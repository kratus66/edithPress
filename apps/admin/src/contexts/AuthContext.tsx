'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  tenantId: string
  tenantSlug: string | null
  role: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  logout: () => Promise<void>
  setUserFromToken: (token: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1]
    const json = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
    return {
      id: json.sub as string,
      email: json.email as string,
      firstName: (json.firstName as string | null) ?? null,
      lastName: (json.lastName as string | null) ?? null,
      tenantId: json.tenantId as string,
      tenantSlug: (json.tenantSlug as string | null) ?? null,
      role: json.role as string,
    }
  } catch {
    return null
  }
}

function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getTokenFromCookie()
    if (token) {
      setUser(decodeJwtPayload(token))
    }
    setIsLoading(false)
  }, [])

  const setUserFromToken = useCallback((token: string) => {
    setUser(decodeJwtPayload(token))
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    setUser(null)
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, setUserFromToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
