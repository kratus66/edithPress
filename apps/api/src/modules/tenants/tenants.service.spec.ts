import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { TenantsService } from './tenants.service'
import { DatabaseService } from '../database/database.service'
import { createTenant, createPlan } from '../../../test/factories'

/**
 * Unit tests — TenantsService
 *
 * Comportamientos clave:
 *  - `create`: slug único, plan starter requerido, transacción atómica
 *  - `findById`: NotFoundException si no existe
 *  - `update`: slug único entre otros tenants (no consigo mismo)
 */
describe('TenantsService', () => {
  let service: TenantsService

  // ─── Mock DB ────────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDb: Record<string, any> = {
    tenant: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    tenantUser: {
      create: jest.fn(),
    },
    plan: {
      findUniqueOrThrow: jest.fn(),
    },
    /**
     * $transaction siempre usa la forma callback en TenantsService.
     * Pasamos el mismo mockDb como el `tx` para que las llamadas internas
     * usen los mismos mocks.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $transaction: jest.fn((fn: any) => (fn as (tx: unknown) => Promise<unknown>)(mockDb)),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile()

    service = module.get<TenantsService>(TenantsService)
    jest.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────── create ──

  describe('create', () => {
    it('should create tenant and assign OWNER role to the userId in one transaction', async () => {
      // Arrange
      const plan = createPlan()
      const tenant = createTenant({ slug: 'my-workspace' })

      mockDb.tenant.findUnique.mockResolvedValue(null)         // slug libre
      mockDb.plan.findUniqueOrThrow.mockResolvedValue(plan)
      mockDb.tenant.create.mockResolvedValue(tenant)
      mockDb.tenantUser.create.mockResolvedValue({})

      // Act
      const result = await service.create('user-1', {
        name: 'My Workspace',
        slug: 'my-workspace',
      })

      // Assert
      expect(result.slug).toBe('my-workspace')
      expect(mockDb.tenantUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            tenantId: tenant.id,
            role: 'OWNER',
          }),
        }),
      )
      expect(mockDb.$transaction).toHaveBeenCalled()
    })

    it('should throw ConflictException when slug is already taken', async () => {
      // Arrange
      mockDb.tenant.findUnique.mockResolvedValue({ id: 'existing' })

      // Act & Assert
      await expect(
        service.create('user-1', { name: 'Workspace', slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException)

      // La transacción no debe iniciarse si el slug ya existe
      expect(mockDb.$transaction).not.toHaveBeenCalled()
    })

    it('should use the starter plan when creating a tenant', async () => {
      // Arrange
      const plan = createPlan({ slug: 'starter' })
      const tenant = createTenant()

      mockDb.tenant.findUnique.mockResolvedValue(null)
      mockDb.plan.findUniqueOrThrow.mockResolvedValue(plan)
      mockDb.tenant.create.mockResolvedValue(tenant)
      mockDb.tenantUser.create.mockResolvedValue({})

      // Act
      await service.create('user-1', { name: 'Workspace', slug: 'new-slug' })

      // Assert — busca el plan por slug 'starter'
      expect(mockDb.plan.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { slug: 'starter' },
      })
    })
  })

  // ─────────────────────────────────────────────────────── findById ──

  describe('findById', () => {
    it('should return tenant when it exists', async () => {
      // Arrange
      const tenant = createTenant()
      mockDb.tenant.findUnique.mockResolvedValue(tenant)

      // Act
      const result = await service.findById(tenant.id)

      // Assert
      expect(result.id).toBe(tenant.id)
      expect(result.slug).toBe(tenant.slug)
    })

    it('should throw NotFoundException when tenant does not exist', async () => {
      // Arrange
      mockDb.tenant.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  // ─────────────────────────────────────────────────────── update ──

  describe('update', () => {
    it('should update tenant name without slug conflict check', async () => {
      // Arrange
      const tenant = createTenant({ name: 'Old Name' })
      mockDb.tenant.update.mockResolvedValue({ ...tenant, name: 'New Name' })

      // Act
      const result = await service.update(tenant.id, { name: 'New Name' })

      // Assert
      expect(result.name).toBe('New Name')
      // No hay slug en el DTO → no debe verificar conflicto
      expect(mockDb.tenant.findFirst).not.toHaveBeenCalled()
    })

    it('should update slug when new slug is not taken by another tenant', async () => {
      // Arrange
      const tenant = createTenant({ slug: 'old-slug' })
      mockDb.tenant.findFirst.mockResolvedValue(null) // slug libre
      mockDb.tenant.update.mockResolvedValue({ ...tenant, slug: 'new-slug' })

      // Act
      const result = await service.update(tenant.id, { slug: 'new-slug' })

      // Assert
      expect(result.slug).toBe('new-slug')
      expect(mockDb.tenant.findFirst).toHaveBeenCalledWith({
        where: { slug: 'new-slug', id: { not: tenant.id } },
      })
    })

    it('should throw ConflictException when new slug is taken by another tenant', async () => {
      // Arrange
      mockDb.tenant.findFirst.mockResolvedValue({ id: 'other-tenant' }) // slug tomado

      // Act & Assert
      await expect(
        service.update('my-tenant', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException)

      expect(mockDb.tenant.update).not.toHaveBeenCalled()
    })

    it('should allow keeping the same slug (not conflict with itself)', async () => {
      // Arrange — findFirst retorna null porque la query excluye al tenant actual (id: { not: tenantId })
      mockDb.tenant.findFirst.mockResolvedValue(null)
      const tenant = createTenant({ slug: 'my-slug' })
      mockDb.tenant.update.mockResolvedValue(tenant)

      // Act
      const result = await service.update(tenant.id, { slug: 'my-slug' })

      // Assert — no lanza excepción
      expect(result.slug).toBe('my-slug')
    })
  })
})
