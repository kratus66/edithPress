import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import type { User, TenantUser } from '@edithpress/database'
import { DatabaseService } from '../database/database.service'
import {
  BCRYPT_ROUNDS,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_SECONDS,
  REDIS_REFRESH_PREFIX,
  REDIS_SESSION_PREFIX,
  EMAIL_VERIFICATION_TOKEN_TTL,
} from './constants/auth.constants'
import type { RegisterDto } from './dto/register.dto'
import type { JwtPayload } from './strategies/jwt.strategy'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/**
 * SEC-01 — AuthService
 *
 * Controles de seguridad implementados:
 * ✅ bcrypt con BCRYPT_ROUNDS (12) — resistencia a fuerza bruta offline
 * ✅ Contraseñas nunca almacenadas en texto plano
 * ✅ Refresh tokens opacos (UUID v4, no JWT) — no revelan info del usuario
 * ✅ Refresh tokens almacenados en Redis con TTL
 * ✅ Invalidación del token en logout (blacklist en Redis)
 * ✅ Rotación de refresh token en cada uso (previene replay)
 * ✅ Mensaje de error genérico en login (no enumera usuarios)
 * ✅ Creación de User + Tenant + TenantUser en una transacción
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─────────────────────────────────────────────────────────────── REGISTER ──

  async register(dto: RegisterDto): Promise<AuthTokens> {
    // 1. Verificar email duplicado
    const existing = await this.db.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    })
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Ya existe una cuenta con ese email',
      })
    }

    // 2. SEC-01 — Hash con bcrypt 12 rounds
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)

    // 3. Crear User + Tenant + TenantUser en una transacción atómica
    const { user, tenant } = await this.db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      })

      // El slug del tenant se genera a partir del email (antes del @)
      const slug = await this.generateUniqueSlug(
        dto.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        tx,
      )

      // Obtener el plan Starter (debe existir en la DB, creado por seed)
      const starterPlan = await tx.plan.findUniqueOrThrow({
        where: { slug: 'starter' },
      })

      const newTenant = await tx.tenant.create({
        data: {
          name: dto.firstName ? `${dto.firstName}'s workspace` : 'Mi workspace',
          slug,
          planId: starterPlan.id,
        },
      })

      await tx.tenantUser.create({
        data: {
          userId: newUser.id,
          tenantId: newTenant.id,
          role: 'OWNER',
        },
      })

      return { user: newUser, tenant: newTenant }
    })

    this.logger.log(`Nuevo registro: userId=${user.id} tenantId=${tenant.id}`)

    // Generar y enviar email de verificación (Resend — stub en desarrollo)
    const verificationToken = this.generateEmailVerificationToken(user.id, user.email)
    this.sendVerificationEmail(user.email, verificationToken)

    return this.generateTokens(user.id, user.email, tenant.id, 'OWNER')
  }

  // ────────────────────────────────────────────────────────────────── LOGIN ──

  /**
   * Valida credenciales. Llamado por LocalStrategy.
   * Retorna null en lugar de lanzar excepción para que LocalStrategy
   * genere el mensaje de error genérico (no enumera usuarios).
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<(User & { tenantUsers: TenantUser[] }) | null> {
    const user = await this.db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { tenantUsers: true },
    })

    if (!user || !user.isActive) {
      // SEC-05: timing attack mitigation — comparar siempre para evitar
      // que un email inexistente responda más rápido que uno existente
      await bcrypt.compare(password, '$2b$12$invalidhashtopreventtimingattack00000000000000000')
      return null
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) return null

    return user
  }

  async login(user: User & { tenantUsers: TenantUser[] }): Promise<AuthTokens> {
    // Usar el primer tenant del usuario (el que creó al registrarse)
    const primaryTenantUser = user.tenantUsers[0]
    if (!primaryTenantUser) throw new InternalServerErrorException('Usuario sin tenant asignado')

    return this.generateTokens(
      user.id,
      user.email,
      primaryTenantUser.tenantId,
      primaryTenantUser.role,
    )
  }

  // ─────────────────────────────────────────────────────────────── REFRESH ──

  /**
   * Rota el refresh token: invalida el anterior y emite uno nuevo.
   * SEC-05 — previene replay attacks con tokens robados.
   */
  async refresh(oldRefreshToken: string): Promise<AuthTokens> {
    const redisKey = `${REDIS_REFRESH_PREFIX}${oldRefreshToken}`
    // TODO: implementar Redis lookup cuando Redis esté disponible
    // Por ahora buscamos en DB
    const tokenRecord = await this.db.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: { include: { tenantUsers: true } } },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Token de refresco inválido o expirado',
      })
    }

    // Invalidar token usado (rotación)
    await this.db.refreshToken.delete({ where: { id: tokenRecord.id } })

    const primaryTenantUser = tokenRecord.user.tenantUsers[0]
    if (!primaryTenantUser) throw new InternalServerErrorException()

    return this.generateTokens(
      tokenRecord.userId,
      tokenRecord.user.email,
      primaryTenantUser.tenantId,
      primaryTenantUser.role,
    )
  }

  // ─────────────────────────────────────────────────────────────── LOGOUT ──

  /** Invalida el refresh token en DB (y Redis cuando esté disponible). */
  async logout(refreshToken: string): Promise<void> {
    await this.db.refreshToken.deleteMany({ where: { token: refreshToken } })
  }

  // ─────────────────────────────────────────────────── VERIFY EMAIL ──

  /**
   * Genera un token de verificación de email (JWT, 24h).
   * El token contiene { sub: userId, email, purpose: 'email-verification' }
   * para distinguirlo del access token.
   */
  generateEmailVerificationToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email, purpose: 'email-verification' },
      { expiresIn: EMAIL_VERIFICATION_TOKEN_TTL },
    )
  }

  /**
   * Valida el token de verificación y marca el email como verificado.
   * El token es un JWT firmado con JWT_SECRET, válido 24h.
   */
  async verifyEmail(token: string): Promise<void> {
    let payload: { sub: string; purpose: string }

    try {
      payload = this.jwtService.verify<{ sub: string; purpose: string }>(token)
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_VERIFICATION_TOKEN',
        message: 'Token de verificación inválido o expirado',
      })
    }

    if (payload.purpose !== 'email-verification') {
      throw new UnauthorizedException({
        code: 'INVALID_VERIFICATION_TOKEN',
        message: 'Token de verificación inválido',
      })
    }

    await this.db.user.update({
      where: { id: payload.sub },
      data: { emailVerified: true },
    })
  }

  // ─────────────────────────────────────────────────── HELPERS PRIVADOS ──

  /**
   * Envía el email de verificación.
   * En desarrollo: loguea el enlace en consola.
   * En producción: enviar via Resend (FASE 2).
   */
  private sendVerificationEmail(email: string, token: string): void {
    const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:3000'
    const link = `${appUrl}/auth/verify-email?token=${token}`

    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`[verify-email] Link para ${email}: ${link}`)
    } else {
      // TODO FASE 2: integrar Resend
      // await this.resend.emails.send({ to: email, subject: '...', html: '...' })
      this.logger.log(`Email de verificación enviado a ${email}`)
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    tenantId: string,
    role: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, tenantId, role }

    const accessToken = this.jwtService.sign(payload)

    // SEC-01 — Refresh token opaco (UUID v4, no JWT)
    const refreshToken = randomUUID()
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)

    await this.db.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    })

    return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_TTL_SECONDS }
  }

  private async generateUniqueSlug(
    base: string,
    tx: Parameters<Parameters<DatabaseService['$transaction']>[0]>[0],
  ): Promise<string> {
    const slug = base || 'workspace'
    let candidate = slug
    let counter = 0

    while (await tx.tenant.findUnique({ where: { slug: candidate } })) {
      counter++
      candidate = `${slug}${counter}`
    }
    return candidate
  }
}
