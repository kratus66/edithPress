import { headers, draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BlockRenderer, type Block } from '../_components/BlockRenderer'

// ── Tipos de la API ────────────────────────────────────────────────────────────

interface SiteInfo {
  id: string
  name: string
  slug: string
  domain?: string
  defaultOgImage?: string
  navItems: Array<{ label: string; slug: string }>
  favicon?: string
}

interface PageContent {
  id: string
  slug: string
  title: string
  metaTitle?: string
  metaDesc?: string
  ogImage?: string
  canonicalUrl?: string
  content: Block[]
  publishedAt: string
  updatedAt: string
}

// ── Helpers de fetch ───────────────────────────────────────────────────────────

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001'

/**
 * Obtiene el tenantSlug de los headers internos.
 * El middleware ya lo inyectó desde el header X-Tenant-Slug o el subdominio.
 */
function getTenantSlug(): string | null {
  const headersList = headers()
  return headersList.get('x-tenant-slug')
}

async function fetchSite(tenantSlug: string, isDraft: boolean): Promise<SiteInfo | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/renderer/tenant/${tenantSlug}`,
      {
        // En Draft Mode: no-store para ver siempre el estado actual.
        // En modo normal: next.revalidate = 3600 activa ISR (no usar cache:force-cache
        // junto a next.revalidate — son opciones que se solapan en Next.js 14).
        ...(isDraft
          ? { cache: 'no-store' as const }
          : { next: { revalidate: 3600 } }),
        headers: {
          'x-renderer-secret': process.env.RENDERER_SECRET ?? '',
        },
      }
    )

    if (!res.ok) return null
    return res.json() as Promise<SiteInfo>
  } catch {
    return null
  }
}

async function fetchPage(
  tenantSlug: string,
  pageSlug: string,
  isDraft: boolean
): Promise<PageContent | null> {
  try {
    // En Draft Mode añadimos ?draft=true para que la API devuelva borradores
    const url = isDraft
      ? `${API_BASE}/api/v1/renderer/tenant/${tenantSlug}/page/${pageSlug}?draft=true`
      : `${API_BASE}/api/v1/renderer/tenant/${tenantSlug}/page/${pageSlug}`

    const res = await fetch(url, {
      ...(isDraft
        ? { cache: 'no-store' as const }
        : { next: { revalidate: 3600 } }),
      headers: {
        'x-renderer-secret': process.env.RENDERER_SECRET ?? '',
      },
    })

    if (!res.ok) return null
    return res.json() as Promise<PageContent>
  } catch {
    return null
  }
}

// ── generateMetadata ───────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] }
}): Promise<Metadata> {
  const tenantSlug = getTenantSlug()
  if (!tenantSlug) return {}

  const { isEnabled: isDraft } = draftMode()
  const pageSlug = params.slug?.join('/') ?? ''

  const [site, page] = await Promise.all([
    fetchSite(tenantSlug, isDraft),
    fetchPage(tenantSlug, pageSlug || 'home', isDraft),
  ])

  if (!site || !page) return {}

  const baseUrl = site.domain
    ? `https://${site.domain}`
    : `https://${tenantSlug}.edithpress.com`

  const pageUrl = pageSlug ? `${baseUrl}/${pageSlug}` : baseUrl

  return {
    title: page.metaTitle ?? `${page.title} | ${site.name}`,
    description: page.metaDesc ?? undefined,
    openGraph: {
      title: page.metaTitle ?? page.title,
      description: page.metaDesc ?? undefined,
      images: page.ogImage ?? site.defaultOgImage
        ? [{ url: (page.ogImage ?? site.defaultOgImage) as string }]
        : undefined,
      url: pageUrl,
      siteName: site.name,
      type: 'website',
    },
    alternates: {
      canonical: page.canonicalUrl ?? pageUrl,
    },
    // En Draft Mode no indexamos — es una preview privada
    robots: isDraft
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

// ── SiteNav ────────────────────────────────────────────────────────────────────

function SiteNav({
  site,
  currentSlug,
}: {
  site: SiteInfo
  currentSlug: string
}) {
  if (!site.navItems?.length) return null

  return (
    <nav
      className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200"
      aria-label="Navegación principal"
    >
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <a href="/" className="font-bold text-gray-900 text-lg hover:opacity-80 transition-opacity">
          {site.name}
        </a>
        <ul className="flex items-center gap-6 list-none m-0 p-0">
          {site.navItems.map((item) => {
            const href = item.slug === 'home' ? '/' : `/${item.slug}`
            const isCurrent = item.slug === (currentSlug || 'home')
            return (
              <li key={item.slug}>
                <a
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

// ── DraftBanner ────────────────────────────────────────────────────────────────

function DraftBanner() {
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-lg"
      role="status"
    >
      Modo preview — contenido en borrador
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

/**
 * Ruta dinámica catch-all del renderer de EdithPress.
 *
 * Maneja:
 * - / → página "home" del tenant
 * - /slug → página con ese slug
 * - /a/b/c → slug compuesto (aunque la mayoría de tenants usan slugs simples)
 *
 * ISR: revalidación de respaldo de 1 hora (3600s).
 * La revalidación principal es on-demand, disparada por la API al publicar.
 *
 * Draft Mode: activado por /api/preview con el secret correcto.
 * En Draft Mode: no hay caché, se muestran borradores.
 */
export default async function TenantPage({
  params,
}: {
  params: { slug?: string[] }
}) {
  const tenantSlug = getTenantSlug()

  // Sin tenant identificado → 404
  if (!tenantSlug) {
    notFound()
  }

  const { isEnabled: isDraft } = draftMode()
  const pageSlug = params.slug?.join('/') ?? ''

  // Fetch paralelo de sitio y página
  const [site, page] = await Promise.all([
    fetchSite(tenantSlug, isDraft),
    fetchPage(tenantSlug, pageSlug || 'home', isDraft),
  ])

  // Tenant o página no encontrada → 404
  if (!site || !page) {
    notFound()
  }

  return (
    <>
      <SiteNav site={site} currentSlug={pageSlug || 'home'} />

      <BlockRenderer blocks={page.content} />

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
        </p>
      </footer>

      {isDraft && <DraftBanner />}
    </>
  )
}

// ISR: revalidación de respaldo — la principal es on-demand desde la API
export const revalidate = 3600
