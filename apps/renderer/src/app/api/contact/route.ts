import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/contact — Proxy del formulario de contacto hacia la API de EdithPress.
 *
 * El ContactFormBlock es un Client Component que no puede llamar directamente
 * a la API del backend porque:
 *   1. El API_INTERNAL_URL es una URL de red interna (docker) — no accesible desde el navegador
 *   2. La API no tiene CORS abierto para orígenes arbitrarios del renderer
 *
 * Este Route Handler actúa como proxy local:
 *   Cliente → POST /api/contact → API interna → POST /api/v1/renderer/contact
 *
 * Body esperado (JSON):
 *   { tenantSlug: string, name: string, email: string, message: string }
 *
 * Respuesta exitosa:
 *   { success: true }
 *
 * Respuesta de error:
 *   { error: string }
 *
 * SEGURIDAD:
 *   - Validación de inputs en este handler (antes de llamar a la API)
 *   - El API_INTERNAL_URL nunca se expone al cliente
 *   - Rate limiting delegado al ThrottlerGuard de la API (5 req/min para /renderer/contact)
 */
export async function POST(request: NextRequest) {
  // ── Parsear body ───────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Cuerpo de la petición inválido', 400)
  }

  if (!body || typeof body !== 'object') {
    return jsonError('Cuerpo de la petición inválido', 400)
  }

  const { tenantSlug, name, email, message } = body as Record<string, unknown>

  // ── Validación de campos ───────────────────────────────────────────────────
  // Validación básica aquí para dar feedback rápido al usuario sin roundtrip a la API.
  // La validación definitiva (class-validator) está en el DTO de la API.

  if (!tenantSlug || typeof tenantSlug !== 'string' || tenantSlug.trim().length === 0) {
    return jsonError('Sitio no identificado', 400)
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return jsonError('El nombre es obligatorio', 400)
  }

  if (name.trim().length > 100) {
    return jsonError('El nombre no puede superar 100 caracteres', 400)
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return jsonError('El email no es válido', 400)
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return jsonError('El mensaje es obligatorio', 400)
  }

  if (message.trim().length > 2000) {
    return jsonError('El mensaje no puede superar 2000 caracteres', 400)
  }

  // ── Llamar a la API del backend ────────────────────────────────────────────
  const apiBase = process.env.API_INTERNAL_URL ?? 'http://localhost:3001'
  const apiUrl = `${apiBase}/api/v1/renderer/contact`

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // El secret interno protege los endpoints del renderer de llamadas externas.
        // Nginx lo inyecta en producción; en dev se usa directamente.
        ...(process.env.RENDERER_SECRET && {
          'x-renderer-secret': process.env.RENDERER_SECRET,
        }),
      },
      body: JSON.stringify({
        tenantSlug: tenantSlug.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
      }),
      // Sin caché — esta es una acción de escritura
      cache: 'no-store',
    })

    if (!apiResponse.ok) {
      // Propagar el código de error de la API cuando sea relevante para el cliente
      const errorData = await apiResponse.json().catch(() => null) as { error?: { message?: string } } | null
      const userMessage =
        apiResponse.status === 404
          ? 'Sitio no encontrado'
          : apiResponse.status === 429
            ? 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
            : (errorData?.error?.message ?? 'No se pudo enviar el mensaje. Inténtalo de nuevo.')

      return jsonError(userMessage, apiResponse.status >= 500 ? 503 : apiResponse.status)
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (err) {
    // Error de red — API no disponible
    console.error('[contact] Error llamando a la API:', err)
    return jsonError('Servicio no disponible. Inténtalo más tarde.', 503)
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Respuesta de error en formato JSON consistente. */
function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Validación básica de email.
 * No pretende cubrir todos los RFC — la validación completa está en la API
 * con class-validator @IsEmail(). Este check evita envíos claramente inválidos.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
