'use client'

import { useEffect } from 'react'

interface PageViewTrackerProps {
  siteId: string
  path: string
}

/**
 * PageViewTracker — Componente cliente de analytics para EdithPress Renderer.
 *
 * Se monta una sola vez por navegación de página y dispara un POST fire-and-forget
 * al endpoint de analytics. Si el request falla por cualquier motivo (red, API caída,
 * adblocker) el error se silencia completamente para no afectar al usuario final.
 *
 * No bloquea el SSR/ISR: el render del servidor es independiente de este componente.
 */
export function PageViewTracker({ siteId, path }: PageViewTrackerProps) {
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''

    // Sin URL configurada no podemos trackear — saltar silenciosamente
    if (!apiUrl) return

    fetch(`${apiUrl}/api/v1/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId,
        path,
        referrer: document.referrer || undefined,
      }),
    }).catch(() => {
      // fire-and-forget: nunca propagar errores de analytics al usuario
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Componente invisible — solo ejecuta el efecto
  return null
}
