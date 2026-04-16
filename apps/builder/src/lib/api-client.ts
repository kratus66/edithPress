/**
 * Cliente HTTP autenticado para apps/builder.
 *
 * Usa fetch nativo (sin axios) para no añadir dependencias.
 * Lee el JWT del mismo localStorage que apps/admin:
 *   key: 'edithpress_access_token'
 *
 * En 401 redirige al login del admin (NEXT_PUBLIC_APP_URL/login).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const ADMIN_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('edithpress_access_token')
}

function authHeaders(extra: Record<string, string> = {}): HeadersInit {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    // Token expirado o inválido — redirigir al login del admin
    window.location.href = `${ADMIN_URL}/login`
    throw new Error('Sesión expirada. Redirigiendo al login...')
  }

  if (!res.ok) {
    // Intentar extraer el mensaje de error del body (formato EdithPress: { error: { message } })
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    const errorPayload = body?.error as Record<string, unknown> | undefined
    const message =
      typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : `Error ${res.status}`
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

// ── Cliente ───────────────────────────────────────────────────────────────────

export const builderApi = {
  get: <T>(path: string): Promise<T> =>
    fetch(`${BASE_URL}/api/v1${path}`, {
      headers: authHeaders(),
    }).then((res) => parseResponse<T>(res)),

  put: <T>(path: string, body: unknown): Promise<T> =>
    fetch(`${BASE_URL}/api/v1${path}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then((res) => parseResponse<T>(res)),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    fetch(`${BASE_URL}/api/v1${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((res) => parseResponse<T>(res)),
}
