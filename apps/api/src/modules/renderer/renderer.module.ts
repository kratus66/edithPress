import { Module } from '@nestjs/common'
import { RendererController } from './renderer.controller'
import { RendererService } from './renderer.service'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [RendererController],
  providers: [RendererService],
})
export class RendererModule {}
