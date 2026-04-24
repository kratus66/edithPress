import React from 'react'
import type { Fields } from '@measured/puck'

export interface HeroBlockProps {
  title: string
  subtitle: string
  backgroundColor: string
  backgroundImage: string
  textColor: string
  ctaText: string
  ctaUrl: string
  textAlign: 'left' | 'center' | 'right'
  paddingY: 'sm' | 'md' | 'lg' | 'xl'
  fontFamily: string
  titleFontSize: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  subtitleFontSize: 'sm' | 'md' | 'lg' | 'xl'
}

const paddingMap: Record<HeroBlockProps['paddingY'], string> = {
  sm: '40px',
  md: '80px',
  lg: '120px',
  xl: '160px',
}

const titleFontSizeMap: Record<HeroBlockProps['titleFontSize'], string> = {
  sm: '1.5rem',
  md: '2.25rem',
  lg: 'clamp(2rem, 5vw, 3.5rem)',
  xl: 'clamp(2.5rem, 6vw, 5rem)',
  xxl: 'clamp(3rem, 8vw, 7rem)',
}

const subtitleFontSizeMap: Record<HeroBlockProps['subtitleFontSize'], string> = {
  sm: '0.95rem',
  md: '1.1rem',
  lg: 'clamp(1rem, 2.5vw, 1.25rem)',
  xl: 'clamp(1.2rem, 3vw, 1.6rem)',
}

export const heroBlockFields: Fields<HeroBlockProps> = {
  title: { type: 'text', label: 'Título (H1)' },
  subtitle: { type: 'text', label: 'Subtítulo' },
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  backgroundImage: { type: 'text', label: 'URL imagen de fondo (opcional)' },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  fontFamily: { type: 'text', label: 'Fuente' },
  titleFontSize: {
    type: 'radio',
    label: 'Tamaño del título',
    options: [
      { label: 'S', value: 'sm' },
      { label: 'M', value: 'md' },
      { label: 'L', value: 'lg' },
      { label: 'XL', value: 'xl' },
      { label: 'XXL', value: 'xxl' },
    ],
  },
  subtitleFontSize: {
    type: 'radio',
    label: 'Tamaño del subtítulo',
    options: [
      { label: 'S', value: 'sm' },
      { label: 'M', value: 'md' },
      { label: 'L', value: 'lg' },
      { label: 'XL', value: 'xl' },
    ],
  },
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
  backgroundImage: '',
  textColor: '#ffffff',
  ctaText: 'Contáctanos',
  ctaUrl: '/contacto',
  textAlign: 'center',
  paddingY: 'lg',
  fontFamily: 'inherit',
  titleFontSize: 'lg',
  subtitleFontSize: 'lg',
}

export function HeroBlock({
  title,
  subtitle,
  backgroundColor,
  backgroundImage,
  textColor,
  ctaText,
  ctaUrl,
  textAlign,
  paddingY,
  fontFamily = 'inherit',
  titleFontSize = 'lg',
  subtitleFontSize = 'lg',
}: HeroBlockProps) {
  const padding = paddingMap[paddingY]
  const resolvedTitleSize = titleFontSizeMap[titleFontSize]
  const resolvedSubtitleSize = subtitleFontSizeMap[subtitleFontSize]

  const bgStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }
    : {}

  return (
    <section
      style={{
        backgroundColor,
        color: textColor,
        padding: `${padding} 40px`,
        textAlign,
        fontFamily,
        ...bgStyle,
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: resolvedTitleSize,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '16px',
            fontFamily,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: resolvedSubtitleSize,
            opacity: 0.85,
            marginBottom: '32px',
            fontFamily,
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
              fontFamily,
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
