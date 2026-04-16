import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { PagesService } from './pages.service'
import { CreatePageDto } from './dto/create-page.dto'
import { UpdatePageDto } from './dto/update-page.dto'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'

@ApiTags('Pages')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('sites/:siteId/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  // ──────────── GET /sites/:siteId/pages ──

  @Get()
  @ApiOperation({ summary: 'Listar páginas de un sitio' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.pagesService.findAll(
      siteId,
      user.tenantId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
    )
    return { data: result.items, meta: { page: result.page, limit: result.limit, total: result.total } }
  }

  // ──────────── POST /sites/:siteId/pages ──

  @Post()
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Crear una página' })
  @ApiResponse({ status: 201, description: 'Página creada' })
  @ApiResponse({ status: 409, description: 'Slug ya existe en este sitio' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Body() dto: CreatePageDto,
  ) {
    return { data: await this.pagesService.create(siteId, user.tenantId, dto, user.sub) }
  }

  // ──────────── GET /sites/:siteId/pages/:pageId ──

  @Get(':pageId')
  @ApiOperation({ summary: 'Obtener una página con su contenido' })
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
  ) {
    return { data: await this.pagesService.findOne(pageId, siteId, user.tenantId) }
  }

  // ──────────── PATCH /sites/:siteId/pages/:pageId ──

  @Patch(':pageId')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Actualizar metadatos de una página' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @Body() dto: UpdatePageDto,
  ) {
    return { data: await this.pagesService.update(pageId, siteId, user.tenantId, dto) }
  }

  // ──────────── DELETE /sites/:siteId/pages/:pageId ──

  @Delete(':pageId')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una página' })
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
  ) {
    await this.pagesService.remove(pageId, siteId, user.tenantId)
  }

  // ──────────── POST /sites/:siteId/pages/:pageId/publish ──

  @Post(':pageId/publish')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Publicar una página' })
  @ApiResponse({ status: 400, description: 'La página no tiene contenido' })
  async publish(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
  ) {
    return { data: await this.pagesService.publish(pageId, siteId, user.tenantId) }
  }

  // ──────────── POST /sites/:siteId/pages/:pageId/unpublish ──

  @Post(':pageId/unpublish')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Despublicar una página' })
  async unpublish(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
  ) {
    return { data: await this.pagesService.unpublish(pageId, siteId, user.tenantId) }
  }

  // ──────────── GET /sites/:siteId/pages/:pageId/versions ──

  @Get(':pageId/versions')
  @ApiOperation({ summary: 'Historial de versiones de una página (máx. 50)' })
  async listVersions(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
  ) {
    return { data: await this.pagesService.listVersions(pageId, siteId, user.tenantId) }
  }

  // ──────────── POST /sites/:siteId/pages/:pageId/restore/:versionId ──

  @Post(':pageId/restore/:versionId')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Restaurar una versión anterior (guarda la actual antes de restaurar)' })
  async restoreVersion(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @Param('versionId') versionId: string,
  ) {
    return {
      data: await this.pagesService.restoreVersion(
        pageId,
        versionId,
        siteId,
        user.tenantId,
        user.sub,
      ),
    }
  }
}
