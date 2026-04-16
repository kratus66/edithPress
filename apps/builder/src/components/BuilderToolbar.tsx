'use client'

import React from 'react'
import Link from 'next/link'

type Viewport = 'desktop' | 'tablet' | 'mobile'
type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

interface BuilderToolbarProps {
  siteId: string
  pageName: string
  saveStatus: SaveStatus
  viewport: Viewport
  onViewportChange: (v: Viewport) => void
  onPublish: () => void
  onSave: () => void
  /** Slug del tenant — necesario para construir la URL del preview */
  tenantSlug: string | null
  /** Slug de la página actualmente editada */
  pageSlug: string
}

const viewportOptions: { value: Viewport; label: string; icon: string }[] = [
  { value: 'desktop', label: 'Escritorio', icon: '🖥' },
  { value: 'tablet', label: 'Tablet', icon: '📱' },
  { value: 'mobile', label: 'Móvil', icon: '📲' },
]

function SaveIndicator({ status }: { status: SaveStatus }) {
  const map: Record<SaveStatus, { text: string; color: string }> = {
    idle: { text: '', color: '' },
    unsaved: { text: 'Cambios sin guardar', color: 'text-amber-500' },
    saving: { text: 'Guardando...', color: 'text-blue-500' },
    saved: { text: 'Guardado', color: 'text-green-600' },
    error: { text: 'Error al guardar', color: 'text-red-500' },
  }
  const { text, color } = map[status]
  if (!text) return null
  return <span className={`text-xs font-medium ${color}`}>{text}</span>
}

/**
 * Toolbar superior del editor.
 *
 * Layout:
 *   [← Volver] [Nombre de página]   [Desktop|Tablet|Mobile]   [Estado] [Guardar] [Publicar]
 */
export function BuilderToolbar({
  siteId,
  pageName,
  saveStatus,
  viewport,
  onViewportChange,
  onPublish,
  onSave,
  tenantSlug,
  pageSlug,
}: BuilderToolbarProps) {
  function handlePreview() {
    if (!tenantSlug) return
    const url = `/api/preview?tenantSlug=${encodeURIComponent(tenantSlug)}&pageSlug=${encodeURIComponent(pageSlug)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 shadow-sm">
      {/* ── Izquierda: breadcrumb ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          href={`/sites/${siteId}`}
          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 transition hover:bg-gray-100"
        >
          ← Volver
        </Link>
        <span className="text-gray-300">|</span>
        <span className="max-w-[180px] truncate text-sm font-medium text-gray-800">
          {pageName}
        </span>
      </div>

      {/* ── Centro: selector de viewport ───────────────────────────────────── */}
      <div className="flex rounded-md border border-gray-200 overflow-hidden">
        {viewportOptions.map(({ value, label, icon }) => (
          <button
            key={value}
            title={label}
            onClick={() => onViewportChange(value)}
            className={`px-3 py-1.5 text-sm transition ${
              viewport === value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span aria-hidden="true">{icon}</span>
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Derecha: estado + acciones ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <SaveIndicator status={saveStatus} />

        {saveStatus === 'error' && (
          <button
            onClick={onSave}
            className="text-xs text-red-500 underline hover:no-underline"
          >
            Reintentar
          </button>
        )}

        <button
          onClick={onSave}
          className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          Guardar (Ctrl+S)
        </button>

        {tenantSlug && (
          <button
            onClick={handlePreview}
            title="Abrir vista previa en borrador en una nueva pestaña"
            className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 transition"
          >
            Vista previa
          </button>
        )}

        <button
          onClick={onPublish}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Publicar
        </button>
      </div>
    </header>
  )
}
