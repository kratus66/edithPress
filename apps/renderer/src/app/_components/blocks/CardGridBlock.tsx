/**
 * CardGridBlock — Renderer (read-only) — FASE 1 PENDIENTE
 *
 * Este bloque aún no está implementado en el builder (puck-config.tsx).
 * La interfaz de props es provisional: se definirá en conjunto con el
 * agente de Builder cuando se implemente CardGridBlock en FASE 1.
 */
export interface CardGridBlockProps {
  title?: string
  cards: Array<{
    title: string
    description?: string
    image?: string
    linkUrl?: string
  }>
  columns: 2 | 3 | 4
}

export function CardGridBlock({ title, cards, columns }: CardGridBlockProps) {
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
      <strong>CardGridBlock</strong> — pendiente de implementación (FASE 1).
      {title && <> · Título: "{title}"</>}
      {' '}· {cards?.length ?? 0} tarjetas · {columns} columnas
    </div>
  )
}
