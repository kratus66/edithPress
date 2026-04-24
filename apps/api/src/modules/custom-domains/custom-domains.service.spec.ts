import { Test, TestingModule } from '@nestjs/testing'
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { CustomDomainsService } from './custom-domains.service'
import { DatabaseService } from '../database/database.service'
import { RedisService } from '../redis/redis.service'

// ─── Mock dns.promises ────────────────────────────────────────────────────────
//
// jest.mock() es hoisted por ts-jest antes de que se inicialicen las variables
// con const/let (TDZ). Por eso no se puede referenciar una variable en la
// factory. En su lugar, usamos jest.fn() inline y luego obtenemos la referencia
// del módulo ya mockeado vía require().
//
jest.mock('dns', () => ({
  promises: {
    resolveTxt: jest.fn(),
  },
}))

// require('dns') retorna el módulo mockeado — ts-jest hoisted jest.mock arriba de los imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockResolveTxt = (require('dns') as typeof import('dns')).promises.resolveTxt as jest.Mock

// ─────────────────────────────────────────────────────────────────────────────

describe('CustomDomainsService', () => {
  let service: CustomDomainsService

  // ─── Mock de DatabaseService ──────────────────────────────────────────────────
  //
  // CustomDomainsService accede a db.site y db.customDomain (vía cast any).
  //
  const mockCustomDomainModel = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  const mockDb = {
    site: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    // El servicio accede a (this.db as any).customDomain
    customDomain: mockCustomDomainModel,
  }

  // ─── Mock de RedisService ─────────────────────────────────────────────────────

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }

  // ─── Setup ────────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomDomainsService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile()

    service = module.get<CustomDomainsService>(CustomDomainsService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ──────────────────────────────────────────────────── addDomain() ──

  describe('addDomain()', () => {
    const siteId = 'site-001'
    const tenantId = 'tenant-001'
    const dto = { domain: 'mysite.com' }

    it('should create a new custom domain and return it with txtRecord and instructions', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique
        .mockResolvedValueOnce(null) // dominio libre
        .mockResolvedValueOnce(null) // sitio sin dominio previo
      mockCustomDomainModel.create.mockResolvedValueOnce({
        id: 'cd-001',
        domain: 'mysite.com',
        txtRecord: 'a'.repeat(64),
        status: 'PENDING',
        createdAt: new Date(),
      })

      // Act
      const result = await service.addDomain(siteId, tenantId, dto)

      // Assert
      expect(result.domain).toBe('mysite.com')
      expect(result.txtRecord).toBeDefined()
      expect(result.instructions).toContain('_edithpress-verify.mysite.com')
      expect(mockCustomDomainModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId,
            siteId,
            domain: 'mysite.com',
            status: 'PENDING',
          }),
        }),
      )
    })

    it('should throw NotFoundException when site does not belong to tenant', async () => {
      // Arrange — sitio no encontrado (pertenece a otro tenant)
      mockDb.site.findFirst.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.addDomain(siteId, 'other-tenant', dto),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw ConflictException when domain is already registered by another site', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce({ id: 'cd-existing', domain: 'mysite.com' }) // dominio ocupado

      // Act & Assert
      await expect(
        service.addDomain(siteId, tenantId, dto),
      ).rejects.toThrow(ConflictException)
    })

    it('should throw ConflictException when site already has a domain registered', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique
        .mockResolvedValueOnce(null)                                    // dominio libre
        .mockResolvedValueOnce({ id: 'cd-site-has', siteId })          // sitio ya tiene dominio

      // Act & Assert
      await expect(
        service.addDomain(siteId, tenantId, dto),
      ).rejects.toThrow(ConflictException)
    })

    it('should throw BadRequestException for blocked domains (edithpress.com)', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })

      // Act & Assert
      await expect(
        service.addDomain(siteId, tenantId, { domain: 'myapp.edithpress.com' }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException for localhost domain', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })

      // Act & Assert
      await expect(
        service.addDomain(siteId, tenantId, { domain: 'localhost' }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should normalize domain to lowercase before storing', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
      mockCustomDomainModel.create.mockResolvedValueOnce({
        id: 'cd-002',
        domain: 'mysite.com',
        txtRecord: 'b'.repeat(64),
        status: 'PENDING',
        createdAt: new Date(),
      })

      // Act
      await service.addDomain(siteId, tenantId, { domain: 'MYSITE.COM' })

      // Assert — se guardó en minúsculas
      expect(mockCustomDomainModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ domain: 'mysite.com' }),
        }),
      )
    })
  })

  // ──────────────────────────────────────────────────── getDomain() ──

  describe('getDomain()', () => {
    const siteId = 'site-002'
    const tenantId = 'tenant-002'

    it('should return DomainInfo when site has a custom domain', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce({
        id: 'cd-003',
        domain: 'client.com',
        txtRecord: 'abc123',
        status: 'ACTIVE',
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Act
      const result = await service.getDomain(siteId, tenantId)

      // Assert
      expect(result).not.toBeNull()
      expect(result?.domain).toBe('client.com')
      expect(result?.status).toBe('ACTIVE')
    })

    it('should return null when site has no custom domain configured', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce(null)

      // Act
      const result = await service.getDomain(siteId, tenantId)

      // Assert
      expect(result).toBeNull()
    })

    it('should throw NotFoundException when site does not belong to tenant', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.getDomain(siteId, 'wrong-tenant'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ──────────────────────────────────────────────────── verifyDomain() ──

  describe('verifyDomain()', () => {
    const siteId = 'site-003'
    const tenantId = 'tenant-003'
    const pendingDomain = {
      id: 'cd-004',
      domain: 'verify.com',
      txtRecord: 'expected-txt-value',
      status: 'PENDING',
    }

    it('should return ACTIVE status and update DB when DNS lookup finds the correct TXT record', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce(pendingDomain)
      mockRedis.get.mockResolvedValueOnce(null) // sin intentos previos
      mockRedis.set.mockResolvedValueOnce('OK')
      mockResolveTxt.mockResolvedValueOnce([['expected-txt-value']]) // DNS encontrado
      mockCustomDomainModel.update.mockResolvedValueOnce({})

      // Act
      const result = await service.verifyDomain(siteId, tenantId)

      // Assert
      expect(result.status).toBe('ACTIVE')
      expect(mockCustomDomainModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cd-004' },
          data: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      )
    })

    it('should return FAILED status when DNS lookup does not find the TXT record', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce(pendingDomain)
      mockRedis.get.mockResolvedValueOnce(null)
      mockRedis.set.mockResolvedValueOnce('OK')
      mockResolveTxt.mockResolvedValueOnce([['wrong-value-xyz']]) // valor incorrecto
      mockCustomDomainModel.update.mockResolvedValueOnce({})

      // Act
      const result = await service.verifyDomain(siteId, tenantId)

      // Assert
      expect(result.status).toBe('FAILED')
      expect(mockCustomDomainModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      )
    })

    it('should return FAILED status when DNS lookup throws ENOTFOUND', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce(pendingDomain)
      mockRedis.get.mockResolvedValueOnce(null)
      mockRedis.set.mockResolvedValueOnce('OK')
      mockResolveTxt.mockRejectedValueOnce(Object.assign(new Error('queryTxt ENOTFOUND'), { code: 'ENOTFOUND' }))
      mockCustomDomainModel.update.mockResolvedValueOnce({})

      // Act
      const result = await service.verifyDomain(siteId, tenantId)

      // Assert — DNS error es tratado como verificación fallida, no como excepción
      expect(result.status).toBe('FAILED')
    })

    it('should throw ForbiddenException when rate limit is exceeded (>= 5 attempts)', async () => {
      // Arrange — ya hay 5 intentos registrados en Redis
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce(pendingDomain)
      mockRedis.get.mockResolvedValueOnce('5') // 5 intentos = límite alcanzado

      // Act & Assert
      await expect(
        service.verifyDomain(siteId, tenantId),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should return ACTIVE immediately when domain is already verified', async () => {
      // Arrange — dominio ya en estado ACTIVE
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce({
        ...pendingDomain,
        status: 'ACTIVE',
      })

      // Act
      const result = await service.verifyDomain(siteId, tenantId)

      // Assert — retorna sin consultar DNS
      expect(result.status).toBe('ACTIVE')
      expect(mockResolveTxt).not.toHaveBeenCalled()
    })

    it('should throw NotFoundException when site has no domain configured', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.verifyDomain(siteId, tenantId),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException when site does not belong to tenant', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.verifyDomain(siteId, 'wrong-tenant'),
      ).rejects.toThrow(NotFoundException)
    })

    it('should increment rate limit counter when previous attempts exist', async () => {
      // Arrange — 2 intentos previos, no al límite
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce(pendingDomain)
      mockRedis.get.mockResolvedValueOnce('2') // 2 intentos → incrementar a 3
      mockRedis.set.mockResolvedValueOnce('OK')
      mockResolveTxt.mockRejectedValueOnce(new Error('ENODATA'))
      mockCustomDomainModel.update.mockResolvedValueOnce({})

      // Act
      await service.verifyDomain(siteId, tenantId)

      // Assert — se actualizó el contador a 3
      expect(mockRedis.set).toHaveBeenCalledWith(
        `domain-verify-count:${siteId}`,
        '3',
        3600,
      )
    })
  })

  // ──────────────────────────────────────────────────── removeDomain() ──

  describe('removeDomain()', () => {
    const siteId = 'site-004'
    const tenantId = 'tenant-004'

    it('should delete the custom domain record when it exists', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce({
        id: 'cd-005',
        domain: 'todelete.com',
      })
      mockCustomDomainModel.delete.mockResolvedValueOnce({})

      // Act
      await service.removeDomain(siteId, tenantId)

      // Assert
      expect(mockCustomDomainModel.delete).toHaveBeenCalledWith({
        where: { id: 'cd-005' },
      })
    })

    it('should throw NotFoundException when site has no domain to remove', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce({ id: siteId })
      mockCustomDomainModel.findUnique.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.removeDomain(siteId, tenantId),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException when site does not belong to tenant', async () => {
      // Arrange
      mockDb.site.findFirst.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.removeDomain(siteId, 'wrong-tenant'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ──────────────────────────────────────────────────── lookupByDomain() ──

  describe('lookupByDomain()', () => {
    it('should return tenantSlug and siteId when active domain is found', async () => {
      // Arrange
      mockCustomDomainModel.findFirst.mockResolvedValueOnce({
        siteId: 'site-abc',
        tenant: { slug: 'my-tenant' },
      })

      // Act
      const result = await service.lookupByDomain('active-domain.com')

      // Assert
      expect(result.tenantSlug).toBe('my-tenant')
      expect(result.siteId).toBe('site-abc')
      expect(mockCustomDomainModel.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { domain: 'active-domain.com', status: 'ACTIVE' },
        }),
      )
    })

    it('should normalize domain to lowercase before lookup', async () => {
      // Arrange
      mockCustomDomainModel.findFirst.mockResolvedValueOnce({
        siteId: 'site-xyz',
        tenant: { slug: 'my-tenant-2' },
      })

      // Act
      await service.lookupByDomain('UPPERCASE-DOMAIN.COM')

      // Assert
      expect(mockCustomDomainModel.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { domain: 'uppercase-domain.com', status: 'ACTIVE' },
        }),
      )
    })

    it('should throw NotFoundException when domain is not found or not verified', async () => {
      // Arrange — dominio no existe o está PENDING/FAILED
      mockCustomDomainModel.findFirst.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.lookupByDomain('notfound.com'),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
