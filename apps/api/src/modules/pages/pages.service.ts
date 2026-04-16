import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import type { CreatePageDto } from './dto/create-page.dto'
import type { UpdatePageDto } from './dto/update-page.dto'

const PAGE_SELECT = {
  id: true,
  siteId: true,
  title: true,
  slug: true,
  metaTitle: true,
  metaDesc: true,
  ogImage: true,
  status: true,
  isHomepage: true,
  order: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  // content excluido por defecto en listas (puede ser grande)
} as const

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name)

  constructor(private readonly db: DatabaseService) {}

  // ──────────────────────────────────────── VERIFY SITE OWNERSHIP ──

  /**
   * Verifica que el siteId pertenece al tenantId antes de cualquier operación.
   * Patrón IDOR: nunca operar sobre un site sin verificar tenancy.
   */
  private async verifySiteOwnership(siteId: string, tenantId: string) {
    const site = await this.db.site.findFirst({
      where: { id: siteId, tenantId },
      select: { id: true },
    })
    if (!site) throw new NotFoundException('Sitio no encontrado')
    return site
  }

  // ──────────────────────────────────────── LIST ──

  async findAll(siteId: string, tenantId: string, page: number, limit: number) {
    await this.verifySiteOwnership(siteId, tenantId)

    const [items, total] = await this.db.$transaction([
      this.db.page.findMany({
        where: { siteId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: PAGE_SELECT,
      }),
      this.db.page.count({ where: { siteId } }),
    ])

    return { items, total, page, limit }
  }

  // ──────────────────────────────────────── CREATE ──

  async create(siteId: string, tenantId: string, dto: CreatePageDto, userId: string) {
    await this.verifySiteOwnership(siteId, tenantId)

    // Slug único dentro del sitio
    const existing = await this.db.page.findUnique({
      where: { siteId_slug: { siteId, slug: dto.slug } },
      select: { id: true },
    })
    if (existing) {
      throw new ConflictException({
        code: 'SLUG_ALREADY_EXISTS',
        message: `El slug "${dto.slug}" ya existe en este sitio`,
      })
    }

    // Si es homepage, quitar el flag de la página anterior
    if (dto.isHomepage) {
      await this.db.page.updateMany({
        where: { siteId, isHomepage: true },
        data: { isHomepage: false },
      })
    }

    const page = await this.db.page.create({
      data: {
        siteId,
        title: dto.title,
        slug: dto.slug,
        metaTitle: dto.metaTitle,
        metaDesc: dto.metaDesc,
        ogImage: dto.ogImage,
        isHomepage: dto.isHomepage ?? false,
        order: dto.order ?? 0,
        content: [],
      },
      select: PAGE_SELECT,
    })

    this.logger.log(`Página creada: pageId=${page.id} siteId=${siteId}`)
    return page
  }

  // ──────────────────────────────────────── GET ONE ──

  async findOne(pageId: string, siteId: string, tenantId: string) {
    await this.verifySiteOwnership(siteId, tenantId)

    const page = await this.db.page.findFirst({
      where: { id: pageId, siteId },
      select: { ...PAGE_SELECT, content: true },
    })
    if (!page) throw new NotFoundException('Página no encontrada')
    return page
  }

  // ──────────────────────────────────────── UPDATE ──

  async update(pageId: string, siteId: string, tenantId: string, dto: UpdatePageDto) {
    await this.verifySiteOwnership(siteId, tenantId)

    const page = await this.db.page.findFirst({
      where: { id: pageId, siteId },
      select: { id: true },
    })
    if (!page) throw new NotFoundException('Página no encontrada')

    // Verificar slug único si se está cambiando
    if (dto.slug) {
      const conflict = await this.db.page.findFirst({
        where: { siteId, slug: dto.slug, NOT: { id: pageId } },
        select: { id: true },
      })
      if (conflict) {
        throw new ConflictException({
          code: 'SLUG_ALREADY_EXISTS',
          message: `El slug "${dto.slug}" ya existe en este sitio`,
        })
      }
    }

    if (dto.isHomepage) {
      await this.db.page.updateMany({
        where: { siteId, isHomepage: true, NOT: { id: pageId } },
        data: { isHomepage: false },
      })
    }

    return this.db.page.update({
      where: { id: pageId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDesc !== undefined && { metaDesc: dto.metaDesc }),
        ...(dto.ogImage !== undefined && { ogImage: dto.ogImage }),
        ...(dto.isHomepage !== undefined && { isHomepage: dto.isHomepage }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
      select: PAGE_SELECT,
    })
  }

  // ──────────────────────────────────────── DELETE ──

  async remove(pageId: string, siteId: string, tenantId: string): Promise<void> {
    await this.verifySiteOwnership(siteId, tenantId)

    const page = await this.db.page.findFirst({
      where: { id: pageId, siteId },
      select: { id: true },
    })
    if (!page) throw new NotFoundException('Página no encontrada')

    await this.db.page.delete({ where: { id: pageId } })
    this.logger.log(`Página eliminada: pageId=${pageId}`)
  }

  // ──────────────────────────────────────── PUBLISH ──

  async publish(pageId: string, siteId: string, tenantId: string) {
    await this.verifySiteOwnership(siteId, tenantId)

    const page = await this.db.page.findFirst({
      where: { id: pageId, siteId },
      select: { id: true, content: true },
    })
    if (!page) throw new NotFoundException('Página no encontrada')

    const content = page.content as unknown[]
    if (!content?.length) {
      throw new BadRequestException({
        code: 'EMPTY_PAGE_CONTENT',
        message: 'No se puede publicar una página sin contenido',
      })
    }

    return this.db.page.update({
      where: { id: pageId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
      select: PAGE_SELECT,
    })
  }

  async unpublish(pageId: string, siteId: string, tenantId: string) {
    await this.verifySiteOwnership(siteId, tenantId)

    const page = await this.db.page.findFirst({
      where: { id: pageId, siteId },
      select: { id: true },
    })
    if (!page) throw new NotFoundException('Página no encontrada')

    return this.db.page.update({
      where: { id: pageId },
      data: { status: 'DRAFT' },
      select: PAGE_SELECT,
    })
  }

  // ──────────────────────────────────────── VERSIONS ──

  async listVersions(pageId: string, siteId: string, tenantId: string) {
    await this.verifySiteOwnership(siteId, tenantId)

    const page = await this.db.page.findFirst({
      where: { id: pageId, siteId },
      select: { id: true },
    })
    if (!page) throw new NotFoundException('Página no encontrada')

    return this.db.pageVersion.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
      take: 50, // máximo 50 versiones en el historial
      select: { id: true, pageId: true, createdAt: true, createdBy: true },
    })
  }

  async restoreVersion(
    pageId: string,
    versionId: string,
    siteId: string,
    tenantId: string,
    userId: string,
  ) {
    await this.verifySiteOwnership(siteId, tenantId)

    const version = await this.db.pageVersion.findFirst({
      where: { id: versionId, pageId },
    })
    if (!version) throw new NotFoundException('Versión no encontrada')

    // Guardar el estado actual como nueva versión antes de restaurar
    const current = await this.db.page.findUnique({
      where: { id: pageId },
      select: { content: true },
    })

    await this.db.$transaction([
      this.db.pageVersion.create({
        data: { pageId, content: current!.content, createdBy: userId },
      }),
      this.db.page.update({
        where: { id: pageId },
        data: { content: version.content, status: 'DRAFT' },
      }),
    ])

    this.logger.log(`Versión restaurada: pageId=${pageId} versionId=${versionId}`)
    return this.db.page.findUnique({
      where: { id: pageId },
      select: { ...PAGE_SELECT, content: true },
    })
  }
}
