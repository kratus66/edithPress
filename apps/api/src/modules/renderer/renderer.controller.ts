import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Headers,
} from '@nestjs/common'
import { Throttle, SkipThrottle } from '@nestjs/throttler'
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { RendererService } from './renderer.service'
import { ContactFormDto } from './dto/contact-form.dto'

/**
 * RendererController — endpoints PÚBLICOS consumidos por el renderer Next.js.
 *
 * NO lleva JwtAuthGuard: los visitantes anónimos llegan aquí.
 * Rate limiting conservador (30 req/min) — el renderer usa caché ISR,
 * por lo que en producción el volumen real es mucho menor.
 *
 * El formulario de contacto tiene throttle más estricto (5/min)
 * para prevenir spam.
 */
@ApiTags('Renderer (público)')
@Throttle({ default: { limit: 30, ttl: 60_000 } })
@Controller('renderer')
export class RendererController {
  constructor(private readonly rendererService: RendererService) {}

  // ── GET /renderer/tenant/:slug ──────────────────────────────────────────

  @Get('tenant/:slug')
  @SkipThrottle({ default: false }) // hereda los 30/min del controlador
  @ApiOperation({
    summary: 'Info del sitio + navegación (público)',
    description:
      'Retorna datos del tenant, settings del sitio y nav links de páginas publicadas. ' +
      'Usado por el renderer para el layout global (nav, footer, favicon, colores).',
  })
  @ApiParam({ name: 'slug', description: 'Slug del tenant (subdominio)' })
  @ApiResponse({ status: 200, description: 'Info del sitio' })
  @ApiResponse({ status: 404, description: 'Sitio no encontrado o no publicado' })
  async getTenantInfo(
    @Param('slug') slug: string,
    @Query('draft') draft?: string,
    @Headers('x-renderer-secret') secret?: string,
  ) {
    const isDraft = draft === 'true' && !!secret && secret === process.env.RENDERER_SECRET
    return { data: await this.rendererService.getTenantInfo(slug, isDraft) }
  }

  // ── GET /renderer/tenant/:slug/page/:pageSlug ───────────────────────────

  @Get('tenant/:slug/page/:pageSlug')
  @ApiOperation({
    summary: 'Contenido de una página publicada (público)',
    description:
      'Retorna los bloques del page builder (JSON) de una página con status PUBLISHED. ' +
      'Usa pageSlug="index" para obtener la homepage.',
  })
  @ApiParam({ name: 'slug', description: 'Slug del tenant' })
  @ApiParam({
    name: 'pageSlug',
    description: 'Slug de la página ("index" para homepage)',
  })
  @ApiResponse({ status: 200, description: 'Contenido de la página' })
  @ApiResponse({ status: 404, description: 'Página o sitio no encontrado' })
  async getPage(
    @Param('slug') slug: string,
    @Param('pageSlug') pageSlug: string,
    @Query('draft') draft?: string,
    @Headers('x-renderer-secret') secret?: string,
  ) {
    const isDraft = draft === 'true' && !!secret && secret === process.env.RENDERER_SECRET
    return { data: await this.rendererService.getPage(slug, pageSlug, isDraft) }
  }

  // ── POST /renderer/contact ──────────────────────────────────────────────

  @Post('contact')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar formulario de contacto (público)',
    description:
      'Valida el formulario y envía un email al OWNER del tenant via Resend. ' +
      'El slug del tenant se pasa en el body para saber a quién dirigir el mensaje.',
  })
  @ApiResponse({ status: 200, description: 'Mensaje enviado' })
  @ApiResponse({ status: 404, description: 'Sitio no encontrado' })
  @ApiResponse({ status: 503, description: 'Error al enviar el email' })
  async sendContact(@Body() dto: ContactFormDto) {
    return { data: await this.rendererService.sendContactForm(dto.tenantSlug, dto) }
  }
}
