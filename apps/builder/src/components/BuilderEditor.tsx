'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Puck, type Data } from '@measured/puck'
import '@measured/puck/puck.css'
import { puckConfig } from '@/lib/puck-config'
import { BuilderToolbar } from '@/components/BuilderToolbar'
import { PreviewDrawer } from '@/components/PreviewDrawer'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { useAutosave } from '@/hooks/useAutosave'
import { builderApi } from '@/lib/api-client'

// Puck override components — defined at module level so references are stable
// (Puck uses overrides.outline / overrides.components as React component classes;
//  a new reference every render would cause unmount+remount of those subtrees)
const OutlineOverride = ({ children }: { children: React.ReactNode }) => (
  <CollapsibleSection title="Outline">{children}</CollapsibleSection>
)

const ComponentsOverride = ({ children }: { children: React.ReactNode }) => (
  <CollapsibleSection title="Componentes" noBorderTop>{children}</CollapsibleSection>
)

// CSS targeting Puck's left sidebar section titles (hashed classes from @measured/puck@0.16.2).
// These hides Puck's native non-interactive headings and replaces them with CollapsibleSection.
// If Puck is upgraded, verify the hashes haven't changed in its dist/index.css.
const PUCK_LEFT_SIDEBAR_CSS = `
  ._PuckLayout-leftSideBar_1g88c_143 ._SidebarSection-title_125qe_12 {
    display: none !important;
  }
  ._PuckLayout-leftSideBar_1g88c_143 ._SidebarSection-content_125qe_24 {
    padding: 0 !important;
  }
`

const EMPTY_DATA: Data = {
  content: [],
  root: { props: {} },
}

const RENDERER_URL = process.env.NEXT_PUBLIC_RENDERER_URL ?? 'http://localhost:3003'

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
function getTenantIdFromCookie(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
  if (!match) return ''
  try {
    const base64 = decodeURIComponent(match[1]).split('.')[1]
    const payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
    return (payload?.tenantId as string) ?? ''
  } catch { return '' }
}

export function BuilderEditor({ siteId, pageId }: BuilderEditorProps) {
  // Bootstrap auth: if admin passes ?token=<jwt> in the URL, persist it for api-client
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('edithpress_access_token', token)
      const url = new URL(window.location.href)
      url.searchParams.delete('token')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  const [data, setData] = useState<Data>(EMPTY_DATA)
  const [isLoaded, setIsLoaded] = useState(false)
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [pageName, setPageName] = useState('Sin nombre')
  const [pageSlug, setPageSlug] = useState('home')
  const [pageStatus, setPageStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [tenantSlug, setTenantSlug] = useState('')

  // Ref siempre actualizado con los datos más recientes del canvas
  const currentDataRef = useRef<Data>(EMPTY_DATA)

  // ── Autosave ────────────────────────────────────────────────────────────────
  const { status: saveStatus, lastSaved, saveNow, onChange: autosaveOnChange } = useAutosave({
    pageId,
    onSave: async (dataToSave: Data | null) => {
      const activeData = dataToSave ?? currentDataRef.current
      const blocks = activeData.content
      const rootProps = activeData.root?.props ?? {}
      await builderApi.put(`/sites/${siteId}/pages/${pageId}/content`, { blocks, rootProps })
    },
  })

  // ── Carga del contenido desde la API ───────────────────────────────────────
  useEffect(() => {
    async function loadPage() {
      try {
        const tenantId = getTenantIdFromCookie()

        const [pageJson, siteJson] = await Promise.all([
          builderApi.get<{ data: { title: string; slug: string; status: 'DRAFT' | 'PUBLISHED'; content: Data['content']; rootProps?: Record<string, unknown> } }>(
            `/sites/${siteId}/pages/${pageId}`
          ),
          builderApi.get<{ data: { tenantId: string; tenant?: { slug: string } } }>(`/sites/${siteId}`).catch(() => null),
        ])

        if (pageJson.data.title) setPageName(pageJson.data.title)
        if (pageJson.data.slug) setPageSlug(pageJson.data.slug)
        if (pageJson.data.status) setPageStatus(pageJson.data.status)
        if (Array.isArray(pageJson.data.content) && pageJson.data.content.length > 0) {
          const rootPropsFromApi = pageJson.data.rootProps ?? {}
          const loaded: Data = { content: pageJson.data.content, root: { props: rootPropsFromApi } }
          setData(loaded)
          currentDataRef.current = loaded
        }

        // Obtener el slug del tenant dueño del sitio
        if (siteJson?.data?.tenant?.slug) {
          setTenantSlug(siteJson.data.tenant.slug)
        } else if (siteJson?.data?.tenantId) {
          const tenantRes = await builderApi.get<{ data: { slug: string } }>(`/tenants/${siteJson.data.tenantId}`).catch(() => null)
          if (tenantRes?.data?.slug) setTenantSlug(tenantRes.data.slug)
        }
      } catch {
        // continuar con canvas vacío en dev
      } finally {
        setIsLoaded(true)
      }
    }

    void loadPage()
  }, [siteId, pageId])

  // ── Callback de cambio en el canvas ────────────────────────────────────────
  // Actualiza el estado local Y notifica al hook de autosave
  const handleChange = useCallback(
    (newData: Data) => {
      setData(newData)
      currentDataRef.current = newData
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
      // Llamada al proxy local (server-side) para evitar CORS con el renderer
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // Memoizar el override del header para evitar re-renders innecesarios en Puck
  const headerOverride = useCallback(() => (
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
  ), [siteId, pageName, pageStatus, saveStatus, lastSaved, viewport, handlePublish, saveNow, handleTitleChange, previewOpen])

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 14, color: '#6b7280' }}>Cargando página...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <style>{PUCK_LEFT_SIDEBAR_CSS}</style>
      <Puck
        config={puckConfig}
        data={data}
        onChange={handleChange}
        overrides={{
          header: headerOverride,
          outline: OutlineOverride,
          components: ComponentsOverride,
        }}
      />

      <PreviewDrawer
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        rendererUrl={RENDERER_URL}
        pageSlug={pageSlug}
        tenantSlug={tenantSlug}
      />
    </div>
  )
}
