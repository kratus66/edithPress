import { INestApplication, ValidationPipe, Global, Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request: typeof import('supertest') = require('supertest')
import { PagesModule } from '../src/modules/pages/pages.module'
import { DatabaseService } from '../src/modules/database/database.service'
import { RedisService } from '../src/modules/redis/redis.service'
import { REDIS_CLIENT } from '../src/modules/redis/redis.module'
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter'
import { createSite, createPage } from './factories'

// ─── MockRedisModule ──────────────────────────────────────────────────────────
// RedisModule es @Global() y se registra en AppModule. En tests de módulos
// individuales sin AppModule, este mock lo replica para evitar Redis real.

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
 * Integration tests — Pages endpoints
 *
 * Levanta la app NestJS completa con:
 *   - PagesModule real (guards, validation, service lógica)
 *   - DatabaseService mockeado (no requiere Postgres)
 *   - JwtService real para tokens de prueba
 *
 * PagesService primero verifica que el site pertenece al tenant (verifySiteOwnership),
 * luego opera sobre las páginas. Esto garantiza aislamiento multi-tenant.
 *
 * URLs de los endpoints (controller prefix: 'sites/:siteId/pages'):
 *   GET    /api/v1/sites/:siteId/pages
 *   POST   /api/v1/sites/:siteId/pages
 *   GET    /api/v1/sites/:siteId/pages/:pageId
 *   PATCH  /api/v1/sites/:siteId/pages/:pageId
 *   DELETE /api/v1/sites/:siteId/pages/:pageId
 *   POST   /api/v1/sites/:siteId/pages/:pageId/publish
 *   POST   /api/v1/sites/:siteId/pages/:pageId/unpublish
 */
describe('Pages API (integration)', () => {
  let app: INestApplication
  let httpServer: ReturnType<INestApplication['getHttpServer']>
  let jwtService: JwtService

  const TENANT_A = 'tenant-a-0001'
  const TENANT_B = 'tenant-b-0002'

  // ─── Mock de DatabaseService ──────────────────────────────────────────────────

  const mockDb = {
    site: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    page: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    pageVersion: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
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
        MockRedisModule,  // @Global: expone RedisService a AuthModule sin Redis real
        PagesModule,
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

  // ─────────────────────────────────────── GET /api/v1/sites/:siteId/pages ──

  describe('GET /api/v1/sites/:siteId/pages', () => {
    it('200 — should return pages of own site', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      const page = createPage({ siteId: site.id })
      // verifySiteOwnership usa site.findFirst; luego $transaction usa page.findMany + count
      mockDb.site.findFirst.mockResolvedValue({ id: site.id })
      mockDb.page.findMany.mockResolvedValue([page])
      mockDb.page.count.mockResolvedValue(1)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get(`/api/v1/sites/${site.id}/pages`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.meta.total).toBe(1)
      // El site fue buscado con el tenantId del JWT
      expect(mockDb.site.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: TENANT_A }),
        }),
      )
    })

    it('404 — should not list pages of another tenant site (tenant isolation)', async () => {
      // Arrange — site pertenece a TENANT_B; verifySiteOwnership devuelve null para TENANT_A
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get('/api/v1/sites/site-of-tenant-b/pages')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
      // La operación se detuvo en verifySiteOwnership — page.findMany nunca fue llamado
      expect(mockDb.page.findMany).not.toHaveBeenCalled()
    })

    it('401 — should reject unauthenticated request', async () => {
      // Act
      const response = await request(httpServer)
        .get('/api/v1/sites/any-site/pages')
        .expect(401)

      // Assert
      expect(response.body.error.statusCode).toBe(401)
    })
  })

  // ─────────────────────────────────────── POST /api/v1/sites/:siteId/pages ──

  describe('POST /api/v1/sites/:siteId/pages', () => {
    it('201 — should create page in own site', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      const page = createPage({ siteId: site.id })
      mockDb.site.findFirst.mockResolvedValue({ id: site.id })
      mockDb.page.findUnique.mockResolvedValue(null) // slug not taken
      mockDb.page.create.mockResolvedValue(page)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${site.id}/pages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Sobre nosotros', slug: 'sobre-nosotros' })
        .expect(201)

      // Assert
      expect(response.body.data.id).toBeDefined()
      expect(mockDb.page.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ siteId: site.id }),
        }),
      )
    })

    it('404 — should not create page in another tenant site (tenant isolation)', async () => {
      // Arrange — el site pertenece a TENANT_B
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post('/api/v1/sites/site-of-tenant-b/pages')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hacked Page', slug: 'hacked-page' })
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
      expect(mockDb.page.create).not.toHaveBeenCalled()
    })

    it('409 — should return conflict on duplicate slug in same site', async () => {
      // Arrange — slug ya existe en el sitio
      const site = createSite({ tenantId: TENANT_A })
      const existing = createPage({ siteId: site.id, slug: 'sobre-nosotros' })
      mockDb.site.findFirst.mockResolvedValue({ id: site.id })
      // page.findUnique con siteId_slug devuelve una página existente
      mockDb.page.findUnique.mockResolvedValue(existing)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${site.id}/pages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Duplicado', slug: 'sobre-nosotros' })
        .expect(409)

      // Assert
      expect(response.body.error.statusCode).toBe(409)
      expect(response.body.error.code).toBe('SLUG_ALREADY_EXISTS')
      expect(mockDb.page.create).not.toHaveBeenCalled()
    })

    it('400 — should reject missing required field (title)', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      mockDb.site.findFirst.mockResolvedValue({ id: site.id })
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${site.id}/pages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ slug: 'solo-slug-sin-titulo' })
        .expect(400)

      // Assert
      expect(response.body.error.statusCode).toBe(400)
    })

    it('400 — should reject invalid slug format (uppercase chars)', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      mockDb.site.findFirst.mockResolvedValue({ id: site.id })
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${site.id}/pages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', slug: 'Slug-Con-Mayusculas' })
        .expect(400)

      // Assert
      expect(response.body.error.statusCode).toBe(400)
    })
  })

  // ─────────────────────────────────────── POST /api/v1/sites/:siteId/pages/:pageId/publish ──

  describe('POST /api/v1/sites/:siteId/pages/:pageId/publish', () => {
    it('200 — should publish page and return status PUBLISHED', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      const page = createPage({ siteId: site.id })
      const published = { ...page, status: 'PUBLISHED', publishedAt: new Date() }

      mockDb.site.findFirst.mockResolvedValue({ id: site.id }) // verifySiteOwnership
      // page.findFirst devuelve page con content no vacío
      mockDb.page.findFirst.mockResolvedValue({
        id: page.id,
        content: [{ type: 'HeroBlock', props: { title: 'Hello' } }],
      })
      mockDb.page.update.mockResolvedValue(published)
      mockDb.site.update.mockResolvedValue({ id: site.id, isPublished: true })
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${site.id}/pages/${page.id}/publish`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert
      expect(response.body.data.status).toBe('PUBLISHED')
      expect(mockDb.page.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      )
    })

    it('400 — should reject publish when page content is empty', async () => {
      // Arrange — el servicio lanza BadRequestException si content está vacío
      const site = createSite({ tenantId: TENANT_A })
      const page = createPage({ siteId: site.id })

      mockDb.site.findFirst.mockResolvedValue({ id: site.id })
      mockDb.page.findFirst.mockResolvedValue({
        id: page.id,
        content: [], // vacío → no se puede publicar
      })
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post(`/api/v1/sites/${site.id}/pages/${page.id}/publish`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      // Assert
      expect(response.body.error.statusCode).toBe(400)
      expect(response.body.error.code).toBe('EMPTY_PAGE_CONTENT')
      expect(mockDb.page.update).not.toHaveBeenCalled()
    })

    it('404 — should not publish page in a site belonging to another tenant', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null) // verifySiteOwnership falla
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .post('/api/v1/sites/site-b/pages/page-b/publish')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
      expect(mockDb.page.update).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────── GET /api/v1/sites/:siteId/pages/:pageId ──

  describe('GET /api/v1/sites/:siteId/pages/:pageId', () => {
    it('200 — should return page with content for own site', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      const page = createPage({ siteId: site.id })
      mockDb.site.findFirst.mockResolvedValue({ id: site.id })
      mockDb.page.findFirst.mockResolvedValue({ ...page, content: [] })
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get(`/api/v1/sites/${site.id}/pages/${page.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Assert
      expect(response.body.data.id).toBe(page.id)
    })

    it('404 — should return 404 for page in another tenant site', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .get('/api/v1/sites/site-b/pages/page-b')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
    })
  })

  // ─────────────────────────────────────── DELETE /api/v1/sites/:siteId/pages/:pageId ──

  describe('DELETE /api/v1/sites/:siteId/pages/:pageId', () => {
    it('204 — should delete page from own site', async () => {
      // Arrange
      const site = createSite({ tenantId: TENANT_A })
      const page = createPage({ siteId: site.id })
      mockDb.site.findFirst.mockResolvedValue({ id: site.id })
      mockDb.page.findFirst.mockResolvedValue({ id: page.id })
      mockDb.page.delete.mockResolvedValue(page)
      const token = makeToken(TENANT_A)

      // Act
      await request(httpServer)
        .delete(`/api/v1/sites/${site.id}/pages/${page.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      // Assert
      expect(mockDb.page.delete).toHaveBeenCalledWith({ where: { id: page.id } })
    })

    it('404 — should not delete page in another tenant site', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null)
      const token = makeToken(TENANT_A)

      // Act
      const response = await request(httpServer)
        .delete('/api/v1/sites/site-b/pages/page-b')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      // Assert
      expect(response.body.error.statusCode).toBe(404)
      expect(mockDb.page.delete).not.toHaveBeenCalled()
    })
  })
})
