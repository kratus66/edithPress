'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'

export type GalleryHoverEffect      = 'none' | 'zoom' | 'zoom-bright' | 'lift' | 'dim' | 'reveal'
export type GalleryGradientDirection =
  'bottom-top' | 'top-bottom' | 'left-right' | 'right-left' |
  'diag-br' | 'diag-bl' | 'diag-tr' | 'diag-tl'

export interface GalleryOverlayStyles {
  color: string
  opacity: number
  direction: GalleryGradientDirection
}

export interface GalleryTextStyles {
  show: boolean
  position: 'bottom' | 'bottom-center' | 'center' | 'top'
  titleSize: 'sm' | 'md' | 'lg' | 'xl'
  titleWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  titleColor: string
  descSize: 'xs' | 'sm' | 'md'
  descColor: string
}

export interface GalleryImage {
  src: string
  alt: string
  title?: string
  description?: string
  caption?: string        // backwards-compat
  overlayStyles?: Partial<GalleryOverlayStyles>
  textStyles?: Partial<GalleryTextStyles>
}

export interface GalleryBlockProps {
  images: GalleryImage[]
  columns: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  borderRadius?: 'none' | 'sm' | 'md' | 'lg'
  padding?: 'sm' | 'md' | 'lg'
  hoverEffect?: GalleryHoverEffect
  // Legacy global overlay props (ignored when per-image overlayStyles is set)
  overlayColor?: string
  overlayOpacity?: number
  gradientDirection?: GalleryGradientDirection
  showText?: boolean
}

// ── Style maps ────────────────────────────────────────────────────────────────

const gapMap        = { sm: '8px',  md: '16px', lg: '24px' }
const verticalPaddingMap = { sm: 'clamp(24px, 4vw, 32px)', md: 'clamp(32px, 5vw, 48px)', lg: 'clamp(48px, 8vw, 80px)' }
const radiusMap     = { none: '0', sm: '4px', md: '8px', lg: '16px' }
const directionMap: Record<GalleryGradientDirection, string> = {
  'bottom-top': 'to top',   'top-bottom': 'to bottom',
  'left-right': 'to right', 'right-left': 'to left',
  'diag-br': '135deg', 'diag-bl': '225deg', 'diag-tr': '45deg', 'diag-tl': '315deg',
}
const titleSizeMap  = { sm: '0.85rem', md: '1rem',  lg: '1.2rem', xl: '1.5rem' }
const descSizeMap   = { xs: '0.7rem',  sm: '0.78rem', md: '0.9rem' }
const weightMap     = { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 }

// ── Defaults ──────────────────────────────────────────────────────────────────

const defaultOverlay: GalleryOverlayStyles = {
  color: '#000000', opacity: 0, direction: 'bottom-top',
}
const defaultText: GalleryTextStyles = {
  show: false, position: 'bottom',
  titleSize: 'md', titleWeight: 'bold', titleColor: '#ffffff',
  descSize: 'sm', descColor: '#ffffffcc',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getImgStyle(effect: GalleryHoverEffect, hovered: boolean): React.CSSProperties {
  const base: React.CSSProperties = { transition: 'transform 0.4s ease, filter 0.4s ease', objectFit: 'cover' }
  if (!hovered) return base
  switch (effect) {
    case 'zoom':        return { ...base, transform: 'scale(1.07)' }
    case 'zoom-bright': return { ...base, transform: 'scale(1.07)', filter: 'brightness(1.12)' }
    case 'lift':        return { ...base, transform: 'scale(1.04)' }
    case 'dim':         return { ...base, filter: 'brightness(0.7)' }
    case 'reveal':      return { ...base, filter: 'brightness(1.05)' }
    default:            return base
  }
}

function getTextPositionStyle(position: GalleryTextStyles['position']): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute', left: 0, right: 0, pointerEvents: 'none' }
  switch (position) {
    case 'bottom-center': return { ...base, bottom: 0, padding: '20px 14px 14px', textAlign: 'center' }
    case 'center':        return { ...base, top: '50%', padding: '14px', transform: 'translateY(-50%)', textAlign: 'center' }
    case 'top':           return { ...base, top: 0, padding: '14px 14px 20px' }
    default:              return { ...base, bottom: 0, padding: '20px 14px 14px' }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GalleryBlock({
  images,
  columns,
  gap = 'md',
  borderRadius = 'md',
  padding = 'md',
  hoverEffect = 'zoom',
  // Legacy fallbacks
  overlayColor,
  overlayOpacity,
  gradientDirection,
  showText: legacyShowText = false,
}: GalleryBlockProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [hoveredIndex,  setHoveredIndex]  = useState<number | null>(null)

  const openLightbox  = useCallback((i: number) => setLightboxIndex(i), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const goNext = useCallback(() =>
    setLightboxIndex(p => p === null ? null : (p + 1) % images.length), [images.length])
  const goPrev = useCallback(() =>
    setLightboxIndex(p => p === null ? null : (p - 1 + images.length) % images.length), [images.length])

  if (!images?.length) return null

  const radius = radiusMap[borderRadius ?? 'md']

  return (
    <section style={{ padding: `${verticalPaddingMap[padding ?? 'md']} clamp(24px, 6vw, 80px)` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gapMap[gap ?? 'md'],
        }}>
        {images.map((image, index) => {
          const hovered = hoveredIndex === index

          // Merge per-image overlay with legacy global fallback
          const ov: GalleryOverlayStyles = {
            color:     image.overlayStyles?.color     ?? overlayColor     ?? defaultOverlay.color,
            opacity:   image.overlayStyles?.opacity   ?? overlayOpacity   ?? defaultOverlay.opacity,
            direction: image.overlayStyles?.direction ?? gradientDirection ?? defaultOverlay.direction,
          }
          const tx: GalleryTextStyles = { ...defaultText, ...image.textStyles }

          // Legacy: if no per-image textStyles but global showText is on, honour it
          const showText = image.textStyles
            ? tx.show && !!(image.title || image.description || image.caption)
            : legacyShowText && !!(image.title || image.description || image.caption)

          const hasOverlay = ov.opacity > 0
          const overlayHex = `${ov.color}${Math.round((ov.opacity / 100) * 255).toString(16).padStart(2, '0')}`
          const direction  = directionMap[ov.direction]

          return (
            <div
              key={index}
              style={{
                position: 'relative', borderRadius: radius,
                overflow: 'hidden', aspectRatio: '4 / 3',
                cursor: 'zoom-in',
                transition: 'box-shadow 0.4s ease, transform 0.4s ease',
                boxShadow: hovered ? '0 10px 28px rgba(0,0,0,0.20)' : '0 2px 6px rgba(0,0,0,0.08)',
                transform: hoverEffect === 'lift' && hovered ? 'translateY(-4px)' : 'none',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              aria-label={`Ver ${image.alt}`}
              onKeyDown={e => e.key === 'Enter' && openLightbox(index)}
            >
              <Image
                src={image.src}
                alt={image.alt || ''}
                fill
                sizes={`(max-width: 640px) 100vw, ${Math.round(100 / columns)}vw`}
                style={getImgStyle(hoverEffect, hovered)}
              />

              {hasOverlay && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(${direction}, ${overlayHex} 0%, transparent 60%)`,
                  opacity: hoverEffect === 'reveal' ? (hovered ? 0 : 1) : 1,
                  transition: 'opacity 0.4s ease',
                  pointerEvents: 'none',
                }} />
              )}

              {showText && (
                <div style={getTextPositionStyle(tx.position)}>
                  {(image.title) && (
                    <p style={{
                      color: tx.titleColor,
                      fontSize: titleSizeMap[tx.titleSize],
                      fontWeight: weightMap[tx.titleWeight],
                      margin: '0 0 3px', lineHeight: 1.2,
                      textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                    }}>
                      {image.title}
                    </p>
                  )}
                  {(image.description || image.caption) && (
                    <p style={{
                      color: tx.descColor,
                      fontSize: descSizeMap[tx.descSize],
                      margin: 0, lineHeight: 1.4,
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }}>
                      {image.description || image.caption}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog" aria-modal="true" aria-label="Visor de imagen"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          }}
          onClick={closeLightbox}
        >
          <button type="button" onClick={closeLightbox} aria-label="Cerrar visor" style={{
            position: 'absolute', top: 16, right: 20,
            background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: 1,
          }}>×</button>

          {images.length > 1 && (
            <button type="button" onClick={e => { e.stopPropagation(); goPrev() }} aria-label="Imagen anterior" style={{
              position: 'absolute', left: 16, background: 'rgba(255,255,255,0.15)',
              border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer',
              padding: '12px 16px', borderRadius: 4,
            }}>‹</button>
          )}

          <img
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].alt || ''}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '85vh',
              objectFit: 'contain', borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          />

          {images.length > 1 && (
            <button type="button" onClick={e => { e.stopPropagation(); goNext() }} aria-label="Imagen siguiente" style={{
              position: 'absolute', right: 16, background: 'rgba(255,255,255,0.15)',
              border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer',
              padding: '12px 16px', borderRadius: 4,
            }}>›</button>
          )}

          {(images[lightboxIndex].title || images[lightboxIndex].description || images[lightboxIndex].caption) && (
            <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
              {images[lightboxIndex].title && (
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>
                  {images[lightboxIndex].title}
                </p>
              )}
              {(images[lightboxIndex].description || images[lightboxIndex].caption) && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0 }}>
                  {images[lightboxIndex].description || images[lightboxIndex].caption}
                </p>
              )}
            </div>
          )}

          <span style={{ position: 'absolute', bottom: 16, color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </section>
  )
}
