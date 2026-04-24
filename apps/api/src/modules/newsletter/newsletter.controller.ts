import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'
import { Throttle } from '@nestjs/throttler'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'
import { NewsletterService } from './newsletter.service'
import { SubscribeDto, UnsubscribeDto } from './dto/newsletter.dto'

@ApiTags('Newsletter')
@Controller('sites/:siteId/newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  // ── POST /sites/:siteId/newsletter/subscribe ────────────────────────────

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 3_600_000 } })
  @ApiOperation({
    summary: 'Suscribir email al newsletter del sitio (público)',
    description: 'Endpoint consumido por el NewsletterBlock del renderer. ' +
      'Rate limit: 3 suscripciones por IP por hora. Idempotente — re-suscribe si ya existe.',
  })
  @ApiParam({ name: 'siteId', description: 'ID del sitio' })
  @ApiResponse({ status: 201, description: 'Suscripción creada o reactivada' })
  @ApiResponse({ status: 400, description: 'Email inválido' })
  @ApiResponse({ status: 404, description: 'Sitio no encontrado' })
  @ApiResponse({ status: 429, description: 'Rate limit superado' })
  async subscribe(@Param('siteId') siteId: string, @Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(siteId, dto.email, dto.source)
  }

  // ── GET /sites/:siteId/newsletter/subscribers ───────────────────────────

  @Get('subscribers')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar suscriptores del sitio (privado)' })
  @ApiParam({ name: 'siteId', description: 'ID del sitio' })
  @ApiResponse({ status: 200, description: 'Lista paginada de suscriptores' })
  async getSubscribers(
    @Param('siteId') siteId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('active') active?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.newsletterService.getSubscribers(siteId, user!.tenantId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      active: active !== undefined ? active === 'true' : undefined,
    })
  }

  // ── GET /sites/:siteId/newsletter/export ────────────────────────────────

  @Get('export')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Exportar suscriptores a CSV (privado)' })
  @ApiParam({ name: 'siteId', description: 'ID del sitio' })
  @ApiResponse({ status: 200, description: 'Archivo CSV de suscriptores' })
  async exportCsv(
    @Param('siteId') siteId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const csv = await this.newsletterService.exportSubscribersCsv(siteId, user.tenantId)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="subscribers-${siteId}.csv"`)
    res.send(csv)
  }

  // ── DELETE /sites/:siteId/newsletter/unsubscribe ─────────────────────────

  @Delete('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desuscribir email del newsletter (público)',
    description: 'Soft delete — marca isActive = false. El token es base64 del email (v1).',
  })
  @ApiParam({ name: 'siteId', description: 'ID del sitio' })
  @ApiResponse({ status: 200, description: 'Desuscripción procesada' })
  async unsubscribe(@Param('siteId') siteId: string, @Body() dto: UnsubscribeDto) {
    return this.newsletterService.unsubscribe(siteId, dto.email, dto.token)
  }
}
