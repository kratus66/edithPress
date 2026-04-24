import { Injectable, Inject, Logger } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from './redis.constants'

/**
 * RedisService — abstracción sobre ioredis para caché y revocación de tokens.
 *
 * Métodos disponibles:
 * - set(key, value, ttlSeconds): almacena un valor con TTL
 * - get(key): obtiene un valor (null si no existe o expiró)
 * - del(key): elimina una clave (para revocar tokens)
 *
 * Uso en auth:
 * - Refresh token válido: SET refresh:{token} "1" EX 604800
 * - Logout:             DEL refresh:{token}
 * - Validar en refresh: GET refresh:{token} → si null, denegar
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name)

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlSeconds)
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key)
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }

  /**
   * Verifica si una clave existe (atajos para tokens).
   */
  async exists(key: string): Promise<boolean> {
    const count = await this.redis.exists(key)
    return count > 0
  }

  /**
   * Healthcheck de Redis — usado por el health endpoint.
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping()
      return result === 'PONG'
    } catch {
      this.logger.warn('Redis ping falló')
      return false
    }
  }
}
