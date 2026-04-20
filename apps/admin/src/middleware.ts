import { type NextRequest, NextResponse } from 'next/server'

/**
 * Routes that require authentication. Any path that STARTS WITH one of these
 * strings will be protected.
 */
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

/**
 * Auth pages — redirect to dashboard when the user is already logged in.
 */
const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p))

  // Unauthenticated user trying to access a protected route → redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user trying to access an auth page → redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Skip Next.js internals, static files, and Next.js API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
