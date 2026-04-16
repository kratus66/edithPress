import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { AuthService } from './auth.service'
import { DatabaseService } from '../database/database.service'
import { BCRYPT_ROUNDS } from './constants/auth.constants'

/**
 * SEC-05 — Unit tests de seguridad del módulo auth.
 *
 * Cubre los controles del OWASP Top 10 aplicables a auth:
 * A01, A02, A07.
 */
describe('AuthService — Security Tests', () => {
  let service: AuthService

  // ─── Mocks ───
  const mockDb = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tenantUser: {
      create: jest.fn(),
    },
    plan: {
      findUniqueOrThrow: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockDb)),
  }

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
  }

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-jwt-secret-at-least-256-bits-long-xxxxxxxx'),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jest.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────── BCRYPT (SEC-01) ──

  describe('SEC-01 — bcrypt rounds', () => {
    it('should use BCRYPT_ROUNDS = 12', () => {
      expect(BCRYPT_ROUNDS).toBe(12)
    })

    it('should hash password with 12 bcrypt rounds on register', async () => {
      // Arrange
      mockDb.user.findUnique.mockResolvedValue(null)       // email libre
      mockDb.plan.findUniqueOrThrow.mockResolvedValue({ id: 'plan-starter' })
      mockDb.tenant.findUnique.mockResolvedValue(null)     // slug libre
      mockDb.user.create.mockResolvedValue({ id: 'user-1', email: 'test@test.com', tenantUsers: [] })
      mockDb.tenant.create.mockResolvedValue({ id: 'tenant-1' })
      mockDb.tenantUser.create.mockResolvedValue({})
      mockDb.refreshToken.create.mockResolvedValue({})

      let capturedHash = ''
      mockDb.user.create.mockImplementation(({ data }: { data: Record<string, string> }) => {
        capturedHash = data['passwordHash'] ?? ''
        return { id: 'user-1', email: data['email'], tenantUsers: [] }
      })

      // Act
      await service.register({ email: 'test@test.com', password: 'Password123' })

      // Assert — verificamos comportamiento observable:
      // 1. El hash almacenado tiene el formato bcrypt con 12 rounds
      expect(capturedHash).toMatch(/^\$2[aby]\$12\$/)
      // 2. La contraseña original verifica correctamente contra el hash
      const isValid = await bcrypt.compare('Password123', capturedHash)
      expect(isValid).toBe(true)
    })

    it('should never store plaintext password', async () => {
      mockDb.user.findUnique.mockResolvedValue(null)
      mockDb.plan.findUniqueOrThrow.mockResolvedValue({ id: 'plan-starter' })
      mockDb.tenant.findUnique.mockResolvedValue(null)
      mockDb.refreshToken.create.mockResolvedValue({})

      let createdUserData: Record<string, unknown> = {}
      mockDb.user.create.mockImplementation(({ data }: { data: Record<string, unknown> }) => {
        createdUserData = data
        return { id: 'user-1', email: data['email'], tenantUsers: [] }
      })
      mockDb.tenant.create.mockResolvedValue({ id: 'tenant-1' })
      mockDb.tenantUser.create.mockResolvedValue({})

      const plainPassword = 'Password123'
      await service.register({ email: 'test@test.com', password: plainPassword })

      // La contraseña almacenada NO debe ser texto plano
      expect(createdUserData['passwordHash']).not.toBe(plainPassword)
      expect(createdUserData['password']).toBeUndefined()
      // Debe ser un hash de bcrypt válido
      expect(createdUserData['passwordHash']).toMatch(/^\$2[aby]\$12\$/)
    })
  })

  // ─────────────────────────────────────────────── ENUM PREVENTION (A01) ──

  describe('SEC-05 — A07: No enumerar usuarios en login', () => {
    it('should return null (not throw) for non-existent user', async () => {
      mockDb.user.findUnique.mockResolvedValue(null)
      const result = await service.validateUser('noexiste@test.com', 'any')
      expect(result).toBeNull()
    })

    it('should return null for wrong password', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: await bcrypt.hash('correct-password', 12),
        isActive: true,
        tenantUsers: [],
      })
      const result = await service.validateUser('test@test.com', 'wrong-password')
      expect(result).toBeNull()
    })

    it('should return null for inactive user', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: await bcrypt.hash('Password123', 12),
        isActive: false,   // cuenta desactivada
        tenantUsers: [],
      })
      const result = await service.validateUser('test@test.com', 'Password123')
      expect(result).toBeNull()
    })

    it('should return user on correct credentials', async () => {
      const hash = await bcrypt.hash('Password123', 12)
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: hash,
        isActive: true,
        tenantUsers: [{ tenantId: 'tenant-1', role: 'OWNER' }],
      }
      mockDb.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.validateUser('test@test.com', 'Password123')
      expect(result).not.toBeNull()
      expect(result?.id).toBe('user-1')
    })
  })

  // ─────────────────────────────────────────────────── REFRESH ROTATION ──

  describe('SEC-05 — Refresh token rotation', () => {
    it('should reject expired refresh token', async () => {
      mockDb.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'old-token',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 1000), // expirado
        user: { email: 'test@test.com', tenantUsers: [] },
      })

      await expect(service.refresh('old-token')).rejects.toThrow(UnauthorizedException)
    })

    it('should reject non-existent refresh token', async () => {
      mockDb.refreshToken.findUnique.mockResolvedValue(null)
      await expect(service.refresh('nonexistent')).rejects.toThrow(UnauthorizedException)
    })

    it('should delete old token on successful refresh (rotation)', async () => {
      mockDb.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'valid-token',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 1_000_000),
        user: {
          id: 'user-1',
          email: 'test@test.com',
          tenantUsers: [{ tenantId: 'tenant-1', role: 'OWNER' }],
        },
      })
      mockDb.refreshToken.create.mockResolvedValue({})

      await service.refresh('valid-token')

      // El token viejo debe haberse eliminado
      expect(mockDb.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
      })
    })
  })

  // ─────────────────────────────────────────────────────── CONFLICT (A02) ──

  describe('SEC-05 — Registro: email duplicado', () => {
    it('should throw ConflictException for duplicate email', async () => {
      mockDb.user.findUnique.mockResolvedValue({ id: 'existing-user' })
      await expect(
        service.register({ email: 'duplicate@test.com', password: 'Password123' }),
      ).rejects.toThrow(ConflictException)
    })
  })

  // ──────────────────────────────────────────────────────── LOGOUT ──

  describe('SEC-05 — Logout invalida el refresh token', () => {
    it('should delete refresh token on logout', async () => {
      mockDb.refreshToken.deleteMany.mockResolvedValue({ count: 1 })
      await service.logout('some-refresh-token')
      expect(mockDb.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'some-refresh-token' },
      })
    })
  })
})
