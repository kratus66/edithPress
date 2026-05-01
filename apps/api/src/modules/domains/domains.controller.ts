import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'
import { DomainsService } from './domains.service'
import { CreateDomainDto } from './dto/create-domain.dto'

/**
 * DomainsController — gestión de dominios personalizados por tenant.
 *
 * Rutas montadas bajo: tenants/:tenantId/domains
 *
 * El TenantGuard verifica que el :tenantId del URL coincide con el JWT,
 * protegiendo contra IDOR. El RolesGuard restringe las acciones destructivas
 * a usuarios con rol OWNER.
 */
@ApiTags('Domains')
@Controller('tenants/:tenantId/domains')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth('access-token')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  // ── POST /tenants/:tenantId/domains ────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({
    summary: 'Registrar dominio personalizado',
    description:
      'Registra un dominio personalizado para el tenant. ' +
      'Requiere plan con soporte de dominios custom. Solo rol OWNER.',
  })
  @ApiParam({ name: 'tenantId', description: 'ID del tenant' })
  @ApiResponse({ status: 201, description: 'Dominio registrado, pendiente de verificación' })
  @ApiResponse({ status: 400, description: 'Dominio inválido o subdominio de edithpress.com' })
  @ApiResponse({ status: 403, description: 'Plan no incluye dominios custom o rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Tenant o sitio no encontrado' })
  @ApiResponse({ status: 409, description: 'Dominio ya registrado' })
  async addDomain(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateDomainDto,
  ) {
    return {
      data: await this.domainsService.addDomain(user.tenantId, dto),
    }
  }

  // ── GET /tenants/:tenantId/domains ─────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Listar dominios del tenant',
    description: 'Retorna todos los dominios custom registrados para el tenant.',
  })
  @ApiParam({ name: 'tenantId', description: 'ID del tenant' })
  @ApiResponse({ status: 200, description: 'Lista de dominios' })
  async getDomains(@CurrentUser() user: JwtPayload) {
    return {
      data: await this.domainsService.getDomains(user.tenantId),
    }
  }

  // ── DELETE /tenants/:tenantId/domains/:domainId ────────────────────────

  @Delete(':domainId')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar dominio personalizado',
    description: 'Elimina el dominio del tenant. Solo rol OWNER.',
  })
  @ApiParam({ name: 'tenantId', description: 'ID del tenant' })
  @ApiParam({ name: 'domainId', description: 'ID del dominio a eliminar' })
  @ApiResponse({ status: 204, description: 'Dominio eliminado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Dominio no encontrado' })
  async deleteDomain(
    @CurrentUser() user: JwtPayload,
    @Param('domainId') domainId: string,
  ) {
    await this.domainsService.deleteDomain(user.tenantId, domainId)
  }

  // ── POST /tenants/:tenantId/domains/:domainId/verify ───────────────────

  @Post(':domainId/verify')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar dominio via DNS',
    description:
      'Consulta el CNAME del dominio para verificar que apunta al renderer. ' +
      'Usa dns.resolveCname() — sin fetch() al dominio del usuario (previene SSRF). ' +
      'Solo rol OWNER.',
  })
  @ApiParam({ name: 'tenantId', description: 'ID del tenant' })
  @ApiParam({ name: 'domainId', description: 'ID del dominio a verificar' })
  @ApiResponse({ status: 200, description: 'Resultado de la verificación' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Dominio no encontrado' })
  async verifyDomain(
    @CurrentUser() user: JwtPayload,
    @Param('domainId') domainId: string,
  ) {
    return {
      data: await this.domainsService.verifyDomain(user.tenantId, domainId),
    }
  }
}
