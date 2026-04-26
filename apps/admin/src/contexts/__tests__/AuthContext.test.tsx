import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../AuthContext'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Genera un JWT firmado con un payload falso (sin verificación). */
function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fake-signature`
}

/** Componente que expone el contexto para testing. */
function AuthConsumer() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>loading</div>
  if (!user) return <div>no-user</div>
  return (
    <div>
      <span data-testid="email">{user.email}</span>
      <span data-testid="role">{user.role}</span>
      <span data-testid="tenantId">{user.tenantId}</span>
    </div>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    // Limpiar cookies antes de cada test
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    vi.clearAllMocks()
  })

  it('renders children without crashing', () => {
    render(
      <AuthProvider>
        <div>hello</div>
      </AuthProvider>
    )
    expect(screen.getByText('hello')).toBeTruthy()
  })

  it('user is null when no access_token cookie exists', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    // After loading resolves, no user
    expect(screen.getByText('no-user')).toBeTruthy()
  })

  it('decodes user from access_token cookie', async () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      tenantId: 'tenant-abc',
      tenantSlug: 'my-shop',
      role: 'OWNER',
    }
    document.cookie = `access_token=${makeJwt(payload)}`

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('email').textContent).toBe('test@example.com')
    expect(screen.getByTestId('role').textContent).toBe('OWNER')
    expect(screen.getByTestId('tenantId').textContent).toBe('tenant-abc')
  })

  it('throws if useAuth is used outside AuthProvider', () => {
    // Capturar el error de consola que React lanza
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<AuthConsumer />)).toThrow('useAuth debe usarse dentro de <AuthProvider>')
    consoleSpy.mockRestore()
  })

  it('logout calls DELETE /api/auth/session', async () => {
    const fetchMock = vi.fn().mockResolvedValue({})
    vi.stubGlobal('fetch', fetchMock)

    // Redirigir window.location.href
    const assignMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    function LogoutButton() {
      const { logout } = useAuth()
      return <button onClick={() => void logout()}>logout</button>
    }

    render(
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('logout').click()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/session', { method: 'DELETE' })
    vi.unstubAllGlobals()
  })
})
