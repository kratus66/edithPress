import { BuilderEditor } from '@/components/BuilderEditor'

interface BuilderPageProps {
  params: {
    siteId: string
    pageId: string
  }
}

/**
 * Ruta: /builder/[siteId]/[pageId]
 *
 * Server Component: solo resuelve los params y pasa el ID al componente
 * cliente que monta Puck. Puck requiere 'use client' porque depende
 * de eventos del DOM (drag, drop, click).
 */
export default function BuilderPage({ params }: BuilderPageProps) {
  return <BuilderEditor siteId={params.siteId} pageId={params.pageId} />
}

export function generateMetadata({ params }: BuilderPageProps) {
  return {
    title: `Editando página ${params.pageId}`,
  }
}
