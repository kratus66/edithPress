import { Test, TestingModule } from '@nestjs/testing'
import { RedisService } from './redis.service'
import { REDIS_CLIENT } from './redis.module'

// ─── Mock del cliente ioredis ─────────────────────────────────────────────────
//
// Inyectamos un objeto que replica la API de ioredis que usa RedisService.
// No conectamos a Redis real — todos los métodos son jest.fn().
//
const mockRedisClient = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  ping: jest.fn(),
}

// ─────────────────────────────────────────────────────────────────────────────

describe('RedisService', () => {
  let service: RedisService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: REDIS_CLIENT, useValue: mockRedisClient },
      ],
    }).compile()

    service = module.get<RedisService>(RedisService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ──────────────────────────────────────────────────── set() ──

  describe('set()', () => {
    it('should call redis.set with EX and the given TTL seconds', async () => {
      // Arrange
      mockRedisClient.set.mockResolvedValueOnce('OK')

      // Act
      await service.set('refresh:token-abc', '1', 604800)

      // Assert
      expect(mockRedisClient.set).toHaveBeenCalledTimes(1)
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'refresh:token-abc',
        '1',
        'EX',
        604800,
      )
    })

    it('should call redis.set with the provided key and value', async () => {
      // Arrange
      mockRedisClient.set.mockResolvedValueOnce('OK')

      // Act
      await service.set('analytics:site-1:7d', JSON.stringify({ total: 42 }), 300)

      // Assert
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'analytics:site-1:7d',
        JSON.stringify({ total: 42 }),
        'EX',
        300,
      )
    })

    it('should resolve without returning a value', async () => {
      // Arrange
      mockRedisClient.set.mockResolvedValueOnce('OK')

      // Act & Assert
      await expect(service.set('k', 'v', 60)).resolves.toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────────── get() ──

  describe('get()', () => {
    it('should return the stored string value when key exists', async () => {
      // Arrange
      mockRedisClient.get.mockResolvedValueOnce('1')

      // Act
      const result = await service.get('refresh:some-token')

      // Assert
      expect(result).toBe('1')
      expect(mockRedisClient.get).toHaveBeenCalledWith('refresh:some-token')
    })

    it('should return null when key does not exist', async () => {
      // Arrange — ioredis devuelve null para claves inexistentes o expiradas
      mockRedisClient.get.mockResolvedValueOnce(null)

      // Act
      const result = await service.get('nonexistent-key')

      // Assert
      expect(result).toBeNull()
    })

    it('should return null when key has expired (TTL gone)', async () => {
      // Arrange — comportamiento idéntico a clave inexistente tras expiración
      mockRedisClient.get.mockResolvedValueOnce(null)

      // Act
      const result = await service.get('expired:key')

      // Assert
      expect(result).toBeNull()
    })

    it('should return a JSON string when value is serialized data', async () => {
      // Arrange — valor serializado como JSON (analytics cache)
      const payload = JSON.stringify({ totalViews: 99, topPages: [] })
      mockRedisClient.get.mockResolvedValueOnce(payload)

      // Act
      const result = await service.get('analytics:site-2:30d')

      // Assert
      expect(result).toBe(payload)
      // Los tests de servicio de nivel superior harán el JSON.parse
    })
  })

  // ──────────────────────────────────────────────────── del() ──

  describe('del()', () => {
    it('should call redis.del with the given key', async () => {
      // Arrange
      mockRedisClient.del.mockResolvedValueOnce(1)

      // Act
      await service.del('refresh:old-token')

      // Assert
      expect(mockRedisClient.del).toHaveBeenCalledWith('refresh:old-token')
    })

    it('should resolve without returning a value even if key did not exist', async () => {
      // Arrange — Redis devuelve 0 cuando la clave no existe
      mockRedisClient.del.mockResolvedValueOnce(0)

      // Act & Assert
      await expect(service.del('missing-key')).resolves.toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────────── exists() ──

  describe('exists()', () => {
    it('should return true when Redis reports count > 0', async () => {
      // Arrange — Redis EXISTS retorna 1 cuando la clave existe
      mockRedisClient.exists.mockResolvedValueOnce(1)

      // Act
      const result = await service.exists('refresh:valid-token')

      // Assert
      expect(result).toBe(true)
      expect(mockRedisClient.exists).toHaveBeenCalledWith('refresh:valid-token')
    })

    it('should return false when Redis reports count = 0', async () => {
      // Arrange — clave no existe
      mockRedisClient.exists.mockResolvedValueOnce(0)

      // Act
      const result = await service.exists('refresh:revoked-token')

      // Assert
      expect(result).toBe(false)
    })
  })

  // ──────────────────────────────────────────────────── ping() ──

  describe('ping()', () => {
    it('should return true when Redis responds PONG', async () => {
      // Arrange
      mockRedisClient.ping.mockResolvedValueOnce('PONG')

      // Act
      const result = await service.ping()

      // Assert
      expect(result).toBe(true)
    })

    it('should return false when Redis ping throws an error', async () => {
      // Arrange — conexión caída
      mockRedisClient.ping.mockRejectedValueOnce(new Error('ECONNREFUSED'))

      // Act
      const result = await service.ping()

      // Assert — no propaga el error, retorna false
      expect(result).toBe(false)
    })

    it('should return false when Redis returns something other than PONG', async () => {
      // Arrange — respuesta inesperada
      mockRedisClient.ping.mockResolvedValueOnce('unexpected-response')

      // Act
      const result = await service.ping()

      // Assert
      expect(result).toBe(false)
    })
  })

  // ──────────────────────────────────── setEx pattern (set con TTL) ──

  describe('set() with TTL (setEx pattern)', () => {
    it('should store key with correct TTL for token blacklisting (7d = 604800s)', async () => {
      // Arrange
      mockRedisClient.set.mockResolvedValueOnce('OK')
      const SEVEN_DAYS = 7 * 24 * 60 * 60 // 604800

      // Act
      await service.set('refresh:token-new', '1', SEVEN_DAYS)

      // Assert
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'refresh:token-new',
        '1',
        'EX',
        SEVEN_DAYS,
      )
    })

    it('should store key with 300s TTL for analytics cache', async () => {
      // Arrange
      mockRedisClient.set.mockResolvedValueOnce('OK')

      // Act
      await service.set('analytics:site-3:90d', '{"totalViews":0}', 300)

      // Assert
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'analytics:site-3:90d',
        '{"totalViews":0}',
        'EX',
        300,
      )
    })
  })
})
