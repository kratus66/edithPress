/**
 * QA-SPRINT02-04 — Smoke tests post-deploy
 *
 * Propósito:
 *   Verificar que los endpoints críticos de la API responden correctamente
 *   contra un entorno real (staging o producción).
 *
 * Uso:
 *   pnpm test:smoke                          # contra localhost:3001 (default)
 *   SMOKE_BASE_URL=https://api.staging.example.com pnpm test:smoke
 *
 * Credenciales de test (no modifican datos de producción):
 *   SMOKE_TEST_EMAIL=test@edithpress.io
 *   SMOKE_TEST_PASSWORD=SmokeTestPass123
 *
 * Seguridad: ningún test de este archivo crea, modifica ni elimina datos.
 *
 * NOTA: si el servidor no está corriendo, los tests fallarán con ECONNREFUSED.
 * Eso es intencionado — indica que el servicio no está disponible.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const request: typeof import('supertest') = require('supertest')

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://localhost:3001'
const TEST_EMAIL = process.env.SMOKE_TEST_EMAIL ?? 'test@edithpress.io'
const TEST_PASSWORD = process.env.SMOKE_TEST_PASSWORD ?? 'SmokeTestPass123'

// Timeout generoso para ambientes remotos (staging puede ser lento)
jest.setTimeout(15_000)

describe(`Smoke tests — ${BASE_URL}`, () => {
  // ─────────────────────────────────────────────────── Health ──

  describe('GET /api/v1/health', () => {
    it('200 — should return { status: "ok" } with ISO timestamp', async () => {
      // Arrange — sin autenticación, siempre debe responder

      // Act
      const response = await request(BASE_URL)
        .get('/api/v1/health')
        .expect(200)

      // Assert
      expect(response.body.status).toBe('ok')
      expect(typeof response.body.timestamp).toBe('string')
      // El timestamp debe ser ISO 8601 válido
      expect(() => new Date(response.body.timestamp).toISOString()).not.toThrow()
    })

    it('should respond in under 2000ms', async () => {
      // Arrange
      const start = Date.now()

      // Act
      await request(BASE_URL).get('/api/v1/health').expect(200)

      // Assert — SLA básico para el health endpoint
      expect(Date.now() - start).toBeLessThan(2000)
    })
  })

  // ─────────────────────────────────────────────────── Auth login ──

  describe('POST /api/v1/auth/login', () => {
    it('200 — should authenticate with test credentials', async () => {
      // Arrange — credenciales de la cuenta de test (read-only, sin tenant real)

      // Act
      const response = await request(BASE_URL)
        .post('/api/v1/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200)

      // Assert — la respuesta contiene el accessToken
      expect(response.body.data).toHaveProperty('accessToken')
      expect(typeof response.body.data.accessToken).toBe('string')
      expect(response.body.data.accessToken.length).toBeGreaterThan(0)
    })

    it('401 — should reject invalid credentials', async () => {
      // Arrange — contraseña inválida
      await request(BASE_URL)
        .post('/api/v1/auth/login')
        .send({ email: TEST_EMAIL, password: 'definitivamente-incorrecta-xyz' })
        .expect(401)
    })
  })

  // ─────────────────────────────────────────────────── Templates ──

  describe('GET /api/v1/templates', () => {
    it('200 — should return an array of templates', async () => {
      // Arrange — endpoint público (no requiere auth)

      // Act
      const response = await request(BASE_URL)
        .get('/api/v1/templates')
        .expect(200)

      // Assert — debe retornar un array (puede estar vacío en staging sin seed)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('200 — should return at least one template in a seeded environment', async () => {
      // Este test puede fallar si la BD de staging no tiene seed.
      // Marcarlo como xtest (skip) si no hay seed en el entorno.
      const response = await request(BASE_URL)
        .get('/api/v1/templates')
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
    })
  })
})
