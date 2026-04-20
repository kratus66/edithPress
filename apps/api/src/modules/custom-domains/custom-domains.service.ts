import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common'
import { promises as dns } from 'dns'
import { randomBytes } from 'crypto'
import { DatabaseService } from '../database/database.service'
import { RedisService } from '../redis/redis.service'
import type { AddDomainDto } from './dto/add-domain.dto'

/** Prefijo TXT DNS para verificación de dominio */
const DNS_VERIFY_PREFIX = '_edithpress-verify.'

/** Dominios bloqueados — no se puede registrar subdominios propios ni localhost */
const BLOCKED_DOMAIN_PATTERNS = [
  /edithpress\.(com|io|app|dev)$/i,
  /^localhost$/i,
  /^(\d{1,3}\.){3}\d{1,3}$/,     // IPv4
  /^\[?[0-9a-fA-F:]+\]?$/,        // IPv6
  /\.local$/i,
  /\.internal$/i,
  /\.test$/i,
  /\.example$/i,
]

/** Rate limit: máx 5 intentos de verificación por siteId por hora */
const VERIFY_RATE_LIMIT = 5
const VERIFY_RATE_WINDOW_SECONDS = 3600

@Injectable()
export class CustomDomainsService {
  private readonly logger = new Logger(CustomDomainsService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Acceso tipado al modelo CustomDomain.
   * El modelo existe en el schema Sprint 03 — el cast se elimina tras
   * regenerar el Prisma client con `pnpm db:generate` en packages/database.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get customDomainModel(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.db as any).customDomain
  }

  // ────────────────────────────────────────── ADD DOMAIN ──

  /**
   * Registra un dominio personalizado para un sitio.
   *
   * Flujo:
   * 1. Validar que el sitio pertenece al tenant (IDOR protection)
   * 2. Validar formato y dominio no bloqueado
   * 3. Verificar que el dominio no está en uso por otro sitio
   * 4. Generar txtRecord aleatorio (32 bytes hex)
   * 5. Crear registro CustomDomain con status PENDING
   */
  async addDomain(siteId: string, tenantId: string, dto: AddDomainDto) {
    // 1. Verificar que el sitio pertenece al tenant
    const site = await this.db.site.findFirst({
      where: { id: siteId, tenantId },
      select: { id: true },
    })
    if (!site) {
      throw new NotFoundException({
        code: 'SITE_NOT_FOUND',
        message: 'Sitio no encontrado',
      })
    }

    // 2. Validar que el dominio no está bloqueado
    const domain = dto.domain.toLowerCase().trim()
    this.assertDomainAllowed(domain)

    // 3. Verificar que no existe un CustomDomain activo con este dominio
    const existing = await this.customDomainModel.findUnique({
      where: { domain },
    })
    if (existing) {
      throw new ConflictException({
        code: 'DOMAIN_ALREADY_REGISTERED',
        message: 'Este dominio ya está registrado en EdithPress',
      })
    }

    // 4. Verificar si el siteId ya tiene un CustomDomain (1:1)
    const existingForSite = await this.customDomainModel.findUnique({
      where: { siteId },
    })
    if (existingForSite) {
      throw new ConflictException({
        code: 'SITE_ALREADY_HAS_DOMAIN',
        message: 'Este sitio ya tiene un dominio personalizado. Elimínalo primero.',
      })
    }

    // 5. Generar TXT record
    const txtRecord = randomBytes(32).toString('hex')

    // 6. Crear registro
    const customDomain = await this.customDomainModel.create({
      data: {
        tenantId,
        siteId,
        domain,
        txtRecord,
        status: 'PENDING',
      },
      select: {
        id: true,
        domain: true,
        txtRecord: true,
        status: true,
        createdAt: true,
      },
    })

    this.logger.log(
      `Dominio agregado: siteId=${siteId} domain=${domain} tenantId=${tenantId}`,
    )

    return {
      ...customDomain,
      instructions: this.buildDnsInstructions(domain, txtRecord),
    }
  }

  // ────────────────────────────────────────── GET DOMAIN ──

  async getDomain(siteId: string, tenantId: string) {
    const site = await this.db.site.findFirst({
      where: { id: siteId, tenantId },
      select: { id: true },
    })
    if (!site) {
      throw new NotFoundException({
        code: 'SITE_NOT_FOUND',
        message: 'Sitio no encontrado',
      })
    }

    const customDomain = await this.customDomainModel.findUnique({
      where: { siteId },
      select: {
        id: true,
        domain: true,
        txtRecord: true,
        status: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // null es válido — el sitio simplemente no tiene dominio personalizado
    return customDomain
  }

  // ────────────────────────────────────────── VERIFY ──

  /**
   * Verifica el dominio consultando el registro TXT en DNS.
   *
   * Rate limit: máx 5 intentos por siteId por hora (via Redis INCR/EX).
   * Si la verificación supera el límite, lanza TooManyRequestsException.
   */
  async verifyDomain(siteId: string, tenantId: string) {
    const site = await this.db.site.findFirst({
      where: { id: siteId, tenantId },
      select: { id: true },
    })
    if (!site) {
      throw new NotFoundException({
        code: 'SITE_NOT_FOUND',
        message: 'Sitio no encontrado',
      })
    }

    const customDomain = await this.customDomainModel.findUnique({
      where: { siteId },
      select: { id: true, domain: true, txtRecord: true, status: true },
    })

    if (!customDomain) {
      throw new NotFoundException({
        code: 'DOMAIN_NOT_CONFIGURED',
        message: 'Este sitio no tiene un dominio personalizado configurado',
      })
    }

    if (customDomain.status === 'ACTIVE') {
      return {
        status: 'ACTIVE',
        message: 'El dominio ya está verificado',
      }
    }

    // Rate limit via Redis
    const rateLimitKey = `domain-verify-count:${siteId}`
    const currentCount = await this.redis.get(rateLimitKey)
    const count = currentCount ? parseInt(currentCount, 10) : 0

    if (count >= VERIFY_RATE_LIMIT) {
      throw new ForbiddenException({
        code: 'VERIFY_RATE_LIMIT_EXCEEDED',
        message: `Demasiados intentos de verificación. Espera ${VERIFY_RATE_WINDOW_SECONDS / 60} minutos.`,
      })
    }

    // Incrementar contador (con TTL si es el primero del período)
    if (count === 0) {
      await this.redis.set(rateLimitKey, '1', VERIFY_RATE_WINDOW_SECONDS)
    } else {
      // Incrementar sin resetear TTL — usamos el cliente Redis directamente
      // RedisService no expone INCR, así que reutilizamos set con el nuevo valor
      await this.redis.set(rateLimitKey, String(count + 1), VERIFY_RATE_WINDOW_SECONDS)
    }

    // Consultar TXT record
    const dnsHost = `${DNS_VERIFY_PREFIX}${customDomain.domain}`
    let verified = false

    try {
      const txtRecords = await dns.resolveTxt(dnsHost)
      // txtRecords es string[][] — aplanar y buscar el txtRecord exacto
      const allValues = txtRecords.flat()
      verified = allValues.includes(customDomain.txtRecord)
    } catch (err) {
      // ENOTFOUND o ENODATA — el registro TXT aún no existe
      this.logger.debug(
        `DNS lookup fallido para ${dnsHost}: ${err instanceof Error ? err.message : String(err)}`,
      )
      verified = false
    }

    if (verified) {
      await this.customDomainModel.update({
        where: { id: customDomain.id },
        data: {
          status: 'ACTIVE',
          verifiedAt: new Date(),
        },
      })

      this.logger.log(
        `Dominio verificado: siteId=${siteId} domain=${customDomain.domain}`,
      )

      return {
        status: 'ACTIVE',
        message: 'Dominio verificado correctamente',
      }
    } else {
      await this.customDomainModel.update({
        where: { id: customDomain.id },
        data: { status: 'FAILED' },
      })

      this.logger.warn(
        `Verificación fallida: siteId=${siteId} domain=${customDomain.domain}`,
      )

      return {
        status: 'FAILED',
        message: `No se encontró el registro TXT. Asegúrate de haber creado: ${dnsHost} → ${customDomain.txtRecord}`,
      }
    }
  }

  // ────────────────────────────────────────── DELETE ──

  async removeDomain(siteId: string, tenantId: string) {
    const site = await this.db.site.findFirst({
      where: { id: siteId, tenantId },
      select: { id: true },
    })
    if (!site) {
      throw new NotFoundException({
        code: 'SITE_NOT_FOUND',
        message: 'Sitio no encontrado',
      })
    }

    const customDomain = await this.customDomainModel.findUnique({
      where: { siteId },
      select: { id: true, domain: true },
    })

    if (!customDomain) {
      throw new NotFoundException({
        code: 'DOMAIN_NOT_CONFIGURED',
        message: 'Este sitio no tiene un dominio personalizado',
      })
    }

    await this.customDomainModel.delete({ where: { id: customDomain.id } })

    this.logger.log(
      `Dominio eliminado: siteId=${siteId} domain=${customDomain.domain}`,
    )
  }

  // ────────────────────────────────────────── RENDERER LOOKUP ──

  /**
   * Usado por el renderer: busca un CustomDomain activo por nombre de dominio
   * y retorna el tenantSlug + siteId para resolver la petición.
   */
  async lookupByDomain(domain: string) {
    const customDomain = await this.customDomainModel.findFirst({
      where: { domain: domain.toLowerCase().trim(), status: 'ACTIVE' },
      select: {
        siteId: true,
        tenant: {
          select: { slug: true },
        },
      },
    })

    if (!customDomain) {
      throw new NotFoundException({
        code: 'DOMAIN_NOT_FOUND',
        message: 'Dominio no encontrado o no verificado',
      })
    }

    return {
      tenantSlug: customDomain.tenant.slug,
      siteId: customDomain.siteId,
    }
  }

  // ────────────────────────────────────────── HELPERS ──

  private assertDomainAllowed(domain: string): void {
    for (const pattern of BLOCKED_DOMAIN_PATTERNS) {
      if (pattern.test(domain)) {
        throw new BadRequestException({
          code: 'DOMAIN_NOT_ALLOWED',
          message: 'Este dominio no está permitido',
        })
      }
    }
  }

  private buildDnsInstructions(domain: string, txtRecord: string): string {
    return (
      `Para verificar tu dominio, crea el siguiente registro TXT en tu proveedor DNS:\n` +
      `  Host: ${DNS_VERIFY_PREFIX}${domain}\n` +
      `  Valor: ${txtRecord}\n` +
      `\n` +
      `Luego, apunta tu dominio al servidor de EdithPress:\n` +
      `  CNAME: ${domain} → sites.edithpress.com\n` +
      `\n` +
      `Los cambios DNS pueden tardar hasta 48 horas en propagarse.`
    )
  }
}
