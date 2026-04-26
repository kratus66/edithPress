/**
 * CategoryGridBlock — Renderer (read-only)
 *
 * Versión del renderer para el bloque de grid de categorías.
 * Usa next/image para optimización y sanitizeUrl() para todos los hrefs.
 */
import Image from 'next/image'
import { sanitizeUrl } from '../../../lib/sanitize-url'

export interface CategoryGridBlockProps {
  eyebrowText: string
  title: string
  columns: 2 | 3 | 4
  categories: Array<{
    image: string
    imageAlt: string
    name: string
    description: string
    url: string
  }>
  cardAspectRatio: 'square' | 'portrait' | 'landscape'
  overlayColor: string
  overlayOpacity: number
  backgroundColor: string
  textColor: string
  accentColor: string
}

const aspectRatioPaddingMap: Record<CategoryGridBlockProps['cardAspectRatio'], string> = {
  square: '100%',
  portrait: '125%',    // 4/5
  landscape: '56.25%', // 16/9
}

export function CategoryGridBlock({
  eyebrowText,
  title,
  columns,
  categories,
  cardAspectRatio,
  overlayColor,
  overlayOpacity,
  backgroundColor,
  textColor,
  accentColor,
}: CategoryGridBlockProps) {
  const clampedOpacity = Math.min(100, Math.max(0, overlayOpacity ?? 0))
  const overlayRgba = `${overlayColor}${Math.round((clampedOpacity / 100) * 255).toString(16).padStart(2, '0')}`
  const paddingBottom = aspectRatioPaddingMap[cardAspectRatio]

  return (
    <section style={{ backgroundColor, padding: '64px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {eyebrowText && (
          <p style={{
            color: accentColor,
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: 12,
          }}>
            {eyebrowText}
          </p>
        )}
        {title && (
          <h2 style={{
            color: textColor,
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 48,
          }}>
            {title}
          </h2>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
        }}>
          {categories.map((category, i) => (
            <a
              key={i}
              href={sanitizeUrl(category.url)}
              style={{
                display: 'block',
                borderRadius: 12,
                overflow: 'hidden',
                textDecoration: 'none',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Aspect-ratio wrapper usando padding-bottom trick para SSR */}
              <div style={{ position: 'relative', paddingBottom, width: '100%', overflow: 'hidden' }}>
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes={`(max-width: 640px) 100vw, ${Math.round(100 / columns)}vw`}
                  style={{ objectFit: 'cover' }}
                />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(to top, ${overlayRgba} 0%, transparent 60%)`,
                  pointerEvents: 'none',
                }} />
                {/* Text overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '24px 16px 20px',
                }}>
                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    margin: '0 0 4px',
                    lineHeight: 1.2,
                  }}>
                    {category.name}
                  </h3>
                  {category.description && (
                    <p style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.8rem',
                      margin: 0,
                      lineHeight: 1.4,
                    }}>
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
