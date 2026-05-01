import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import type { Request } from 'express'
import { AnalyticsService } from './analytics.service'
import { DatabaseService } from '../database/database.service'
import { RedisService } from '../redis/redis.service'

// ─────────────────────────────────────────────────────────────────────────────

describe('AnalyticsService', () => {
  let service: AnalyticsService

  // ─── Mock PageView model ──────────────────────────────────────────────────────
  // AnalyticsService accede a (this.db as any).pageView
  const mockPageViewModel = {
    create: jest.fn(),
    findMany: jest.fn(),
  }

  const mockDb = {
    site: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    // Accedido mediante cast (this.db as any).pageView
    pageView: mockPageViewModel,
  }

  // ─── Mock RedisService ────────────────────────────────────────────────────────

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }

  // ─── Helper: req mock ────────────────────────────────────────────────────────
  //
  // La nueva firma de trackPageView recibe (dto, req).
  // La IP se lee desde headers['x-real-ip'] o req.ip.
  //
  function buildMockReq(ip = '1.2.3.4'): Request {
    return {
      headers: { 'x-real-ip': ip },
      ip,
    } as unknown as Request
  }

  // ─── Setup ────────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile()

    service = module.get<AnalyticsService>(AnalyticsService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ──────────────────────────────────────────────────── trackPageView() ──

  describe('trackPageView()', () => {
    it('should create a pageView record in DB when site exists', async () => {
      // Arrange
      mockDb.site.findUnique.mockResolvedValueOnce({ id: 'site-001', tenantId: 'tenant-001' })
      mockPageViewModel.create.mockResolvedValueOnce({ id: 'pv-001' })
      mockRedis.del.mockResolvedValue(undefined)

      // Act
      await service.trackPageView(
        { siteId: 'site-001', path: '/home', referrer: 'https://google.com' },
        buildMockReq(),
      )

      // Assert
      expect(mockPageViewModel.create).toHaveBeenCalledTimes(1)
      expect(mockPageViewModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            siteId: 'site-001',
            path: '/home',
            referrer: 'https://google.com',
          }),
        }),
      )
    })

    it('should store ipHash (sha256 hex) instead of raw IP — GDPR compliance', async () => {
      // Arrange
      mockDb.site.findUnique.mockResolvedValueOnce({ id: 'site-001', tenantId: 'tenant-001' })
      mockPageViewModel.create.mockResolvedValueOnce({ id: 'pv-002' })
      mockRedis.del.mockResolvedValue(undefined)

      const ip = '1.2.3.4'

      // Act
      await service.trackPageView(
        { siteId: 'site-001', path: '/about' },
        buildMockReq(ip),
      )

      // Assert — el objeto pasado a create no debe contener la IP raw
      const createCall = mockPageViewModel.create.mock.calls[0][0]
      expect(createCall.data).not.toHaveProperty('ip')
      expect(Object.keys(createCall.data)).not.toContain('ipAddress')

      // ipHash debe ser un hash hex de 64 caracteres (sha256) — no la IP en claro
      expect(createCall.data.ipHash).toBeDefined()
      expect(createCall.data.ipHash).not.toBe(ip)
      expect(createCall.data.ipHash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should NOT create pageView when userAgent matches a bot pattern (Googlebot)', async () => {
      // Arrange — bot check runs before findUnique; no mock needed

      // Act
      await service.trackPageView(
        {
          siteId: 'site-001',
          path: '/home',
          userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
        buildMockReq(),
      )

      // Assert — se filtró el bot, no se creó ningún registro
      expect(mockPageViewModel.create).not.toHaveBeenCalled()
    })

    it('should NOT create pageView when userAgent contains "crawler"', async () => {
      // Arrange — bot check runs before findUnique; no mock needed

      // Act
      await service.trackPageView(
        { siteId: 'site-001', path: '/home', userAgent: 'SomeCrawler/1.0' },
        buildMockReq(),
      )

      // Assert
      expect(mockPageViewModel.create).not.toHaveBeenCalled()
    })

    it('should NOT create pageView when userAgent contains "spider"', async () => {
      // Arrange — bot check runs before findUnique; no mock needed

      // Act
      await service.trackPageView(
        { siteId: 'site-001', path: '/page', userAgent: 'AhrefsSpider/7.0' },
        buildMockReq(),
      )

      // Assert
      expect(mockPageViewModel.create).not.toHaveBeenCalled()
    })

    it('should return void (not throw) when site does not exist — fire-and-forget', async () => {
      // Arrange
      mockDb.site.findUnique.mockResolvedValueOnce(null)

      // Act & Assert — debe retornar void sin lanzar excepción
      await expect(
        service.trackPageView(
          { siteId: 'nonexistent-site', path: '/test' },
          buildMockReq(),
        ),
      ).resolves.toBeUndefined()

      // No se debe crear ningún registro
      expect(mockPageViewModel.create).not.toHaveBeenCalled()
    })

    it('should invalidate all analytics cache keys (7d, 30d, 90d) for the site', async () => {
      // Arrange
      mockDb.site.findUnique.mockResolvedValueOnce({ id: 'site-002', tenantId: 'tenant-001' })
      mockPageViewModel.create.mockResolvedValueOnce({ id: 'pv-003' })
      mockRedis.del.mockResolvedValue(undefined)

      // Act
      await service.trackPageView(
        { siteId: 'site-002', path: '/page' },
        buildMockReq(),
      )

      // Assert — se invocó del() para las 3 ventanas de tiempo
      const delCalls = mockRedis.del.mock.calls.map((c: string[]) => c[0])
      expect(delCalls).toContain('analytics:site-002:7d')
      expect(delCalls).toContain('analytics:site-002:30d')
      expect(delCalls).toContain('analytics:site-002:90d')
    })

    it('should normalize path to start with / when missing leading slash', async () => {
      // Arrange
      mockDb.site.findUnique.mockResolvedValueOnce({ id: 'site-001', tenantId: 'tenant-001' })
      mockPageViewModel.create.mockResolvedValueOnce({ id: 'pv-004' })
      mockRedis.del.mockResolvedValue(undefined)

      // Act — path sin "/" inicial
      await service.trackPageView(
        { siteId: 'site-001', path: '/blog/my-article' },
        buildMockReq(),
      )

      // Assert — el path debe empezar con /
      const createCall = mockPageViewModel.create.mock.calls[0][0]
      expect(createCall.data.path).toBe('/blog/my-article')
    })

    it('should handle optional referrer as null when not provided', async () => {
      // Arrange
      mockDb.site.findUnique.mockResolvedValueOnce({ id: 'site-001', tenantId: 'tenant-001' })
      mockPageViewModel.create.mockResolvedValueOnce({ id: 'pv-005' })
      mockRedis.del.mockResolvedValue(undefined)

      // Act
      await service.trackPageView(
        { siteId: 'site-001', path: '/contact' },
        buildMockReq(),
      )

      // Assert
      const createCall = mockPageViewModel.create.mock.calls[0][0]
      expect(createCall.data.referrer).toBeNull()
    })

    it('should use req.ip as fallback when x-real-ip header is absent', async () => {
      // Arrange
      mockDb.site.findUnique.mockResolvedValueOnce({ id: 'site-001', tenantId: 'tenant-001' })
      mockPageViewModel.create.mockResolvedValueOnce({ id: 'pv-006' })
      mockRedis.del.mockResolvedValue(undefined)

      const reqWithoutHeader = { headers: {}, ip: '5.6.7.8' } as unknown as Request

      // Act
      await service.trackPageView(
        { siteId: 'site-001', path: '/home' },
        reqWithoutHeader,
      )

      // Assert — se procesó sin error y el ipHash está presente
      const createCall = mockPageViewModel.create.mock.calls[0][0]
      expect(createCall.data.ipHash).toBeDefined()
      expect(createCall.data.ipHash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should store tenantId from the site record in the pageView', async () => {
      // Arrange
      mockDb.site.findUnique.mockResolvedValueOnce({ id: 'site-001', tenantId: 'tenant-xyz' })
      mockPageViewModel.create.mockResolvedValueOnce({ id: 'pv-007' })
      mockRedis.del.mockResolvedValue(undefined)

      // Act
      await service.trackPageView(
        { siteId: 'site-001', path: '/home' },
        buildMockReq(),
      )

      // Assert — el tenantId proviene del site, no del DTO
      const createCall = mockPageViewModel.create.mock.calls[0][0]
      expect(createCall.data.tenantId).toBe('tenant-xyz')
    })

    it('should check bot pattern case-insensitively', async () => {
      // Arrange — bot check runs before findUnique; no mock needed

      // Act
      await service.trackPageView(
        { siteId: 'site-001', path: '/home', userAgent: 'SOME-BOT/1.0' },
        buildMockReq(),
      )

      // Assert — "bot" es subpatrón de "BOT" en lowercase → filtrado
      expect(mockPageViewModel.create).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────── getAnalytics() ──

  describe('getAnalytics()', () => {
    const siteId = 'site-analytics-01'
    const tenantId = 'tenant-001'

    it('should return cached analytics when Redis has data', async () => {
      // Arrange
      const cachedData = {
        totalViews: 50,
        uniquePaths: 5,
        topPages: [],
        viewsByDay: [],
        referrers: [],
      }
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(cachedData))

      // Act
      const result = await service.getAnalytics(siteId, tenantId, '7d')

      // Assert
      expect(result).toEqual(cachedData)
      // No debe consultar la DB si hay caché
      expect(mockPageViewModel.findMany).not.toHaveBeenCalled()
    })

    it('should query DB and populate cache when Redis has no data', async () => {
      // Arrange — sin caché
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(null)
      mockPageViewModel.findMany.mockResolvedValueOnce([]) // sin visitas
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act
      const result = await service.getAnalytics(siteId, tenantId, '7d')

      // Assert
      expect(mockPageViewModel.findMany).toHaveBeenCalledTimes(1)
      expect(mockRedis.set).toHaveBeenCalledWith(
        `analytics:${siteId}:7d`,
        expect.any(String),
        300, // CACHE_TTL_SECONDS
      )
      expect(result.totalViews).toBe(0)
    })

    it('should fill all days in the period with 0 when no pageViews exist', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(null)
      mockPageViewModel.findMany.mockResolvedValueOnce([])
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act
      const result = await service.getAnalytics(siteId, tenantId, '7d')

      // Assert — viewsByDay tiene exactamente 7 entradas (una por día)
      expect(result.viewsByDay).toHaveLength(7)
      expect(result.viewsByDay.every((d: { views: number }) => d.views === 0)).toBe(true)
    })

    it('should fill 30 days when period is 30d', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(null)
      mockPageViewModel.findMany.mockResolvedValueOnce([])
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act
      const result = await service.getAnalytics(siteId, tenantId, '30d')

      // Assert
      expect(result.viewsByDay).toHaveLength(30)
    })

    it('should fill 90 days when period is 90d', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(null)
      mockPageViewModel.findMany.mockResolvedValueOnce([])
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act
      const result = await service.getAnalytics(siteId, tenantId, '90d')

      // Assert
      expect(result.viewsByDay).toHaveLength(90)
    })

    it('should return topPages with max 10 entries even with more than 10 unique paths', async () => {
      // Arrange — 15 páginas distintas
      const now = new Date()
      const pageViews = Array.from({ length: 15 }, (_, i) => ({
        path: `/page-${i + 1}`,
        referrer: null,
        createdAt: now,
      }))
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(null)
      mockPageViewModel.findMany.mockResolvedValueOnce(pageViews)
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act
      const result = await service.getAnalytics(siteId, tenantId, '30d')

      // Assert — topPages limitado a 10
      expect(result.topPages.length).toBeLessThanOrEqual(10)
    })

    it('should aggregate pageViews by path correctly', async () => {
      // Arrange — 3 visitas a /home y 1 a /about
      const now = new Date()
      const pageViews = [
        { path: '/home', referrer: null, createdAt: now },
        { path: '/home', referrer: null, createdAt: now },
        { path: '/home', referrer: null, createdAt: now },
        { path: '/about', referrer: null, createdAt: now },
      ]
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(null)
      mockPageViewModel.findMany.mockResolvedValueOnce(pageViews)
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act
      const result = await service.getAnalytics(siteId, tenantId, '7d')

      // Assert
      expect(result.totalViews).toBe(4)
      const homePage = result.topPages.find((p: { path: string }) => p.path === '/home')
      expect(homePage?.views).toBe(3)
      expect(homePage?.percentage).toBe(75)
    })

    it('should use default period of 30d when period is not specified', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(null)
      mockPageViewModel.findMany.mockResolvedValueOnce([])
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act — sin pasar period
      const result = await service.getAnalytics(siteId, tenantId)

      // Assert — 30 días por defecto
      expect(result.viewsByDay).toHaveLength(30)
    })

    it('should throw NotFoundException when site does not belong to tenant', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.getAnalytics(siteId, 'wrong-tenant', '7d'),
      ).rejects.toThrow(NotFoundException)
    })

    it('should re-query DB when Redis cache contains corrupted JSON', async () => {
      // Arrange — caché corrompida (JSON inválido)
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce('INVALID_JSON{{{')
      mockPageViewModel.findMany.mockResolvedValueOnce([])
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act — no debe lanzar excepción
      const result = await service.getAnalytics(siteId, tenantId, '7d')

      // Assert — consultó DB como fallback
      expect(mockPageViewModel.findMany).toHaveBeenCalledTimes(1)
      expect(result.totalViews).toBe(0)
    })

    it('should aggregate referrers and mark direct visits as null', async () => {
      // Arrange
      const now = new Date()
      const pageViews = [
        { path: '/home', referrer: null, createdAt: now },            // directo
        { path: '/home', referrer: 'https://google.com', createdAt: now }, // google
        { path: '/blog', referrer: 'https://google.com', createdAt: now }, // google
      ]
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(null)
      mockPageViewModel.findMany.mockResolvedValueOnce(pageViews)
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act
      const result = await service.getAnalytics(siteId, tenantId, '7d')

      // Assert
      const googleRef = result.referrers.find(
        (r: { referrer: string | null }) => r.referrer === 'https://google.com',
      )
      const directRef = result.referrers.find(
        (r: { referrer: string | null }) => r.referrer === null,
      )
      expect(googleRef?.count).toBe(2)
      expect(directRef?.count).toBe(1)
    })

    it('should count uniquePaths correctly', async () => {
      // Arrange — 5 visitas a 3 paths únicos
      const now = new Date()
      const pageViews = [
        { path: '/home', referrer: null, createdAt: now },
        { path: '/home', referrer: null, createdAt: now },
        { path: '/blog', referrer: null, createdAt: now },
        { path: '/blog', referrer: null, createdAt: now },
        { path: '/contact', referrer: null, createdAt: now },
      ]
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockRedis.get.mockResolvedValueOnce(null)
      mockPageViewModel.findMany.mockResolvedValueOnce(pageViews)
      mockRedis.set.mockResolvedValueOnce('OK')

      // Act
      const result = await service.getAnalytics(siteId, tenantId, '7d')

      // Assert
      expect(result.uniquePaths).toBe(3)
      expect(result.totalViews).toBe(5)
    })
  })
})
