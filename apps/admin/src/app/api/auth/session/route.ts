import { type NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'access_token'
// 15 minutes — matches the API's JWT expiry (ACCESS_TOKEN_TTL_SECONDS = 900)
const MAX_AGE = 15 * 60

/**
 * POST /api/auth/session — persist accessToken in a cookie after login.
 *
 * SEC note: httpOnly is intentionally false so document.cookie can read it
 * in the browser-side api-client interceptor. The token itself is a short-lived
 * JWT (15 min). Sensitive session data (refresh token) is handled server-side
 * by the NestJS API in a separate httpOnly cookie.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { accessToken?: unknown }

  if (typeof body.accessToken !== 'string' || !body.accessToken) {
    return NextResponse.json({ error: 'accessToken required' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, body.accessToken, {
    httpOnly: false, // readable by document.cookie in api-client
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
  return res
}

/**
 * DELETE /api/auth/session — clear the access_token cookie on logout.
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}

/**
 * GET /api/auth/session — return the decoded JWT payload.
 * Only used for server-side route decisions; signature not re-verified here
 * (the NestJS API validates the token on every protected request).
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ user: null })
  }

  try {
    const [, payloadB64] = token.split('.')
    const json = Buffer.from(
      payloadB64.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf-8')
    const payload = JSON.parse(json) as Record<string, unknown>
    return NextResponse.json({ user: payload })
  } catch {
    return NextResponse.json({ user: null })
  }
}
