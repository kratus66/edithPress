import { SetMetadata } from '@nestjs/common'

export const ROLES_KEY = 'roles'

/**
 * Decorador para declarar qué roles tienen acceso a un endpoint.
 * Uso: @Roles('OWNER') o @Roles('OWNER', 'EDITOR')
 *
 * Siempre combinar con @UseGuards(JwtAuthGuard, RolesGuard).
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)
