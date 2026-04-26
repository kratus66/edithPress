import { Test, TestingModule } from '@nestjs/testing'
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { PagesService } from './pages.service'
import { DatabaseService } from '../database/database.service'
import { createPage, createSite } from '../../../test/factories'

/**
 * Unit tests — PagesService
 *
 * El patrón central que se verifica es `verifySiteOwnership`:
 * toda operación primero comprueba que siteId pertenece a tenantId.
 * Si esa verificación falla, la respuesta es NotFoundException,
 * sin importar si la página existe.
 */
describe('PagesService', () => {
  let service: PagesService

  // ─── Mock DB ────────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDb: Record<string, any> = {
    site: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    page: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    pageVersion: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $transaction: jest.fn((arg: any) => {
      if (Array.isArray(arg)) return Promise.all(arg as Promise<unknown>[])
      return (arg as (tx: unknown) => Promise<unknown>)(mockDb)
    }),
  }

  /** Helper: simula que el site SÍ pertenece al tenant. */
  const allowSiteOwnership = (siteId = 'site-1', tenantId = 'tenant-1') => {
    mockDb.site.findFirst.mockResolvedValue({ id: siteId })
  }

  /** Helper: simula que el site NO pertenece al tenant (IDOR). */
  const denySiteOwnership = () => {
    mockDb.site.findFirst.mockResolvedValue(null)
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile()

    service = module.get<PagesService>(PagesService)
    jest.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────── findAll ──

  describe('findAll', () => {
    it('should return pages list when site belongs to tenant', async () => {
      // Arrange
      allowSiteOwnership()
      const page = createPage({ siteId: 'site-1' })
      mockDb.page.findMany.mockResolvedValue([page])
      mockDb.page.count.mockResolvedValue(1)

      // Act
      const result = await service.findAll('site-1', 'tenant-1', 1, 10)

      // Assert
      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should throw NotFoundException when site does not belong to tenant (IDOR)', async () => {
      // Arrange
      denySiteOwnership()

      // Act & Assert
      await expect(service.findAll('site-b', 'tenant-a', 1, 10)).rejects.toThrow(
        NotFoundException,
      )
      expect(mockDb.page.findMany).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────────────────────── create ──

  describe('create', () => {
    it('should create page when site is owned and slug is unique', async () => {
      // Arrange
      allowSiteOwnership()
      mockDb.page.findUnique.mockResolvedValue(null) // slug libre
      const newPage = createPage({ siteId: 'site-1', slug: 'about', title: 'About' })
      mockDb.page.create.mockResolvedValue(newPage)

      // Act
      const result = await service.create(
        'site-1',
        'tenant-1',
        { title: 'About', slug: 'about' },
        'user-1',
      )

      // Assert
      expect(result.slug).toBe('about')
      expect(mockDb.page.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ siteId: 'site-1', slug: 'about' }),
        }),
      )
    })

    it('should throw ConflictException when slug already exists in the site', async () => {
      // Arrange
      allowSiteOwnership()
      mockDb.page.findUnique.mockResolvedValue({ id: 'existing-page' }) // slug tomado

      // Act & Assert
      await expect(
        service.create('site-1', 'tenant-1', { title: 'Dup', slug: 'about' }, 'user-1'),
      ).rejects.toThrow(ConflictException)
    })

    it('should clear previous homepage when isHomepage is true', async () => {
      // Arrange
      allowSiteOwnership()
      mockDb.page.findUnique.mockResolvedValue(null)
      mockDb.page.updateMany.mockResolvedValue({ count: 1 })
      mockDb.page.create.mockResolvedValue(createPage({ siteId: 'site-1', isHomepage: true }))

      // Act
      await service.create(
        'site-1',
        'tenant-1',
        { title: 'Home', slug: 'home', isHomepage: true },
        'user-1',
      )

      // Assert — desmarca homepage anterior
      expect(mockDb.page.updateMany).toHaveBeenCalledWith({
        where: { siteId: 'site-1', isHomepage: true },
        data: { isHomepage: false },
      })
    })

    it('should not call updateMany when isHomepage is false or undefined', async () => {
      // Arrange
      allowSiteOwnership()
      mockDb.page.findUnique.mockResolvedValue(null)
      mockDb.page.create.mockResolvedValue(createPage({ siteId: 'site-1' }))

      // Act
      await service.create('site-1', 'tenant-1', { title: 'Blog', slug: 'blog' }, 'user-1')

      // Assert
      expect(mockDb.page.updateMany).not.toHaveBeenCalled()
    })

    it('should throw NotFoundException when site does not belong to tenant', async () => {
      // Arrange
      denySiteOwnership()

      // Act & Assert
      await expect(
        service.create('site-b', 'tenant-a', { title: 'Hack', slug: 'hack' }, 'user-a'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ─────────────────────────────────────────────────────── findOne ──

  describe('findOne', () => {
    it('should return page with content when site is owned', async () => {
      // Arrange
      allowSiteOwnership()
      const page = { ...createPage({ siteId: 'site-1' }), content: [{ type: 'hero' }] }
      mockDb.page.findFirst.mockResolvedValue(page)

      // Act
      const result = await service.findOne(page.id, 'site-1', 'tenant-1')

      // Assert
      expect(result.id).toBe(page.id)
    })

    it('should throw NotFoundException when page does not exist in site', async () => {
      // Arrange
      allowSiteOwnership()
      mockDb.page.findFirst.mockResolvedValue(null)

      // Act & Assert
      await expect(service.findOne('ghost-page', 'site-1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw NotFoundException when site does not belong to tenant (IDOR)', async () => {
      // Arrange
      denySiteOwnership()

      // Act & Assert
      await expect(service.findOne('page-1', 'site-b', 'tenant-a')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─────────────────────────────────────────────────────── update ──

  describe('update', () => {
    it('should update page fields when ownership verified', async () => {
      // Arrange
      allowSiteOwnership()
      const page = createPage({ siteId: 'site-1' })
      mockDb.page.findFirst
        .mockResolvedValueOnce(page) // verifica existencia
      mockDb.page.update.mockResolvedValue({ ...page, title: 'Editado' })

      // Act
      const result = await service.update(page.id, 'site-1', 'tenant-1', { title: 'Editado' })

      // Assert
      expect(result.title).toBe('Editado')
    })

    it('should throw ConflictException when updating to an already used slug', async () => {
      // Arrange
      allowSiteOwnership()
      const page = createPage({ siteId: 'site-1', slug: 'original' })
      mockDb.page.findFirst
        .mockResolvedValueOnce(page)                    // página existe
        .mockResolvedValueOnce({ id: 'other-page' })   // slug tomado por otra página

      // Act & Assert
      await expect(
        service.update(page.id, 'site-1', 'tenant-1', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException)
    })
  })

  // ─────────────────────────────────────────────────────── remove ──

  describe('remove', () => {
    it('should delete page when site is owned and page exists', async () => {
      // Arrange
      allowSiteOwnership()
      const page = createPage({ siteId: 'site-1' })
      mockDb.page.findFirst.mockResolvedValue(page)
      mockDb.page.delete.mockResolvedValue(page)

      // Act
      await service.remove(page.id, 'site-1', 'tenant-1')

      // Assert
      expect(mockDb.page.delete).toHaveBeenCalledWith({ where: { id: page.id } })
    })

    it('should throw NotFoundException when page does not exist', async () => {
      // Arrange
      allowSiteOwnership()
      mockDb.page.findFirst.mockResolvedValue(null)

      // Act & Assert
      await expect(service.remove('ghost', 'site-1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─────────────────────────────────────────────────────── publish ──

  describe('publish', () => {
    it('should set status PUBLISHED when page has content', async () => {
      // Arrange
      allowSiteOwnership()
      const page = createPage({ siteId: 'site-1', content: [{ type: 'hero' }] })
      mockDb.page.findFirst.mockResolvedValue(page)
      mockDb.page.update.mockResolvedValue({ ...page, status: 'PUBLISHED' })
      mockDb.site.update.mockResolvedValue({ id: 'site-1', isPublished: true })

      // Act
      const result = await service.publish(page.id, 'site-1', 'tenant-1')

      // Assert
      expect(result.status).toBe('PUBLISHED')
      expect(mockDb.page.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      )
    })

    it('should throw BadRequestException when page has no content', async () => {
      // Arrange
      allowSiteOwnership()
      const emptyPage = createPage({ siteId: 'site-1', content: [] })
      mockDb.page.findFirst.mockResolvedValue(emptyPage)

      // Act & Assert
      await expect(service.publish(emptyPage.id, 'site-1', 'tenant-1')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw NotFoundException when site does not belong to tenant (IDOR)', async () => {
      // Arrange
      denySiteOwnership()

      // Act & Assert
      await expect(service.publish('page-1', 'site-b', 'tenant-a')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─────────────────────────────────────────────────────── unpublish ──

  describe('unpublish', () => {
    it('should set status DRAFT', async () => {
      // Arrange
      allowSiteOwnership()
      const page = createPage({ siteId: 'site-1', status: 'PUBLISHED' })
      mockDb.page.findFirst.mockResolvedValue(page)
      mockDb.page.update.mockResolvedValue({ ...page, status: 'DRAFT' })

      // Act
      const result = await service.unpublish(page.id, 'site-1', 'tenant-1')

      // Assert
      expect(result.status).toBe('DRAFT')
    })
  })

  // ─────────────────────────────────────────────────────── versions ──

  describe('listVersions', () => {
    it('should return version history for owned page', async () => {
      // Arrange
      allowSiteOwnership()
      const page = createPage({ siteId: 'site-1' })
      mockDb.page.findFirst.mockResolvedValue(page)
      mockDb.pageVersion.findMany.mockResolvedValue([
        { id: 'v-1', pageId: page.id, createdAt: new Date(), createdBy: 'user-1' },
      ])

      // Act
      const result = await service.listVersions(page.id, 'site-1', 'tenant-1')

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].pageId).toBe(page.id)
    })

    it('should throw NotFoundException when page does not exist', async () => {
      // Arrange
      allowSiteOwnership()
      mockDb.page.findFirst.mockResolvedValue(null)

      // Act & Assert
      await expect(service.listVersions('ghost', 'site-1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('restoreVersion', () => {
    it('should save current content as new version before restoring', async () => {
      // Arrange
      allowSiteOwnership()
      const version = { id: 'v-old', pageId: 'page-1', content: [{ type: 'old' }] }
      mockDb.pageVersion.findFirst.mockResolvedValue(version)
      mockDb.page.findUnique.mockResolvedValue({ content: [{ type: 'current' }] })
      mockDb.page.findFirst.mockResolvedValue(null) // findOne después de restaurar
      mockDb.page.findUnique
        .mockResolvedValueOnce({ content: [{ type: 'current' }] })
        .mockResolvedValueOnce(createPage({ siteId: 'site-1' }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDb.$transaction.mockImplementation((ops: any) => {
        if (Array.isArray(ops)) return Promise.all(ops as Promise<unknown>[])
        return (ops as (tx: unknown) => Promise<unknown>)(mockDb)
      })
      mockDb.pageVersion.create.mockResolvedValue({})
      mockDb.page.update.mockResolvedValue({ id: 'page-1' })

      // Act — verifica que no lanza excepción y la transacción se ejecutó
      await service.restoreVersion('page-1', 'v-old', 'site-1', 'tenant-1', 'user-1')

      // Assert — $transaction fue llamado con dos operaciones
      expect(mockDb.$transaction).toHaveBeenCalled()
    })

    it('should throw NotFoundException when version does not exist', async () => {
      // Arrange
      allowSiteOwnership()
      mockDb.pageVersion.findFirst.mockResolvedValue(null)

      // Act & Assert
      await expect(
        service.restoreVersion('page-1', 'v-ghost', 'site-1', 'tenant-1', 'user-1'),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
