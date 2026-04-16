import { type NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/preview?tenantSlug={slug}&pageSlug={slug}
 *
 * Punto de entrada para activar la vista previa en modo borrador (Draft Mode).
 *
 * Flujo completo:
 * 1. El toolbar del editor llama window.open('/api/preview?...', '_blank')
 * 2. Este Route Handler valida los parámetros requeridos
 * 3. Redirige al endpoint /api/preview del RENDERER con el RENDERER_SECRET
 * 4. El renderer activa Next.js Draft Mode (cookie httpOnly en su dominio)
 * 5. El renderer redirige a la página del tenant en modo borrador
 *
 * Por qué el redirect en lugar de activar Draft Mode aquí:
 * - Draft Mode usa cookies. Las cookies son por dominio.
 * - El builder (localhost:3002) y el renderer (localhost:3003) son dominios distintos.
 * - Solo el renderer puede setear cookies válidas para su propio dominio.
 * - Este Route Handler actúa como proxy seguro: el RENDERER_SECRET nunca
 *   llega al cliente (no es una env var NEXT_PUBLIC_*).
 *
 * Variables de entorno requeridas:
 * - RENDERER_URL      → URL del renderer (default: http://localhost:3003)
 * - RENDERER_SECRET   → Secret compartido entre builder y renderer para autenticar el preview
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const tenantSlug = searchParams.get('tenantSlug')
  const pageSlug = searchParams.get('pageSlug') ?? 'home'

  // ── Validación de parámetros ────────────────────────────────────────────────

  if (!tenantSlug) {
    return NextResponse.json(
      { error: { code: 'MISSING_PARAM', message: 'El parámetro tenantSlug es requerido' } },
      { status: 400 }
    )
  }

  // ── Validación de configuración del servidor ────────────────────────────────

  const rendererSecret = process.env.RENDERER_SECRET
  if (!rendererSecret) {
    console.error('[preview] RENDERER_SECRET no está definido en las variables de entorno')
    return NextResponse.json(
      { error: { code: 'SERVER_MISCONFIGURED', message: 'Preview no disponible. Contacta al administrador.' } },
      { status: 503 }
    )
  }

  const rendererUrl = process.env.RENDERER_URL ?? 'http://localhost:3003'

  // ── Construir URL de preview del renderer ──────────────────────────────────

  const previewUrl = new URL(`${rendererUrl}/api/preview`)
  previewUrl.searchParams.set('secret', rendererSecret)    // autenticación server-to-server
  previewUrl.searchParams.set('tenantSlug', tenantSlug)
  previewUrl.searchParams.set('pageSlug', pageSlug)

  // ── Redirect al renderer ────────────────────────────────────────────────────

  return NextResponse.redirect(previewUrl.toString())
}
