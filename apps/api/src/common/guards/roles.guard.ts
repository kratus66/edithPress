import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import type { JwtPayload } from '../../modules/auth/strategies/jwt.strategy'

/**
 * Verifica que el usuario tenga alguno de los roles declarados con @Roles().
 *
 * Si el endpoint no tiene @Roles(), deja pasar (opt-in).
 * Siempre usar después de JwtAuthGuard:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('OWNER')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // Sin @Roles() declarado → el endpoint no requiere rol específico
    if (!requiredRoles || requiredRoles.length === 0) return true

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>()
    const userRole = request.user?.role

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_ROLE',
        message: `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      })
    }

    return true
  }
}
