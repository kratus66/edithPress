import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'

/**
 * sitemap.ts — Sitemap dinámico por tenant
 *
 * El tenant se identifica via el header X-Tenant-Slug inyectado por el middleware
 * (basado en el subdominio o dominio personalizado).
 *
 * La API expone GET /api/v1/renderer/tenant/{slug}/pages (solo páginas PUBLISHED)
 * que devuelve { slug, updatedAt, isHomepage } — lo mínimo para el sitemap.
 *
 * Revalidación: 1 hora de ISR + on-demand revalidation desde la API al publicar.
 */

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001'

interface PageEntry {
  slug: string
  updatedAt: string
  isHomepage: boolean
}

interface SiteConfig {
  domain?: string
}

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = headers()
  const tenantSlug = headersList.get('x-tenant-slug') ?? process.env.TENANT_SLUG ?? ''

  if (!tenantSlug) return []

  try {
    const [pagesRes, siteRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/renderer/tenant/${tenantSlug}/pages`, {
        next: { revalidate: 3600 },
        headers: { 'x-renderer-secret': process.env.RENDERER_SECRET ?? '' },
      }),
      fetch(`${API_BASE}/api/v1/renderer/tenant/${tenantSlug}`, {
        next: { revalidate: 3600 },
        headers: { 'x-renderer-secret': process.env.RENDERER_SECRET ?? '' },
      }),
    ])

    if (!pagesRes.ok || !siteRes.ok) return []

    const pages: PageEntry[] = await pagesRes.json()
    const site: SiteConfig = await siteRes.json()

    const baseUrl = site.domain
      ? `https://${site.domain}`
      : `https://${tenantSlug}.edithpress.com`

    return pages.map((page) => ({
      url: page.isHomepage || page.slug === 'home' ? baseUrl : `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: page.isHomepage || page.slug === 'home' ? 'weekly' as const : 'monthly' as const,
      priority: page.isHomepage || page.slug === 'home' ? 1.0 : 0.8,
    }))
  } catch {
    return []
  }
}
