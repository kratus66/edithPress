/**
 * Endpoint de revalidación on-demand — EdithPress Renderer
 *
 * Llamado por la API del backend cuando el usuario publica una página.
 * Borra el caché ISR de la ruta afectada para que la siguiente petición
 * obtenga el contenido fresco de la API.
 *
 * Seguridad: requiere el header X-Renderer-Secret igual a RENDERER_SECRET.
 * En desarrollo (RENDERER_SECRET no configurado) se permite sin autenticación.
 * La API backend lo envía de forma interna — no es accesible desde el cliente.
 *
 * Uso:
 *   POST /api/revalidate
 *   x-renderer-secret: <RENDERER_SECRET>
 *   Content-Type: application/json
 *   { "siteId": "uuid", "slug": "sobre-nosotros" }
 *
 * Para revalidar la home, pasar slug: "/"  o  slug: "home".
 */
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // ── Autenticación ──────────────────────────────────────────────────────────
  // Si RENDERER_SECRET no está configurado (entorno de desarrollo), se permite
  // el acceso sin autenticación para facilitar las pruebas locales.
  const configuredSecret = process.env.RENDERER_SECRET

  if (configuredSecret) {
    const providedSecret = request.headers.get('x-renderer-secret')
    if (!providedSecret || providedSecret !== configuredSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // ── Parsing del body ───────────────────────────────────────────────────────
  const body = await request.json().catch(() => ({})) as { siteId?: string; slug?: string }
  const { siteId, slug } = body

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  // ── Normalización del path ─────────────────────────────────────────────────
  // "home" y "/" ambos equivalen a la ruta raíz del tenant.
  const isHome = slug === '/' || slug === 'home'
  const path = isHome ? '/' : `/${slug.replace(/^\//, '')}`

  // ── Revalidación ───────────────────────────────────────────────────────────
  revalidatePath(path)

  return NextResponse.json({ revalidated: true, path, siteId: siteId ?? null })
}
