import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { NewsletterService } from './newsletter.service'
import { DatabaseService } from '../database/database.service'

describe('NewsletterService', () => {
  let service: NewsletterService

  const mockSubscriberModel = {
    upsert: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
  }

  const mockDb = {
    site: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    newsletterSubscriber: mockSubscriberModel,
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile()

    service = module.get<NewsletterService>(NewsletterService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── subscribe ────────────────────────────────────────────────────────────────

  describe('subscribe', () => {
    it('email válido + siteId existente → crea suscriptor y retorna { success: true }', async () => {
      mockDb.site.findUnique.mockResolvedValue({ id: 'site-1' })
      mockSubscriberModel.upsert.mockResolvedValue({ id: 'sub-1' })

      const result = await service.subscribe('site-1', 'user@example.com', 'newsletter-block')

      expect(result).toEqual({ success: true })
      expect(mockSubscriberModel.upsert).toHaveBeenCalledWith({
        where: { siteId_email: { siteId: 'site-1', email: 'user@example.com' } },
        update: { isActive: true, source: 'newsletter-block' },
        create: { siteId: 'site-1', email: 'user@example.com', source: 'newsletter-block', isActive: true },
      })
    })

    it('email ya suscrito → reactiva (isActive = true) sin crear duplicado', async () => {
      mockDb.site.findUnique.mockResolvedValue({ id: 'site-1' })
      mockSubscriberModel.upsert.mockResolvedValue({ id: 'sub-1', isActive: true })

      const result = await service.subscribe('site-1', 'already@example.com')

      expect(result).toEqual({ success: true })
      // El upsert actualiza isActive: true si ya existe
      expect(mockSubscriberModel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ isActive: true }) })
      )
    })

    it('siteId inexistente → lanza NotFoundException', async () => {
      mockDb.site.findUnique.mockResolvedValue(null)

      await expect(service.subscribe('invalid-site', 'user@example.com')).rejects.toThrow(
        NotFoundException,
      )
      expect(mockSubscriberModel.upsert).not.toHaveBeenCalled()
    })
  })

  // ── getSubscribers ───────────────────────────────────────────────────────────

  describe('getSubscribers', () => {
    it('retorna lista paginada con total', async () => {
      const subscribers = [
        { email: 'a@test.com', subscribedAt: new Date(), isActive: true, source: null },
        { email: 'b@test.com', subscribedAt: new Date(), isActive: true, source: null },
      ]
      mockDb.site.findFirst.mockResolvedValue({ id: 'site-1' })
      mockSubscriberModel.findMany.mockResolvedValue(subscribers)
      mockSubscriberModel.count.mockResolvedValue(2)

      const result = await service.getSubscribers('site-1', 'tenant-1', { page: 1, limit: 50 })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
    })

    it('filtro active=true solo retorna suscriptores activos', async () => {
      mockDb.site.findFirst.mockResolvedValue({ id: 'site-1' })
      mockSubscriberModel.findMany.mockResolvedValue([])
      mockSubscriberModel.count.mockResolvedValue(0)

      await service.getSubscribers('site-1', 'tenant-1', { active: true })

      expect(mockSubscriberModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
      )
    })

    it('siteId no pertenece al tenant → lanza NotFoundException', async () => {
      mockDb.site.findFirst.mockResolvedValue(null)

      await expect(
        service.getSubscribers('other-site', 'tenant-1', {})
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ── unsubscribe ──────────────────────────────────────────────────────────────

  describe('unsubscribe', () => {
    it('token válido → marca isActive = false (soft delete)', async () => {
      const email = 'user@example.com'
      const token = Buffer.from(email).toString('base64')
      mockSubscriberModel.updateMany.mockResolvedValue({ count: 1 })

      const result = await service.unsubscribe('site-1', email, token)

      expect(result).toEqual({ success: true })
      expect(mockSubscriberModel.updateMany).toHaveBeenCalledWith({
        where: { siteId: 'site-1', email },
        data: { isActive: false },
      })
    })

    it('token inválido → retorna { success: true } sin revelar información (idempotente)', async () => {
      const result = await service.unsubscribe('site-1', 'user@example.com', 'invalid-token')

      expect(result).toEqual({ success: true })
      expect(mockSubscriberModel.updateMany).not.toHaveBeenCalled()
    })
  })

  // ── exportSubscribersCsv ─────────────────────────────────────────────────────

  describe('exportSubscribersCsv', () => {
    it('retorna string CSV con header y filas de suscriptores', async () => {
      const now = new Date('2026-04-24T00:00:00Z')
      mockDb.site.findFirst.mockResolvedValue({ id: 'site-1' })
      mockSubscriberModel.findMany.mockResolvedValue([
        { email: 'a@test.com', subscribedAt: now, isActive: true },
      ])

      const csv = await service.exportSubscribersCsv('site-1', 'tenant-1')

      expect(csv).toContain('email,subscribedAt,isActive')
      expect(csv).toContain('a@test.com')
      expect(csv).toContain('2026-04-24T00:00:00.000Z')
      expect(csv).toContain('true')
    })

    it('siteId no pertenece al tenant → lanza NotFoundException', async () => {
      mockDb.site.findFirst.mockResolvedValue(null)

      await expect(
        service.exportSubscribersCsv('other-site', 'tenant-1')
      ).rejects.toThrow(NotFoundException)
    })
  })
})
