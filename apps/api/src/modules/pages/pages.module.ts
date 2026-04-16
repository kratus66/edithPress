import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { PagesController } from './pages.controller'
import { PagesService } from './pages.service'

@Module({
  imports: [AuthModule],
  controllers: [PagesController],
  providers: [PagesService, TenantGuard, RolesGuard],
  exports: [PagesService],
})
export class PagesModule {}
