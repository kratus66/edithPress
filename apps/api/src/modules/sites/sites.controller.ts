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
import { SitesService } from './sites.service'
import { CreateSiteDto } from './dto/create-site.dto'
import { UpdateSiteDto } from './dto/update-site.dto'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'

@ApiTags('Sites')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  // ─────────────────────────────── GET /sites ──

  @Get()
  @ApiOperation({ summary: 'Listar sitios del tenant' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.sitesService.findAll(
      user.tenantId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
    )
    return { data: result.items, meta: { page: result.page, limit: result.limit, total: result.total } }
  }

  // ─────────────────────────────── POST /sites ──

  @Post()
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Crear un sitio' })
  @ApiResponse({ status: 201, description: 'Sitio creado' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSiteDto,
  ) {
    return { data: await this.sitesService.create(user.tenantId, dto) }
  }

  // ─────────────────────────────── GET /sites/:siteId ──

  @Get(':siteId')
  @ApiOperation({ summary: 'Obtener un sitio' })
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
  ) {
    return { data: await this.sitesService.findOne(siteId, user.tenantId) }
  }

  // ─────────────────────────────── PATCH /sites/:siteId ──

  @Patch(':siteId')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Actualizar un sitio' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Body() dto: UpdateSiteDto,
  ) {
    return { data: await this.sitesService.update(siteId, user.tenantId, dto) }
  }

  // ─────────────────────────────── DELETE /sites/:siteId ──

  @Delete(':siteId')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un sitio (solo OWNER)' })
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
  ) {
    await this.sitesService.remove(siteId, user.tenantId)
  }

  // ─────────────────────────────── POST /sites/:siteId/publish ──

  @Post(':siteId/publish')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Publicar un sitio' })
  async publish(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
  ) {
    return { data: await this.sitesService.publish(siteId, user.tenantId) }
  }

  // ─────────────────────────────── POST /sites/:siteId/unpublish ──

  @Post(':siteId/unpublish')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @ApiOperation({ summary: 'Despublicar un sitio' })
  async unpublish(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
  ) {
    return { data: await this.sitesService.unpublish(siteId, user.tenantId) }
  }
}
