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
  viewport?: Viewport
  onViewportChange?: (v: Viewport) => void
  onPublish: () => Promise<void>
  onSave: () => Promise<void>
  onPreviewToggle: () => void
  onTitleChange: (newTitle: string) => void
  isPreviewOpen: boolean
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// ── SaveIndicator ──────────────────────────────────────────────────────────────

function SaveIndicator({ status, lastSaved, onRetry }: { status: SaveStatus; lastSaved: Date | null; onRetry: () => void }) {
  function formatLastSaved(date: Date): string {
    const diff = Math.round((Date.now() - date.getTime()) / 1000)
    if (diff < 5) return 'ahora'
    if (diff < 60) return `hace ${diff}s`
    if (diff < 3600) return `hace ${Math.round(diff / 60)}min`
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }

  if (status === 'saved') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
      <IconCheck />
      {lastSaved ? `Guardado ${formatLastSaved(lastSaved)}` : 'Guardado'}
    </span>
  )

  if (status === 'saving') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3b82f6' }}>
      <span style={{
        display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
        border: '2px solid #bfdbfe', borderTopColor: '#3b82f6',
        animation: 'spin 0.7s linear infinite',
      }} />
      Guardando…
    </span>
  )

  if (status === 'unsaved') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#f59e0b' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
      Sin guardar
    </span>
  )

  if (status === 'error') return (
    <button onClick={onRetry} style={{
      display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
      color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer',
      textDecoration: 'underline', padding: 0,
    }}>
      Error — Reintentar
    </button>
  )

  return null
}

// ── InlineTitle ────────────────────────────────────────────────────────────────

function InlineTitle({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!editing) setDraft(value) }, [value, editing])

  function startEditing() {
    setDraft(value)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onChange(trimmed)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setDraft(value); setEditing(false) }
  }

  if (editing) return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      autoFocus
      style={{
        width: 160, fontSize: 13, fontWeight: 500, color: '#111827',
        border: '1.5px solid #3b82f6', borderRadius: 6, padding: '3px 8px',
        outline: 'none', background: '#fff',
      }}
    />
  )

  return (
    <button
      onClick={startEditing}
      title="Clic para renombrar"
      style={{
        maxWidth: 180, fontSize: 13, fontWeight: 600, color: '#111827',
        background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px',
        borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      {value || 'Sin nombre'}
    </button>
  )
}

// ── StatusBadge ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'DRAFT' | 'PUBLISHED' }) {
  const published = status === 'PUBLISHED'
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 999,
      background: published ? '#dcfce7' : '#f3f4f6',
      color: published ? '#15803d' : '#6b7280',
    }}>
      {published ? 'Publicada' : 'Borrador'}
    </span>
  )
}

// ── PublishModal ───────────────────────────────────────────────────────────────

function PublishModal({ isOpen, isPublishing, onConfirm, onCancel }: {
  isOpen: boolean; isPublishing: boolean; onConfirm: () => void; onCancel: () => void
}) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, padding: '24px 28px',
          width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#111827' }}>
          Publicar página
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
          La página será visible públicamente en tu sitio. ¿Continuar?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={isPublishing}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPublishing}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: isPublishing ? '#93c5fd' : '#2563eb',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: isPublishing ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
            }}
          >
            {isPublishing ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── BuilderToolbar ─────────────────────────────────────────────────────────────

export function BuilderToolbar({
  siteId, pageName, pageStatus, saveStatus, lastSaved,
  onPublish, onSave, onPreviewToggle, onTitleChange, isPreviewOpen,
}: BuilderToolbarProps) {
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublishConfirm = useCallback(async () => {
    setIsPublishing(true)
    try { await onPublish(); setShowPublishModal(false) }
    finally { setIsPublishing(false) }
  }, [onPublish])

  return (
    <>
      {/* keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <header style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        height: 48,
        padding: '0 12px',
        gap: 8,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        flexShrink: 0,
        zIndex: 10,
        position: 'relative',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}>

        {/* ── Izquierda: Volver + estado guardado ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3010'}/sites/${siteId}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 8px', borderRadius: 7,
              fontSize: 13, fontWeight: 500, color: '#374151',
              textDecoration: 'none', flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <IconChevronLeft />
            Volver
          </a>
          <span style={{ width: 1, height: 18, background: '#e5e7eb' }} />
          <SaveIndicator status={saveStatus} lastSaved={lastSaved} onRetry={onSave} />
        </div>

        {/* ── Centro: nombre + badge (centrado) ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden' }}>
          <InlineTitle value={pageName} onChange={onTitleChange} />
          <StatusBadge status={pageStatus} />
        </div>

        {/* ── Derecha: acciones ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <button
            onClick={onPreviewToggle}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              border: '1px solid #e5e7eb',
              background: isPreviewOpen ? '#eff6ff' : '#fff',
              color: isPreviewOpen ? '#2563eb' : '#374151',
            }}
          >
            <IconEye />
            Preview
          </button>

          <button
            onClick={onSave}
            style={{
              padding: '6px 12px', borderRadius: 7, cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              border: '1px solid #e5e7eb', background: '#fff', color: '#374151',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            Guardar
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            style={{
              padding: '6px 16px', borderRadius: 7, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, border: 'none',
              background: '#2563eb', color: '#fff',
              boxShadow: '0 1px 3px rgba(37,99,235,0.35)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
          >
            Publicar
          </button>
        </div>
      </header>

      <PublishModal
        isOpen={showPublishModal}
        isPublishing={isPublishing}
        onConfirm={handlePublishConfirm}
        onCancel={() => setShowPublishModal(false)}
      />
    </>
  )
}
