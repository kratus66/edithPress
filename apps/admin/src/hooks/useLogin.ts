'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getApiErrorMessage, saveSession } from '@/lib/api-client'

interface LoginCredentials {
  email: string
  password: string
}

// Actual shape returned by POST /api/v1/auth/login
// { data: { accessToken: string, expiresIn: number } }
interface LoginApiResponse {
  data: {
    accessToken: string
    expiresIn: number
  }
}

/**
 * Hook que encapsula toda la lógica del flujo de login.
 * Los componentes solo llaman a `login(credentials)` y reaccionan a `error`/`isLoading`.
 */
export function useLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function login(credentials: LoginCredentials) {
    setIsLoading(true)
    setError(null)

    try {
      const { data: body } = await api.post<LoginApiResponse>('/auth/login', credentials)
      const { accessToken } = body.data

      // Store the token in a cookie via the Next.js session route
      await saveSession(accessToken)

      // Decode JWT payload to determine role (no need for an extra API call)
      const [, payloadB64] = accessToken.split('.')
      const payload = JSON.parse(
        atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
      ) as { role?: string }

      if (payload.role === 'SUPER_ADMIN') {
        router.push('/super-admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Credenciales incorrectas. Inténtalo de nuevo.'))
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
