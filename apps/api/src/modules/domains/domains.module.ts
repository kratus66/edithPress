import { Module } from '@nestjs/common'
import { DomainsController } from './domains.controller'
import { DomainsService } from './domains.service'
import { DatabaseModule } from '../database/database.module'

/**
 * DomainsModule — gestión de dominios personalizados por tenant.
 *
 * Endpoints montados bajo: /api/v1/tenants/:tenantId/domains
 * - POST   /tenants/:tenantId/domains                      — registrar dominio (OWNER)
 * - GET    /tenants/:tenantId/domains                      — listar dominios
 * - DELETE /tenants/:tenantId/domains/:domainId            — eliminar dominio (OWNER)
 * - POST   /tenants/:tenantId/domains/:domainId/verify     — verificar CNAME (OWNER)
 *
 * Distinto de CustomDomainsModule (que gestiona dominios desde sites/:siteId/domain).
 * Este módulo expone la vista desde el tenant, con verificación via CNAME.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [DomainsController],
  providers: [DomainsService],
})
export class DomainsModule {}
