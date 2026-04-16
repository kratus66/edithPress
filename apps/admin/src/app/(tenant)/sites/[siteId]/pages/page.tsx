'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Badge, Card, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SitePage {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isHomepage: boolean
  updatedAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<SitePage['status'], string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
}

const STATUS_VARIANTS: Record<SitePage['status'], 'default' | 'success' | 'warning'> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  ARCHIVED: 'warning',
}

// ── Page Row ──────────────────────────────────────────────────────────────────

function PageRow({
  page,
  siteId,
  onDeleted,
}: {
  page: SitePage
  siteId: string
  onDeleted: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const date = new Date(page.updatedAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await api.delete(`/sites/${siteId}/pages/${page.id}`)
      onDeleted(page.id)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'No se pudo eliminar la página.'))
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-1 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between gap-3">
        {/* Info */}
        <div className="flex items-center gap-2 min-w-0">
          {page.isHomepage && (
            <span className="shrink-0 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium">
              Inicio
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
            <p className="text-xs text-gray-400">/{page.slug} · editado {date}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={STATUS_VARIANTS[page.status]}>
            {STATUS_LABELS[page.status]}
          </Badge>

          <Link href={`/builder/${siteId}/${page.id}`}>
            <Button variant="outline" size="sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-1">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </Button>
          </Link>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label={`Eliminar página ${page.title}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
              >
                Eliminar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      {deleteError && (
        <p className="text-xs text-red-600">{deleteError}</p>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PagesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 rounded-md bg-gray-100 animate-pulse" />
      ))}
    </div>
  )
}

// ── Filter Bar ────────────────────────────────────────────────────────────────

type Filter = 'ALL' | SitePage['status']

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Publicadas', value: 'PUBLISHED' },
  { label: 'Borrador', value: 'DRAFT' },
  { label: 'Archivadas', value: 'ARCHIVED' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SitePagesPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = use(params)

  const [pages, setPages] = useState<SitePage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')

  const fetchPages = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.get<{ data: SitePage[] }>(`/sites/${siteId}/pages`)
      setPages(data.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar las páginas.'))
    } finally {
      setIsLoading(false)
    }
  }, [siteId])

  useEffect(() => { void fetchPages() }, [fetchPages])

  function handleDeleted(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id))
  }

  const filtered = filter === 'ALL' ? pages : pages.filter((p) => p.status === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/sites/${siteId}`}>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
            aria-label="Volver al sitio"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Sitio
          </button>
        </Link>
        <h2 className="flex-1 text-xl font-semibold text-gray-900">Páginas</h2>
        <Link href={`/sites/${siteId}/pages/new`}>
          <Button size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mr-1.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva página
          </Button>
        </Link>
      </div>

      {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200" role="tablist" aria-label="Filtrar páginas">
        {FILTERS.map(({ label, value }) => {
          const count = value === 'ALL' ? pages.length : pages.filter((p) => p.status === value).length
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={[
                'px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                filter === value
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {label}
              {!isLoading && (
                <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${filter === value ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      <Card className="p-5">
        {isLoading ? (
          <PagesSkeleton />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-3" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm text-gray-500">
              {filter === 'ALL' ? 'No hay páginas en este sitio.' : `No hay páginas en estado "${STATUS_LABELS[filter as SitePage['status']]}".`}
            </p>
            {filter === 'ALL' && (
              <Link href={`/sites/${siteId}/pages/new`}>
                <Button variant="outline" size="sm" className="mt-4">
                  Crear primera página
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((page) => (
              <PageRow key={page.id} page={page} siteId={siteId} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
