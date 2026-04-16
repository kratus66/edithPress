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
      })
      if (!template) {
        throw new BadRequestException({
          code: 'TEMPLATE_NOT_FOUND',
          message: 'El template especificado no existe',
        })
      }
    }

    const site = await this.db.site.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        favicon: dto.favicon,
        templateId: dto.templateId,
        settings: dto.settings ?? {},
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
        ...(dto.templateId !== undefined && { templateId: dto.templateId }),
        ...(dto.settings !== undefined && { settings: dto.settings }),
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
