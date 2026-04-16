import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'
import type { User, TenantUser } from '@edithpress/database'

/**
 * SEC-05 — Local strategy (email + password).
 * passport-local usa por defecto los campos "username" y "password";
 * sobreescribimos usernameField a "email".
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' })
  }

  /**
   * Mensaje de error genérico para no revelar si el email existe.
   * (A01 prevención: no enumerar usuarios)
   */
  async validate(email: string, password: string): Promise<User & { tenantUsers: TenantUser[] }> {
    const user = await this.authService.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas')
    }
    return user
  }
}
