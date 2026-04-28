'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { builderApi } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MediaItem {
  id: string
  url: string
  filename: string
  mimeType: string
}

interface MediaListResponse {
  data: MediaItem[]
}

export interface MediaPickerProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface MediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

function MediaModal({ isOpen, onClose, onSelect }: MediaModalProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadMedia = useCallback(() => {
    setLoading(true)
    setError(null)
    builderApi
      .get<MediaListResponse>('/media?type=image&limit=24')
      .then((res) => { setItems(res.data ?? []) })
      .catch(() => { setError('No se pudo cargar la biblioteca de medios.') })
      .finally(() => { setLoading(false) })
  }, [])

  // Load media when modal opens
  useEffect(() => {
    if (!isOpen) return
    loadMedia()
  }, [isOpen, loadMedia])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      await builderApi.upload('/media/upload', formData)
      loadMedia()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir la imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Biblioteca de medios"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '680px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header del modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
            Biblioteca de medios
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                padding: '6px 14px',
                backgroundColor: uploading ? '#9ca3af' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              {uploading ? 'Subiendo...' : '+ Subir imagen'}
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar biblioteca"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: '#6b7280',
                lineHeight: 1,
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              ×
            </button>
          </div>
        </div>
        {uploadError && (
          <div style={{ padding: '8px 20px', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.8125rem' }}>
            {uploadError}
          </div>
        )}

        {/* Contenido */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                color: '#6b7280',
                fontSize: '0.9375rem',
              }}
            >
              Cargando imagenes...
            </div>
          )}

          {error && !loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                color: '#dc2626',
                fontSize: '0.9375rem',
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                color: '#9ca3af',
                fontSize: '0.9375rem',
              }}
            >
              No hay imagenes en la biblioteca.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
              }}
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.url)
                    onClose()
                  }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  title={item.filename}
                  aria-label={`Seleccionar ${item.filename}`}
                  style={{
                    border: hoveredId === item.id ? '2px solid #2563eb' : '2px solid transparent',
                    padding: 0,
                    cursor: 'pointer',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#f3f4f6',
                    display: 'block',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.filename}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#374151',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MediaPicker ───────────────────────────────────────────────────────────────

/**
 * MediaPicker — campo de seleccion de imagen para el panel de propiedades de Puck.
 *
 * Muestra un input de texto editable para URL manual y un boton que abre
 * el modal de la biblioteca de medios del tenant.
 */
export function MediaPicker({ value, onChange, label }: MediaPickerProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])

  const handleSelect = useCallback(
    (url: string) => {
      onChange(url)
    },
    [onChange]
  )

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {label && (
          <label
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#374151',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            style={{
              flex: 1,
              padding: '7px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#111827',
              outline: 'none',
              minWidth: 0,
            }}
          />
          <button
            type="button"
            onClick={openModal}
            style={{
              flexShrink: 0,
              padding: '7px 11px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: '#374151',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Biblioteca
          </button>
        </div>

        {/* Preview de la imagen seleccionada */}
        {value && (
          <img
            src={value}
            alt="Vista previa"
            style={{
              width: '100%',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              marginTop: '2px',
            }}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
      </div>

      <MediaModal isOpen={modalOpen} onClose={closeModal} onSelect={handleSelect} />
    </>
  )
}
