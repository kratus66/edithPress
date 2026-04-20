'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Puck, type Data } from '@measured/puck'
import '@measured/puck/puck.css'
import { puckConfig } from '@/lib/puck-config'
import { BuilderToolbar } from '@/components/BuilderToolbar'
import { PreviewDrawer } from '@/components/PreviewDrawer'
import { useAutosave } from '@/hooks/useAutosave'
import { builderApi } from '@/lib/api-client'

const EMPTY_DATA: Data = {
  content: [],
  root: { props: {} },
}

const RENDERER_URL =
  process.env.NEXT_PUBLIC_RENDERER_URL ?? 'http://localhost:3003'

const RENDERER_SECRET = process.env.NEXT_PUBLIC_RENDERER_SECRET ?? ''

interface BuilderEditorProps {
  siteId: string
  pageId: string
}

/**
 * BuilderEditor — componente raíz del editor visual.
 *
 * Responsabilidades:
 * - Montar Puck con la configuración de bloques
 * - Delegar el autosave al hook useAutosave (debounce 3s + periódico 30s)
 * - Gestionar el preview drawer lateral
 * - Edición inline del título de la página
 * - Publicación con confirmación
 */
export function BuilderEditor({ siteId, pageId }: BuilderEditorProps) {
  const [data, setData] = useState<Data>(EMPTY_DATA)
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [pageName, setPageName] = useState('Sin nombre')
  const [pageSlug, setPageSlug] = useState('home')
  const [pageStatus, setPageStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [previewOpen, setPreviewOpen] = useState(false)

  // ── Autosave ────────────────────────────────────────────────────────────────
  const { status: saveStatus, lastSaved, saveNow, onChange: autosaveOnChange } = useAutosave({
    pageId,
    onSave: async (dataToSave: Data) => {
      // PUT /api/v1/pages/:pageId/content — guarda el array de bloques de Puck
      await builderApi.put(`/pages/${pageId}/content`, {
        blocks: dataToSave.content,
      })
    },
  })

  // ── Carga del contenido desde la API ───────────────────────────────────────
  useEffect(() => {
    async function loadPage() {
      try {
        const json = await builderApi.get<{
          data: {
            title: string
            slug: string
            status: 'DRAFT' | 'PUBLISHED'
            content: Data['content']
          }
        }>(`/sites/${siteId}/pages/${pageId}`)

        if (json.data.title) setPageName(json.data.title)
        if (json.data.slug) setPageSlug(json.data.slug)
        if (json.data.status) setPageStatus(json.data.status)

        if (Array.isArray(json.data.content) && json.data.content.length > 0) {
          setData({ content: json.data.content, root: { props: {} } })
        }
      } catch {
        // En dev puede no haber API aún — continuar con canvas vacío
      }
    }

    void loadPage()
  }, [siteId, pageId])

  // ── Callback de cambio en el canvas ────────────────────────────────────────
  // Actualiza el estado local Y notifica al hook de autosave
  const handleChange = useCallback(
    (newData: Data) => {
      setData(newData)
      autosaveOnChange(newData)
    },
    [autosaveOnChange]
  )

  // ── Ctrl+S para guardar inmediatamente ────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void saveNow()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveNow])

  // ── Renombrar página (edición inline del título) ───────────────────────────
  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setPageName(newTitle)
      try {
        await builderApi.patch(`/sites/${siteId}/pages/${pageId}`, { title: newTitle })
      } catch {
        // Revertir si falla
        setPageName(pageName)
      }
    },
    [siteId, pageId, pageName]
  )

  // ── Revalidación ISR (best-effort) ────────────────────────────────────────
  // Notifica al renderer que invalide el caché de la página publicada.
  // Los errores se loggean pero nunca bloquean al usuario.
  const revalidatePage = useCallback(
    (revalidateSiteId: string, slug: string): void => {
      fetch(`${RENDERER_URL}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-renderer-secret': RENDERER_SECRET,
        },
        body: JSON.stringify({ siteId: revalidateSiteId, slug }),
      }).catch((err: unknown) => {
        console.error('[Builder] Revalidación ISR fallida (best-effort):', err)
      })
    },
    []
  )

  // ── Publicar ───────────────────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    // Guardar cualquier cambio pendiente antes de publicar
    await saveNow()
    try {
      await builderApi.post(`/sites/${siteId}/pages/${pageId}/publish`)
      setPageStatus('PUBLISHED')

      // Revalidar la caché ISR del renderer de forma asíncrona.
      // La llamada es best-effort: si falla no se bloquea al usuario.
      revalidatePage(siteId, pageSlug)
    } catch {
      // Si falla, el modal muestra el error (lanzar para que el modal lo capture)
      throw new Error('No se pudo publicar la página')
    }
  }, [saveNow, siteId, pageId, pageSlug, revalidatePage])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <BuilderToolbar
        siteId={siteId}
        pageName={pageName}
        pageStatus={pageStatus}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        viewport={viewport}
        onViewportChange={setViewport}
        onPublish={handlePublish}
        onSave={saveNow}
        onPreviewToggle={() => setPreviewOpen((v) => !v)}
        onTitleChange={handleTitleChange}
        isPreviewOpen={previewOpen}
      />

      {/* ── Contenedor principal: editor + drawer ───────────────────────────── */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Canvas Puck — se comprime cuando el preview está abierto */}
        <div className={`flex-1 overflow-hidden transition-all duration-300 ${previewOpen ? 'mr-[50%]' : ''}`}>
          {/*
            Puck gestiona internamente el layout de 3 columnas:
              - Panel izquierdo (bloques disponibles)
              - Canvas central (drag & drop)
              - Panel derecho (propiedades del bloque seleccionado)

            overrides.header = null suprime el header interno de Puck
            porque usamos nuestro propio toolbar arriba.
          */}
          <Puck
            config={puckConfig}
            data={data}
            onChange={handleChange}
            overrides={{
              // eslint-disable-next-line react/display-name
              header: () => <></>,
            }}
          />
        </div>

        {/* Preview Drawer lateral */}
        <PreviewDrawer
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          rendererUrl={RENDERER_URL}
          pageSlug={pageSlug}
        />
      </div>
    </div>
  )
}
