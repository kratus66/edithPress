'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Badge, Card, Alert } from '@edithpress/ui'
import { useSite } from '@/hooks/useSites'
import { api, getApiErrorMessage } from '@/lib/api-client'

interface Page {
  id: string; title: string; slug: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isHomepage: boolean; order: number; updatedAt: string
}

function PageRow({ id, siteId, title, slug, status, isHomepage }: Page & { siteId: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {isHomepage && (
          <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium shrink-0">Inicio</span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-400">/{slug}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={status === 'PUBLISHED' ? 'success' : status === 'ARCHIVED' ? 'warning' : 'default'}>
          {status === 'PUBLISHED' ? 'Publicado' : status === 'ARCHIVED' ? 'Archivado' : 'Borrador'}
        </Badge>
        <Link href={`/builder/${siteId}/${id}`}>
          <Button variant="ghost" size="sm">Editar</Button>
        </Link>
      </div>
    </div>
  )
}

export default function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  const { site, isLoading: siteLoading, error: siteError } = useSite(siteId)
  const [pages, setPages] = useState<Page[]>([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!siteId) return
    api.get<{ data: Page[] }>(`/sites/${siteId}/pages`)
      .then(({ data }) => setPages(data.data))
      .catch(() => {})
      .finally(() => setPagesLoading(false))
  }, [siteId])

  async function handleTogglePublish() {
    if (!site) return
    setPublishing(true)
    setActionError(null)
    try {
      const endpoint = site.isPublished ? `/sites/${siteId}/unpublish` : `/sites/${siteId}/publish`
      await api.post(endpoint)
      window.location.reload()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo cambiar el estado del sitio.'))
    } finally {
      setPublishing(false)
    }
  }

  if (siteLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-md bg-gray-100 animate-pulse" />
        <div className="h-40 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    )
  }

  if (siteError || !site) {
    return <Alert variant="error">{siteError ?? 'Sitio no encontrado.'}</Alert>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sites">
          <button type="button" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md" aria-label="Volver a sitios">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Sitios
          </button>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900 flex-1 truncate">{site.name}</h2>
        <Badge variant={site.isPublished ? 'success' : 'default'}>
          {site.isPublished ? 'Publicado' : 'Borrador'}
        </Badge>
      </div>

      {actionError && <Alert variant="error" onDismiss={() => setActionError(null)}>{actionError}</Alert>}

      {/* Acciones rápidas */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Acciones rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Link href={`/builder/${siteId}`}>
            <Button>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Abrir editor
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            loading={publishing}
          >
            {site.isPublished ? 'Despublicar' : 'Publicar sitio'}
          </Button>
          {site.isPublished && (
            <a
              href={`https://${site.settings?.slug ?? siteId}.edithpress.com`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost">
                Ver sitio →
              </Button>
            </a>
          )}
          <Link href={`/sites/${siteId}/settings`}>
            <Button variant="ghost">Configuración</Button>
          </Link>
        </div>
      </Card>

      {/* Páginas */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Páginas</h3>
          <Link href={`/sites/${siteId}/pages/new`}>
            <Button variant="outline" size="sm">+ Nueva página</Button>
          </Link>
        </div>

        {pagesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-12 rounded-md bg-gray-100 animate-pulse" />)}
          </div>
        ) : pages.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">No hay páginas aún.</p>
            <Link href={`/sites/${siteId}/pages/new`}>
              <Button variant="outline" size="sm" className="mt-3">Crear primera página</Button>
            </Link>
          </div>
        ) : (
          <div>
            {pages.map((page) => (
              <PageRow key={page.id} {...page} siteId={siteId} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
