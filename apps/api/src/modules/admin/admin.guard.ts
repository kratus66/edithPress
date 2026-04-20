import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import type { Request } from 'express'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'

/**
 * SuperAdminGuard — protege los endpoints de /admin/*.
 *
 * Un usuario es super-admin si tiene el campo `isSuperAdmin = true` en su JWT,
 * o si pertenece a un tenant con slug === 'super-admin' con rol OWNER.
 *
 * Actualmente: verifica la propiedad `isSuperAdmin` del payload JWT.
 * (El campo se puede agregar al JWT en generateTokens cuando el usuario
 * tenga el tenant super-admin asignado — implementar en FASE 2).
 *
 * Fallback seguro: si el JWT no tiene `isSuperAdmin: true`, denegar siempre.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload & { isSuperAdmin?: boolean } }>()
    const user = request.user

    if (!user?.isSuperAdmin) {
      throw new ForbiddenException({
        code: 'SUPER_ADMIN_REQUIRED',
        message: 'Acceso denegado — se requieren permisos de super administrador',
      })
    }

    return true
  }
}
