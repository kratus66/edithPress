'use client'

import React, { useCallback, useState } from 'react'

type PreviewViewport = 'desktop' | 'mobile'

interface PreviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  rendererUrl: string
  pageSlug: string
  tenantSlug: string
}

/**
 * Panel lateral de vista previa del renderer.
 *
 * Muestra un iframe apuntando al renderer en modo draft.
 * Layout: ocupa el 50% derecho de la pantalla como sidebar flotante.
 * Opciones: toggle Desktop/Mobile, abrir en nueva pestaña, cerrar.
 */
export function PreviewDrawer({
  isOpen,
  onClose,
  rendererUrl,
  pageSlug,
  tenantSlug,
}: PreviewDrawerProps) {
  const [viewport, setViewport] = useState<PreviewViewport>('desktop')

  // URL del renderer con el subdominio del tenant: {tenantSlug}.localhost:3003/{pageSlug}
  const rendererBase = new URL(rendererUrl)
  const tenantHost = tenantSlug ? `${tenantSlug}.${rendererBase.host}` : rendererBase.host
  const pagePath = !pageSlug || pageSlug === 'home' ? '/' : `/${pageSlug}`
  const previewUrl = `${rendererBase.protocol}//${tenantHost}${pagePath}`

  // Abrir en nueva pestaña vía el proxy seguro del builder
  const handleOpenNewTab = useCallback(() => {
    const url = tenantSlug
      ? `/api/preview?tenantSlug=${tenantSlug}&pageSlug=${pageSlug || 'home'}`
      : previewUrl
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [tenantSlug, pageSlug, previewUrl])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay semitransparente (solo en mobile para no bloquear el editor en desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-black/10 lg:hidden"
        onClick={onClose}
      />

      {/* Panel lateral */}
      <div
        role="complementary"
        aria-label="Vista previa"
        className="fixed inset-y-0 right-0 z-40 flex w-1/2 min-w-[380px] flex-col border-l border-gray-200 bg-gray-900 shadow-2xl"
      >
        {/* Header del drawer */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
          <span className="text-sm font-semibold text-gray-200">Vista previa</span>

          {/* Toggle Desktop / Mobile */}
          <div className="flex overflow-hidden rounded border border-gray-600">
            <button
              onClick={() => setViewport('desktop')}
              title="Escritorio"
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition ${
                viewport === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span aria-hidden="true">💻</span>
              <span>Escritorio</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              title="Móvil"
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition ${
                viewport === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span aria-hidden="true">📱</span>
              <span>Móvil</span>
            </button>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewTab}
              title="Abrir en nueva pestaña"
              className="rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition"
              aria-label="Abrir vista previa en nueva pestaña"
            >
              ↗ Nueva pestaña
            </button>
            <button
              onClick={onClose}
              title="Cerrar vista previa"
              className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white transition"
              aria-label="Cerrar panel de vista previa"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.22 4.22a.75.75 0 011.06 0L8 6.94l2.72-2.72a.75.75 0 111.06 1.06L9.06 8l2.72 2.72a.75.75 0 11-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 01-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 010-1.06z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Área del iframe */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gray-900">
          {viewport === 'desktop' ? (
            <iframe
              key={`desktop-${previewUrl}`}
              src={previewUrl}
              title="Vista previa — escritorio"
              className="h-full w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            // Modo móvil: iframe centrado a 390px con fondo oscuro alrededor
            <div className="relative mx-auto flex h-full items-center justify-center">
              <div
                className="overflow-hidden rounded-2xl shadow-2xl"
                style={{ width: '390px', height: '844px', maxHeight: 'calc(100% - 32px)' }}
              >
                <iframe
                  key={`mobile-${previewUrl}`}
                  src={previewUrl}
                  title="Vista previa — móvil"
                  className="h-full w-full border-0 bg-white"
                  style={{ width: '390px' }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer con URL */}
        <div className="shrink-0 border-t border-gray-700 bg-gray-800 px-4 py-2">
          <p className="truncate text-xs text-gray-500" title={previewUrl}>
            {previewUrl}
          </p>
        </div>
      </div>
    </>
  )
}
