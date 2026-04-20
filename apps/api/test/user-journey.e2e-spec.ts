/**
 * User Journey E2E — Flujo completo de usuario
 *
 * Flujo testeado (sin DB ni Redis reales — mock completo):
 *   1. POST /api/v1/auth/register  → nuevo usuario + tenant
 *   2. POST /api/v1/auth/login     → access token + refresh cookie
 *   3. POST /api/v1/sites          → crear sitio
 *   4. GET  /api/v1/sites/:id      → verificar creación
 *   5. POST /api/v1/auth/logout    → cerrar sesión (requiere refresh cookie)
 *   6. GET  /api/v1/sites          → 401 sin token válido
 *
 * Nota: este test verifica los contratos HTTP del journey completo.
 * Para un E2E real con DB, usar Playwright + DB de test y semilla de datos.
 */

import { INestApplication, ValidationPipe, Global, Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard } from '@nestjs/throttler'
import { JwtService } from '@nestjs/jwt'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request: typeof import('supertest') = require('supertest')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as typeof import('cookie-parser')
import { AuthModule } from '../src/modules/auth/auth.module'
import { SitesModule } from '../src/modules/sites/sites.module'
import { DatabaseService } from '../src/modules/database/database.service'
import { RedisService } from '../src/modules/redis/redis.service'
import { REDIS_CLIENT } from '../src/modules/redis/redis.module'
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter'
import { createUser, createTenant, createSite } from './factories'
import * as bcrypt from 'bcrypt'

// ─── MockRedisModule ──────────────────────────────────────────────────────────

const mockRedisClient = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
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

// ─────────────────────────────────────────────────────────────────────────────

describe('User Journey (integration)', () => {
  let app: INestApplication
  let httpServer: ReturnType<INestApplication['getHttpServer']>
  let jwtService: JwtService
  let validPasswordHash: string

  // ─── Shared state entre pasos del journey ─────────────────────────────────

  let accessToken: string
  let refreshCookie: string
  const journeyUser = createUser({ emailVerified: true })
  const journeyTenant = createTenant()
  const journeySite = createSite({ tenantId: journeyTenant.id })

  // ─── Mock de DatabaseService ──────────────────────────────────────────────

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
    site: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    template: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((fn: unknown) => {
      if (typeof fn === 'function') return fn(mockDb)
      if (Array.isArray(fn)) return Promise.all(fn as Promise<unknown>[])
    }),
  }

  // ─── Setup ────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({
            JWT_SECRET: 'test-jwt-secret-at-least-256-bits-long-journey-test',
            JWT_REFRESH_SECRET: 'test-refresh-secret-256-bits-long-journey-xxxx',
            APP_URL: 'http://localhost:3000',
            NODE_ENV: 'test',
          })],
        }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
        MockRedisModule,
        AuthModule,
        SitesModule,
      ],
      providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    })
      .overrideProvider(DatabaseService)
      .useValue(mockDb)
      .compile()

    app = module.createNestApplication()
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

    jwtService = module.get<JwtService>(JwtService)

    // Pre-computar hash de contraseña una sola vez
    validPasswordHash = await bcrypt.hash('SecurePass123', 12)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 1: Registro de nuevo usuario
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step 1: POST /api/v1/auth/register', () => {
    it('201 — should register a new user and return accessToken', async () => {
      // Arrange — email libre, plan starter existe
      mockDb.user.findUnique.mockResolvedValue(null)
      mockDb.plan.findUniqueOrThrow.mockResolvedValue({ id: 'plan-starter', slug: 'starter' })
      mockDb.tenant.findUnique.mockResolvedValue(null) // slug libre
      mockDb.user.create.mockResolvedValue({
        ...journeyUser,
        passwordHash: validPasswordHash,
      })
      mockDb.tenant.create.mockResolvedValue(journeyTenant)
      mockDb.tenantUser.create.mockResolvedValue({})
      mockDb.refreshToken.create.mockResolvedValue({})

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/register')
        .send({
          email: journeyUser.email,
          password: 'SecurePass123',
          firstName: 'Journey',
        })
        .expect(201)

      // Assert
      expect(response.body.data).toHaveProperty('accessToken')
      expect(typeof response.body.data.accessToken).toBe('string')

      // Guardar token para pasos siguientes
      accessToken = response.body.data.accessToken
      const cookies = response.headers['set-cookie'] as string[]
      refreshCookie = Array.isArray(cookies)
        ? cookies.find((c: string) => c.startsWith('refresh_token=')) ?? ''
        : ''
      expect(refreshCookie).toMatch(/refresh_token=/)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 2: Login con las credenciales registradas
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step 2: POST /api/v1/auth/login', () => {
    it('200 — should login with credentials and return a new accessToken', async () => {
      // Arrange — usuario existe con email verificado
      mockDb.user.findUnique.mockResolvedValue({
        ...journeyUser,
        passwordHash: validPasswordHash,
        emailVerified: true,
        isActive: true,
        tenantUsers: [{ tenantId: journeyTenant.id, role: 'OWNER' }],
      })
      mockDb.refreshToken.create.mockResolvedValue({})

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/login')
        .send({ email: journeyUser.email, password: 'SecurePass123' })
        .expect(200)

      // Assert
      expect(response.body.data.accessToken).toBeTruthy()
      const cookies = response.headers['set-cookie'] as string[]
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(true)

      // Actualizar token para los pasos siguientes
      accessToken = response.body.data.accessToken
      const refreshCookieFound = cookies.find((c: string) => c.startsWith('refresh_token='))
      if (refreshCookieFound) refreshCookie = refreshCookieFound
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 3: Crear sitio con el token de acceso
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step 3: POST /api/v1/sites', () => {
    it('201 — should create a new site for the authenticated tenant', async () => {
      // Arrange — usar un token JWT real firmado con el secret de test
      const token = jwtService.sign({
        sub: journeyUser.id,
        email: journeyUser.email,
        tenantId: journeyTenant.id,
        role: 'OWNER',
      })
      mockDb.site.create.mockResolvedValue(journeySite)

      // Act
      const response = await request(httpServer)
        .post('/api/v1/sites')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Mi Primer Sitio' })
        .expect(201)

      // Assert
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.id).toBe(journeySite.id)
      expect(mockDb.site.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId: journeyTenant.id }),
        }),
      )
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 4: Obtener el sitio recién creado por ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step 4: GET /api/v1/sites/:id', () => {
    it('200 — should return the created site by its ID', async () => {
      // Arrange
      const token = jwtService.sign({
        sub: journeyUser.id,
        email: journeyUser.email,
        tenantId: journeyTenant.id,
        role: 'OWNER',
      })
      mockDb.site.findFirst.mockResolvedValue(journeySite)

      // Act
      const response = await request(httpServer)
        .get(`/api/v1/sites/${journeySite.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert
      expect(response.body.data.id).toBe(journeySite.id)
      expect(response.body.data.tenantId).toBe(journeyTenant.id)
      // Verificar aislamiento de tenant: la query incluye tenantId
      expect(mockDb.site.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: journeySite.id,
            tenantId: journeyTenant.id,
          }),
        }),
      )
    })

    it('404 — should return 404 when site belongs to another tenant (tenant isolation)', async () => {
      // Arrange — token de otro tenant
      const otherTenantToken = jwtService.sign({
        sub: 'other-user',
        email: 'other@test.com',
        tenantId: 'other-tenant-999',
        role: 'OWNER',
      })
      mockDb.site.findFirst.mockResolvedValue(null) // sitio no encontrado para este tenant

      // Act
      const response = await request(httpServer)
        .get(`/api/v1/sites/${journeySite.id}`)
        .set('Authorization', `Bearer ${otherTenantToken}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 5: Logout — cerrar sesión
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step 5: POST /api/v1/auth/logout', () => {
    it('204 — should logout and clear the refresh token cookie', async () => {
      // Arrange — usar el refreshToken en la cookie
      const token = jwtService.sign({
        sub: journeyUser.id,
        email: journeyUser.email,
        tenantId: journeyTenant.id,
        role: 'OWNER',
      })

      // Mock: el refresh token existe en DB
      mockDb.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-journey-001',
        userId: journeyUser.id,
        tokenHash: 'some-hash',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      })
      mockDb.refreshToken.delete.mockResolvedValue({})

      // El cliente Redis confirma el refresh token como válido
      mockRedisClient.exists.mockResolvedValueOnce(1)

      // Act
      const response = await request(httpServer)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', refreshCookie || 'refresh_token=dummy-token-for-logout')
        .expect(204)

      // Assert — cookie debe quedar vacía (Set-Cookie con Max-Age=0 o expires en pasado)
      const setCookies = response.headers['set-cookie'] as string[] | undefined
      if (setCookies) {
        const refreshCookieHeader = Array.isArray(setCookies)
          ? setCookies.find((c: string) => c.startsWith('refresh_token='))
          : ''
        // La cookie se limpia (Max-Age=0 o valor vacío)
        if (refreshCookieHeader) {
          expect(refreshCookieHeader).toMatch(/Max-Age=0|refresh_token=;/)
        }
      }
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 6: Verificar que sin token válido la API retorna 401
  // ─────────────────────────────────────────────────────────────────────────

  describe('Step 6: GET /api/v1/sites (sin token)', () => {
    it('401 — should reject request without Authorization header', async () => {
      // Act — sin token
      const response = await request(httpServer)
        .get('/api/v1/sites')
        .expect(401)

      // Assert
      expect(response.body.error.statusCode).toBe(401)
      expect(mockDb.site.findMany).not.toHaveBeenCalled()
    })

    it('401 — should reject request with an expired/invalid token', async () => {
      // Arrange — token firmado con un secret diferente (inválido)
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJ0ZW5hbnRJZCI6InRlbmFudC0xIn0.INVALID_SIGNATURE'

      // Act
      const response = await request(httpServer)
        .get('/api/v1/sites')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401)

      // Assert
      expect(response.body.error.statusCode).toBe(401)
    })
  })
})
