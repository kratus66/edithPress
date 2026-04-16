import type { MetadataRoute } from 'next'

/**
 * sitemap.ts — Generación dinámica del sitemap del tenant
 *
 * ARQUITECTURA MULTI-TENANT:
 * En un despliegue multi-tenant (un renderer para todos los tenants),
 * el sitemap se genera por petición — Next.js la trata como una ruta
 * dinámica. El tenant se identifica via la variable de entorno TENANT_SLUG
 * (establecida en el contenedor/proceso de cada tenant) o via el host.
 *
 * La API expone GET /api/v1/renderer/tenant/{slug}/pages (solo publicadas)
 * que devuelve { slug, updatedAt } de cada página — lo mínimo para el sitemap.
 *
 * Revalidación: el sitemap se regenera cuando se publica una página
 * (on-demand revalidation desde la API vía revalidatePath('/sitemap.xml')).
 */

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001'
const TENANT_SLUG = process.env.TENANT_SLUG ?? ''

interface PageEntry {
  slug: string
  updatedAt: string
}

interface SiteConfig {
  domain?: string
}

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!TENANT_SLUG) return []

  try {
    const [pagesRes, siteRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/renderer/tenant/${TENANT_SLUG}/pages`, {
        next: { revalidate: 3600 },
        headers: { 'x-renderer-secret': process.env.RENDERER_SECRET ?? '' },
      }),
      fetch(`${API_BASE}/api/v1/renderer/tenant/${TENANT_SLUG}`, {
        next: { revalidate: 3600 },
        headers: { 'x-renderer-secret': process.env.RENDERER_SECRET ?? '' },
      }),
    ])

    if (!pagesRes.ok || !siteRes.ok) return []

    const pages: PageEntry[] = await pagesRes.json()
    const site: SiteConfig = await siteRes.json()

    const baseUrl = site.domain
      ? `https://${site.domain}`
      : `https://${TENANT_SLUG}.edithpress.com`

    return pages.map((page) => ({
      url: page.slug === 'home' ? baseUrl : `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: page.slug === 'home' ? 1.0 : 0.8,
    }))
  } catch {
    return []
  }
}
