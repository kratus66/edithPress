/**
 * HeroBlock — Renderer (read-only)
 *
 * Props idénticas al builder (apps/builder/src/blocks/HeroBlock.tsx).
 * Sprint 03.2: añadido soporte para eyebrowText, cta2, overlay y backgroundImage.
 * Todos los hrefs pasan por sanitizeUrl().
 * La imagen de fondo usa next/image con fill para evitar <img> directa.
 */
import Image from 'next/image'
import { sanitizeUrl } from '../../../lib/sanitize-url'

export interface HeroBlockProps {
  title: string
  subtitle: string
  backgroundColor: string
  backgroundImage?: string
  textColor: string
  ctaText: string
  ctaUrl: string
  textAlign: 'left' | 'center' | 'right'
  paddingY: 'sm' | 'md' | 'lg' | 'xl'
  fontFamily?: string
  titleFontSize?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  subtitleFontSize?: 'sm' | 'md' | 'lg' | 'xl'
  // Sprint 03.2 — opcionales, defaults neutros para retro-compatibilidad
  eyebrowText?: string
  cta2Text?: string
  cta2Url?: string
  cta2Variant?: 'solid' | 'outline' | 'ghost'
  overlayColor?: string
  overlayOpacity?: number
}

const paddingMap: Record<NonNullable<HeroBlockProps['paddingY']>, string> = {
  sm: '40px',
  md: '80px',
  lg: '120px',
  xl: '160px',
}

const titleFontSizeMap: Record<NonNullable<HeroBlockProps['titleFontSize']>, string> = {
  sm: '1.5rem',
  md: '2.25rem',
  lg: 'clamp(2rem, 5vw, 3.5rem)',
  xl: 'clamp(2.5rem, 6vw, 5rem)',
  xxl: 'clamp(3rem, 8vw, 7rem)',
}

const subtitleFontSizeMap: Record<NonNullable<HeroBlockProps['subtitleFontSize']>, string> = {
  sm: '0.95rem',
  md: '1.1rem',
  lg: 'clamp(1rem, 2.5vw, 1.25rem)',
  xl: 'clamp(1.2rem, 3vw, 1.6rem)',
}

export function HeroBlock({
  title,
  subtitle,
  backgroundColor,
  backgroundImage = '',
  textColor,
  ctaText,
  ctaUrl,
  textAlign,
  paddingY,
  fontFamily = 'inherit',
  titleFontSize = 'lg',
  subtitleFontSize = 'lg',
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

  // Clampear opacidad entre 0 y 100
  const clampedOpacity = Math.min(100, Math.max(0, overlayOpacity ?? 0))
  const overlayHex = clampedOpacity > 0
    ? `${overlayColor}${Math.round((clampedOpacity / 100) * 255).toString(16).padStart(2, '0')}`
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Imagen de fondo con next/image */}
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
      )}

      {/* Overlay sobre la imagen de fondo */}
      {overlayHex && backgroundImage && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: overlayHex,
          pointerEvents: 'none',
        }} />
      )}

      {/* Contenido — z-index para quedar sobre imagen y overlay */}
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
          flexWrap: 'wrap',
        }}>
          {ctaText && (
            <a
              href={sanitizeUrl(ctaUrl)}
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
              href={sanitizeUrl(cta2Url ?? '#')}
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '1rem',
                fontFamily,
                textDecoration: 'none',
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
