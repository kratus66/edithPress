import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { TenantsController } from './tenants.controller'
import { TenantsService } from './tenants.service'

@Module({
  imports: [
    AuthModule, // provee JwtAuthGuard y JwtModule
  ],
  controllers: [TenantsController],
  providers: [
    TenantsService,
    TenantGuard,  // guard de aislamiento multi-tenant
    RolesGuard,   // guard de control de roles (OWNER/EDITOR/VIEWER)
  ],
  exports: [TenantsService],
})
export class TenantsModule {}
