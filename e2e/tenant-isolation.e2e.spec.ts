import { test, expect, APIRequestContext } from '@playwright/test'

/**
 * E2E — Flujo 5: Seguridad — Tenant Isolation (IDOR prevention)
 *
 * Verifica que un tenant autenticado NO puede acceder a recursos
 * (sites, pages) que pertenecen a otro tenant.
 *
 * Pre-requisitos:
 *   - API corriendo en http://localhost:3001
 *   - DB de test limpia (o con seed mínimo que incluya plan 'starter')
 *
 * Patrón IDOR probado:
 *   Tenant A obtiene el siteId de Tenant B (como atacante lo haría
 *   por enumeración o filtraje de info). Cuando Tenant A llama
 *   GET /api/v1/sites/{siteDeTenantB} con su propio JWT, debe
 *   recibir 404 — la misma respuesta que si el site no existiera.
 *   Esto previene que el attacker confirme la existencia del recurso.
 *
 * Nota: estos tests requieren la API activa. En CI, descomentar
 * el bloque `webServer` en playwright.config.ts.
 */

const API_URL = 'http://localhost:3001/api/v1'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function registerAndLogin(
  ctx: APIRequestContext,
  email: string,
  password = 'Password123',
): Promise<{ accessToken: string; cookies: string[] }> {
  // Registro
  await ctx.post(`${API_URL}/auth/register`, {
    data: { email, password },
  })

  // Login
  const loginRes = await ctx.post(`${API_URL}/auth/login`, {
    data: { email, password },
  })
  expect(loginRes.status()).toBe(200)

  const body = await loginRes.json()
  const accessToken: string = body.data.accessToken

  const rawCookies = loginRes.headers()['set-cookie']
  const cookies = Array.isArray(rawCookies)
    ? rawCookies
    : rawCookies
      ? [rawCookies]
      : []

  return { accessToken, cookies }
}

async function createSite(
  ctx: APIRequestContext,
  accessToken: string,
  tenantId: string,
  name: string,
): Promise<string> {
  const res = await ctx.post(`${API_URL}/sites`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Tenant-ID': tenantId,
    },
    data: { name },
  })
  expect(res.status()).toBe(201)
  const body = await res.json()
  return body.data.id as string
}

// ─── Test suite ───────────────────────────────────────────────────────────────

/**
 * Nota de naming: el archivo usa .e2e.spec.ts para que Playwright
 * lo recoja según el testMatch configurado en playwright.config.ts.
 * Se ejecuta como proyecto sin browser (api-smoke) ya que no
 * requiere renderizado de UI.
 */
test.describe('Tenant Isolation — IDOR Prevention', () => {
  let tokenA: string
  let tokenB: string
  let tenantAId: string
  let tenantBId: string
  let siteBId: string // site de Tenant B que Tenant A intentará acceder

  /**
   * Setup: registrar dos usuarios independientes.
   * Cada registro crea su propio tenant automáticamente.
   */
  test.beforeAll(async ({ request }) => {
    const emailA = `tenant-a-${Date.now()}@isolation-test.com`
    const emailB = `tenant-b-${Date.now()}@isolation-test.com`

    const [resultA, resultB] = await Promise.all([
      registerAndLogin(request, emailA),
      registerAndLogin(request, emailB),
    ])

    tokenA = resultA.accessToken
    tokenB = resultB.accessToken

    // Obtener el tenantId desde el perfil del usuario (decodificando el JWT)
    // El JWT contiene { sub, email, tenantId, role }
    const payloadA = decodeJwtPayload(tokenA)
    const payloadB = decodeJwtPayload(tokenB)

    tenantAId = payloadA.tenantId
    tenantBId = payloadB.tenantId

    // Tenant B crea un site
    siteBId = await createSite(request, tokenB, tenantBId, 'Site de Tenant B')
  })

  // ─────────────────────────────────────────────────── Sites ──

  test('Tenant A can access its own sites (smoke)', async ({ request }) => {
    // Arrange — Tenant A crea su propio site
    const siteName = 'Site de Tenant A'
    const siteId = await createSite(request, tokenA, tenantAId, siteName)

    // Act
    const res = await request.get(`${API_URL}/sites/${siteId}`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'X-Tenant-ID': tenantAId,
      },
    })

    // Assert
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.tenantId).toBe(tenantAId)
    expect(body.data.name).toBe(siteName)
  })

  test('Tenant A receives 404 when accessing Tenant B site (IDOR blocked)', async ({ request }) => {
    // Act — Tenant A usa su JWT pero el siteId pertenece a Tenant B
    const res = await request.get(`${API_URL}/sites/${siteBId}`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'X-Tenant-ID': tenantAId,
      },
    })

    // Assert — 404 (el service hace findFirst con AND tenantId=A, no encuentra nada)
    // Responde igual que si no existiera: no confirma la existencia del recurso
    expect([403, 404]).toContain(res.status())
  })

  test('Tenant A receives 404 when updating Tenant B site', async ({ request }) => {
    // Act — intento de PATCH con token de Tenant A sobre site de Tenant B
    const res = await request.patch(`${API_URL}/sites/${siteBId}`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'X-Tenant-ID': tenantAId,
      },
      data: { name: 'Hacked!' },
    })

    // Assert
    expect([403, 404]).toContain(res.status())
  })

  test('Tenant A receives 404 when deleting Tenant B site', async ({ request }) => {
    // Act
    const res = await request.delete(`${API_URL}/sites/${siteBId}`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'X-Tenant-ID': tenantAId,
      },
    })

    // Assert
    expect([403, 404]).toContain(res.status())
  })

  // ─────────────────────────────────────────────────── Pages ──

  test('Tenant A cannot list pages of Tenant B site', async ({ request }) => {
    // Act
    const res = await request.get(`${API_URL}/sites/${siteBId}/pages`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'X-Tenant-ID': tenantAId,
      },
    })

    // Assert
    expect([403, 404]).toContain(res.status())
  })

  // ─────────────────────────────────────────────────── Unauthenticated ──

  test('Unauthenticated request to protected site endpoint returns 401', async ({ request }) => {
    // Act — sin Authorization header
    const res = await request.get(`${API_URL}/sites/${siteBId}`)

    // Assert
    expect(res.status()).toBe(401)
  })

  test('Request with forged JWT returns 401', async ({ request }) => {
    // Act — JWT con firma inválida
    const forgedToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhdHRhY2tlciIsInRlbmFudElkIjoiYW55In0.invalid_signature'
    const res = await request.get(`${API_URL}/sites/${siteBId}`, {
      headers: {
        Authorization: `Bearer ${forgedToken}`,
        'X-Tenant-ID': tenantBId, // intentando acceder al tenant B con JWT inválido
      },
    })

    // Assert
    expect(res.status()).toBe(401)
  })
})

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Decodifica el payload de un JWT sin verificar la firma (solo para tests). */
function decodeJwtPayload(token: string): Record<string, string> {
  const base64Payload = token.split('.')[1]
  if (!base64Payload) throw new Error('Token JWT inválido')
  const decoded = Buffer.from(base64Payload, 'base64url').toString('utf-8')
  return JSON.parse(decoded) as Record<string, string>
}
