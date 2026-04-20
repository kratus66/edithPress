import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'
import { AnalyticsService } from './analytics.service'
import { CreatePageViewDto } from './dto/pageview.dto'
import { AnalyticsQueryDto } from './dto/analytics-query.dto'

@ApiTags('Analytics')
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ── POST /analytics/pageview ─────────────────────────────────────────────

  /**
   * Endpoint PÚBLICO — consumido por el renderer para trackear visitas.
   *
   * Rate limit estricto: 10 req/min por IP para evitar inflado de métricas.
   * GDPR: no se guarda IP, solo el path, referrer y user-agent opcional.
   */
  @Post('analytics/pageview')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Registrar visita de página (público)',
    description:
      'Endpoint consumido por el renderer para trackear visitas. ' +
      'No guarda IP del visitante (cumplimiento GDPR). Rate limit: 10/min.',
  })
  @ApiResponse({ status: 204, description: 'Visita registrada' })
  @ApiResponse({ status: 404, description: 'Sitio no encontrado' })
  @ApiResponse({ status: 429, description: 'Rate limit superado' })
  async trackPageView(@Body() dto: CreatePageViewDto): Promise<void> {
    await this.analyticsService.trackPageView(dto)
  }

  // ── GET /sites/:siteId/analytics ─────────────────────────────────────────

  @Get('sites/:siteId/analytics')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Dashboard de analytics del sitio',
    description:
      'Retorna métricas del sitio en el período indicado. ' +
      'Cacheado en Redis 5 minutos. Requiere autenticación y pertenencia al tenant.',
  })
  @ApiParam({ name: 'siteId', description: 'ID del sitio' })
  @ApiResponse({ status: 200, description: 'Métricas de analytics' })
  @ApiResponse({ status: 404, description: 'Sitio no encontrado' })
  async getAnalytics(
    @Param('siteId') siteId: string,
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.analyticsService.getAnalytics(
      siteId,
      user.tenantId,
      query.period ?? '30d',
    )
    return { data }
  }
}
