import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common'
import { promises as dns } from 'node:dns'
import { randomBytes } from 'node:crypto'
import { DatabaseService } from '../database/database.service'
import type { CreateDomainDto } from './dto/create-domain.dto'

/** CNAME al que deben apuntar los dominios custom de los tenants */
const TARGET_CNAME = 'renderer.edithpress.com'

/**
 * Detecta si una dirección IPv4 o IPv6 pertenece a rangos privados / loopback.
 *
 * SEC (SSRF): aunque domains.service.ts usa dns.resolveCname() en lugar de
 * fetch(), un atacante podría configurar un CNAME que resuelva a 127.0.0.1
 * o 169.254.x.x. Esta función se usa después de dns.resolve4() para rechazar
 * dominios cuya resolución apunte a rangos RFC-1918 / loopback / link-local.
 */
function isPrivateIP(ip: string): boolean {
  // IPv6 loopback
  if (ip === '::1') return true

  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return false

  const [a, b] = parts
  return (
    a === 10 ||                        // 10.0.0.0/8
    a === 127 ||                       // 127.0.0.0/8 (loopback)
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
    (a === 192 && b === 168) ||         // 192.168.0.0/16
    (a === 169 && b === 254)            // 169.254.0.0/16 (link-local)
  )
}

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name)

  constructor(private readonly db: DatabaseService) {}

  // ────────────────────────────────────────── ADD DOMAIN ──

  /**
   * Registra un dominio personalizado para un tenant.
   *
   * Validaciones:
   * 1. El plan del tenant debe tener hasCustomDomain = true
   * 2. El siteId debe pertenecer al tenant (IDOR protection)
   * 3. El dominio no puede ser subdominio de edithpress.com
   * 4. El dominio debe ser único en CustomDomain
   */
  async addDomain(tenantId: string, dto: CreateDomainDto) {
    // 1. Verificar plan del tenant
    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    })

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado')
    }

    if (!tenant.plan.hasCustomDomain) {
      throw new ForbiddenException('Tu plan actual no incluye dominios personalizados')
    }

    // 2. Verificar que el siteId pertenece al tenant
    const site = await this.db.site.findFirst({
      where: { id: dto.siteId, tenantId },
      select: { id: true },
    })
    if (!site) {
      throw new NotFoundException('Sitio no encontrado o no pertenece al tenant')
    }

    // 3. Rechazar subdominios de edithpress.com
    if (dto.domain.endsWith('.edithpress.com')) {
      throw new BadRequestException('No se pueden registrar subdominios de edithpress.com')
    }

    // 4. Verificar unicidad del dominio
    const existing = await this.db.customDomain.findUnique({
      where: { domain: dto.domain },
    })
    if (existing) {
      throw new ConflictException('El dominio ya está registrado')
    }

    // Generar txtRecord para verificación DNS
    const txtRecord = `edithpress-verify=${randomBytes(16).toString('hex')}`

    const customDomain = await this.db.customDomain.create({
      data: {
        tenantId,
        siteId: dto.siteId,
        domain: dto.domain,
        txtRecord,
        status: 'PENDING',
      },
    })

    this.logger.log(
      `Dominio agregado: tenantId=${tenantId} domain=${dto.domain} siteId=${dto.siteId}`,
    )

    return customDomain
  }

  // ────────────────────────────────────────── GET DOMAINS ──

  async getDomains(tenantId: string) {
    return this.db.customDomain.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ────────────────────────────────────────── DELETE DOMAIN ──

  /**
   * Elimina un dominio personalizado.
   * IDOR check: findFirst con tenantId para asegurar pertenencia.
   */
  async deleteDomain(tenantId: string, domainId: string): Promise<void> {
    const domain = await this.db.customDomain.findFirst({
      where: { id: domainId, tenantId },
    })
    if (!domain) {
      throw new NotFoundException('Dominio no encontrado')
    }

    await this.db.customDomain.delete({ where: { id: domainId } })

    this.logger.log(
      `Dominio eliminado: tenantId=${tenantId} domainId=${domainId} domain=${domain.domain}`,
    )
  }

  // ────────────────────────────────────────── VERIFY DOMAIN ──

  /**
   * Verifica que el dominio apunta al renderer via CNAME.
   *
   * Usa dns.resolveCname() — nunca fetch() al dominio del usuario (previene SSRF).
   * Guarda el resultado en DomainVerification y actualiza el estado del CustomDomain.
   */
  async verifyDomain(tenantId: string, domainId: string) {
    // IDOR check
    const domain = await this.db.customDomain.findFirst({
      where: { id: domainId, tenantId },
    })
    if (!domain) {
      throw new NotFoundException('Dominio no encontrado')
    }

    let verificationStatus: 'PENDING' | 'VERIFYING' | 'ACTIVE' | 'FAILED'
    let message: string | null = null

    try {
      const records = await dns.resolveCname(domain.domain)
      const matches = records.some(
        (r) => r === TARGET_CNAME || r === TARGET_CNAME + '.',
      )

      if (matches) {
        // SEC (SSRF): verificar que la resolución A del dominio no apunta a
        // rangos privados / loopback, incluso si el CNAME es correcto.
        // Un atacante podría hacer que renderer.edithpress.com.evil.com (o un
        // CNAME indirecto) resuelva a 127.0.0.1.
        try {
          const ipv4s = await dns.resolve4(domain.domain)
          const hasPrivate = ipv4s.some(isPrivateIP)
          if (hasPrivate) {
            verificationStatus = 'FAILED'
            message = 'El dominio no puede resolver a una dirección IP privada'
            this.logger.warn(
              `SEC: dominio con resolución IP privada rechazado: domainId=${domainId}`,
            )
          } else {
            verificationStatus = 'ACTIVE'
          }
        } catch {
          // Si no hay registros A (ej. solo IPv6), aceptar — no es un vector SSRF
          // porque el servidor hace CNAME lookup, no fetch HTTP.
          verificationStatus = 'ACTIVE'
        }
      } else {
        verificationStatus = 'FAILED'
        message = 'CNAME no apunta a renderer.edithpress.com'
      }
    } catch (err: unknown) {
      verificationStatus = 'FAILED'
      const code = (err as NodeJS.ErrnoException).code

      if (code === 'ENOTFOUND') {
        message = 'No se encontró el dominio en DNS'
      } else if (code === 'ETIMEOUT') {
        message = 'DNS timeout'
      } else {
        message = 'Error al verificar el dominio'
        // NO exponer err.message — puede contener detalles internos
        this.logger.warn(
          `DNS check error desconocido: domainId=${domainId} code=${code}`,
        )
      }
    }

    // Guardar resultado y actualizar estado en transacción
    const [verification, updatedDomain] = await this.db.$transaction([
      this.db.domainVerification.create({
        data: {
          domainId: domain.id,
          status: verificationStatus,
          message,
        },
      }),
      this.db.customDomain.update({
        where: { id: domain.id },
        data: {
          status: verificationStatus,
          verifiedAt: verificationStatus === 'ACTIVE' ? new Date() : null,
        },
      }),
    ])

    this.logger.log(
      `Verificación de dominio: domainId=${domainId} status=${verificationStatus}`,
    )

    return { domain: updatedDomain, verification }
  }
}
