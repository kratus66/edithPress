import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { randomUUID, randomBytes, createHash } from 'crypto'
import type { User, TenantUser } from '@edithpress/database'
import { DatabaseService } from '../database/database.service'
import { RedisService } from '../redis/redis.service'
import { MailerService } from '../mailer/mailer.service'
import {
  BCRYPT_ROUNDS,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_SECONDS,
  REDIS_REFRESH_PREFIX,
  EMAIL_VERIFICATION_TOKEN_TTL,
  PASSWORD_RESET_TTL_MS,
} from './constants/auth.constants'
import type { RegisterDto } from './dto/register.dto'
import type { JwtPayload } from './strategies/jwt.strategy'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/**
 * AuthService — seguridad implementada:
 * ✅ bcrypt 12 rounds para contraseñas
 * ✅ Refresh tokens opacos (UUID v4) en httpOnly cookie
 * ✅ Redis para revocación inmediata de refresh tokens (logout efectivo)
 * ✅ Rotación de refresh token en cada uso (previene replay)
 * ✅ Mensaje de error genérico en login (no enumera usuarios)
 * ✅ Timing attack mitigation en validateUser (bcrypt siempre se ejecuta)
 * ✅ Forgot-password: token SHA-256 en DB, fire-and-forget, respuesta constante
 * ✅ Reset-password: token de un solo uso con expiración
 * ✅ Emails transaccionales via MailerService (Resend en prod, consola en dev)
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailerService: MailerService,
  ) {}

  // ─────────────────────────────────────────────────────────────── REGISTER ──

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.db.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    })
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Ya existe una cuenta con ese email',
      })
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS)

    const { user, tenant } = await this.db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      })

      const slug = await this.generateUniqueSlug(
        dto.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        tx,
      )

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
        data: { userId: newUser.id, tenantId: newTenant.id, role: 'OWNER' },
      })

      return { user: newUser, tenant: newTenant }
    })

    this.logger.log(`Nuevo registro: userId=${user.id} tenantId=${tenant.id}`)

    // Email de verificación en background (no bloquea la respuesta)
    const verificationToken = this.generateEmailVerificationToken(user.id, user.email)
    this.mailerService.sendVerificationEmail(user.email, verificationToken).catch((err: unknown) => {
      this.logger.error(`Error enviando email de verificación a ${user.email}: ${String(err)}`)
    })

    return this.generateTokens(user.id, user.email, tenant.id, 'OWNER')
  }

  // ────────────────────────────────────────────────────────────────── LOGIN ──

  /**
   * Valida credenciales. Llamado por LocalStrategy.
   * Retorna null para que LocalStrategy emita el mensaje genérico.
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
      // Timing attack mitigation — bcrypt siempre se ejecuta
      await bcrypt.compare(password, '$2b$12$invalidhashtopreventtimingattack00000000000000000')
      return null
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) return null

    return user
  }

  async login(user: User & { tenantUsers: TenantUser[] }): Promise<AuthTokens> {
    if (!user.emailVerified) {
      throw new ForbiddenException({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Debes verificar tu email antes de iniciar sesión',
      })
    }

    const primaryTenantUser = user.tenantUsers[0]
    if (!primaryTenantUser) throw new InternalServerErrorException('Usuario sin tenant asignado')

    return this.generateTokens(user.id, user.email, primaryTenantUser.tenantId, primaryTenantUser.role)
  }

  // ─────────────────────────────────────────────────────────────── REFRESH ──

  /**
   * Rota el refresh token. Verifica primero en Redis (revocación inmediata)
   * y luego en DB como fuente de verdad.
   */
  async refresh(oldRefreshToken: string): Promise<AuthTokens> {
    const redisKey = `${REDIS_REFRESH_PREFIX}${oldRefreshToken}`

    // 1. Verificar en Redis — si no existe, el token fue revocado (logout)
    const existsInRedis = await this.redisService.exists(redisKey).catch(() => true)
    // Si Redis falla, fallback a DB (no denegar por error de infra)
    if (!existsInRedis) {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Token de refresco inválido o expirado',
      })
    }

    // 2. Obtener de DB como fuente de verdad
    const tokenRecord = await this.db.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: { include: { tenantUsers: true } } },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      // Limpiar Redis si el token ya expiró en DB
      await this.redisService.del(redisKey).catch(() => null)
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Token de refresco inválido o expirado',
      })
    }

    // 3. Rotar: eliminar token viejo de Redis y DB
    await Promise.all([
      this.redisService.del(redisKey).catch(() => null),
      this.db.refreshToken.delete({ where: { id: tokenRecord.id } }),
    ])

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

  /** Revoca el refresh token inmediatamente en Redis + DB. */
  async logout(refreshToken: string): Promise<void> {
    const redisKey = `${REDIS_REFRESH_PREFIX}${refreshToken}`
    await Promise.all([
      this.redisService.del(redisKey).catch(() => null),
      this.db.refreshToken.deleteMany({ where: { token: refreshToken } }),
    ])
  }

  // ─────────────────────────────────────────────────── VERIFY EMAIL ──

  generateEmailVerificationToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email, purpose: 'email-verification' },
      { expiresIn: EMAIL_VERIFICATION_TOKEN_TTL },
    )
  }

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

  // ─────────────────────────────────────────────── FORGOT / RESET PASSWORD ──

  /**
   * Inicia el flujo de restablecimiento de contraseña.
   *
   * Siempre retorna la MISMA respuesta — no revela si el email está registrado.
   * La generación del token y el envío del email son fire-and-forget.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const SAFE_RESPONSE = {
      message: 'Si el email está registrado, recibirás un enlace de restablecimiento',
    }

    this.processForgotPassword(email.toLowerCase()).catch((err: unknown) => {
      this.logger.error(`Error en processForgotPassword(${email}): ${String(err)}`)
    })

    return SAFE_RESPONSE
  }

  /**
   * Lógica real — ejecutada en background para no bloquear la respuesta.
   *
   * 1. Verificar que el usuario existe y está activo (silencioso si no)
   * 2. Generar token aleatorio opaco (32 bytes hex)
   * 3. Guardar SHA-256 del token en PasswordResetToken (válido 1h)
   * 4. Enviar el token plano al email del usuario via MailerService
   */
  private async processForgotPassword(email: string): Promise<void> {
    const user = await this.db.user.findUnique({ where: { email } })
    if (!user || !user.isActive) return

    // Invalidar tokens de reset anteriores para este usuario
    await this.db.passwordResetToken.deleteMany({ where: { userId: user.id } })

    // Generar token opaco (no JWT — no revelan info del usuario)
    const plainToken = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(plainToken).digest('hex')
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

    await this.db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    await this.mailerService.sendPasswordResetEmail(email, plainToken)
    this.logger.log(`Password reset solicitado: userId=${user.id}`)
  }

  /**
   * Completa el flujo: valida el token y actualiza la contraseña.
   *
   * El token recibido es el plain token (hex). Se hashea con SHA-256
   * para buscar en DB. El token se invalida tras el uso (usedAt = now).
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex')

    const record = await this.db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })

    if (!record || record.usedAt !== null || record.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'INVALID_RESET_TOKEN',
        message: 'El enlace de restablecimiento es inválido o ha expirado',
      })
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

    // Transacción: actualizar contraseña + marcar token como usado
    await this.db.$transaction([
      this.db.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Invalidar todos los refresh tokens activos (forzar re-login)
      this.db.refreshToken.deleteMany({ where: { userId: record.userId } }),
    ])

    this.logger.log(`Contraseña restablecida: userId=${record.userId}`)
  }

  // ─────────────────────────────────────────────────── HELPERS PRIVADOS ──

  private async generateTokens(
    userId: string,
    email: string,
    tenantId: string,
    role: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, tenantId, role }
    const accessToken = this.jwtService.sign(payload)

    // Refresh token opaco (UUID v4)
    const refreshToken = randomUUID()
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
    const redisKey = `${REDIS_REFRESH_PREFIX}${refreshToken}`

    // Persistir en DB + Redis en paralelo
    await Promise.all([
      this.db.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } }),
      this.redisService.set(redisKey, '1', REFRESH_TOKEN_TTL_SECONDS).catch(() => null),
    ])

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
