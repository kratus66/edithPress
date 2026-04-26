import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/sites',
  '/billing',
  '/media',
  '/settings',
  '/templates',
  '/analytics',
  '/domains',
  '/onboarding',
  '/super-admin',
]

const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password']

const TENANT_PREFIXES = [
  '/dashboard',
  '/sites',
  '/billing',
  '/media',
  '/settings',
  '/templates',
  '/analytics',
  '/domains',
  '/onboarding',
]

function decodeJwtPayload(token: string): { isSuperAdmin?: boolean; tenantId?: string } | null {
  try {
    const base64 = token.split('.')[1]
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/'))) as {
      isSuperAdmin?: boolean
      tenantId?: string
    }
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p))
  const isTenantRoute = TENANT_PREFIXES.some((p) => pathname.startsWith(p))
  const isSuperAdminRoute = pathname.startsWith('/super-admin')

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token) {
    const payload = decodeJwtPayload(token)

    // Super admin accessing tenant routes → redirect to super-admin dashboard
    if (payload?.isSuperAdmin && isTenantRoute) {
      return NextResponse.redirect(new URL('/super-admin/dashboard', request.url))
    }

    // Regular tenant user accessing super-admin routes → redirect to tenant dashboard
    if (!payload?.isSuperAdmin && isSuperAdminRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Authenticated user on auth page → redirect to appropriate dashboard
    if (isAuthPage) {
      const dest = payload?.isSuperAdmin ? '/super-admin/dashboard' : '/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
