import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { IsBoolean as IsValidBoolean } from 'class-validator'
import { Type } from 'class-transformer'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SuperAdminGuard } from './admin.guard'
import { AdminService } from './admin.service'

class UpdateTenantStatusDto {
  @IsValidBoolean()
  @Type(() => Boolean)
  isActive: boolean
}

/**
 * AdminController — endpoints de super-administración.
 * Prefijo: /admin (sobre el /api/v1 global)
 * Protegido por: JwtAuthGuard + SuperAdminGuard
 */
@ApiTags('Super Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─────────────────────────────────── GET /admin/stats ──

  @Get('stats')
  @ApiOperation({ summary: 'KPIs del sistema: tenants, sitios, MRR' })
  @ApiResponse({ status: 200, description: 'Estadísticas globales' })
  async getStats() {
    const data = await this.adminService.getStats()
    return { data }
  }

  // ─────────────────────────────────── GET /admin/tenants ──

  @Get('tenants')
  @ApiOperation({ summary: 'Listar todos los tenants (paginado + filtros)' })
  async getTenants(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.adminService.getTenants({ page, limit, search, status })
    return {
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total },
    }
  }

  // ─────────────────────────────────── GET /admin/tenants/:id ──

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Detalle completo de un tenant' })
  async getTenant(@Param('id') id: string) {
    const data = await this.adminService.getTenantById(id)
    return { data }
  }

  // ─────────────────────────────────── PATCH /admin/tenants/:id/status ──

  @Patch('tenants/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar o suspender un tenant' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    const data = await this.adminService.updateTenantStatus(id, dto.isActive)
    return { data }
  }

  // ─────────────────────────────────── GET /admin/plans ──

  @Get('plans')
  @ApiOperation({ summary: 'Listar planes con conteo de tenants activos' })
  async getPlans() {
    const data = await this.adminService.getPlans()
    return { data }
  }
}
