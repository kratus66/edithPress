import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { ContentController } from './content.controller'
import { ContentService } from './content.service'

@Module({
  imports: [AuthModule],
  controllers: [ContentController],
  providers: [ContentService, TenantGuard, RolesGuard],
  exports: [ContentService],
})
export class ContentModule {}
