'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getApiErrorMessage, saveTokens } from '@/lib/api-client'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    role: 'SUPER_ADMIN' | 'OWNER' | 'EDITOR' | 'VIEWER'
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
      const { data } = await api.post<LoginResponse>('/auth/login', credentials)

      saveTokens(data.accessToken, data.refreshToken)

      // Redirigir según rol
      if (data.user.role === 'SUPER_ADMIN') {
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
