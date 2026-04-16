import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware de extracción de tenant — EdithPress Renderer
 *
 * Responsabilidades:
 * 1. Extraer el tenantSlug del header X-Tenant-Slug (inyectado por Nginx en prod)
 *    o del subdominio del Host (en dev local, ej: miempresa.localhost:3003)
 * 2. Extraer el tenantDomain del header X-Tenant-Domain para custom domains
 * 3. Propagar estos valores como headers internos para que page.tsx los lea
 * 4. Permitir que las rutas /api/preview y /api/contact pasen sin tenant check
 *
 * SEGURIDAD:
 * - En producción, X-Tenant-Slug y X-Tenant-Domain los inyecta Nginx.
 *   El cliente externo NO puede falsificarlos porque Nginx los sobreescribe.
 * - En dev, el middleware lee el subdominio del Host header local.
 */

// Rutas que no necesitan resolución de tenant
const PUBLIC_PATHS = [
  '/api/preview',
  '/api/contact',
  '/_next',
  '/favicon.ico',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Dejar pasar rutas públicas/internas sin modificación
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // --- Resolución del tenant ---

  // Prioridad 1: header inyectado por Nginx/Cloudflare en producción
  const tenantSlugFromHeader = request.headers.get('x-tenant-slug')
  const tenantDomainFromHeader = request.headers.get('x-tenant-domain')

  if (tenantSlugFromHeader || tenantDomainFromHeader) {
    // Ya tenemos el tenant — pasar al page.tsx con los headers originales
    return NextResponse.next()
  }

  // Prioridad 2: extraer del subdominio (desarrollo local)
  // Ejemplo: miempresa.localhost:3003 → tenantSlug = "miempresa"
  const host = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0] // quitar puerto

  // Detectar si es un subdominio de localhost o de edithpress.com
  const localhostMatch = hostname.match(/^([^.]+)\.localhost$/)
  const edithpressMatch = hostname.match(/^([^.]+)\.edithpress\.com$/)

  const subdomain = localhostMatch?.[1] ?? edithpressMatch?.[1]

  if (subdomain && subdomain !== 'www') {
    // Inyectar el tenantSlug como header interno para que page.tsx lo lea
    const response = NextResponse.next()
    response.headers.set('x-tenant-slug', subdomain)
    return response
  }

  // Sin tenant identificado — page.tsx devolverá 404
  return NextResponse.next()
}

export const config = {
  // Aplicar middleware a todas las rutas excepto archivos estáticos de Next.js
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
}
