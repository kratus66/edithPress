import React from 'react'
import type { Fields } from '@measured/puck'

export interface HeroBlockProps {
  title: string
  subtitle: string
  backgroundColor: string
  textColor: string
  ctaText: string
  ctaUrl: string
  textAlign: 'left' | 'center' | 'right'
  paddingY: 'sm' | 'md' | 'lg' | 'xl'
}

const paddingMap: Record<HeroBlockProps['paddingY'], string> = {
  sm: '40px',
  md: '80px',
  lg: '120px',
  xl: '160px',
}

export const heroBlockFields: Fields<HeroBlockProps> = {
  title: { type: 'text', label: 'Título (H1)' },
  subtitle: { type: 'text', label: 'Subtítulo' },
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  ctaText: { type: 'text', label: 'Texto del botón CTA' },
  ctaUrl: { type: 'text', label: 'URL del botón CTA' },
  textAlign: {
    type: 'radio',
    label: 'Alineación del texto',
    options: [
      { label: 'Izquierda', value: 'left' },
      { label: 'Centro', value: 'center' },
      { label: 'Derecha', value: 'right' },
    ],
  },
  paddingY: {
    type: 'radio',
    label: 'Tamaño del hero',
    options: [
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
      { label: 'Extra grande', value: 'xl' },
    ],
  },
}

export const heroBlockDefaultProps: HeroBlockProps = {
  title: 'Bienvenido a mi negocio',
  subtitle: 'Ofrecemos los mejores servicios de la región',
  backgroundColor: '#1a1a2e',
  textColor: '#ffffff',
  ctaText: 'Contáctanos',
  ctaUrl: '/contacto',
  textAlign: 'center',
  paddingY: 'lg',
}

export function HeroBlock({
  title,
  subtitle,
  backgroundColor,
  textColor,
  ctaText,
  ctaUrl,
  textAlign,
  paddingY,
}: HeroBlockProps) {
  const padding = paddingMap[paddingY]

  return (
    <section
      style={{
        backgroundColor,
        color: textColor,
        padding: `${padding} 40px`,
        textAlign,
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '16px',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            opacity: 0.85,
            marginBottom: '32px',
          }}
        >
          {subtitle}
        </p>
        {ctaText && (
          <a
            href={ctaUrl}
            style={{
              display: 'inline-block',
              backgroundColor: textColor,
              color: backgroundColor,
              padding: '12px 32px',
              borderRadius: '6px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
