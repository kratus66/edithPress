import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'

/**
 * robots.ts — robots.txt dinámico por tenant
 *
 * Si el sitio está publicado (isPublished=true): permite indexación.
 * Si está en borrador o no publicado: bloquea todos los crawlers.
 *
 * El tenant se identifica via el header X-Tenant-Slug inyectado por el middleware.
 */

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001'

interface SiteConfig {
  domain?: string
  isPublished: boolean
}

export const revalidate = 3600

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = headers()
  const tenantSlug = headersList.get('x-tenant-slug') ?? process.env.TENANT_SLUG ?? ''

  // Sin tenant conocido → no indexar
  if (!tenantSlug) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  let site: SiteConfig | null = null
  try {
    const res = await fetch(`${API_BASE}/api/v1/renderer/tenant/${tenantSlug}`, {
      next: { revalidate: 3600 },
      headers: { 'x-renderer-secret': process.env.RENDERER_SECRET ?? '' },
    })
    if (res.ok) {
      site = await res.json()
    }
  } catch {
    // Fallo de red → conservador: no indexar
  }

  const baseUrl = site?.domain
    ? `https://${site.domain}`
    : `https://${tenantSlug}.edithpress.com`

  // Sitio no publicado → bloquear todos los bots
  if (!site?.isPublished) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
