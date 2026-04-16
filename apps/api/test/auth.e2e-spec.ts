import { INestApplication, ValidationPipe } from '@nestjs/common'
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
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter'
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
      // validateUser devuelve el usuario (contraseña correcta)
      mockDb.user.findUnique.mockResolvedValue({
        ...userWithTenants,
        passwordHash: validPasswordHash,  // hash real de 'Password123'
        isActive: true,
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
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildRegisteredUserFixture() {
  const user = createUser({ email: 'test@example.com' })
  const tenant = createTenant({ slug: 'test-workspace' })
  return { user, tenant }
}
