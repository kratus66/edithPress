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
  // NUEVO Sprint 03.2 — props opcionales, defaults neutros para retro-compatibilidad
  eyebrowText?: string
  cta2Text?: string
  cta2Url?: string
  cta2Variant?: 'solid' | 'outline' | 'ghost'
  overlayColor?: string
  overlayOpacity?: number
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
  // NUEVO Sprint 03.2
  eyebrowText: { type: 'text', label: 'Texto eyebrow (sobre el título, opcional)' },
  cta2Text: { type: 'text', label: 'Texto del segundo botón CTA (opcional)' },
  cta2Url: { type: 'text', label: 'URL del segundo botón CTA' },
  cta2Variant: {
    type: 'radio',
    label: 'Estilo del segundo botón',
    options: [
      { label: 'Sólido', value: 'solid' },
      { label: 'Contorno', value: 'outline' },
      { label: 'Ghost', value: 'ghost' },
    ],
  },
  overlayColor: { type: 'text', label: 'Color del overlay sobre imagen (hex)' },
  overlayOpacity: { type: 'number', label: 'Opacidad del overlay (0–100, default 0)' },
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
  // NUEVO Sprint 03.2 — defaults neutros para no romper heroes existentes
  eyebrowText: '',
  cta2Text: '',
  cta2Url: '#',
  cta2Variant: 'outline',
  overlayColor: '#000000',
  overlayOpacity: 0,
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
  // NUEVO Sprint 03.2
  eyebrowText = '',
  cta2Text = '',
  cta2Url = '#',
  cta2Variant = 'outline',
  overlayColor = '#000000',
  overlayOpacity = 0,
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

  // Overlay hex-opacity suffix (0 = invisible = retro-compatible)
  const overlayHex = overlayOpacity > 0
    ? `${overlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`
    : null

  const cta2Style: React.CSSProperties =
    cta2Variant === 'solid'
      ? { backgroundColor: textColor, color: backgroundColor, border: 'none' }
      : cta2Variant === 'outline'
        ? { backgroundColor: 'transparent', color: textColor, border: `2px solid ${textColor}` }
        : { backgroundColor: 'transparent', color: textColor, border: 'none', textDecoration: 'underline' }

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
      {/* Overlay sobre imagen de fondo — no visible cuando overlayOpacity es 0 */}
      {overlayHex && backgroundImage && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: overlayHex,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        {eyebrowText && (
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: 0.75,
            marginBottom: '12px',
            fontFamily,
          }}>
            {eyebrowText}
          </p>
        )}
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
        <div style={{ display: 'flex', gap: 12, justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
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
          {cta2Text && (
            <a
              href={cta2Url}
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '1rem',
                fontFamily,
                ...cta2Style,
              }}
            >
              {cta2Text}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
