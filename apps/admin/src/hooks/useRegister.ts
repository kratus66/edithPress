'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, getApiErrorMessage } from '@/lib/api-client'

interface RegisterCredentials {
  firstName: string
  lastName: string
  email: string
  password: string
  tenantName: string
  tenantSlug: string
}

export function useRegister() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function register(credentials: RegisterCredentials) {
    setIsLoading(true)
    setError(null)
    try {
      await api.post('/auth/register', credentials)
      router.push('/verify-email')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al crear la cuenta. Inténtalo de nuevo.'))
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error }
}
