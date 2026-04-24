import { type NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/revalidate — Proxy server-side hacia el renderer.
 *
 * El browser no puede llamar directamente al renderer (CORS).
 * Este route handler lo hace server-to-server, evitando el problema.
 */
export async function POST(request: NextRequest) {
  const rendererUrl = process.env.RENDERER_URL ?? 'http://localhost:3003'
  const rendererSecret = process.env.RENDERER_SECRET

  if (!rendererSecret) {
    return NextResponse.json({ error: 'RENDERER_SECRET no configurado' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))

  try {
    const res = await fetch(`${rendererUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-renderer-secret': rendererSecret,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: 'Error al contactar el renderer' }, { status: 502 })
  }
}
