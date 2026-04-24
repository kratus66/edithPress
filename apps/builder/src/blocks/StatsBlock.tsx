import React from 'react'
import type { Fields } from '@measured/puck'

export interface StatsBlockProps {
  stats: Array<{
    value: string
    label: string
    icon: string
  }>
  backgroundColor: string
  textColor: string
  accentColor: string
  layout: 'row' | 'row-with-dividers'
  padding: 'sm' | 'md' | 'lg'
}

const paddingMap: Record<StatsBlockProps['padding'], string> = {
  sm: '24px 24px',
  md: '48px 24px',
  lg: '80px 24px',
}

export const statsBlockFields: Fields<StatsBlockProps> = {
  stats: {
    type: 'array',
    label: 'Estadísticas',
    arrayFields: {
      value: { type: 'text', label: 'Valor (ej: 50+, 200, 15 años)' },
      label: { type: 'text', label: 'Etiqueta (ej: Artesanos)' },
      icon: { type: 'text', label: 'Icono (emoji, opcional)' },
    },
    defaultItemProps: { value: '0', label: 'Nueva estadística', icon: '⭐' },
    getItemSummary: (item: { label?: string; value?: string }) =>
      `${(item.value as string) || ''} ${(item.label as string) || 'Estadística'}`.trim(),
  },
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  accentColor: { type: 'text', label: 'Color del valor/número (hex)' },
  layout: {
    type: 'radio',
    label: 'Estilo',
    options: [
      { label: 'Fila simple', value: 'row' },
      { label: 'Con separadores', value: 'row-with-dividers' },
    ],
  },
  padding: {
    type: 'radio',
    label: 'Espaciado',
    options: [
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
}

export const statsBlockDefaultProps: StatsBlockProps = {
  stats: [
    { value: '50+', label: 'Artesanos', icon: '🎨' },
    { value: '200+', label: 'Productos', icon: '📦' },
    { value: '15', label: 'Años de experiencia', icon: '⭐' },
    { value: '100%', label: 'Hecho a mano', icon: '✋' },
  ],
  backgroundColor: '#f8f4ef',
  textColor: '#1e293b',
  accentColor: '#b45309',
  layout: 'row-with-dividers',
  padding: 'md',
}

export function StatsBlock({
  stats,
  backgroundColor,
  textColor,
  accentColor,
  layout,
  padding,
}: StatsBlockProps) {
  return (
    <section style={{ backgroundColor, padding: paddingMap[padding] }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 32,
      }}>
        {stats.map((stat, i) => (
          <React.Fragment key={i}>
            {layout === 'row-with-dividers' && i > 0 && (
              <div style={{
                width: 1,
                height: 64,
                background: textColor,
                opacity: 0.15,
                flexShrink: 0,
              }} />
            )}
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              {stat.icon && (
                <div style={{ fontSize: '2rem', lineHeight: 1, marginBottom: 8 }}>
                  {stat.icon}
                </div>
              )}
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                lineHeight: 1,
                color: accentColor,
                marginBottom: 6,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: textColor,
                opacity: 0.7,
                lineHeight: 1.3,
              }}>
                {stat.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}
