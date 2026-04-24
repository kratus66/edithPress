import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { SitesService } from './sites.service'
import { DatabaseService } from '../database/database.service'
import { createSite, createTenant } from '../../../test/factories'

/**
 * Unit tests — SitesService
 *
 * Cobertura objetivo: >80% lines/functions
 * Patrón IDOR verificado en findOne: si el site existe pero es de otro
 * tenant, la respuesta es idéntica a "no encontrado" (no filtra por IDOR).
 */
describe('SitesService', () => {
  let service: SitesService

  // ─── Mock DB ────────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDb: Record<string, any> = {
    site: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    template: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    page: {
      create: jest.fn(),
    },
    /**
     * $transaction cubre dos formas:
     *  - Array  → Promise.all(ops) — usado en findAll
     *  - Callback → fn(tx)         — no usado en SitesService actualmente
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $transaction: jest.fn((arg: any) => {
      if (Array.isArray(arg)) return Promise.all(arg as Promise<unknown>[])
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return (arg as (tx: unknown) => Promise<unknown>)(mockDb)
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile()

    service = module.get<SitesService>(SitesService)
    jest.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────── findAll ──

  describe('findAll', () => {
    it('should return only sites belonging to the given tenantId', async () => {
      // Arrange
      const tenant = createTenant()
      const site = createSite({ tenantId: tenant.id })
      mockDb.site.findMany.mockResolvedValue([site])
      mockDb.site.count.mockResolvedValue(1)

      // Act
      const result = await service.findAll(tenant.id, 1, 10)

      // Assert
      expect(result.items).toHaveLength(1)
      expect(result.items[0].tenantId).toBe(tenant.id)
      expect(result.total).toBe(1)
      expect(mockDb.site.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: tenant.id } }),
      )
    })

    it('should apply pagination correctly when page > 1', async () => {
      // Arrange
      mockDb.site.findMany.mockResolvedValue([])
      mockDb.site.count.mockResolvedValue(20)

      // Act
      await service.findAll('tenant-1', 3, 5)

      // Assert — skip = (3-1)*5 = 10
      expect(mockDb.site.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      )
    })

    it('should return empty list when tenant has no sites', async () => {
      // Arrange
      mockDb.site.findMany.mockResolvedValue([])
      mockDb.site.count.mockResolvedValue(0)

      // Act
      const result = await service.findAll('tenant-empty', 1, 10)

      // Assert
      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  // ─────────────────────────────────────────────────────── create ──

  describe('create', () => {
    it('should create site with the correct tenantId', async () => {
      // Arrange
      const tenantId = 'tenant-abc'
      const dto = { name: 'Mi Sitio' }
      const expectedSite = createSite({ tenantId, name: 'Mi Sitio' })
      mockDb.site.create.mockResolvedValue(expectedSite)

      // Act
      const result = await service.create(tenantId, dto)

      // Assert
      expect(mockDb.site.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId }),
        }),
      )
      expect(result.tenantId).toBe(tenantId)
    })

    it('should throw BadRequestException when templateId does not exist', async () => {
      // Arrange
      mockDb.template.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(
        service.create('tenant-1', { name: 'Site', templateId: 'template-ghost' }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should create site without templateId when none is provided', async () => {
      // Arrange
      const site = createSite({ tenantId: 'tenant-1' })
      mockDb.site.create.mockResolvedValue(site)

      // Act
      await service.create('tenant-1', { name: 'Site sin template' })

      // Assert — template no debe consultarse si no hay templateId
      expect(mockDb.template.findUnique).not.toHaveBeenCalled()
    })

    it('should pass when templateId exists', async () => {
      // Arrange
      mockDb.template.findUnique.mockResolvedValue({ id: 'tpl-1', content: [] })
      const site = createSite({ tenantId: 'tenant-1', templateId: 'tpl-1' })
      mockDb.site.create.mockResolvedValue(site)
      mockDb.page.create.mockResolvedValue({ id: 'page-001' })
      mockDb.template.update.mockResolvedValue({ id: 'tpl-1', usageCount: 1 })

      // Act
      const result = await service.create('tenant-1', { name: 'Site', templateId: 'tpl-1' })

      // Assert
      expect(result.templateId).toBe('tpl-1')
    })
  })

  // ─────────────────────────────────────────────────────── findOne ──

  describe('findOne', () => {
    it('should return site when it belongs to the tenant', async () => {
      // Arrange
      const site = createSite({ tenantId: 'tenant-a' })
      mockDb.site.findFirst.mockResolvedValue(site)

      // Act
      const result = await service.findOne(site.id, 'tenant-a')

      // Assert
      expect(result.id).toBe(site.id)
      expect(mockDb.site.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: site.id, tenantId: 'tenant-a' },
        }),
      )
    })

    it('should throw NotFoundException when site belongs to a different tenant (IDOR protection)', async () => {
      // Arrange — el site existe en DB pero es de tenant-b; findFirst retorna null
      // porque la query incluye el tenantId del caller (tenant-a)
      mockDb.site.findFirst.mockResolvedValue(null)

      // Act & Assert — mismo error que "no encontrado" → no revela la existencia
      await expect(service.findOne('site-of-tenant-b', 'tenant-a')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw NotFoundException when site does not exist at all', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null)

      // Act & Assert
      await expect(service.findOne('nonexistent-site', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─────────────────────────────────────────────────────── update ──

  describe('update', () => {
    it('should update site when caller owns it', async () => {
      // Arrange
      const site = createSite({ tenantId: 'tenant-1', name: 'Antiguo' })
      mockDb.site.findFirst.mockResolvedValue(site)
      mockDb.site.update.mockResolvedValue({ ...site, name: 'Nuevo' })

      // Act
      const result = await service.update(site.id, 'tenant-1', { name: 'Nuevo' })

      // Assert
      expect(result.name).toBe('Nuevo')
    })

    it('should throw NotFoundException when caller does not own the site', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null)

      // Act & Assert
      await expect(
        service.update('site-b', 'tenant-a', { name: 'Hack' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ─────────────────────────────────────────────────────── remove ──

  describe('remove', () => {
    it('should delete site when caller owns it', async () => {
      // Arrange
      const site = createSite({ tenantId: 'tenant-1' })
      mockDb.site.findFirst.mockResolvedValue(site)
      mockDb.site.delete.mockResolvedValue(site)

      // Act
      await service.remove(site.id, 'tenant-1')

      // Assert
      expect(mockDb.site.delete).toHaveBeenCalledWith({ where: { id: site.id } })
    })

    it('should throw NotFoundException when caller does not own the site', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null)

      // Act & Assert
      await expect(service.remove('site-b', 'tenant-a')).rejects.toThrow(NotFoundException)
    })
  })

  // ─────────────────────────────────────────────────────── publish / unpublish ──

  describe('publish', () => {
    it('should set isPublished = true', async () => {
      // Arrange
      const site = createSite({ tenantId: 'tenant-1', isPublished: false })
      mockDb.site.findFirst.mockResolvedValue(site)
      mockDb.site.update.mockResolvedValue({ ...site, isPublished: true })

      // Act
      const result = await service.publish(site.id, 'tenant-1')

      // Assert
      expect(result.isPublished).toBe(true)
      expect(mockDb.site.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isPublished: true } }),
      )
    })

    it('should throw NotFoundException when site is not owned by tenant', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValue(null)

      // Act & Assert
      await expect(service.publish('site-b', 'tenant-a')).rejects.toThrow(NotFoundException)
    })
  })

  describe('unpublish', () => {
    it('should set isPublished = false', async () => {
      // Arrange
      const site = createSite({ tenantId: 'tenant-1', isPublished: true })
      mockDb.site.findFirst.mockResolvedValue(site)
      mockDb.site.update.mockResolvedValue({ ...site, isPublished: false })

      // Act
      const result = await service.unpublish(site.id, 'tenant-1')

      // Assert
      expect(result.isPublished).toBe(false)
    })
  })
})
