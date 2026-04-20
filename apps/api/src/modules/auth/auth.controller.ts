import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import type { User, TenantUser } from '@edithpress/database'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import {
  LOGIN_THROTTLE_LIMIT,
  LOGIN_THROTTLE_TTL_MS,
  FORGOT_PASSWORD_THROTTLE_LIMIT,
  FORGOT_PASSWORD_THROTTLE_TTL_MS,
  REFRESH_TOKEN_TTL_SECONDS,
} from './constants/auth.constants'

/** Cookie name para el refresh token. */
const REFRESH_COOKIE = 'refresh_token'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ────────────────────────────────────────────────── POST /auth/register ──

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario y tenant' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(dto)
    this.setRefreshCookie(res, tokens.refreshToken)
    return {
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    }
  }

  // ───────────────────────────────────────────────────── POST /auth/login ──

  /**
   * SEC-05 — Rate limiting estricto en login:
   * 5 intentos por IP cada 15 minutos.
   * Sobreescribe el ThrottlerGuard global (100 req/min).
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: LOGIN_THROTTLE_LIMIT, ttl: LOGIN_THROTTLE_TTL_MS } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos' })
  async login(
    @Req() req: Request & { user: User & { tenantUsers: TenantUser[] } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(req.user)
    this.setRefreshCookie(res, tokens.refreshToken)
    return {
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    }
  }

  // ───────────────────────────────────────────────────── POST /auth/refresh ──

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando el refresh token (cookie)' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // SEC-05 — Refresh token se lee desde httpOnly cookie
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    if (!token) {
      throw new UnauthorizedException({
        code: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token no encontrado',
      })
    }

    const tokens = await this.authService.refresh(token)
    this.setRefreshCookie(res, tokens.refreshToken)
    return {
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    }
  }

  // ────────────────────────────────────────────────────── POST /auth/logout ──

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cerrar sesión e invalidar refresh token' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    if (token) {
      await this.authService.logout(token)
    }
    // Borrar la cookie
    res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: 'strict' })
  }

  // ──────────────────────────────────────────── POST /auth/forgot-password ──

  /**
   * SEC-SPRINT02-02 — Protección de enumeración de usuarios.
   *
   * Siempre retorna la MISMA respuesta genérica, sin revelar si el email
   * está registrado. El email real se envía en background para igualar
   * el tiempo de respuesta en ambos casos.
   *
   * Rate limit estricto: 3 intentos por IP por hora (previene abuso de envío).
   */
  @Post('forgot-password')
  @Throttle({ default: { limit: FORGOT_PASSWORD_THROTTLE_LIMIT, ttl: FORGOT_PASSWORD_THROTTLE_TTL_MS } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar enlace de restablecimiento de contraseña' })
  @ApiResponse({ status: 200, description: 'Respuesta genérica (no revela si el email existe)' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email)
  }

  // ─────────────────────────────────────────── POST /auth/reset-password ──

  /**
   * Completa el flujo de restablecimiento de contraseña.
   * El token llega por query param del link enviado al email.
   * No requiere autenticación.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con el token del email' })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida correctamente' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password)
    return { data: { message: 'Contraseña actualizada correctamente' } }
  }

  // ────────────────────────────────────────────────── GET /auth/verify-email ──

  /**
   * Verifica el email del usuario usando el token enviado al registrarse.
   * Token: JWT con { sub: userId, purpose: 'email-verification' }, 24h de vida.
   * No requiere autenticación — se accede desde el link del email.
   */
  @Get('verify-email')
  @ApiOperation({ summary: 'Verificar email con el token recibido por correo' })
  @ApiResponse({ status: 200, description: 'Email verificado correctamente' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async verifyEmail(@Query('token') token: string) {
    await this.authService.verifyEmail(token)
    return { data: { message: 'Email verificado correctamente' } }
  }

  // ──────────────────────────────────────────────────────────────── HELPER ──

  /**
   * SEC-05 — Refresh token en httpOnly cookie.
   * httpOnly: no accesible desde JS (previene XSS)
   * secure: solo HTTPS en producción
   * sameSite: strict — previene CSRF
   */
  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: '/api/v1/auth',   // Solo enviado a las rutas de auth
    })
  }
}
