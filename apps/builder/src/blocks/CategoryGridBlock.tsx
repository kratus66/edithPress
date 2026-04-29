import React, { useState } from 'react'
import type { Fields } from '@measured/puck'
import { makeCollapsibleRadio, makeCollapsibleColor } from '@/lib/fieldHelpers'

export type HoverEffect = 'none' | 'zoom' | 'zoom-bright' | 'lift' | 'dim' | 'reveal'
export type GradientDirection = 'bottom-top' | 'top-bottom' | 'left-right' | 'right-left' | 'diag-br' | 'diag-bl' | 'diag-tr' | 'diag-tl'
export type TextPosition = 'bottom' | 'center' | 'top'

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
  gradientDirection: GradientDirection
  hoverEffect: HoverEffect
  textPosition: TextPosition
  backgroundColor: string
  textColor: string
  accentColor: string
}

// ── Style maps ────────────────────────────────────────────────────────────────

const aspectRatioMap: Record<CategoryGridBlockProps['cardAspectRatio'], string> = {
  square: '1 / 1',
  portrait: '3 / 4',
  landscape: '4 / 3',
}

const gradientDirectionMap: Record<GradientDirection, string> = {
  'bottom-top': 'to top',
  'top-bottom': 'to bottom',
  'left-right': 'to right',
  'right-left': 'to left',
  'diag-br':    '135deg',
  'diag-bl':    '225deg',
  'diag-tr':    '45deg',
  'diag-tl':    '315deg',
}

const textPositionStyleMap: Record<TextPosition, React.CSSProperties> = {
  bottom: { bottom: 0, left: 0, right: 0, padding: '24px 16px 20px' },
  center: { inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '16px' },
  top:    { top: 0, left: 0, right: 0, padding: '20px 16px 24px' },
}

// ── Fields ────────────────────────────────────────────────────────────────────

export const categoryGridBlockFields: Fields<CategoryGridBlockProps> = {
  eyebrowText: { type: 'text', label: 'Texto eyebrow (ej: NUESTRAS CATEGORÍAS)' },
  title: { type: 'text', label: 'Título de la sección' },
  columns: makeCollapsibleRadio('Columnas', [
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
  ]) as Fields<CategoryGridBlockProps>['columns'],
  categories: {
    type: 'array',
    label: 'Categorías',
    arrayFields: {
      image:       { type: 'text', label: 'URL de imagen' },
      imageAlt:    { type: 'text', label: 'Texto alternativo' },
      name:        { type: 'text', label: 'Nombre de la categoría' },
      description: { type: 'text', label: 'Descripción breve' },
      url:         { type: 'text', label: 'URL de destino' },
    },
    defaultItemProps: {
      image:       'https://placehold.co/400x500/8B6914/ffffff?text=Categoría',
      imageAlt:    'Categoría',
      name:        'Nombre de categoría',
      description: 'Descripción de la categoría',
      url:         '#',
    },
    getItemSummary: (item: { name?: string }) => (item.name as string) || 'Categoría',
  },
  cardAspectRatio: makeCollapsibleRadio('Proporción de imagen', [
    { label: 'Cuadrada', value: 'square' },
    { label: 'Retrato',  value: 'portrait' },
    { label: 'Paisaje',  value: 'landscape' },
  ]) as Fields<CategoryGridBlockProps>['cardAspectRatio'],

  // ── Hover ──────────────────────────────────────────────────────────────────
  hoverEffect: makeCollapsibleRadio('Efecto hover', [
    { label: 'Ninguno',        value: 'none' },
    { label: 'Zoom',           value: 'zoom' },
    { label: 'Zoom + brillo',  value: 'zoom-bright' },
    { label: 'Levantar',       value: 'lift' },
    { label: 'Oscurecer',      value: 'dim' },
    { label: 'Revelar',        value: 'reveal' },
  ]) as Fields<CategoryGridBlockProps>['hoverEffect'],

  // ── Gradiente ──────────────────────────────────────────────────────────────
  overlayColor:      makeCollapsibleColor('Color del gradiente') as Fields<CategoryGridBlockProps>['overlayColor'],
  overlayOpacity:    { type: 'number', label: 'Opacidad del gradiente (0–100)' },
  gradientDirection: makeCollapsibleRadio('Dirección del gradiente', [
    { label: '↑ Abajo → arriba',    value: 'bottom-top' },
    { label: '↓ Arriba → abajo',    value: 'top-bottom' },
    { label: '→ Izq → derecha',     value: 'left-right' },
    { label: '← Der → izquierda',   value: 'right-left' },
    { label: '↘ Diagonal ↘',        value: 'diag-br' },
    { label: '↙ Diagonal ↙',        value: 'diag-bl' },
    { label: '↗ Diagonal ↗',        value: 'diag-tr' },
    { label: '↖ Diagonal ↖',        value: 'diag-tl' },
  ]) as Fields<CategoryGridBlockProps>['gradientDirection'],

  // ── Texto ──────────────────────────────────────────────────────────────────
  textPosition: makeCollapsibleRadio('Posición del texto', [
    { label: 'Abajo',  value: 'bottom' },
    { label: 'Centro', value: 'center' },
    { label: 'Arriba', value: 'top' },
  ]) as Fields<CategoryGridBlockProps>['textPosition'],

  backgroundColor: makeCollapsibleColor('Color de fondo')    as Fields<CategoryGridBlockProps>['backgroundColor'],
  textColor:       makeCollapsibleColor('Color del texto')   as Fields<CategoryGridBlockProps>['textColor'],
  accentColor:     makeCollapsibleColor('Color de acento')   as Fields<CategoryGridBlockProps>['accentColor'],
}

// ── Default props ─────────────────────────────────────────────────────────────

export const categoryGridBlockDefaultProps: CategoryGridBlockProps = {
  eyebrowText: 'NUESTRAS CATEGORÍAS',
  title: 'Explora por tipo de artesanía',
  columns: 4,
  categories: [
    { image: 'https://placehold.co/400x500/8B6914/ffffff?text=Mochilas',  imageAlt: 'Mochilas artesanales',  name: 'Mochilas',  description: 'Tejidas a mano con hilos naturales',       url: '#' },
    { image: 'https://placehold.co/400x500/8B6914/ffffff?text=Cerámica',  imageAlt: 'Cerámica artesanal',   name: 'Cerámica',  description: 'Técnicas ancestrales del Vichada',         url: '#' },
    { image: 'https://placehold.co/400x500/8B6914/ffffff?text=Joyería',   imageAlt: 'Joyería artesanal',    name: 'Joyería',   description: 'Semillas y materiales naturales',          url: '#' },
    { image: 'https://placehold.co/400x500/8B6914/ffffff?text=Textiles',  imageAlt: 'Textiles artesanales', name: 'Textiles',  description: 'Bordados y tejidos únicos',                url: '#' },
  ],
  cardAspectRatio:   'portrait',
  overlayColor:      '#000000',
  overlayOpacity:    60,
  gradientDirection: 'bottom-top',
  hoverEffect:       'zoom',
  textPosition:      'bottom',
  backgroundColor:   '#f5f0e8',
  textColor:         '#1a0f00',
  accentColor:       '#7c3f00',
}

// ── Hover helpers ─────────────────────────────────────────────────────────────

function getImageStyle(effect: HoverEffect, hovered: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', display: 'block',
    transition: 'transform 0.4s ease, filter 0.4s ease',
  }
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

function getOverlayStyle(
  effect: HoverEffect,
  hovered: boolean,
  overlayRgba: string,
  direction: string,
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute', inset: 0,
    transition: 'opacity 0.4s ease',
  }
  if (effect === 'reveal') {
    return {
      ...base,
      opacity: hovered ? 0 : 1,
      background: `linear-gradient(${direction}, ${overlayRgba} 0%, transparent 60%)`,
    }
  }
  return {
    ...base,
    background: `linear-gradient(${direction}, ${overlayRgba} 0%, transparent 60%)`,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

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

  const aspectRatio  = aspectRatioMap[cardAspectRatio]
  const direction    = gradientDirectionMap[gradientDirection]
  const overlayRgba  = `${overlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`
  const textPosStyle = textPositionStyleMap[textPosition]

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
            color: textColor,
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
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
                href={category.url}
                style={{
                  position: 'relative',
                  display: 'block',
                  aspectRatio,
                  overflow: 'hidden',
                  borderRadius: 12,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.4s ease, transform 0.4s ease',
                  boxShadow: hovered
                    ? '0 12px 32px rgba(0,0,0,0.22)'
                    : '0 2px 8px rgba(0,0,0,0.10)',
                  transform: hoverEffect === 'lift' && hovered ? 'translateY(-4px)' : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={category.image}
                  alt={category.imageAlt}
                  style={getImageStyle(hoverEffect, hovered)}
                />

                <div style={getOverlayStyle(hoverEffect, hovered, overlayRgba, direction)} />

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
