/**
 * SplitContentBlock — Renderer (read-only)
 *
 * Versión del renderer para el bloque de contenido dividido.
 * Usa next/image para las imágenes del collage y sanitizeUrl() para el CTA.
 */
import Image from 'next/image'
import { sanitizeUrl } from '../../../lib/sanitize-url'

export interface SplitContentBlockProps {
  eyebrowText: string
  title: string
  body: string
  imagePosition: 'left' | 'right'
  imageLayout: 'single' | 'collage'
  images: Array<{ src: string; alt: string }>
  stats: Array<{ value: string; label: string }>
  ctaText: string
  ctaUrl: string
  ctaVariant: 'solid' | 'outline' | 'ghost' | 'none'
  backgroundColor: string
  textColor: string
  accentColor: string
  gap: 'sm' | 'md' | 'lg'
}

const gapMap: Record<SplitContentBlockProps['gap'], string> = {
  sm: '32px',
  md: '64px',
  lg: '96px',
}

function CtaButton({
  ctaText,
  ctaUrl,
  ctaVariant,
  accentColor,
}: {
  ctaText: string
  ctaUrl: string
  ctaVariant: SplitContentBlockProps['ctaVariant']
  accentColor: string
}) {
  if (ctaVariant === 'none' || !ctaText) return null

  const baseStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 32px',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: '0.95rem',
    textDecoration: 'none',
    cursor: 'pointer',
  }

  const variantStyle: React.CSSProperties =
    ctaVariant === 'solid'
      ? { backgroundColor: accentColor, color: '#ffffff', border: 'none' }
      : ctaVariant === 'outline'
        ? { backgroundColor: 'transparent', color: accentColor, border: `2px solid ${accentColor}` }
        : { backgroundColor: 'transparent', color: accentColor, border: 'none', textDecoration: 'underline' }

  return (
    <a href={sanitizeUrl(ctaUrl)} style={{ ...baseStyle, ...variantStyle }}>
      {ctaText}
    </a>
  )
}

export function SplitContentBlock({
  eyebrowText,
  title,
  body,
  imagePosition,
  imageLayout,
  images,
  stats,
  ctaText,
  ctaUrl,
  ctaVariant,
  backgroundColor,
  textColor,
  accentColor,
  gap,
}: SplitContentBlockProps) {
  const columnGap = gapMap[gap]
  const paragraphs = body.split('\n').filter(Boolean)
  const [mainImage, ...collageImages] = images

  const imageColumn = (
    <div style={{ flex: '0 0 45%', maxWidth: '45%' }}>
      {imageLayout === 'single' || !collageImages.length ? (
        /* Single image — contenedor con height fijo para fill */
        <div style={{ position: 'relative', width: '100%', height: 400, borderRadius: 12, overflow: 'hidden' }}>
          <Image
            src={mainImage?.src ?? ''}
            alt={mainImage?.alt ?? ''}
            fill
            sizes="45vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        /* Collage: imagen 0 en la parte superior (altura 280px), imágenes 1 y 2 en fila (altura 180px) */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {/* Imagen principal — ocupa toda la anchura del collage */}
          <div style={{ gridColumn: '1 / -1', position: 'relative', height: 280, borderRadius: 8, overflow: 'hidden' }}>
            <Image
              src={mainImage?.src ?? ''}
              alt={mainImage?.alt ?? ''}
              fill
              sizes="45vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          {/* Imágenes secundarias */}
          {collageImages.slice(0, 2).map((img, i) => (
            <div key={i} style={{ position: 'relative', height: 180, borderRadius: 8, overflow: 'hidden' }}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="22vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const contentColumn = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {eyebrowText && (
        <p style={{
          color: accentColor,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          {eyebrowText}
        </p>
      )}
      {title && (
        <h2 style={{
          color: textColor,
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 20,
        }}>
          {title}
        </h2>
      )}
      {paragraphs.map((p, i) => (
        <p key={i} style={{
          color: textColor,
          opacity: 0.8,
          fontSize: '1rem',
          lineHeight: 1.7,
          marginBottom: 12,
        }}>
          {p}
        </p>
      ))}

      {stats.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px 24px',
          marginTop: 24,
          marginBottom: 32,
        }}>
          {stats.map((stat, i) => (
            <div key={i}>
              <p style={{
                color: accentColor,
                fontSize: '1.75rem',
                fontWeight: 800,
                lineHeight: 1,
                margin: '0 0 4px',
              }}>
                {stat.value}
              </p>
              <p style={{
                color: textColor,
                opacity: 0.65,
                fontSize: '0.85rem',
                margin: 0,
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <CtaButton ctaText={ctaText} ctaUrl={ctaUrl} ctaVariant={ctaVariant} accentColor={accentColor} />
    </div>
  )

  return (
    <section style={{ backgroundColor, padding: 'clamp(48px, 8vw, 80px) clamp(24px, 6vw, 80px)' }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: imagePosition === 'left' ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: columnGap,
        flexWrap: 'wrap',
      }}>
        {imageColumn}
        {contentColumn}
      </div>
    </section>
  )
}
