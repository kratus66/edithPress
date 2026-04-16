import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/preview — Activa/desactiva Next.js Draft Mode.
 *
 * Llamado por apps/builder/src/app/api/preview/route.ts, que actúa como
 * proxy seguro (nunca expone RENDERER_SECRET al cliente).
 *
 * Query params:
 *   - secret      (requerido para activar) — debe coincidir con RENDERER_SECRET
 *   - tenantSlug  (requerido para activar) — identifica el tenant a previsualizar
 *   - pageSlug    (opcional)  — slug de la página (default: "home")
 *   - disable     (opcional)  — si es "true", desactiva Draft Mode
 *
 * Flujo de activación:
 *   1. Builder GET /api/preview?tenantSlug=X&pageSlug=Y
 *   2. Builder valida params y redirige a renderer /api/preview?secret=S&tenantSlug=X&pageSlug=Y
 *   3. Este handler verifica el secret contra RENDERER_SECRET
 *   4. draftMode().enable() → Next.js establece la cookie __prerender_bypass
 *   5. Redirige a /{tenantSlug}.localhost:3003/{pageSlug} (dev)
 *      o https://{tenantSlug}.edithpress.com/{pageSlug} (prod)
 *
 * Flujo de desactivación:
 *   1. GET /api/preview?disable=true
 *   2. draftMode().disable() → limpia la cookie
 *   3. Redirige a / (raíz del renderer)
 *
 * SEGURIDAD:
 *   - RENDERER_SECRET nunca viaja al cliente (lo guarda el builder en server)
 *   - Sin secret válido → 401
 *   - Este endpoint está en PUBLIC_PATHS del middleware → no requiere tenant header
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const secret     = searchParams.get('secret')
  const tenantSlug = searchParams.get('tenantSlug')
  const pageSlug   = searchParams.get('pageSlug') ?? 'home'
  const disable    = searchParams.get('disable') === 'true'

  // ── Desactivar Draft Mode ──────────────────────────────────────────────────
  if (disable) {
    draftMode().disable()
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ── Verificar secret ───────────────────────────────────────────────────────
  const rendererSecret = process.env.RENDERER_SECRET

  if (!rendererSecret) {
    console.error('[preview] RENDERER_SECRET no está configurado en las variables de entorno')
    return new NextResponse(
      JSON.stringify({ error: 'Preview no disponible' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (!secret || secret !== rendererSecret) {
    return new NextResponse(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // ── Validar tenantSlug ─────────────────────────────────────────────────────
  if (!tenantSlug) {
    return new NextResponse(
      JSON.stringify({ error: 'tenantSlug es requerido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // ── Activar Draft Mode ─────────────────────────────────────────────────────
  draftMode().enable()

  // Construir la URL de destino con el subdominio del tenant.
  //
  // En desarrollo: http://{tenantSlug}.localhost:3003/{pageSlug}
  // En producción: https://{tenantSlug}.edithpress.com/{pageSlug}
  //
  // Esto garantiza que el middleware del renderer pueda extraer el tenantSlug
  // del subdominio cuando la cookie de Draft Mode ya está activa.
  const rendererPublicUrl = process.env.RENDERER_PUBLIC_URL ?? 'http://localhost:3003'
  const parsedRenderer   = new URL(rendererPublicUrl)

  // Inyectar el tenantSlug como subdominio del host base del renderer.
  // Ejemplo: localhost:3003 → miempresa.localhost:3003
  const tenantHost = `${tenantSlug}.${parsedRenderer.host}`
  const pagePath   = pageSlug === 'home' ? '/' : `/${pageSlug}`

  const redirectUrl = new URL(pagePath, `${parsedRenderer.protocol}//${tenantHost}`)

  return NextResponse.redirect(redirectUrl.toString())
}
