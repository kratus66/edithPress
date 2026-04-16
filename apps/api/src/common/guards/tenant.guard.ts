import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import type { Request } from 'express'
import type { JwtPayload } from '../../modules/auth/strategies/jwt.strategy'

/**
 * TenantGuard — aislamiento de datos entre tenants (multi-tenancy row-level).
 *
 * REGLA DE SEGURIDAD (OWASP A01 — Broken Access Control):
 * Nunca confiar en el tenantId del URL sin verificarlo contra el JWT.
 * Un usuario malintencionado podría cambiar el :id en la URL para
 * acceder a datos de otro tenant.
 *
 * Lo que hace este guard:
 * 1. Verifica que el JWT contiene un tenantId válido
 * 2. Si la URL tiene :id o :tenantId, verifica que coincida con el JWT
 * 3. Inyecta req.tenantId para que los servicios lo lean (en lugar del URL param)
 *
 * Uso: @UseGuards(JwtAuthGuard, TenantGuard)
 * — siempre DESPUÉS de JwtAuthGuard (que inyecta req.user)
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload; tenantId: string }>()

    const user = request.user

    if (!user?.tenantId) {
      throw new ForbiddenException({
        code: 'NO_ACTIVE_TENANT',
        message: 'No tienes un tenant activo',
      })
    }

    // Si la ruta expone :id o :tenantId, verificar que coincida con el JWT
    // Esto previene IDOR (Insecure Direct Object Reference)
    const params = request.params as Record<string, string>
    const urlTenantId = params['tenantId'] ?? params['id']

    if (urlTenantId && urlTenantId !== user.tenantId) {
      throw new ForbiddenException({
        code: 'TENANT_ACCESS_DENIED',
        message: 'No tienes acceso a este recurso',
      })
    }

    // Propagar tenantId verificado al resto del pipeline
    // Los servicios deben usar req.tenantId, NUNCA req.params.id directamente
    request.tenantId = user.tenantId

    return true
  }
}
