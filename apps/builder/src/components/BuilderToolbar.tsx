'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { SaveStatus } from '@/hooks/useAutosave'

type Viewport = 'desktop' | 'tablet' | 'mobile'

interface BuilderToolbarProps {
  siteId: string
  pageName: string
  pageStatus: 'DRAFT' | 'PUBLISHED'
  saveStatus: SaveStatus
  lastSaved: Date | null
  viewport: Viewport
  onViewportChange: (v: Viewport) => void
  onPublish: () => Promise<void>
  onSave: () => Promise<void>
  onPreviewToggle: () => void
  onTitleChange: (newTitle: string) => void
  isPreviewOpen: boolean
}

const viewportOptions: { value: Viewport; label: string; icon: string }[] = [
  { value: 'desktop', label: 'Escritorio', icon: '🖥' },
  { value: 'tablet', label: 'Tablet', icon: '📱' },
  { value: 'mobile', label: 'Móvil', icon: '📲' },
]

// ── Subcomponentes ─────────────────────────────────────────────────────────────

function SaveIndicator({
  status,
  lastSaved,
  onRetry,
}: {
  status: SaveStatus
  lastSaved: Date | null
  onRetry: () => void
}) {
  function formatLastSaved(date: Date): string {
    const diff = Math.round((Date.now() - date.getTime()) / 1000)
    if (diff < 5) return 'ahora'
    if (diff < 60) return `hace ${diff}s`
    if (diff < 3600) return `hace ${Math.round(diff / 60)}min`
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }

  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Guardado{lastSaved ? ` ${formatLastSaved(lastSaved)}` : ''}
      </span>
    )
  }
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-xs text-blue-500">
        <span
          className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"
          aria-hidden="true"
        />
        Guardando...
      </span>
    )
  }
  if (status === 'unsaved') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
        Cambios sin guardar
      </span>
    )
  }
  if (status === 'error') {
    return (
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-xs text-red-500 underline hover:no-underline"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.93 2.93l1.41 1.41M7.66 7.66l1.41 1.41M2.93 9.07l1.41-1.41M7.66 4.34l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Error al guardar — Reintentar
      </button>
    )
  }
  return null
}

function PageStatusBadge({ status }: { status: 'DRAFT' | 'PUBLISHED' }) {
  if (status === 'PUBLISHED') {
    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
        Publicada
      </span>
    )
  }
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      Borrador
    </span>
  )
}

function InlineTitle({
  value,
  onChange,
}: {
  value: string
  onChange: (newTitle: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync if parent changes the value externally
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  function startEditing() {
    setDraft(value)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onChange(trimmed)
    }
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-40 rounded border border-blue-400 bg-white px-2 py-0.5 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-300"
        autoFocus
        aria-label="Renombrar página"
      />
    )
  }

  return (
    <button
      onClick={startEditing}
      title="Clic para renombrar"
      className="max-w-[160px] truncate rounded px-1 py-0.5 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
    >
      {value || 'Sin nombre'}
    </button>
  )
}

function PublishModal({
  isOpen,
  isPublishing,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  isPublishing: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="publish-modal-title" className="mb-2 text-base font-semibold text-gray-900">
          Publicar página
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          La página será visible públicamente en tu sitio. ¿Continuar?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isPublishing}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPublishing}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-75"
          >
            {isPublishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Toolbar principal ───────────────────────────────────────────────────────────

/**
 * Toolbar superior del editor visual.
 *
 * Layout de 3 zonas:
 *  [← Volver] [Indicador estado]  |  [Nombre página] [Badge]  |  [Vista previa] [Guardar borrador] [Publicar]
 */
export function BuilderToolbar({
  siteId,
  pageName,
  pageStatus,
  saveStatus,
  lastSaved,
  viewport,
  onViewportChange,
  onPublish,
  onSave,
  onPreviewToggle,
  onTitleChange,
  isPreviewOpen,
}: BuilderToolbarProps) {
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublishConfirm = useCallback(async () => {
    setIsPublishing(true)
    try {
      await onPublish()
      setShowPublishModal(false)
    } finally {
      setIsPublishing(false)
    }
  }, [onPublish])

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 shadow-sm">
        {/* ── Izquierda: navegación + indicador de guardado ─────────────────── */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href={`/sites/${siteId}`}
            className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 transition hover:bg-gray-100"
          >
            ← Volver
          </Link>
          <span className="text-gray-300" aria-hidden="true">|</span>
          <SaveIndicator status={saveStatus} lastSaved={lastSaved} onRetry={onSave} />
        </div>

        {/* ── Centro: viewport + nombre + badge ──────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Selector de viewport */}
          <div className="flex overflow-hidden rounded-md border border-gray-200">
            {viewportOptions.map(({ value, label, icon }) => (
              <button
                key={value}
                title={label}
                onClick={() => onViewportChange(value)}
                className={`px-2.5 py-1.5 text-sm transition ${
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

          <span className="text-gray-300" aria-hidden="true">|</span>

          {/* Nombre editable */}
          <InlineTitle value={pageName} onChange={onTitleChange} />
          <PageStatusBadge status={pageStatus} />
        </div>

        {/* ── Derecha: acciones principales ──────────────────────────────────── */}
        <div className="flex shrink-0 flex-1 items-center justify-end gap-2">
          {/* Vista previa — abre/cierra el drawer */}
          <button
            onClick={onPreviewToggle}
            className={`rounded px-3 py-1.5 text-sm font-medium transition ${
              isPreviewOpen
                ? 'bg-gray-200 text-gray-800'
                : 'text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50'
            }`}
          >
            Vista previa
          </button>

          {/* Guardar borrador (manual, además del autosave) */}
          <button
            onClick={onSave}
            className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 transition"
          >
            Guardar borrador
          </button>

          {/* Publicar → abre modal de confirmación */}
          <button
            onClick={() => setShowPublishModal(true)}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Publicar
          </button>
        </div>
      </header>

      {/* Modal de confirmación de publicación */}
      <PublishModal
        isOpen={showPublishModal}
        isPublishing={isPublishing}
        onConfirm={handlePublishConfirm}
        onCancel={() => setShowPublishModal(false)}
      />
    </>
  )
}
