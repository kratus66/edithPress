import { Module } from '@nestjs/common'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'
import { DatabaseModule } from '../database/database.module'

/**
 * AnalyticsModule — tracking de pageviews y dashboard de métricas.
 *
 * Endpoints:
 * - POST /analytics/pageview — público, sin auth (consumido por renderer)
 * - GET /sites/:siteId/analytics — protegido con JWT + TenantGuard
 *
 * Depende de: DatabaseModule (Prisma), RedisModule (@Global, auto-inyectado)
 */
@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
