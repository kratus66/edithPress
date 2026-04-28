import { headers, draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BlockRenderer, type Block } from '../_components/BlockRenderer'
import { PageViewTracker } from '../_components/PageViewTracker'

// ── Tipos de la API ────────────────────────────────────────────────────────────

interface SiteInfo {
  id: string
  name: string
  slug: string
  domain?: string
  defaultOgImage?: string
  navItems: Array<{ label: string; slug: string }>
  favicon?: string
  accentColor?: string
  plan?: string
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
  rootProps?: Record<string, unknown>
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
    const url = isDraft
      ? `${API_BASE}/api/v1/renderer/tenant/${tenantSlug}?draft=true`
      : `${API_BASE}/api/v1/renderer/tenant/${tenantSlug}`

    const res = await fetch(url, {
      ...(isDraft
        ? { cache: 'no-store' as const }
        : { next: { revalidate: 3600 } }),
      headers: {
        'x-renderer-secret': process.env.RENDERER_SECRET ?? '',
      },
    })

    if (!res.ok) return null

    const json = (await res.json()) as {
      data: {
        tenant: { name: string; slug: string; logoUrl?: string }
        site: { id: string; name: string; description?: string; favicon?: string; settings?: unknown }
        navigation: Array<{ id: string; title: string; slug: string; isHomepage: boolean }>
      }
    }

    const { tenant, site, navigation } = json.data
    const settings = site.settings as Record<string, unknown> | undefined
    return {
      id: site.id,
      name: site.name ?? tenant.name,
      slug: tenant.slug,
      favicon: site.favicon,
      navItems: navigation.map((p) => ({ label: p.title, slug: p.slug })),
      accentColor: typeof settings?.accentColor === 'string' ? settings.accentColor : undefined,
      plan: (tenant as Record<string, unknown> & { subscription?: { plan?: string }; plan?: string }).subscription?.plan
        ?? (tenant as Record<string, unknown> & { plan?: string }).plan
        ?? undefined,
    }
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

    const json = (await res.json()) as {
      data: {
        page: {
          id: string
          title: string
          slug: string
          content: Block[]
          rootProps?: Record<string, unknown>
          meta: { title?: string; description?: string; ogImage?: string }
          isHomepage: boolean
          publishedAt: string
          updatedAt: string
        }
      }
    }

    const { page } = json.data
    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      metaTitle: page.meta?.title,
      metaDesc: page.meta?.description,
      ogImage: page.meta?.ogImage,
      content: Array.isArray(page.content) ? page.content : [],
      rootProps: page.rootProps,
      publishedAt: page.publishedAt,
      updatedAt: page.updatedAt,
    }
  } catch {
    return null
  }
}

// ── generateMetadata helpers ───────────────────────────────────────────────────

/**
 * Extrae la URL de la primera imagen encontrada en el contenido de la página.
 * Recorre los bloques en orden y devuelve la primera `src` o `image` que encuentre.
 */
function extractFirstImage(blocks: Block[]): string | undefined {
  for (const block of blocks) {
    const props = block.props as Record<string, unknown> | undefined
    if (!props) continue

    // ImageBlock: { src: string }
    if (typeof props.src === 'string' && props.src) return props.src
    // HeroBlock o CardGridBlock: { image: string }
    if (typeof props.image === 'string' && props.image) return props.image
    // GalleryBlock: { images: [{ src }] }
    if (Array.isArray(props.images)) {
      const first = (props.images as Array<{ src?: string }>)[0]
      if (first?.src) return first.src
    }
    // CardGridBlock: { cards: [{ image }] }
    if (Array.isArray(props.cards)) {
      for (const card of props.cards as Array<{ image?: string }>) {
        if (card.image) return card.image
      }
    }
  }
  return undefined
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
  const isHome = !pageSlug || pageSlug === 'home'

  // Prioridad de imagen OG: ogImage explícito → primera imagen del contenido → defaultOgImage del site
  const ogImageUrl =
    page.ogImage ??
    extractFirstImage(page.content) ??
    site.defaultOgImage

  return {
    title: page.metaTitle ?? `${page.title} | ${site.name}`,
    description: page.metaDesc ?? undefined,
    openGraph: {
      title: page.metaTitle ?? page.title,
      description: page.metaDesc ?? undefined,
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
      url: pageUrl,
      siteName: site.name,
      // homepage → website; páginas internas → article
      type: isHome ? 'website' : 'article',
      ...((!isHome && page.publishedAt) && {
        publishedTime: page.publishedAt,
        modifiedTime: page.updatedAt,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle ?? page.title,
      description: page.metaDesc ?? undefined,
      images: ogImageUrl ? [ogImageUrl] : undefined,
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
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-3 flex items-center justify-between">
        <a href="/" className="font-bold text-gray-900 text-lg hover:opacity-80 transition-opacity shrink-0">
          {site.name}
        </a>
        <ul className="hidden sm:flex items-center gap-6 list-none m-0 p-0">
          {site.navItems.map((item) => {
            const href = item.slug === 'home' ? '/' : `/${item.slug}`
            const isCurrent = item.slug === (currentSlug || 'home')
            return (
              <li key={item.slug}>
                <a
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'text-primary-600'
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

// ── TenantNotFound ─────────────────────────────────────────────────────────────

function TenantNotFound({ site }: { site: SiteInfo }) {
  const accent = site.accentColor ?? '#2563eb'
  return (
    <>
      <SiteNav site={site} currentSlug="" />
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 24px',
          fontFamily: 'inherit',
        }}
      >
        <p
          style={{
            fontSize: 'clamp(5rem, 20vw, 9rem)',
            fontWeight: 800,
            lineHeight: 1,
            color: accent,
            margin: '0 0 16px',
            letterSpacing: '-0.04em',
          }}
        >
          404
        </p>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 12px',
          }}
        >
          Página no encontrada
        </h1>
        <p
          style={{
            color: '#6b7280',
            fontSize: '1rem',
            maxWidth: 420,
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          La página que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            backgroundColor: accent,
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            padding: '12px 28px',
            borderRadius: 8,
            letterSpacing: '0.01em',
          }}
        >
          Volver al inicio
        </a>
      </div>
    </>
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

  // Tenant no encontrado → 404 genérico
  if (!site) {
    notFound()
  }

  // Página no encontrada pero el tenant existe → 404 con branding del tenant
  if (!page) {
    return <TenantNotFound site={site} />
  }

  // La ruta actual para analytics (ej: "/" o "/sobre-nosotros")
  const currentPath = pageSlug ? `/${pageSlug}` : '/'

  return (
    <>
      <SiteNav site={site} currentSlug={pageSlug || 'home'} />

      <BlockRenderer blocks={page.content} siteId={site.id} rootProps={page.rootProps} />

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
        </p>
        {/* TODO: mostrar solo en plan FREE cuando la API incluya datos de plan */}
        {(site.plan === 'FREE' || site.plan === undefined) && (
          <p className="mt-2 text-xs text-gray-400">
            Sitio creado con{' '}
            <a
              href="https://edithpress.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              EdithPress
            </a>
          </p>
        )}
      </footer>

      {isDraft && <DraftBanner />}

      {/* Analytics — client-side para capturar referrer y no bloquear ISR */}
      {!isDraft && (
        <PageViewTracker siteId={site.id} path={currentPath} />
      )}
    </>
  )
}

// ISR: revalidación de respaldo — la principal es on-demand desde la API
export const revalidate = 3600
