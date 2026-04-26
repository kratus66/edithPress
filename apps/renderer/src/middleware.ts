import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware de extracción de tenant — EdithPress Renderer
 *
 * Responsabilidades:
 * 1. Extraer el tenantSlug del header X-Tenant-Slug (inyectado por Nginx en prod)
 *    o del subdominio del Host (en dev local, ej: miempresa.localhost:3003)
 * 2. Soportar custom domains consultando la API interna
 *    (ej: miempresa.com → GET /api/v1/renderer/domain/miempresa.com)
 * 3. Propagar estos valores como headers internos para que page.tsx los lea
 * 4. Permitir que las rutas /api/* y /_next/* pasen sin tenant check
 *
 * SEGURIDAD:
 * - En producción, X-Tenant-Slug y X-Tenant-Domain los inyecta Nginx.
 *   El cliente externo NO puede falsificarlos porque Nginx los sobreescribe.
 * - En dev, el middleware lee el subdominio del Host header local.
 * - El endpoint /api/v1/renderer/domain/* requiere X-Renderer-Secret.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Dejar pasar rutas internas de Next.js sin ninguna modificación
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/')
  ) {
    return NextResponse.next()
  }

  const host = request.headers.get('host') || ''

  // ── Prioridad 1: header inyectado por Nginx/Cloudflare en producción ──────────
  // Nginx sobreescribe estos headers antes de llegar al renderer, por lo que
  // el cliente externo no puede falsificarlos.
  const tenantSlugFromHeader = request.headers.get('x-tenant-slug')
  const tenantDomainFromHeader = request.headers.get('x-tenant-domain')

  if (tenantSlugFromHeader || tenantDomainFromHeader) {
    return NextResponse.next()
  }

  // ── Prioridad 2: preview con ?__t=tenantSlug (draft mode activo) ─────────────
  // Cuando el builder activa draft mode, redirige a localhost:3003/slug?__t=tenantSlug
  // para evitar problemas de dominio de cookie entre demo.localhost y localhost.
  // Solo se acepta si la cookie __prerender_bypass está presente (garantía criptográfica).
  const draftCookie = request.cookies.get('__prerender_bypass')
  const tenantFromParam = request.nextUrl.searchParams.get('__t')
  if (draftCookie && tenantFromParam) {
    const newHeaders = new Headers(request.headers)
    newHeaders.set('x-tenant-slug', tenantFromParam)
    return NextResponse.next({ request: { headers: newHeaders } })
  }

  // ── Prioridad 3: subdominio de edithpress.com o localhost (dev/staging) ───────
  const hostname = host.split(':')[0] // quitar puerto

  const isEdithPressDomain =
    hostname.endsWith('.edithpress.com') || hostname === 'edithpress.com'

  const localhostMatch = hostname.match(/^([^.]+)\.localhost$/)
  const edithpressMatch = hostname.match(/^([^.]+)\.edithpress\.com$/)

  const subdomain = localhostMatch?.[1] ?? edithpressMatch?.[1]

  if (isEdithPressDomain || localhostMatch) {
    if (subdomain && subdomain !== 'www') {
      const newHeaders = new Headers(request.headers)
      newHeaders.set('x-tenant-slug', subdomain)
      return NextResponse.next({ request: { headers: newHeaders } })
    }
    // edithpress.com raíz sin subdominio → sin tenant (mostrará 404)
    return NextResponse.next()
  }

  // ── Prioridad 3: custom domain → consultar la API ─────────────────────────────
  // El host no es un subdominio de EdithPress ni localhost, así que puede ser
  // un dominio propio del tenant (ej: miempresa.com).
  try {
    const apiUrl =
      process.env.API_INTERNAL_URL ?? process.env.API_URL ?? 'http://localhost:3001'

    const response = await fetch(
      `${apiUrl}/api/v1/renderer/domain/${encodeURIComponent(hostname)}`,
      {
        headers: {
          'x-renderer-secret': process.env.RENDERER_SECRET ?? '',
        },
        // Siempre sin caché: el middleware corre en Edge y necesita la info fresca.
        // El ISR de page.tsx se encarga de cachear el contenido.
        cache: 'no-store',
      }
    )

    if (response.ok) {
      const { tenantSlug } = (await response.json()) as { tenantSlug: string }
      const newHeaders = new Headers(request.headers)
      newHeaders.set('x-tenant-slug', tenantSlug)
      newHeaders.set('x-custom-domain', hostname)
      return NextResponse.next({ request: { headers: newHeaders } })
    }
    // La API devolvió 404 u otro error: dominio no registrado
  } catch {
    // Error de red al consultar la API — se deja pasar sin tenant (mostrará 404)
  }

  // Sin tenant identificado → page.tsx devolverá notFound()
  return NextResponse.next()
}

export const config = {
  // Aplicar middleware a todas las rutas excepto archivos estáticos de Next.js
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
