import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { SitesController } from './sites.controller'
import { SitesService } from './sites.service'

@Module({
  imports: [AuthModule],
  controllers: [SitesController],
  providers: [SitesService, TenantGuard, RolesGuard],
  exports: [SitesService],
})
export class SitesModule {}
