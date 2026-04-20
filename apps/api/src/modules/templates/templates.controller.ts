import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { TemplatesService } from './templates.service'
import { FilterTemplatesDto } from './dto/filter-templates.dto'

/**
 * TemplatesController — sin autenticación.
 * Los templates son información pública (galería de marketing).
 *
 * Hereda el ThrottlerGuard global (100 req/min).
 */
@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // ── GET /templates ──────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Listar templates activos',
    description:
      'Retorna la lista de templates disponibles. Filtrable por categoría y si es premium. ' +
      'El campo `content` (estructura de páginas) se omite en el listado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de templates' })
  async findAll(@Query() filters: FilterTemplatesDto) {
    const result = await this.templatesService.findAll(filters)
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    }
  }

  // ── GET /templates/:id ──────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({
    summary: 'Detalle de un template',
    description:
      'Incluye el campo `content` con la estructura de páginas del template. ' +
      'Usado por el builder al crear un sitio desde un template.',
  })
  @ApiParam({ name: 'id', description: 'ID del template' })
  @ApiResponse({ status: 200, description: 'Template encontrado' })
  @ApiResponse({ status: 404, description: 'Template no encontrado o inactivo' })
  async findOne(@Param('id') id: string) {
    return { data: await this.templatesService.findOne(id) }
  }
}
