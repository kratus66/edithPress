'use client'

import { useState } from 'react'
import Image from 'next/image'
import { sanitizeUrl } from '../../../lib/sanitize-url'

export type HoverEffect       = 'none' | 'zoom' | 'zoom-bright' | 'lift' | 'dim' | 'reveal'
export type GradientDirection = 'bottom-top' | 'top-bottom' | 'left-right' | 'right-left' | 'diag-br' | 'diag-bl' | 'diag-tr' | 'diag-tl'
export type TextPosition      = 'bottom' | 'center' | 'top'

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
  gradientDirection?: GradientDirection
  hoverEffect?: HoverEffect
  textPosition?: TextPosition
  backgroundColor: string
  textColor: string
  accentColor: string
}

const aspectRatioMap: Record<CategoryGridBlockProps['cardAspectRatio'], string> = {
  square: '1 / 1', portrait: '3 / 4', landscape: '4 / 3',
}

const gradientDirectionMap: Record<GradientDirection, string> = {
  'bottom-top': 'to top',   'top-bottom': 'to bottom',
  'left-right': 'to right', 'right-left': 'to left',
  'diag-br': '135deg', 'diag-bl': '225deg', 'diag-tr': '45deg', 'diag-tl': '315deg',
}

const textPositionStyleMap: Record<TextPosition, React.CSSProperties> = {
  bottom: { bottom: 0, left: 0, right: 0, padding: '24px 16px 20px' },
  center: { inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' },
  top:    { top: 0, left: 0, right: 0, padding: '20px 16px 24px' },
}

function getImageStyle(effect: HoverEffect, hovered: boolean): React.CSSProperties {
  const base: React.CSSProperties = { transition: 'transform 0.4s ease, filter 0.4s ease', objectFit: 'cover' }
  if (!hovered) return base
  switch (effect) {
    case 'zoom':        return { ...base, transform: 'scale(1.07)' }
    case 'zoom-bright': return { ...base, transform: 'scale(1.07)', filter: 'brightness(1.12)' }
    case 'lift':        return { ...base, transform: 'scale(1.04) translateY(-5px)' }
    case 'dim':         return { ...base, filter: 'brightness(0.7)' }
    case 'reveal':      return { ...base, filter: 'brightness(1.05)' }
    default:            return base
  }
}

export function CategoryGridBlock({
  eyebrowText,
  title,
  columns,
  categories,
  cardAspectRatio,
  overlayColor,
  overlayOpacity,
  gradientDirection = 'bottom-top',
  hoverEffect = 'zoom',
  textPosition = 'bottom',
  backgroundColor,
  textColor,
  accentColor,
}: CategoryGridBlockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const clampedOpacity = Math.min(100, Math.max(0, overlayOpacity ?? 0))
  const overlayRgba    = `${overlayColor}${Math.round((clampedOpacity / 100) * 255).toString(16).padStart(2, '0')}`
  const aspectRatio    = aspectRatioMap[cardAspectRatio]
  const direction      = gradientDirectionMap[gradientDirection]
  const textPosStyle   = textPositionStyleMap[textPosition]

  return (
    <section style={{ backgroundColor, padding: '64px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {eyebrowText && (
          <p style={{
            color: accentColor, fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            textAlign: 'center', marginBottom: 12,
          }}>
            {eyebrowText}
          </p>
        )}
        {title && (
          <h2 style={{
            color: textColor, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 700, textAlign: 'center', marginBottom: 48,
          }}>
            {title}
          </h2>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
        }}>
          {categories.map((category, i) => {
            const hovered = hoveredIndex === i
            return (
              <a
                key={i}
                href={sanitizeUrl(category.url)}
                style={{
                  position: 'relative', display: 'block',
                  aspectRatio, overflow: 'hidden', borderRadius: 12,
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'box-shadow 0.4s ease, transform 0.4s ease',
                  boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.22)' : '0 2px 8px rgba(0,0,0,0.10)',
                  transform: hoverEffect === 'lift' && hovered ? 'translateY(-4px)' : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes={`(max-width: 640px) 100vw, ${Math.round(100 / columns)}vw`}
                  style={getImageStyle(hoverEffect, hovered)}
                />

                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(${direction}, ${overlayRgba} 0%, transparent 60%)`,
                  opacity: hoverEffect === 'reveal' ? (hovered ? 0 : 1) : 1,
                  transition: 'opacity 0.4s ease',
                  pointerEvents: 'none',
                }} />

                {/* Text overlay */}
                <div style={{ position: 'absolute', ...textPosStyle }}>
                  <h3 style={{
                    color: '#ffffff', fontSize: '1.1rem', fontWeight: 700,
                    margin: '0 0 4px', lineHeight: 1.2,
                    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }}>
                    {category.name}
                  </h3>
                  {category.description && (
                    <p style={{
                      color: 'rgba(255,255,255,0.88)', fontSize: '0.8rem',
                      margin: 0, lineHeight: 1.4,
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}>
                      {category.description}
                    </p>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
