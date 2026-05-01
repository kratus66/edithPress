import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import type { CreateSiteDto } from './dto/create-site.dto'
import type { UpdateSiteDto } from './dto/update-site.dto'

/** Campos públicos del site (nunca se expone el campo completo de pages o tenant). */
const SITE_SELECT = {
  id: true,
  tenantId: true,
  name: true,
  description: true,
  favicon: true,
  isPublished: true,
  templateId: true,
  settings: true,
  createdAt: true,
  updatedAt: true,
} as const

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name)

  constructor(private readonly db: DatabaseService) {}

  // ────────────────────────────────────────────────────────────── LIST ──

  async findAll(tenantId: string, page: number, limit: number) {
    const [items, total] = await this.db.$transaction([
      this.db.site.findMany({
        where: { tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: SITE_SELECT,
      }),
      this.db.site.count({ where: { tenantId } }),
    ])
    return { items, total, page, limit }
  }

  // ────────────────────────────────────────────────────────────── CREATE ──

  async create(tenantId: string, dto: CreateSiteDto) {
    // Verificar que el templateId existe si se proporcionó
    if (dto.templateId) {
      const template = await this.db.template.findUnique({
        where: { id: dto.templateId },
        select: { id: true, content: true },
      })
      if (!template) {
        throw new BadRequestException({
          code: 'TEMPLATE_NOT_FOUND',
          message: 'El template especificado no existe',
        })
      }

      // SEC: normalizar template.content a un array plano de bloques.
      // Los templates de Sprint 04 tienen forma { pages: [{ content: [...] }] }
      // mientras que los antiguos son directamente un array de bloques.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let templateBlocks: any[]
      try {
        const raw = template.content as unknown
        if (Array.isArray(raw)) {
          // Formato legacy: array de bloques directamente
          templateBlocks = raw
        } else if (
          raw !== null &&
          typeof raw === 'object' &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Array.isArray((raw as any).pages) &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (raw as any).pages.length > 0
        ) {
          // Formato Sprint 04: { pages: [{ content: [...] }] }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          templateBlocks = (raw as any).pages[0].content ?? []
        } else {
          this.logger.warn(
            `Template con estructura desconocida: templateId=${dto.templateId} — usando página en blanco`,
          )
          templateBlocks = []
        }
      } catch (err) {
        this.logger.error(
          `Error al parsear template.content: templateId=${dto.templateId}`,
          err,
        )
        templateBlocks = []
      }

      // Crear sitio + homepage con contenido del template + incrementar usageCount
      // Usamos $transaction interactivo para poder pasar el siteId a la página
      const site = await this.db.$transaction(async (tx) => {
        const created = await tx.site.create({
          data: {
            tenantId,
            name: dto.name,
            description: dto.description,
            favicon: dto.favicon,
            templateId: dto.templateId,
            settings: (dto.settings ?? {}) as object,
          },
          select: SITE_SELECT,
        })

        await tx.page.create({
          data: {
            siteId: created.id,
            title: 'Inicio',
            slug: '/',
            isHomepage: true,
            status: 'DRAFT',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content: templateBlocks as any,
          },
        })

        // Incrementar usageCount del template (campo Sprint 03 — cast hasta regenerar client)
        await tx.template.update({
          where: { id: dto.templateId },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { usageCount: { increment: 1 } } as any,
        })

        return created
      })

      this.logger.log(
        `Site creado con template: siteId=${site.id} tenantId=${tenantId} templateId=${dto.templateId}`,
      )
      return site
    }

    const site = await this.db.site.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        favicon: dto.favicon,
        templateId: dto.templateId,
        settings: (dto.settings ?? {}) as object,
      },
      select: SITE_SELECT,
    })

    this.logger.log(`Site creado: siteId=${site.id} tenantId=${tenantId}`)
    return site
  }

  // ────────────────────────────────────────────────────────────── GET ONE ──

  /**
   * Busca por id AND tenantId — patrón IDOR:
   * si el site existe pero es de otro tenant, responde igual que si no existiera.
   */
  async findOne(siteId: string, tenantId: string) {
    const site = await this.db.site.findFirst({
      where: { id: siteId, tenantId },
      select: SITE_SELECT,
    })
    if (!site) throw new NotFoundException('Site no encontrado')
    return site
  }

  // ────────────────────────────────────────────────────────────── UPDATE ──

  async update(siteId: string, tenantId: string, dto: UpdateSiteDto) {
    await this.findOne(siteId, tenantId) // verifica existencia y pertenencia

    return this.db.site.update({
      where: { id: siteId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.favicon !== undefined && { favicon: dto.favicon }),
        ...(dto.templateId !== undefined && { templateId: dto.templateId ?? null }),
        ...(dto.settings !== undefined && { settings: dto.settings as object }),
      },
      select: SITE_SELECT,
    })
  }

  // ────────────────────────────────────────────────────────────── DELETE ──

  async remove(siteId: string, tenantId: string): Promise<void> {
    await this.findOne(siteId, tenantId)
    // Prisma hace cascade delete de pages via schema (onDelete: Cascade)
    await this.db.site.delete({ where: { id: siteId } })
    this.logger.log(`Site eliminado: siteId=${siteId}`)
  }

  // ────────────────────────────────────────────────────────────── PUBLISH ──

  async publish(siteId: string, tenantId: string) {
    await this.findOne(siteId, tenantId)

    return this.db.site.update({
      where: { id: siteId },
      data: { isPublished: true },
      select: SITE_SELECT,
    })
  }

  async unpublish(siteId: string, tenantId: string) {
    await this.findOne(siteId, tenantId)

    return this.db.site.update({
      where: { id: siteId },
      data: { isPublished: false },
      select: SITE_SELECT,
    })
  }
}
