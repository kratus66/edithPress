import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { JwtPayload } from '../../modules/auth/strategies/jwt.strategy'

/**
 * Extrae el payload del JWT (inyectado por JwtStrategy) del request.
 * Uso: @CurrentUser() user: JwtPayload
 *
 * IMPORTANTE: solo funciona en rutas protegidas con @UseGuards(JwtAuthGuard).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>()
    return request.user
  },
)
