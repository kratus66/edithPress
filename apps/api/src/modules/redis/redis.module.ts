import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { RedisService } from './redis.service'
import { REDIS_CLIENT } from './redis.constants'

export { REDIS_CLIENT }

/**
 * RedisModule — módulo global (@Global) para caché y revocación de tokens.
 *
 * Al ser global, solo hace falta importarlo en AppModule.
 * Cualquier módulo puede inyectar RedisService directamente sin importar RedisModule.
 *
 * Configuración: REDIS_URL en variables de entorno (default: redis://localhost:6379)
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
        const client = new Redis(url, {
          // Reintentar con backoff exponencial (max 10s)
          retryStrategy: (times: number) => Math.min(times * 200, 10_000),
          // En caso de pérdida de conexión, encolar comandos y ejecutarlos al reconectar
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
          lazyConnect: false,
        })

        client.on('error', (err: Error) => {
          // Loguear pero no crashear — el módulo de auth tiene fallback a DB
          console.error('[Redis] Error de conexión:', err.message)
        })

        return client
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
