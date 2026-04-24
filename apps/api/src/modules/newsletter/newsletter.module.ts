import { Module } from '@nestjs/common'
import { NewsletterController } from './newsletter.controller'
import { NewsletterService } from './newsletter.service'
import { DatabaseModule } from '../database/database.module'

/**
 * NewsletterModule — gestión de suscriptores de newsletter por sitio.
 *
 * Endpoints:
 * - POST /sites/:siteId/newsletter/subscribe  — público, consumido por renderer
 * - GET  /sites/:siteId/newsletter/subscribers — privado, JWT + TenantGuard
 * - GET  /sites/:siteId/newsletter/export      — privado, CSV de suscriptores
 * - DELETE /sites/:siteId/newsletter/unsubscribe — público, soft delete
 */
@Module({
  imports: [DatabaseModule],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
