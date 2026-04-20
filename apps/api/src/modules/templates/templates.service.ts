import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import type { FilterTemplatesDto } from './dto/filter-templates.dto'

/**
 * Campos que se exponen en el listado.
 * El `content` (estructura del template) se omite para mantener
 * las respuestas livianas — solo se incluye en findOne().
 *
 * Nota: usageCount, sortOrder y previewImageUrl son campos del Sprint 03.
 * Se usan `as any` en las queries hasta que el Prisma client sea regenerado
 * con `pnpm db:generate` en packages/database tras aplicar la migración.
 */
const TEMPLATE_LIST_SELECT = {
  id: true,
  name: true,
  description: true,
  previewUrl: true,
  previewImageUrl: true,
  thumbnailUrl: true,
  category: true,
  tags: true,
  isPremium: true,
  price: true,
  usageCount: true,
  sortOrder: true,
  createdAt: true,
}

const TEMPLATE_DETAIL_SELECT = {
  ...TEMPLATE_LIST_SELECT,
  content: true,
  updatedAt: true,
}

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name)

  constructor(private readonly db: DatabaseService) {}

  // ────────────────────────────────────────── LIST ──

  /**
   * Lista templates activos con filtros y paginación opcionales.
   * Ordenados por: sortOrder ASC, luego usageCount DESC.
   */
  async findAll(filters: FilterTemplatesDto) {
    const page = filters.page ?? 1
    const limit = filters.limit ?? 12

    const where = {
      isActive: true,
      ...(filters.category !== undefined && { category: filters.category }),
      ...(filters.isPremium !== undefined && { isPremium: filters.isPremium }),
    }

    const [items, total] = await this.db.$transaction([
      this.db.template.findMany({
        where,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderBy: [{ sortOrder: 'asc' }, { usageCount: 'desc' }] as any,
        skip: (page - 1) * limit,
        take: limit,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        select: TEMPLATE_LIST_SELECT as any,
      }),
      this.db.template.count({ where }),
    ])

    this.logger.debug(`Templates listados: count=${items.length} total=${total} filters=${JSON.stringify(filters)}`)
    return { items, total, page, limit }
  }

  // ────────────────────────────────────────── GET ONE ──

  /**
   * Retorna el detalle completo de un template activo, incluyendo
   * el `content` (estructura de páginas) para que el builder pueda
   * aplicarlo a un nuevo sitio.
   */
  async findOne(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const template = await this.db.template.findFirst({
      where: { id, isActive: true },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      select: TEMPLATE_DETAIL_SELECT as any,
    })

    if (!template) {
      throw new NotFoundException({
        code: 'TEMPLATE_NOT_FOUND',
        message: 'Template no encontrado',
      })
    }

    return template
  }
}
