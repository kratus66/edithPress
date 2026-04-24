import { INestApplication, ValidationPipe, Global, Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as dns from 'dns'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request: typeof import('supertest') = require('supertest')
import { CustomDomainsModule } from '../src/modules/custom-domains/custom-domains.module'
import { AuthModule } from '../src/modules/auth/auth.module'
import { DatabaseService } from '../src/modules/database/database.service'
import { RedisService } from '../src/modules/redis/redis.service'
import { REDIS_CLIENT } from '../src/modules/redis/redis.module'
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter'
import { createSite } from './factories'

// ─── MockRedisModule ──────────────────────────────────────────────────────────

const mockRedisClient = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
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

/**
 * Integration tests — Custom Domains endpoints
 *
 * Levanta CustomDomainsModule con:
 *   - DatabaseService mockeado (no requiere Postgres)
 *   - MockRedisModule @Global para rate limit mock
 *   - JwtService real para tokens de test
 *   - dns.promises.resolveTxt mockeado (no llama DNS real)
 */
describe('Custom Domains (e2e)', () => {
  let app: INestApplication
  let httpServer: ReturnType<INestApplication['getHttpServer']>
  let jwtService: JwtService

  const TENANT_A = 'tenant-a-0001'
  const TENANT_B = 'tenant-b-0002'
  const SITE_A = 'site-a-0001'
  const SITE_B = 'site-b-0002'

  // ─── Mock de DatabaseService ──────────────────────────────────────────────

  const mockCustomDomain = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  const mockDb = {
    site: {
      findFirst: jest.fn(),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customDomain: mockCustomDomain as any,
  }

  // ─── Setup / Teardown ─────────────────────────────────────────────────────

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({
            JWT_SECRET: 'test-jwt-secret-at-least-256-bits-long-xxxxxxxxxxxxxxxx',
            APP_URL: 'http://localhost:3000',
            NODE_ENV: 'test',
            RENDERER_SECRET: 'test-renderer-secret',
          })],
        }),
        AuthModule,
        MockRedisModule,
        CustomDomainsModule,
      ],
    })
      .overrideProvider(DatabaseService)
      .useValue(mockDb)
      .compile()

    app = module.createNestApplication()
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
  })

  afterAll(async () => {
    await app.close()
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset redis mock to default (no count stored)
    mockRedisClient.get.mockResolvedValue(null)
    mockRedisClient.set.mockResolvedValue('OK')
  })

  // ─── Helper: token JWT firmado ────────────────────────────────────────────

  function makeToken(tenantId: string, role = 'OWNER'): string {
    return jwtService.sign({
      sub: 'user-test-0001',
      email: 'owner@test.com',
      tenantId,
      role,
    })
  }

  // ─────────────────────────────── POST /sites/:siteId/domain ──

  describe('POST /api/v1/sites/:siteId/domain', () => {
    it('201 — should register valid domain and return txtRecord (≥32 chars)', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A, id: SITE_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      mockCustomDomain.findUnique.mockResolvedValue(null) // domain free
      const domainRecord = {
        id: 'cd-0001',
        domain: 'my-company.com',
        txtRecord: 'a'.repeat(64),
        status: 'PENDING',
        createdAt: new Date(),
      }
      mockCustomDomain.create.mockResolvedValue(domainRecord)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${SITE_A}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .send({ domain: 'my-company.com' })
        .expect(201)

      // Assert
      expect(response.body.data.txtRecord).toBeDefined()
      expect(response.body.data.txtRecord.length).toBeGreaterThanOrEqual(32)
      expect(response.body.data.status).toBe('PENDING')
      expect(response.body.data.domain).toBe('my-company.com')
      expect(response.body.data.instructions).toBeDefined()
    })

    it('400 — should reject domain with http:// prefix', async () => {
      // Arrange
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${SITE_A}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .send({ domain: 'http://my-company.com' })
        .expect(400)

      // Assert
      expect(response.body.error.statusCode).toBe(400)
      expect(mockCustomDomain.create).not.toHaveBeenCalled()
    })

    it('400 — should reject subdomain of edithpress.com', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A, id: SITE_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      mockCustomDomain.findUnique.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${SITE_A}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .send({ domain: 'my-site.edithpress.com' })
        .expect(400)

      // Assert
      expect(response.body.error.statusCode).toBe(400)
      expect(response.body.error.message).toContain('no está permitido')
      expect(mockCustomDomain.create).not.toHaveBeenCalled()
    })

    it('409 — should return Conflict when domain already registered in another site', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A, id: SITE_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      // First findUnique (by domain) returns existing record → conflict
      mockCustomDomain.findUnique
        .mockResolvedValueOnce({ id: 'cd-existing', domain: 'taken.com', siteId: SITE_B })
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${SITE_A}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .send({ domain: 'taken.com' })
        .expect(409)

      // Assert
      expect(response.body.error.statusCode).toBe(409)
      expect(response.body.error.message).toContain('ya está registrado')
    })

    it('401 — should reject request without authentication', async () => {
      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${SITE_A}/domain`)
        .send({ domain: 'my-company.com' })
        .expect(401)

      // Assert
      expect(response.body.error.statusCode).toBe(401)
    })

    it('404 — should return 404 when siteId belongs to another tenant', async () => {
      // Arrange — TENANT_A intenta añadir dominio a un site de TENANT_B
      // TenantGuard: el service busca site con { id: SITE_B, tenantId: TENANT_A } → null
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${SITE_B}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .send({ domain: 'my-company.com' })
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
    })
  })

  // ─────────────────────────────── GET /sites/:siteId/domain ──

  describe('GET /api/v1/sites/:siteId/domain', () => {
    it('200 — should return domain with PENDING status', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A, id: SITE_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      const domainRecord = {
        id: 'cd-0001',
        domain: 'my-company.com',
        txtRecord: 'a'.repeat(64),
        status: 'PENDING',
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockCustomDomain.findUnique.mockResolvedValue(domainRecord)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get(`/api/v1/sites/${SITE_A}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert
      expect(response.body.data.status).toBe('PENDING')
      expect(response.body.data.domain).toBe('my-company.com')
    })

    it('200 with null data — should return null when site has no domain', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A, id: SITE_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      mockCustomDomain.findUnique.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get(`/api/v1/sites/${SITE_A}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert — el servicio retorna null cuando no hay dominio (200 con data null)
      expect(response.body.data).toBeNull()
    })

    it('404 — should return 404 when site does not belong to tenant', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get(`/api/v1/sites/${SITE_B}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
    })
  })

  // ─────────────────────────────── POST /sites/:siteId/domain/verify ──

  describe('POST /api/v1/sites/:siteId/domain/verify', () => {
    it('200 — should return { success: false } when DNS not configured (no 500)', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A, id: SITE_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      const domainRecord = {
        id: 'cd-0001',
        domain: 'my-company.com',
        txtRecord: 'expected-txt-record-value-0001',
        status: 'PENDING',
      }
      mockCustomDomain.findUnique.mockResolvedValue(domainRecord)
      mockCustomDomain.update.mockResolvedValue({ ...domainRecord, status: 'FAILED' })
      mockRedisClient.get.mockResolvedValue(null) // 0 intentos previos

      // Mock DNS: resolveTxt retorna array vacío → verificación falla sin lanzar error
      const dnsSpy = jest.spyOn(dns.promises, 'resolveTxt').mockResolvedValue([])
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${SITE_A}/domain/verify`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert — no lanza 500, retorna status FAILED
      expect(response.body.data.status).toBe('FAILED')
      expect(dnsSpy).toHaveBeenCalledWith(expect.stringContaining('my-company.com'))

      dnsSpy.mockRestore()
    })

    it('403 — should return VERIFY_RATE_LIMIT_EXCEEDED after 5 attempts in 1 hour', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A, id: SITE_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      const domainRecord = {
        id: 'cd-0001',
        domain: 'my-company.com',
        txtRecord: 'expected-txt-record-value-0001',
        status: 'PENDING',
      }
      mockCustomDomain.findUnique.mockResolvedValue(domainRecord)
      // Redis devuelve 5 intentos → rate limit alcanzado
      mockRedisClient.get.mockResolvedValue('5')
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${SITE_A}/domain/verify`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)

      // Assert
      expect(response.body.error.statusCode).toBe(403)
      expect(response.body.error.code).toBe('VERIFY_RATE_LIMIT_EXCEEDED')
    })
  })

  // ─────────────────────────────── DELETE /sites/:siteId/domain ──

  describe('DELETE /api/v1/sites/:siteId/domain', () => {
    it('204 — should delete domain successfully', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A, id: SITE_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      const domainRecord = {
        id: 'cd-0001',
        domain: 'my-company.com',
      }
      mockCustomDomain.findUnique.mockResolvedValue(domainRecord)
      mockCustomDomain.delete.mockResolvedValue(domainRecord)
      const token = makeToken(TENANT_A)

      // Act
      await request(httpServer)
        .delete(`/api/v1/sites/${SITE_A}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      // Assert
      expect(mockCustomDomain.delete).toHaveBeenCalledWith({
        where: { id: domainRecord.id },
      })
    })

    it('404 — should return 404 when site has no domain configured', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A, id: SITE_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      mockCustomDomain.findUnique.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .delete(`/api/v1/sites/${SITE_A}/domain`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
      expect(response.body.error.code).toBe('DOMAIN_NOT_CONFIGURED')
      expect(mockCustomDomain.delete).not.toHaveBeenCalled()
    })
  })
})
