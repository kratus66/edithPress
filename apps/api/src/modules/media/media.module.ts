import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { AuthModule } from '../auth/auth.module'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { MediaController } from './media.controller'
import { MediaService } from './media.service'

@Module({
  imports: [
    AuthModule,
    // Almacenar en memoria para subir el buffer directamente a S3
    // (nunca escribir archivos temporales al disco en producción)
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [MediaController],
  providers: [MediaService, TenantGuard, RolesGuard],
  exports: [MediaService],
})
export class MediaModule {}
