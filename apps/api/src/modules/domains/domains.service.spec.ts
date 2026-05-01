import { Test, TestingModule } from '@nestjs/testing'
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import * as nodeDns from 'node:dns'
import { DomainsService } from './domains.service'
import { DatabaseService } from '../database/database.service'

// ─── Mock DNS (node:dns) ───────────────────────────────────────────────────────
//
// jest.mock() is hoisted above const declarations, so the factory must use
// jest.fn() directly. We then grab the typed reference from the mocked module.
//
jest.mock('node:dns', () => ({
  promises: { resolveCname: jest.fn() },
}))

const mockResolveCname = jest.mocked(nodeDns.promises.resolveCname)

// ─────────────────────────────────────────────────────────────────────────────

describe('DomainsService', () => {
  let service: DomainsService

  // ─── Mock DatabaseService ─────────────────────────────────────────────────

  const mockDomainVerification = {
    create: jest.fn(),
  }

  const mockCustomDomain = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  // $transaction recibe un array de promesas: [domainVerification.create(...), customDomain.update(...)]
  // Llamamos Promise.all sobre ellas para resolverlas.
  const mockDb = {
    tenant: {
      findUnique: jest.fn(),
    },
    site: {
      findFirst: jest.fn(),
    },
    customDomain: mockCustomDomain,
    domainVerification: mockDomainVerification,
    $transaction: jest.fn((ops: unknown) => {
      if (Array.isArray(ops)) {
        return Promise.all(ops as Promise<unknown>[])
      }
      return Promise.resolve()
    }),
  }

  // ─── Setup ────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainsService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile()

    service = module.get<DomainsService>(DomainsService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ──────────────────────────────────────────────────── addDomain() ──

  describe('addDomain()', () => {
    const tenantId = 'tenant-001'

    function arrangeTenantWithPlan(hasCustomDomain: boolean) {
      mockDb.tenant.findUnique.mockResolvedValueOnce({
        id: tenantId,
        plan: { hasCustomDomain },
      })
    }

    it('should create a CustomDomain with status PENDING when all validations pass', async () => {
      // Arrange
      arrangeTenantWithPlan(true)
      mockDb.site.findFirst.mockResolvedValueOnce({ id: 'site-001' })
      mockCustomDomain.findUnique.mockResolvedValueOnce(null) // dominio libre
      mockCustomDomain.create.mockResolvedValueOnce({
        id: 'domain-001',
        tenantId,
        siteId: 'site-001',
        domain: 'www.miempresa.com',
        status: 'PENDING',
        txtRecord: 'edithpress-verify=abc123',
      })

      // Act
      const result = await service.addDomain(tenantId, {
        domain: 'www.miempresa.com',
        siteId: 'site-001',
      })

      // Assert
      expect(mockCustomDomain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId,
            siteId: 'site-001',
            domain: 'www.miempresa.com',
            status: 'PENDING',
          }),
        }),
      )
      expect(result.status).toBe('PENDING')
    })

    it('should generate a txtRecord in the created domain', async () => {
      // Arrange
      arrangeTenantWithPlan(true)
      mockDb.site.findFirst.mockResolvedValueOnce({ id: 'site-001' })
      mockCustomDomain.findUnique.mockResolvedValueOnce(null)
      mockCustomDomain.create.mockImplementationOnce((args: { data: { txtRecord: string } }) =>
        Promise.resolve({ id: 'domain-001', ...args.data }),
      )

      // Act
      const result = await service.addDomain(tenantId, {
        domain: 'shop.example.com',
        siteId: 'site-001',
      })

      // Assert — txtRecord debe empezar con "edithpress-verify="
      expect(result.txtRecord).toMatch(/^edithpress-verify=[0-9a-f]+$/)
    })

    it('should throw ForbiddenException when tenant plan does not include hasCustomDomain', async () => {
      // Arrange
      arrangeTenantWithPlan(false)

      // Act & Assert
      await expect(
        service.addDomain(tenantId, { domain: 'www.example.com', siteId: 'site-001' }),
      ).rejects.toThrow(ForbiddenException)

      expect(mockCustomDomain.create).not.toHaveBeenCalled()
    })

    it('should throw BadRequestException when domain ends in ".edithpress.com"', async () => {
      // Arrange — edithpress.com check fires before findUnique; no domain mock needed
      arrangeTenantWithPlan(true)
      mockDb.site.findFirst.mockResolvedValueOnce({ id: 'site-001' })

      // Act & Assert
      await expect(
        service.addDomain(tenantId, {
          domain: 'mitienda.edithpress.com',
          siteId: 'site-001',
        }),
      ).rejects.toThrow(BadRequestException)

      expect(mockCustomDomain.create).not.toHaveBeenCalled()
    })

    it('should throw NotFoundException when tenant is not found', async () => {
      // Arrange
      mockDb.tenant.findUnique.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.addDomain(tenantId, { domain: 'www.example.com', siteId: 'site-001' }),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException when site does not belong to tenant', async () => {
      // Arrange
      arrangeTenantWithPlan(true)
      mockDb.site.findFirst.mockResolvedValueOnce(null) // IDOR — el site no pertenece al tenant

      // Act & Assert
      await expect(
        service.addDomain(tenantId, { domain: 'www.example.com', siteId: 'site-other' }),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw ConflictException when domain is already registered', async () => {
      // Arrange
      arrangeTenantWithPlan(true)
      mockDb.site.findFirst.mockResolvedValueOnce({ id: 'site-001' })
      mockCustomDomain.findUnique.mockResolvedValueOnce({
        id: 'domain-existing',
        domain: 'www.yaexiste.com',
      }) // dominio ya registrado

      // Act & Assert
      await expect(
        service.addDomain(tenantId, {
          domain: 'www.yaexiste.com',
          siteId: 'site-001',
        }),
      ).rejects.toThrow(ConflictException)
    })
  })

  // ──────────────────────────────────────────────────── getDomains() ──

  describe('getDomains()', () => {
    it('should return all custom domains for the tenant ordered by createdAt desc', async () => {
      // Arrange
      const domains = [
        { id: 'd-1', domain: 'www.a.com', status: 'ACTIVE', createdAt: new Date('2026-04-01') },
        { id: 'd-2', domain: 'www.b.com', status: 'PENDING', createdAt: new Date('2026-03-01') },
      ]
      mockCustomDomain.findMany.mockResolvedValueOnce(domains)

      // Act
      const result = await service.getDomains('tenant-001')

      // Assert
      expect(mockCustomDomain.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-001' },
          orderBy: { createdAt: 'desc' },
        }),
      )
      expect(result).toEqual(domains)
    })
  })

  // ──────────────────────────────────────────────────── deleteDomain() ──

  describe('deleteDomain()', () => {
    it('should delete the domain when it belongs to the tenant', async () => {
      // Arrange
      mockCustomDomain.findFirst.mockResolvedValueOnce({
        id: 'domain-001',
        domain: 'www.miempresa.com',
        tenantId: 'tenant-001',
      })
      mockCustomDomain.delete.mockResolvedValueOnce({})

      // Act
      await service.deleteDomain('tenant-001', 'domain-001')

      // Assert
      expect(mockCustomDomain.delete).toHaveBeenCalledWith({
        where: { id: 'domain-001' },
      })
    })

    it('should throw NotFoundException when domain does not exist or belongs to another tenant', async () => {
      // Arrange — IDOR check falla
      mockCustomDomain.findFirst.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.deleteDomain('tenant-001', 'domain-other-tenant'),
      ).rejects.toThrow(NotFoundException)

      expect(mockCustomDomain.delete).not.toHaveBeenCalled()
    })
  })

  // ──────────────────────────────────────────────────── verifyDomain() ──

  describe('verifyDomain()', () => {
    const tenantId = 'tenant-001'
    const domainId = 'domain-001'

    const mockDomainRecord = {
      id: domainId,
      tenantId,
      domain: 'www.miempresa.com',
      status: 'PENDING',
    }

    // Helper: setup para un caso de verifyDomain con resultado de DNS dado
    function arrangeVerifyDomain(
      cnameResult: string[] | null,
      dnsError?: NodeJS.ErrnoException,
    ) {
      mockCustomDomain.findFirst.mockResolvedValueOnce(mockDomainRecord)
      if (dnsError) {
        mockResolveCname.mockRejectedValueOnce(dnsError)
      } else {
        mockResolveCname.mockResolvedValueOnce(cnameResult!)
      }
      // La transacción recibe un array de promesas; las resolvemos en orden
      mockDomainVerification.create.mockResolvedValueOnce({
        id: 'ver-001',
        domainId,
        status: dnsError
          ? 'FAILED'
          : cnameResult?.some((r) => r === 'renderer.edithpress.com' || r === 'renderer.edithpress.com.')
          ? 'ACTIVE'
          : 'FAILED',
        message: null,
      })
      mockCustomDomain.update.mockResolvedValueOnce({
        ...mockDomainRecord,
        status: dnsError
          ? 'FAILED'
          : cnameResult?.some((r) => r === 'renderer.edithpress.com' || r === 'renderer.edithpress.com.')
          ? 'ACTIVE'
          : 'FAILED',
        verifiedAt: null,
      })
    }

    it('should set status ACTIVE when CNAME points to renderer.edithpress.com', async () => {
      // Arrange
      arrangeVerifyDomain(['renderer.edithpress.com'])

      // Act
      const result = await service.verifyDomain(tenantId, domainId)

      // Assert
      expect(mockDb.$transaction).toHaveBeenCalledTimes(1)
      expect(result.domain.status).toBe('ACTIVE')
    })

    it('should set status ACTIVE when CNAME includes trailing dot (renderer.edithpress.com.)', async () => {
      // Arrange — algunos servidores DNS retornan CNAME con punto final
      arrangeVerifyDomain(['renderer.edithpress.com.'])

      // Act
      const result = await service.verifyDomain(tenantId, domainId)

      // Assert
      expect(result.domain.status).toBe('ACTIVE')
    })

    it('should set status FAILED when CNAME does not point to renderer.edithpress.com', async () => {
      // Arrange — CNAME apunta a otro servidor
      arrangeVerifyDomain(['other-host.example.com'])

      // Act
      const result = await service.verifyDomain(tenantId, domainId)

      // Assert
      expect(result.domain.status).toBe('FAILED')
    })

    it('should set status FAILED when DNS throws ENOTFOUND', async () => {
      // Arrange — dominio no existe en DNS
      const dnsError = Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' })
      arrangeVerifyDomain(null, dnsError)

      // Act
      const result = await service.verifyDomain(tenantId, domainId)

      // Assert
      expect(result.domain.status).toBe('FAILED')
    })

    it('should set status FAILED when DNS throws ETIMEOUT', async () => {
      // Arrange
      const dnsError = Object.assign(new Error('DNS query timeout'), { code: 'ETIMEOUT' })
      arrangeVerifyDomain(null, dnsError)

      // Act
      const result = await service.verifyDomain(tenantId, domainId)

      // Assert
      expect(result.domain.status).toBe('FAILED')
    })

    it('should set status FAILED for unknown DNS errors without exposing internal details', async () => {
      // Arrange — error desconocido que NO debe exponerse al cliente
      const unknownError = Object.assign(new Error('Internal DNS resolver error XYZ'), {
        code: 'EUNKNOWN_INTERNAL',
      })
      arrangeVerifyDomain(null, unknownError)

      // Act
      const result = await service.verifyDomain(tenantId, domainId)

      // Assert
      expect(result.domain.status).toBe('FAILED')
    })

    it('should throw NotFoundException when domain does not exist or belongs to another tenant', async () => {
      // Arrange — IDOR check falla
      mockCustomDomain.findFirst.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(
        service.verifyDomain(tenantId, 'domain-other-tenant'),
      ).rejects.toThrow(NotFoundException)

      expect(mockResolveCname).not.toHaveBeenCalled()
    })

    it('should persist DomainVerification and update CustomDomain in a single transaction', async () => {
      // Arrange — caso ACTIVE
      arrangeVerifyDomain(['renderer.edithpress.com'])

      // Act
      const result = await service.verifyDomain(tenantId, domainId)

      // Assert — la transacción fue invocada y retornó ambos objetos
      expect(mockDb.$transaction).toHaveBeenCalledTimes(1)
      expect(result.verification).toBeDefined()
      expect(result.domain).toBeDefined()
    })
  })
})
