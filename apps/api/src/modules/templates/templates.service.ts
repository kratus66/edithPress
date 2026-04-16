import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import type { FilterTemplatesDto } from './dto/filter-templates.dto'

/**
 * Campos que se exponen en el listado.
 * El `content` (estructura del template) se omite para mantener
 * las respuestas livianas — solo se incluye en findOne().
 */
const TEMPLATE_LIST_SELECT = {
  id: true,
  name: true,
  description: true,
  previewUrl: true,
  thumbnailUrl: true,
  category: true,
  tags: true,
  isPremium: true,
  price: true,
  createdAt: true,
} as const

const TEMPLATE_DETAIL_SELECT = {
  ...TEMPLATE_LIST_SELECT,
  content: true,
  updatedAt: true,
} as const

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name)

  constructor(private readonly db: DatabaseService) {}

  // ────────────────────────────────────────── LIST ──

  /**
   * Lista templates activos con filtros opcionales.
   * Ordenados por: premium primero, luego por fecha de creación descendente.
   */
  async findAll(filters: FilterTemplatesDto) {
    const where = {
      isActive: true,
      ...(filters.category !== undefined && { category: filters.category }),
      ...(filters.isPremium !== undefined && { isPremium: filters.isPremium }),
    }

    const items = await this.db.template.findMany({
      where,
      orderBy: [
        { isPremium: 'desc' },
        { createdAt: 'desc' },
      ],
      select: TEMPLATE_LIST_SELECT,
    })

    this.logger.debug(`Templates listados: count=${items.length} filters=${JSON.stringify(filters)}`)
    return { items, total: items.length }
  }

  // ────────────────────────────────────────── GET ONE ──

  /**
   * Retorna el detalle completo de un template activo, incluyendo
   * el `content` (estructura de páginas) para que el builder pueda
   * aplicarlo a un nuevo sitio.
   */
  async findOne(id: string) {
    const template = await this.db.template.findFirst({
      where: { id, isActive: true },
      select: TEMPLATE_DETAIL_SELECT,
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
