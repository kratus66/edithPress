import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { DatabaseService } from '../../database/database.service'
import type { JwtPayload } from '../../auth/strategies/jwt.strategy'

/**
 * Restringe el acceso al tenant cuyo slug es 'super-admin'.
 * Siempre usar después de JwtAuthGuard.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>()
    const { tenantId } = request.user ?? {}

    if (!tenantId) {
      throw new ForbiddenException({ code: 'SUPER_ADMIN_REQUIRED', message: 'Acceso denegado' })
    }

    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true },
    })

    if (tenant?.slug !== 'super-admin') {
      throw new ForbiddenException({
        code: 'SUPER_ADMIN_REQUIRED',
        message: 'Acceso restringido a super-administradores',
      })
    }

    return true
  }
}
