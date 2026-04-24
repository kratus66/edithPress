import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { TenantsService } from './tenants.service'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { UpdateTenantDto } from './dto/update-tenant.dto'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'

@ApiTags('Tenants')
@ApiBearerAuth('access-token')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // ─────────────────────────────────────────── POST /tenants ──

  /**
   * Crea un nuevo tenant (workspace) para el usuario autenticado.
   * No necesita TenantGuard porque no opera sobre un tenant existente.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear un nuevo workspace (tenant)' })
  @ApiResponse({ status: 201, description: 'Workspace creado' })
  @ApiResponse({ status: 409, description: 'Slug ya en uso' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTenantDto,
  ) {
    return { data: await this.tenantsService.create(user.sub, dto) }
  }

  // ─────────────────────────────────── GET /tenants/me/stats ──

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Stats del dashboard para el tenant autenticado' })
  @ApiResponse({ status: 200, description: 'Estadísticas del tenant' })
  async getMyStats(@CurrentUser() user: JwtPayload) {
    return { data: await this.tenantsService.getStats(user.tenantId) }
  }

  // ─────────────────────────────────────────── GET /tenants/:id ──

  /**
   * Stack de seguridad:
   * 1. JwtAuthGuard — token válido y no expirado
   * 2. TenantGuard — :id del URL coincide con tenantId del JWT (previene IDOR)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Obtener workspace por ID (solo miembros)' })
  @ApiResponse({ status: 200, description: 'Datos del workspace' })
  @ApiResponse({ status: 403, description: 'Sin acceso a este tenant' })
  async findOne(@Param('id') id: string) {
    return { data: await this.tenantsService.findById(id) }
  }

  // ─────────────────────────────────────────── PATCH /tenants/:id ──

  /**
   * Stack de seguridad:
   * 1. JwtAuthGuard — token válido
   * 2. TenantGuard — :id coincide con tenantId del JWT
   * 3. RolesGuard + @Roles('OWNER') — solo el propietario puede modificar el tenant
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Actualizar workspace (solo OWNER)' })
  @ApiResponse({ status: 200, description: 'Workspace actualizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de OWNER' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return { data: await this.tenantsService.update(id, dto) }
  }
}
