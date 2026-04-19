import { INestApplication, ValidationPipe, Global, Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request: typeof import('supertest') = require('supertest')
import { SitesModule } from '../src/modules/sites/sites.module'
import { DatabaseService } from '../src/modules/database/database.service'
import { RedisService } from '../src/modules/redis/redis.service'
import { REDIS_CLIENT } from '../src/modules/redis/redis.module'
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter'
import { createSite } from './factories'

// ─── MockRedisModule ──────────────────────────────────────────────────────────
// RedisModule es @Global() y se registra en AppModule. En tests que montan
// módulos individuales (SitesModule, PagesModule) sin AppModule, el @Global()
// no está disponible. Este mock lo replica para tests de integración.

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
 * Integration tests — Sites endpoints
 *
 * Levanta la app NestJS completa con:
 *   - SitesModule real (guards, validation, service lógica)
 *   - DatabaseService mockeado (no requiere Postgres)
 *   - JwtService real para firmar tokens de prueba
 *   - ValidationPipe y GlobalExceptionFilter reales
 *
 * Cada test verifica:
 *   - Códigos HTTP correctos (200/201/204/400/401/404)
 *   - Aislamiento de tenant (un tenant NO puede ver datos de otro)
 *   - El tenantId viene del JWT, no del body (prevent IDOR)
 */
describe('Sites API (integration)', () => {
  let app: INestApplication
  let httpServer: ReturnType<INestApplication['getHttpServer']>
  let jwtService: JwtService

  const TENANT_A = 'tenant-a-0001'
  const TENANT_B = 'tenant-b-0002'

  // ─── Mock de DatabaseService ──────────────────────────────────────────────────

  const mockDb = {
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
      if (Array.isArray(fn)) return Promise.all(fn)
    }),
  }

  // ─── Setup / Teardown ─────────────────────────────────────────────────────────

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({
            JWT_SECRET: 'test-jwt-secret-at-least-256-bits-long-xxxxxxxxxxxxxxxx',
            APP_URL: 'http://localhost:3000',
            NODE_ENV: 'test',
          })],
        }),
        MockRedisModule,  // @Global: expone RedisService a AuthModule sin Postgres/Redis reales
        SitesModule,
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

    // JwtService usa el secret configurado en ConfigModule → tokens válidos
    jwtService = module.get<JwtService>(JwtService)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── Helper: genera token JWT firmado con el secret de test ──────────────────

  function makeToken(tenantId: string, role = 'OWNER'): string {
    return jwtService.sign({
      sub: 'user-test-0001',
      email: 'owner@test.com',
      tenantId,
      role,
    })
  }

  // ─────────────────────────────────────── GET /api/v1/sites ──

  describe('GET /api/v1/sites', () => {
    it('200 — should return sites of authenticated tenant only', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      mockDb.site.findMany.mockResolvedValue([site])
      mockDb.site.count.mockResolvedValue(1)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get('/api/v1/sites')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert — solo devuelve sites del tenant autenticado
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.meta.total).toBe(1)
      expect(mockDb.site.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: TENANT_A } }),
      )
    })

    it('401 — should reject unauthenticated request', async () => {
      // Act — sin Authorization header
      const response = await request(httpServer)
        .get('/api/v1/sites')
        .expect(401)

      // Assert
      expect(response.body.error.statusCode).toBe(401)
    })
  })

  // ─────────────────────────────────────── POST /api/v1/sites ──

  describe('POST /api/v1/sites', () => {
    it('201 — should create site with tenantId taken from JWT (not from body)', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      mockDb.site.create.mockResolvedValue(site)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post('/api/v1/sites')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'My New Site' })
        .expect(201)

      // Assert
      expect(response.body.data.id).toBeDefined()
      // tenantId viene del JWT, no del cuerpo de la petición
      expect(mockDb.site.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId: TENANT_A }),
        }),
      )
    })

    it('400 — should reject missing required field (name)', async () => {
      // Arrange
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post('/api/v1/sites')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No name field here' })
        .expect(400)

      // Assert
      expect(response.body.error.statusCode).toBe(400)
      expect(mockDb.site.create).not.toHaveBeenCalled()
    })

    it('401 — should reject unauthenticated request', async () => {
      // Act
      const response = await request(httpServer)
        .post('/api/v1/sites')
        .send({ name: 'Test Site' })
        .expect(401)

      // Assert
      expect(response.body.error.statusCode).toBe(401)
    })
  })

  // ─────────────────────────────────────── GET /api/v1/sites/:siteId ──

  describe('GET /api/v1/sites/:siteId', () => {
    it('200 — should return site that belongs to the authenticated tenant', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get(`/api/v1/sites/${site.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert
      expect(response.body.data.id).toBe(site.id)
    })

    it('404 — should return 404 for non-existent site', async () => {
      // Arrange — DB no encuentra el site
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get('/api/v1/sites/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
    })

    it('404 — should not expose site belonging to another tenant (tenant isolation)', async () => {
      // Arrange — el service filtra por tenantId del JWT;
      // si el site pertenece a TENANT_B pero autenticamos como TENANT_A → null
      mockDb.site.findFirst.mockResolvedValue(null) // tenantId mismatch → not found
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get('/api/v1/sites/site-of-tenant-b')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert — 404 (no 403) para no revelar si el recurso existe
      expect(response.body.error.statusCode).toBe(404)
      // El service fue llamado con el tenantId del JWT, no de otro tenant
      expect(mockDb.site.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: TENANT_A }),
        }),
      )
    })
  })

  // ─────────────────────────────────────── PATCH /api/v1/sites/:siteId ──

  describe('PATCH /api/v1/sites/:siteId', () => {
    it('200 — should update site successfully', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      const updated = { ...site, name: 'Updated Name' }
      // findFirst called twice: once in findOne (ownership check), once to verify existence
      mockDb.site.findFirst.mockResolvedValue(site)
      mockDb.site.update.mockResolvedValue(updated)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .patch(`/api/v1/sites/${site.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(200)

      // Assert
      expect(response.body.data.name).toBe('Updated Name')
    })

    it('404 — should not update site belonging to another tenant', async () => {
      // Arrange — TENANT_A intenta actualizar un site de TENANT_B
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .patch('/api/v1/sites/site-of-tenant-b')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacked Name' })
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
      expect(mockDb.site.update).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────── DELETE /api/v1/sites/:siteId ──

  describe('DELETE /api/v1/sites/:siteId', () => {
    it('204 — should delete own site', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      mockDb.site.findFirst.mockResolvedValue(site)
      mockDb.site.delete.mockResolvedValue(site)
      const token = makeToken(TENANT_A)

      // Act
      await request(httpServer)
        .delete(`/api/v1/sites/${site.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      // Assert — delete fue llamado con el id correcto
      expect(mockDb.site.delete).toHaveBeenCalledWith({ where: { id: site.id } })
    })

    it('404 — should not delete site belonging to another tenant', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .delete('/api/v1/sites/site-of-tenant-b')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
      expect(mockDb.site.delete).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────── POST /api/v1/sites/:siteId/publish ──

  describe('POST /api/v1/sites/:siteId/publish', () => {
    it('200 — should publish site (isPublished becomes true)', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      const published = { ...site, isPublished: true }
      mockDb.site.findFirst.mockResolvedValue(site)
      mockDb.site.update.mockResolvedValue(published)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${site.id}/publish`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert
      expect(response.body.data.isPublished).toBe(true)
      expect(mockDb.site.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isPublished: true },
        }),
      )
    })

    it('404 — should not publish site belonging to another tenant', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post('/api/v1/sites/site-of-tenant-b/publish')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
      expect(mockDb.site.update).not.toHaveBeenCalled()
    })
  })

  // ─── Sanity: EDITOR role también puede crear/publicar ────────────────────────

  describe('Role-based access', () => {
    it('201 — EDITOR role should be able to create a site', async () => {
      // Arrange — EDITOR es un rol válido para POST /sites
      const site = createSite({ tenantId: TENANT_A })
      mockDb.site.create.mockResolvedValue(site)
      const editorToken = makeToken(TENANT_A, 'EDITOR')

      // Act
      const response = await request(httpServer)
        .post('/api/v1/sites')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ name: 'Editor Site' })
        .expect(201)

      // Assert
      expect(response.body.data.id).toBeDefined()
    })

    it('403 — VIEWER role should not be able to create a site', async () => {
      // Arrange — VIEWER no tiene permiso para POST /sites (requiere OWNER o EDITOR)
      const viewerToken = makeToken(TENANT_A, 'VIEWER')

      // Act
      const response = await request(httpServer)
        .post('/api/v1/sites')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ name: 'Viewer Site' })
        .expect(403)

      // Assert
      expect(response.body.error.statusCode).toBe(403)
    })
  })
})
