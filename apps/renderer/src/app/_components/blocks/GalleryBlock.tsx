/**
 * GalleryBlock — Renderer (read-only) — FASE 1 PENDIENTE
 *
 * Este bloque aún no está implementado en el builder (puck-config.tsx).
 * La interfaz de props es provisional: se definirá en conjunto con el
 * agente de Builder cuando se implemente GalleryBlock en FASE 1.
 *
 * El renderer registra el tipo para que el BlockRenderer no falle si
 * llega un bloque de este tipo en el JSON de contenido.
 */
export interface GalleryBlockProps {
  images: Array<{
    src: string
    alt: string
    caption?: string
  }>
  columns: 2 | 3 | 4
}

export function GalleryBlock({ images, columns }: GalleryBlockProps) {
  // En producción no mostramos nada hasta que el bloque esté implementado
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div
      style={{
        margin: '24px 40px',
        padding: '16px',
        border: '2px dashed #f59e0b',
        borderRadius: '8px',
        backgroundColor: '#fffbeb',
        color: '#92400e',
        fontSize: '0.875rem',
      }}
    >
      <strong>GalleryBlock</strong> — pendiente de implementación (FASE 1).
      {' '}{images?.length ?? 0} imágenes · {columns} columnas
    </div>
  )
}
