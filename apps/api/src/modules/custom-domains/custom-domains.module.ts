import { Module } from '@nestjs/common'
import { CustomDomainsService } from './custom-domains.service'
import {
  CustomDomainsController,
  RendererDomainController,
} from './custom-domains.controller'
import { DatabaseModule } from '../database/database.module'

/**
 * CustomDomainsModule — gestión de dominios personalizados por sitio.
 *
 * Expone dos grupos de endpoints:
 * - /sites/:siteId/domain — CRUD protegido con JWT + TenantGuard
 * - /renderer/domain/:domain — lookup interno protegido con X-Renderer-Secret
 *
 * Depende de: DatabaseModule (Prisma), RedisModule (@Global, no requiere import explícito)
 */
@Module({
  imports: [DatabaseModule],
  controllers: [CustomDomainsController, RendererDomainController],
  providers: [CustomDomainsService],
  exports: [CustomDomainsService],
})
export class CustomDomainsModule {}
