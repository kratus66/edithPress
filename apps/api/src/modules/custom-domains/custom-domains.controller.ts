import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common'
import { timingSafeEqual } from 'crypto'
import { SkipThrottle } from '@nestjs/throttler'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'
import { CustomDomainsService } from './custom-domains.service'
import { AddDomainDto } from './dto/add-domain.dto'

@ApiTags('Custom Domains')
@Controller('sites/:siteId/domain')
export class CustomDomainsController {
  constructor(
    private readonly customDomainsService: CustomDomainsService,
    private readonly config: ConfigService,
  ) {}

  // ── POST /sites/:siteId/domain ──────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Registrar dominio personalizado',
    description:
      'Registra un dominio personalizado para el sitio. ' +
      'Retorna las instrucciones DNS y el txtRecord para verificación.',
  })
  @ApiParam({ name: 'siteId', description: 'ID del sitio' })
  @ApiResponse({ status: 201, description: 'Dominio registrado, pendiente de verificación' })
  @ApiResponse({ status: 400, description: 'Dominio inválido o no permitido' })
  @ApiResponse({ status: 409, description: 'Dominio ya registrado' })
  async addDomain(
    @Param('siteId') siteId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddDomainDto,
  ) {
    return {
      data: await this.customDomainsService.addDomain(siteId, user.tenantId, dto),
    }
  }

  // ── GET /sites/:siteId/domain ───────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener dominio personalizado del sitio',
    description: 'Retorna el CustomDomain del sitio o null si no tiene ninguno.',
  })
  @ApiParam({ name: 'siteId', description: 'ID del sitio' })
  @ApiResponse({ status: 200, description: 'Dominio del sitio (puede ser null)' })
  async getDomain(
    @Param('siteId') siteId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return {
      data: await this.customDomainsService.getDomain(siteId, user.tenantId),
    }
  }

  // ── POST /sites/:siteId/domain/verify ──────────────────────────────────

  @Post('verify')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Verificar dominio personalizado via DNS',
    description:
      'Consulta el registro TXT en DNS para verificar la propiedad del dominio. ' +
      'Máximo 5 intentos por hora. Si es exitoso, el dominio queda ACTIVE.',
  })
  @ApiParam({ name: 'siteId', description: 'ID del sitio' })
  @ApiResponse({ status: 200, description: 'Resultado de la verificación' })
  @ApiResponse({ status: 403, description: 'Rate limit superado' })
  @ApiResponse({ status: 404, description: 'Dominio no configurado' })
  async verifyDomain(
    @Param('siteId') siteId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return {
      data: await this.customDomainsService.verifyDomain(siteId, user.tenantId),
    }
  }

  // ── DELETE /sites/:siteId/domain ────────────────────────────────────────

  @Delete()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Eliminar dominio personalizado',
    description: 'Elimina el dominio personalizado del sitio. El sitio vuelve a usar el subdominio de EdithPress.',
  })
  @ApiParam({ name: 'siteId', description: 'ID del sitio' })
  @ApiResponse({ status: 204, description: 'Dominio eliminado' })
  @ApiResponse({ status: 404, description: 'Dominio no configurado' })
  async removeDomain(
    @Param('siteId') siteId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.customDomainsService.removeDomain(siteId, user.tenantId)
  }
}

/**
 * RendererDomainController — endpoint interno para el renderer Next.js.
 *
 * Protegido por X-Renderer-Secret (shared secret entre API y renderer).
 * Usado por el renderer para resolver dominios personalizados al sitio correcto.
 *
 * Se monta en el prefijo /renderer (junto con RendererController).
 */
@ApiTags('Renderer (público)')
@Controller('renderer/domain')
export class RendererDomainController {
  constructor(
    private readonly customDomainsService: CustomDomainsService,
    private readonly config: ConfigService,
  ) {}

  // ── GET /renderer/domain/:domain ────────────────────────────────────────

  @Get(':domain')
  @SkipThrottle()
  @ApiSecurity('X-Renderer-Secret')
  @ApiOperation({
    summary: 'Resolver dominio personalizado (interno — renderer)',
    description:
      'Busca un CustomDomain activo por nombre de dominio y retorna el tenantSlug + siteId. ' +
      'Requiere header X-Renderer-Secret válido.',
  })
  @ApiParam({ name: 'domain', description: 'Nombre de dominio a resolver' })
  @ApiResponse({ status: 200, description: 'Dominio resuelto' })
  @ApiResponse({ status: 401, description: 'Secret inválido' })
  @ApiResponse({ status: 404, description: 'Dominio no encontrado o no verificado' })
  async lookupDomain(
    @Param('domain') domain: string,
    @Headers('x-renderer-secret') secret: string,
  ) {
    const expectedSecret = this.config.get<string>('RENDERER_SECRET')
    // SEC — timing-safe comparison para evitar timing attacks sobre el shared secret.
    // `===` permite medir diferencias de tiempo según el primer char que difiere.
    // timingSafeEqual compara en tiempo constante independientemente del contenido.
    const secretValid =
      !!expectedSecret &&
      !!secret &&
      secret.length === expectedSecret.length &&
      timingSafeEqual(Buffer.from(secret), Buffer.from(expectedSecret))

    if (!secretValid) {
      throw new UnauthorizedException({
        code: 'INVALID_RENDERER_SECRET',
        message: 'Secret del renderer inválido',
      })
    }

    return { data: await this.customDomainsService.lookupByDomain(domain) }
  }
}
