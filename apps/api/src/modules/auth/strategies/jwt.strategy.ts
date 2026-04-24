import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

export interface JwtPayload {
  sub: string          // userId
  email: string
  tenantId: string
  tenantSlug?: string  // slug del tenant (ej: "mi-empresa") para construir URLs del renderer
  role: string         // TenantRole
  isSuperAdmin?: boolean
}

/**
 * SEC-05 — JWT strategy con validaciones de seguridad:
 * - Extrae el token del header Authorization: Bearer
 * - ignoreExpiration: false → NestJS rechaza tokens vencidos
 * - El secret se obtiene de ConfigService (nunca hardcodeado)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET')
    if (!secret) throw new Error('JWT_SECRET no está definido en las variables de entorno')

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }

  /**
   * El payload ya fue verificado (firma + expiración).
   * Solo validamos que tenga los campos requeridos.
   */
  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Token inválido')
    }
    // Super admins have no tenantId — allow empty string
    if (!payload.isSuperAdmin && !payload.tenantId) {
      throw new UnauthorizedException('Token inválido')
    }
    return payload
  }
}
