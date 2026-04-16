'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Puck, type Data } from '@measured/puck'
import '@measured/puck/puck.css'
import { puckConfig } from '@/lib/puck-config'
import { BuilderToolbar } from '@/components/BuilderToolbar'
import { builderApi } from '@/lib/api-client'

const EMPTY_DATA: Data = {
  content: [],
  root: { props: {} },
}

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

interface BuilderEditorProps {
  siteId: string
  pageId: string
}

/**
 * BuilderEditor — componente raíz del editor visual.
 *
 * Responsabilidades:
 * - Montar Puck con la configuración de bloques
 * - Gestionar el estado del guardado (idle → unsaved → saving → saved/error)
 * - Auto-save con debounce de 3s tras el último cambio
 * - Guardar antes de salir (beforeunload)
 */
export function BuilderEditor({ siteId, pageId }: BuilderEditorProps) {
  const [data, setData] = useState<Data>(EMPTY_DATA)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [pageName, setPageName] = useState('Sin nombre')
  const [pageSlug, setPageSlug] = useState('home')
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasUnsavedRef = useRef(false)

  // ── Carga del contenido desde la API ───────────────────────────────────────
  useEffect(() => {
    async function loadPage() {
      try {
        // GET /api/v1/sites/:siteId/pages/:pageId — incluye el campo content (bloques)
        const json = await builderApi.get<{
          data: { title: string; slug: string; content: Data['content'] }
        }>(`/sites/${siteId}/pages/${pageId}`)

        if (json.data.title) setPageName(json.data.title)
        if (json.data.slug) setPageSlug(json.data.slug)

        // Convertir el array de bloques al formato que Puck espera: { content, root }
        if (Array.isArray(json.data.content) && json.data.content.length > 0) {
          setData({ content: json.data.content, root: { props: {} } })
        }
      } catch {
        // En dev puede no haber API aún — continuar con canvas vacío
      }
    }

    async function loadTenant() {
      try {
        // GET /api/v1/tenants/me — devuelve el tenant del usuario autenticado
        const json = await builderApi.get<{ data: { slug: string } }>('/tenants/me')
        if (json.data.slug) setTenantSlug(json.data.slug)
      } catch {
        // Sin tenant slug no se mostrará el botón de preview
      }
    }

    void loadPage()
    void loadTenant()
  }, [siteId, pageId])

  // ── Guardado ───────────────────────────────────────────────────────────────
  const save = useCallback(
    async (dataToSave: Data) => {
      setSaveStatus('saving')
      try {
        // PUT /api/v1/pages/:pageId/content — guarda el array de bloques de Puck.
        // El módulo content crea automáticamente una PageVersion del estado anterior.
        // Se envía dataToSave.content (el array de bloques) como { blocks }.
        await builderApi.put(`/pages/${pageId}/content`, {
          blocks: dataToSave.content,
        })
        setSaveStatus('saved')
        hasUnsavedRef.current = false
        // Volver a 'idle' tras 3s para no distraer al usuario
        setTimeout(() => setSaveStatus('idle'), 3000)
      } catch {
        setSaveStatus('error')
      }
    },
    [pageId]
  )

  // ── Callback de cambio en el canvas (auto-save con debounce 3s) ────────────
  const handleChange = useCallback(
    (newData: Data) => {
      setData(newData)
      setSaveStatus('unsaved')
      hasUnsavedRef.current = true

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => save(newData), 3000)
    },
    [save]
  )

  // ── Guardar con Ctrl+S ─────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (debounceRef.current) clearTimeout(debounceRef.current)
        save(data)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [data, save])

  // ── Advertencia antes de salir con cambios sin guardar ────────────────────
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // ── Publicar ───────────────────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    // Guardar cualquier cambio pendiente antes de publicar
    if (hasUnsavedRef.current) await save(data)
    try {
      // POST /api/v1/sites/:siteId/pages/:pageId/publish
      // Valida que la página tenga contenido (la API lanza 400 si está vacía)
      await builderApi.post(`/sites/${siteId}/pages/${pageId}/publish`)
    } catch {
      // TODO: mostrar toast de error cuando Sonner esté integrado (FASE 1)
    }
  }, [data, save, siteId, pageId])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <BuilderToolbar
        siteId={siteId}
        pageName={pageName}
        saveStatus={saveStatus}
        viewport={viewport}
        onViewportChange={setViewport}
        onPublish={handlePublish}
        onSave={() => save(data)}
        tenantSlug={tenantSlug}
        pageSlug={pageSlug}
      />

      {/* ── Canvas Puck ──────────────────────────────────────────────────────── */}
      {/*
        Puck gestiona internamente el layout de 3 columnas:
          - Panel izquierdo (bloques disponibles)
          - Canvas central (drag & drop)
          - Panel derecho (propiedades del bloque seleccionado)

        overrides.header = null suprime el header interno de Puck
        porque nosotros tenemos el toolbar propio arriba.
      */}
      <div className="flex-1 overflow-hidden">
        <Puck
          config={puckConfig}
          data={data}
          onChange={handleChange}
          overrides={{
            header: () => null,
          }}
        />
      </div>
    </div>
  )
}
