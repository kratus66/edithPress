'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Badge, Card, Alert } from '@edithpress/ui'
import { useSites } from '@/hooks/useSites'
import { getApiErrorMessage } from '@/lib/api-client'

function SiteCard({ id, name, description, isPublished, updatedAt, onDelete, onPublish }: {
  id: string; name: string; description?: string; isPublished: boolean
  updatedAt: string; onDelete: () => void; onPublish: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const date = new Date(updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{name}</p>
            {description && <p className="text-xs text-gray-500 truncate mt-0.5">{description}</p>}
          </div>
        </div>
        <Badge variant={isPublished ? 'success' : 'default'} className="shrink-0">
          {isPublished ? 'Publicado' : 'Borrador'}
        </Badge>
      </div>

      <p className="text-xs text-gray-400">Editado {date}</p>

      <div className="flex gap-2">
        <Link href={`/sites/${id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">Ver sitio</Button>
        </Link>
        <Link href={`/sites/${id}/pages`} className="flex-1">
          <Button size="sm" className="w-full">Editar</Button>
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            aria-label="Más opciones"
            aria-expanded={menuOpen}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 bottom-10 z-10 w-44 rounded-lg border border-gray-200 bg-white shadow-md py-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => { onPublish(); setMenuOpen(false) }}
              >
                {isPublished ? 'Despublicar' : 'Publicar'}
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => { onDelete(); setMenuOpen(false) }}
              >
                Eliminar sitio
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function SitesPage() {
  const { sites, isLoading, error, deleteSite, publishSite } = useSites()
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que quieres eliminar este sitio? Esta acción no se puede deshacer.')) return
    try {
      await deleteSite(id)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo eliminar el sitio.'))
    }
  }

  async function handlePublish(id: string) {
    try {
      await publishSite(id)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo cambiar el estado.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Mis sitios</h2>
        <Link href="/sites/new">
          <Button size="sm">+ Nuevo sitio</Button>
        </Link>
      </div>

      {actionError && <Alert variant="error" onDismiss={() => setActionError(null)}>{actionError}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-4xl mb-4">🌐</p>
          <p className="text-lg font-semibold text-gray-900">Aún no tienes sitios</p>
          <p className="text-sm text-gray-500 mt-1">Crea tu primer sitio en minutos.</p>
          <Link href="/sites/new">
            <Button className="mt-6">Crear mi primer sitio</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              {...site}
              onDelete={() => handleDelete(site.id)}
              onPublish={() => handlePublish(site.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
