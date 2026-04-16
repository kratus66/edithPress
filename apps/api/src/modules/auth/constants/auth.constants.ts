/**
 * SEC-01 — Constantes de seguridad del módulo auth.
 * Centralizadas aquí para que cualquier revisión de seguridad
 * tenga un único punto de verdad.
 */

/** Rounds de bcrypt. OWASP recomienda >= 10; usamos 12 para mayor resistencia. */
export const BCRYPT_ROUNDS = 12

/** Vida del access token (ms). 15 minutos según ADR de arquitectura. */
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60

/** Vida del refresh token (ms). 7 días. */
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

/**
 * Rate limit para /auth/login:
 * máximo 5 intentos por IP en 15 minutos.
 * (ThrottlerModule permite sobreescribir por endpoint con @Throttle)
 */
export const LOGIN_THROTTLE_LIMIT = 5
export const LOGIN_THROTTLE_TTL_MS = 15 * 60 * 1000

/** Prefijo de Redis para tokens de refresco. */
export const REDIS_REFRESH_PREFIX = 'refresh_token:'

/** Prefijo de Redis para sesiones activas. */
export const REDIS_SESSION_PREFIX = 'session:'

/**
 * Vida del token de verificación de email.
 * 24 horas — tiempo suficiente para que el usuario haga clic en el enlace.
 */
export const EMAIL_VERIFICATION_TOKEN_TTL = '24h'
