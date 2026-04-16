import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ContentService } from './content.service'
import { SaveContentDto } from './dto/save-content.dto'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'

@ApiTags('Content')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('pages/:pageId/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ──────────── GET /pages/:pageId/content ──

  @Get()
  @ApiOperation({ summary: 'Obtener los bloques de contenido de una página' })
  async getContent(
    @CurrentUser() user: JwtPayload,
    @Param('pageId') pageId: string,
  ) {
    return { data: await this.contentService.getContent(pageId, user.tenantId) }
  }

  // ──────────── PUT /pages/:pageId/content ──

  @Put()
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Guardar contenido del page builder (crea versión automáticamente)' })
  async saveContent(
    @CurrentUser() user: JwtPayload,
    @Param('pageId') pageId: string,
    @Body() dto: SaveContentDto,
  ) {
    return { data: await this.contentService.saveContent(pageId, user.tenantId, dto, user.sub) }
  }
}
