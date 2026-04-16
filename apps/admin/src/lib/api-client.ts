import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * Cliente HTTP centralizado para apps/admin.
 *
 * - Base URL desde NEXT_PUBLIC_API_URL (obligatorio en producción)
 * - Interceptor de request: adjunta el JWT del localStorage
 * - Interceptor de response: redirige a /login en 401
 *
 * Uso:
 *   import { api } from '@/lib/api-client'
 *   const data = await api.get('/health')
 *   const user = await api.post('/auth/login', { email, password })
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout de 15 segundos — suficiente para el admin, evita cuelgues silenciosos
  timeout: 15_000,
})

// ── Interceptor de REQUEST ──────────────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Solo disponible en el cliente (browser). En SSR no hay localStorage.
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('edithpress_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ── Interceptor de RESPONSE ─────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expirado o inválido — limpiar sesión y redirigir a login
      localStorage.removeItem('edithpress_access_token')
      localStorage.removeItem('edithpress_refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Helpers tipados ─────────────────────────────────────────────────────────

/** Extrae el mensaje de error de una respuesta de la API de forma segura */
export function getApiErrorMessage(error: unknown, fallback = 'Error inesperado'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined
    if (typeof data?.message === 'string') return data.message
    if (Array.isArray(data?.message)) return (data.message as string[]).join(', ')
  }
  return fallback
}

/** Guarda los tokens de sesión en localStorage */
export function saveTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem('edithpress_access_token', accessToken)
  if (refreshToken) {
    localStorage.setItem('edithpress_refresh_token', refreshToken)
  }
}

/** Elimina los tokens de sesión */
export function clearTokens() {
  localStorage.removeItem('edithpress_access_token')
  localStorage.removeItem('edithpress_refresh_token')
}
