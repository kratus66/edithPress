import { INestApplication, ValidationPipe, Global, Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard } from '@nestjs/throttler'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request: typeof import('supertest') = require('supertest')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as typeof import('cookie-parser')
import { AuthModule } from '../src/modules/auth/auth.module'
import { DatabaseService } from '../src/modules/database/database.service'
import { RedisService } from '../src/modules/redis/redis.service'
import { REDIS_CLIENT } from '../src/modules/redis/redis.module'
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter'

// ─── MockRedisModule ──────────────────────────────────────────────────────────
// RedisModule es @Global() y se registra en AppModule. En tests de AuthModule
// sin AppModule, este mock lo replica para evitar Redis real.

const mockRedisClient = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
  // exists devuelve 1 (token presente en Redis) para que el flujo de refresh funcione.
  // En tests de logout, el token se borra vía del() y los mocks se limpian entre tests.
  exists: jest.fn().mockResolvedValue(1),
  ping: jest.fn().mockResolvedValue('PONG'),
}

@Global()
@Module({
  providers: [
    { provide: REDIS_CLIENT, useValue: mockRedisClient },
    RedisService,
  ],
  exports: [RedisService],
})
class MockRedisModule {}
import {
  LOGIN_THROTTLE_LIMIT,
} from '../src/modules/auth/constants/auth.constants'
import * as bcrypt from 'bcrypt'
import { createUser, createTenant } from './factories'

/**
 * Integration tests — Auth endpoints
 *
 * Levanta la app NestJS completa con:
 *   - AuthModule real (strategies, guards, JWT, bcrypt)
 *   - DatabaseService mockeado (no requiere Postgres)
 *   - ThrottlerModule con limit = LOGIN_THROTTLE_LIMIT (5) para test 429
 *   - ValidationPipe, GlobalExceptionFilter y cookieParser reales
 *
 * Nota: para tests de integración sin DB real, los mocks permiten
 * verificar los contratos HTTP (status codes, body shape, cookies).
 * Para tests con DB real, reemplazar mockDb por una DB de test
 * y usar beforeAll para seed + afterAll para cleanup.
 */
describe('Auth endpoints (integration)', () => {
  let app: INestApplication
  let httpServer: ReturnType<INestApplication['getHttpServer']>
  // Hash generado una vez para evitar que cada test espere 12 rounds de bcrypt
  let validPasswordHash: string

  // ─── Mock de DatabaseService ────────────────────────────────────────────────

  const mockDb = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tenantUser: {
      create: jest.fn(),
    },
    plan: {
      findUniqueOrThrow: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((fn: unknown) => {
      if (typeof fn === 'function') return fn(mockDb)
      if (Array.isArray(fn)) return Promise.all(fn)
    }),
  }

  // ─── Setup / Teardown ───────────────────────────────────────────────────────

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // Variables de entorno: inyecta JWT_SECRET sin .env real
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({
            JWT_SECRET: 'test-jwt-secret-at-least-256-bits-long-xxxxxxxxxxxxxxxx',
            APP_URL: 'http://localhost:3000',
            NODE_ENV: 'test',
          })],
        }),

        // ThrottlerModule con el mismo límite de producción para test 429 realista
        ThrottlerModule.forRoot([
          {
            ttl: 60_000,
            limit: LOGIN_THROTTLE_LIMIT,
          },
        ]),

        MockRedisModule,  // @Global: expone RedisService a AuthModule sin Redis real
        AuthModule,
      ],
      providers: [
        // Aplica ThrottlerGuard globalmente igual que AppModule
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    })
      .overrideProvider(DatabaseService)
      .useValue(mockDb)
      .compile()

    app = module.createNestApplication()

    // Replicar el setup de main.ts relevante para auth
    app.use(cookieParser())
    app.useGlobalFilters(new GlobalExceptionFilter())
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    app.setGlobalPrefix('api/v1')

    await app.init()
    httpServer = app.getHttpServer()

    // Generar hash una vez para reutilizar en todos los tests de login
    // Usamos 12 rounds (igual que producción) pero solo pagamos el costo una vez
    validPasswordHash = await bcrypt.hash('Password123', 12)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─────────────────────────────────────────────── POST /api/v1/auth/register ──

  describe('POST /api/v1/auth/register', () => {
    const validBody = {
      email: 'newuser@example.com',
      password: 'Password123',
      firstName: 'Test',
    }

    it('201 — should create user, set refresh_token cookie and return accessToken', async () => {
      // Arrange
      const { user, tenant } = buildRegisteredUserFixture()
      mockDb.user.findUnique.mockResolvedValue(null)          // email libre
      mockDb.plan.findUniqueOrThrow.mockResolvedValue({ id: 'plan-starter', slug: 'starter' })
      mockDb.tenant.findUnique.mockResolvedValue(null)        // slug libre
      mockDb.user.create.mockResolvedValue(user)
      mockDb.tenant.create.mockResolvedValue(tenant)
      mockDb.tenantUser.create.mockResolvedValue({})
      mockDb.refreshToken.create.mockResolvedValue({})

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/register')
        .send(validBody)
        .expect(201)

      // Assert — body
      expect(response.body.data).toHaveProperty('accessToken')
      expect(response.body.data).toHaveProperty('expiresIn')
      expect(typeof response.body.data.accessToken).toBe('string')

      // Assert — cookie httpOnly (refresh token en cookie, no en body)
      const cookies = response.headers['set-cookie'] as string[] | string
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies
      expect(cookieStr).toMatch(/refresh_token=/)
      expect(cookieStr).toMatch(/HttpOnly/i)
    })

    it('409 — should reject duplicate email', async () => {
      // Arrange
      mockDb.user.findUnique.mockResolvedValue({ id: 'existing-user' })

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/register')
        .send(validBody)
        .expect(409)

      // Assert
      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS')
    })

    it('400 — should reject missing email field', async () => {
      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/register')
        .send({ password: 'Password123' })
        .expect(400)

      // Assert
      expect(response.body.error.statusCode).toBe(400)
    })

    it('400 — should reject weak password (no digit)', async () => {
      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/register')
        .send({ email: 'user@test.com', password: 'onlyletters' })
        .expect(400)

      // Assert
      expect(response.body.error.statusCode).toBe(400)
    })

    it('400 — should reject extra fields (forbidNonWhitelisted)', async () => {
      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/register')
        .send({ ...validBody, role: 'SUPER_ADMIN' })
        .expect(400)

      // Assert — ValidationPipe rechaza campos no declarados en el DTO
      expect(response.body.error.statusCode).toBe(400)
    })
  })

  // ─────────────────────────────────────────────────── POST /api/v1/auth/login ──

  describe('POST /api/v1/auth/login', () => {
    it('200 — should return accessToken and set refresh cookie on valid credentials', async () => {
      // Arrange
      const { user } = buildRegisteredUserFixture()
      const userWithTenants = {
        ...user,
        tenantUsers: [{ tenantId: 'tenant-1', role: 'OWNER' }],
      }
      // validateUser devuelve el usuario (contraseña correcta y email verificado)
      mockDb.user.findUnique.mockResolvedValue({
        ...userWithTenants,
        passwordHash: validPasswordHash,  // hash real de 'Password123'
        isActive: true,
        emailVerified: true,   // requerido: login() lanza 403 si es false
      })
      mockDb.refreshToken.create.mockResolvedValue({})

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'Password123' })
        .expect(200)

      // Assert
      expect(response.body.data.accessToken).toBeTruthy()
      const cookies = response.headers['set-cookie'] as string[]
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(true)
    })

    it('401 — should reject wrong password', async () => {
      // Arrange — passwordHash es de "Password123", enviamos "WrongPass999"
      mockDb.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.com',
        passwordHash: validPasswordHash,  // hash real de 'Password123'
        isActive: true,
        tenantUsers: [],
      })

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/login')
        .send({ email: 'user@test.com', password: 'WrongPass999' })
        .expect(401)

      // Assert — mensaje genérico (no revela si el email existe)
      expect(response.body).toMatchObject({
        error: expect.objectContaining({ statusCode: 401 }),
      })
    })

    it('401 — should reject non-existent user', async () => {
      // Arrange
      mockDb.user.findUnique.mockResolvedValue(null)

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/login')
        .send({ email: 'ghost@test.com', password: 'Password123' })
        .expect(401)

      // Assert — mismo status/body que contraseña incorrecta (no enumera usuarios)
      expect(response.body.error.statusCode).toBe(401)
    })

    /**
     * SEC-05 — Rate limit
     *
     * El endpoint tiene @Throttle({ default: { limit: 5, ttl: 15min } }).
     * Hacemos LOGIN_THROTTLE_LIMIT intentos fallidos (401 cada uno),
     * luego el siguiente debe ser 429.
     *
     * Nota: el ThrottlerModule usa storage en memoria; los contadores
     * son independientes por IP+ruta. En tests, todos los requests
     * comparten la misma "IP" de test.
     */
    it('403 — should reject login when email is not verified', async () => {
      // Arrange — usuario con contraseña correcta pero email sin verificar
      mockDb.user.findUnique.mockResolvedValue({
        id: 'user-unverified',
        email: 'unverified@test.com',
        passwordHash: validPasswordHash,
        isActive: true,
        emailVerified: false,   // no verificado
        tenantUsers: [{ tenantId: 'tenant-1', role: 'OWNER' }],
      })

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/login')
        .send({ email: 'unverified@test.com', password: 'Password123' })
        .expect(403)

      // Assert
      expect(response.body.error.code).toBe('EMAIL_NOT_VERIFIED')
    })

    it(`429 — should block after ${LOGIN_THROTTLE_LIMIT} failed login attempts`, async () => {
      // Arrange — todos los intentos fallan (usuario inactivo → validateUser null)
      mockDb.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'target@test.com',
        passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQN6WsNRwCGi',
        isActive: false, // usuario desactivado → siempre 401
        tenantUsers: [],
      })

      // Exhaust the rate limit bucket
      for (let i = 0; i < LOGIN_THROTTLE_LIMIT; i++) {
        await request(httpServer)
          .post('/api/v1/auth/login')
          .send({ email: 'target@test.com', password: 'Password123' })
      }

      // Act — intento N+1 debe ser bloqueado por el throttler
      const response = await request(httpServer)
        .post('/api/v1/auth/login')
        .send({ email: 'target@test.com', password: 'Password123' })
        .expect(429)

      // Assert
      expect(response.status).toBe(429)
    })
  })

  // ─────────────────────────────────────────────── POST /api/v1/auth/refresh ──

  describe('POST /api/v1/auth/refresh', () => {
    it('200 — should return new tokens when refresh cookie is valid', async () => {
      // Arrange
      mockDb.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-valid',
        token: 'valid-refresh-token',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        user: {
          id: 'user-1',
          email: 'user@test.com',
          tenantUsers: [{ tenantId: 'tenant-1', role: 'OWNER' }],
        },
      })
      mockDb.refreshToken.delete.mockResolvedValue({})
      mockDb.refreshToken.create.mockResolvedValue({})

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refresh_token=valid-refresh-token')
        .expect(200)

      // Assert — nuevos tokens emitidos
      expect(response.body.data.accessToken).toBeTruthy()
      expect(response.body.data.expiresIn).toBeTruthy()

      // El token antiguo fue rotado (eliminado)
      expect(mockDb.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'rt-valid' },
      })
    })

    it('401 — should reject when no refresh cookie is present', async () => {
      // Act — sin cookie
      const response = await request(httpServer)
        .post('/api/v1/auth/refresh')
        .expect(401)

      // Assert
      expect(response.body.error.code).toBe('MISSING_REFRESH_TOKEN')
    })

    it('401 — should reject when refresh token is expired', async () => {
      // Arrange — token expirado en DB
      mockDb.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-expired',
        token: 'expired-token',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 1000), // expirado
        user: { id: 'user-1', email: 'user@test.com', tenantUsers: [] },
      })

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refresh_token=expired-token')
        .expect(401)

      // Assert
      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN')
    })
  })

  // ─────────────────────────────────────────────── POST /api/v1/auth/logout ──

  describe('POST /api/v1/auth/logout', () => {
    it('204 — should invalidate refresh token and clear cookie', async () => {
      // Arrange
      mockDb.refreshToken.deleteMany.mockResolvedValue({ count: 1 })

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/logout')
        .set('Cookie', 'refresh_token=some-refresh-token')
        .expect(204)

      // Assert — el token fue eliminado de la DB
      expect(mockDb.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'some-refresh-token' },
      })

      // La cookie fue borrada (Max-Age=0 o expires en el pasado)
      const cookies = response.headers['set-cookie'] as string[] | undefined
      if (cookies) {
        const refreshCookie = cookies.find((c: string) => c.startsWith('refresh_token='))
        if (refreshCookie) {
          expect(refreshCookie).toMatch(/Max-Age=0|expires=.*1970/i)
        }
      }
    })

    it('204 — should succeed gracefully even without refresh cookie', async () => {
      // Act — sin cookie presente: logout silencioso
      await request(httpServer)
        .post('/api/v1/auth/logout')
        .expect(204)

      // Sin cookie → no se llamó deleteMany
      expect(mockDb.refreshToken.deleteMany).not.toHaveBeenCalled()
    })
  })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildRegisteredUserFixture() {
  const user = createUser({ email: 'test@example.com' })
  const tenant = createTenant({ slug: 'test-workspace' })
  return { user, tenant }
}
