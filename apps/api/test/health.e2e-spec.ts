import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request: typeof import('supertest') = require('supertest')
import { HealthModule } from '../src/modules/health/health.module'

/**
 * QA-04 — Smoke test: GET /api/v1/health
 *
 * Este test es el "canary" del sistema: si falla, algo fundamental
 * está roto (app no levanta, prefix mal configurado, etc.).
 *
 * Usa un módulo mínimo (solo HealthModule) para no necesitar
 * base de datos ni variables de entorno en el CI básico.
 *
 * Convención: *.e2e-spec.ts → ejecutado por jest-e2e.json
 */
describe('Health endpoint (smoke)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile()

    app = module.createNestApplication()

    // Replicar el prefijo global definido en main.ts
    app.setGlobalPrefix('api/v1')

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/v1/health', () => {
    it('200 — should return status ok and a valid ISO timestamp', async () => {
      // Arrange — no setup extra: el endpoint no depende de nada externo

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)

      // Assert
      expect(response.body).toMatchObject({
        status: 'ok',
      })
      expect(typeof response.body.timestamp).toBe('string')
      expect(new Date(response.body.timestamp).toISOString()).toBe(
        response.body.timestamp,
      )
    })

    it('should respond in under 200ms', async () => {
      const start = Date.now()
      await request(app.getHttpServer()).get('/api/v1/health').expect(200)
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(200)
    })
  })
})
