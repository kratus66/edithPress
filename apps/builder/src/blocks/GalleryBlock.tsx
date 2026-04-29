'use client'

import React, { useState, useCallback } from 'react'
import type { Fields } from '@measured/puck'
import { ColorPickerField } from '@/components/ColorPickerField'
import {
  makeCollapsibleRadio,
  makeCollapsibleGroup,
  renderRadioOptions,
} from '@/lib/fieldHelpers'

export type GalleryHoverEffect     = 'none' | 'zoom' | 'zoom-bright' | 'lift' | 'dim' | 'reveal'
export type GalleryGradientDirection =
  'bottom-top' | 'top-bottom' | 'left-right' | 'right-left' |
  'diag-br' | 'diag-bl' | 'diag-tr' | 'diag-tl'

// ── Per-image style interfaces ─────────────────────────────────────────────────

export interface GalleryOverlayStyles {
  color: string
  opacity: number
  direction: GalleryGradientDirection
}

export interface GalleryTextStyles {
  position: 'bottom' | 'bottom-center' | 'center' | 'top'
  titleSize: 'sm' | 'md' | 'lg' | 'xl'
  titleWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  titleColor: string
  titleLetterSpacing: 'tight' | 'normal' | 'wide'
  descSize: 'xs' | 'sm' | 'md'
  descWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  descColor: string
}

export interface GalleryImage {
  src: string
  alt: string
  title: string
  description: string
  overlayStyles: GalleryOverlayStyles
  textStyles: GalleryTextStyles
}

export interface GalleryBlockProps {
  images: GalleryImage[]
  columns: 2 | 3 | 4
  gap: 'sm' | 'md' | 'lg'
  borderRadius: 'none' | 'sm' | 'md' | 'lg'
  padding: 'sm' | 'md' | 'lg'
  hoverEffect: GalleryHoverEffect
}

// ── Style maps ────────────────────────────────────────────────────────────────

const gapMap: Record<GalleryBlockProps['gap'], string> = {
  sm: '8px', md: '16px', lg: '24px',
}
const paddingMap: Record<GalleryBlockProps['padding'], string> = {
  sm: '16px 24px', md: '32px 40px', lg: '64px 40px',
}
const borderRadiusMap: Record<GalleryBlockProps['borderRadius'], string> = {
  none: '0', sm: '4px', md: '8px', lg: '16px',
}
const gradientDirectionMap: Record<GalleryGradientDirection, string> = {
  'bottom-top': 'to top',   'top-bottom': 'to bottom',
  'left-right': 'to right', 'right-left': 'to left',
  'diag-br': '135deg', 'diag-bl': '225deg', 'diag-tr': '45deg', 'diag-tl': '315deg',
}
const titleSizeMap: Record<GalleryTextStyles['titleSize'], string> = {
  sm: '0.85rem', md: '1rem', lg: '1.2rem', xl: '1.5rem',
}
const descSizeMap: Record<GalleryTextStyles['descSize'], string> = {
  xs: '0.7rem', sm: '0.78rem', md: '0.9rem',
}
const weightMap: Record<GalleryTextStyles['titleWeight'], number> = {
  light: 300, regular: 400, medium: 500, semibold: 600, bold: 700,
}
const letterSpacingMap: Record<GalleryTextStyles['titleLetterSpacing'], string> = {
  tight: '-0.02em', normal: '0em', wide: '0.06em',
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const defaultOverlayStyles: GalleryOverlayStyles = {
  color: '#000000',
  opacity: 50,
  direction: 'bottom-top',
}

const defaultTextStyles: GalleryTextStyles = {
  position: 'bottom',
  titleSize: 'md',
  titleWeight: 'bold',
  titleColor: '#ffffff',
  titleLetterSpacing: 'normal',
  descSize: 'sm',
  descWeight: 'regular',
  descColor: '#ffffffcc',
}

// ── Slider helper ─────────────────────────────────────────────────────────────

function RangeField({ value, onChange, min = 0, max = 100, unit = '%' }: {
  value: unknown; onChange: (v: number) => void; min?: number; max?: number; unit?: string
}) {
  const num = Number(value) || 0
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        type="range" min={min} max={max} value={num}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#2563eb' }}
      />
      <span style={{ fontSize: 12, color: '#64748b', minWidth: 36, textAlign: 'right' }}>
        {num}{unit}
      </span>
    </div>
  )
}

// ── Summary helpers ───────────────────────────────────────────────────────────

const directionLabel: Record<string, string> = {
  'bottom-top': 'Abajo → arriba', 'top-bottom': 'Arriba → abajo',
  'left-right': 'Izq → derecha',  'right-left': 'Der → izquierda',
  'diag-br': 'Diagonal ↘', 'diag-bl': 'Diagonal ↙',
  'diag-tr': 'Diagonal ↗', 'diag-tl': 'Diagonal ↖',
}
const positionLabel: Record<string, string> = {
  bottom: 'Abajo izq', 'bottom-center': 'Abajo centro',
  center: 'Centro', top: 'Arriba',
}
const sizeLabel: Record<string, string>    = { xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL' }
const weightLabel: Record<string, string>  = {
  light: 'Ligero', regular: 'Normal', medium: 'Medio', semibold: 'Semibold', bold: 'Bold',
}
const spacingLabel: Record<string, string> = { tight: 'Ajustado', normal: 'Normal', wide: 'Amplio' }

// ── Per-image overlay group field ─────────────────────────────────────────────

const overlayGroupField = makeCollapsibleGroup<GalleryOverlayStyles>(
  'Gradiente',
  [
    {
      key: 'color',
      title: 'Color',
      getSummary: (v) => (v as string) || '#000000',
      render: (value, onChange) => (
        <ColorPickerField
          value={(value as string) || '#000000'}
          onChange={onChange as (v: string) => void}
        />
      ),
    },
    {
      key: 'opacity',
      title: 'Opacidad',
      getSummary: (v) => `${v ?? 0}%`,
      render: (value, onChange) => (
        <RangeField value={value} onChange={onChange as (v: number) => void} />
      ),
    },
    {
      key: 'direction',
      title: 'Direccion',
      getSummary: (v) => directionLabel[v as string] ?? String(v),
      render: (value, onChange) => renderRadioOptions(
        [
          { label: '↑ Abajo → arriba',  value: 'bottom-top' },
          { label: '↓ Arriba → abajo',  value: 'top-bottom' },
          { label: '→ Izq → derecha',   value: 'left-right' },
          { label: '← Der → izquierda', value: 'right-left' },
          { label: '↘ Diagonal ↘',      value: 'diag-br' },
          { label: '↙ Diagonal ↙',      value: 'diag-bl' },
          { label: '↗ Diagonal ↗',      value: 'diag-tr' },
          { label: '↖ Diagonal ↖',      value: 'diag-tl' },
        ],
        value, onChange,
      ),
    },
  ],
  defaultOverlayStyles,
)

// ── Per-image text group field ────────────────────────────────────────────────
// El texto se muestra automáticamente cuando title o description tienen contenido.

const textGroupField = makeCollapsibleGroup<GalleryTextStyles>(
  'Texto',
  [
    {
      key: 'position',
      title: 'Posicion',
      getSummary: (v) => positionLabel[v as string] ?? String(v),
      render: (value, onChange) => renderRadioOptions(
        [
          { label: 'Abajo izq',    value: 'bottom' },
          { label: 'Abajo centro', value: 'bottom-center' },
          { label: 'Centro',       value: 'center' },
          { label: 'Arriba',       value: 'top' },
        ],
        value, onChange,
      ),
    },
    // ── Título ──────────────────────────────────────────────────────────────
    {
      key: 'titleSize',
      title: 'Titulo: Tamano',
      getSummary: (v) => sizeLabel[v as string] ?? String(v),
      render: (value, onChange) => renderRadioOptions(
        [
          { label: 'S', value: 'sm' }, { label: 'M', value: 'md' },
          { label: 'L', value: 'lg' }, { label: 'XL', value: 'xl' },
        ],
        value, onChange,
      ),
    },
    {
      key: 'titleWeight',
      title: 'Titulo: Peso',
      getSummary: (v) => weightLabel[v as string] ?? String(v),
      render: (value, onChange) => renderRadioOptions(
        [
          { label: 'Ligero', value: 'light' }, { label: 'Normal', value: 'regular' },
          { label: 'Medio',  value: 'medium' }, { label: 'Semi',  value: 'semibold' },
          { label: 'Bold',   value: 'bold' },
        ],
        value, onChange,
      ),
    },
    {
      key: 'titleLetterSpacing',
      title: 'Titulo: Espaciado',
      getSummary: (v) => spacingLabel[v as string] ?? String(v),
      render: (value, onChange) => renderRadioOptions(
        [
          { label: 'Ajustado', value: 'tight' },
          { label: 'Normal',   value: 'normal' },
          { label: 'Amplio',   value: 'wide' },
        ],
        value, onChange,
      ),
    },
    {
      key: 'titleColor',
      title: 'Titulo: Color',
      getSummary: (v) => (v as string) || '#ffffff',
      render: (value, onChange) => (
        <ColorPickerField
          value={(value as string) || '#ffffff'}
          onChange={onChange as (v: string) => void}
        />
      ),
    },
    // ── Descripción ─────────────────────────────────────────────────────────
    {
      key: 'descSize',
      title: 'Descripcion: Tamano',
      getSummary: (v) => sizeLabel[v as string] ?? String(v),
      render: (value, onChange) => renderRadioOptions(
        [
          { label: 'XS', value: 'xs' }, { label: 'S', value: 'sm' }, { label: 'M', value: 'md' },
        ],
        value, onChange,
      ),
    },
    {
      key: 'descWeight',
      title: 'Descripcion: Peso',
      getSummary: (v) => weightLabel[v as string] ?? String(v),
      render: (value, onChange) => renderRadioOptions(
        [
          { label: 'Ligero', value: 'light' }, { label: 'Normal', value: 'regular' },
          { label: 'Medio',  value: 'medium' }, { label: 'Semi',  value: 'semibold' },
          { label: 'Bold',   value: 'bold' },
        ],
        value, onChange,
      ),
    },
    {
      key: 'descColor',
      title: 'Descripcion: Color',
      getSummary: (v) => (v as string) || '#ffffff',
      render: (value, onChange) => (
        <ColorPickerField
          value={(value as string) || '#ffffffcc'}
          onChange={onChange as (v: string) => void}
        />
      ),
    },
  ],
  defaultTextStyles,
)

// ── Fields ────────────────────────────────────────────────────────────────────

export const galleryBlockFields: Fields<GalleryBlockProps> = {
  images: {
    type: 'array',
    label: 'Imagenes',
    arrayFields: {
      src:         { type: 'text', label: 'URL de la imagen' },
      alt:         { type: 'text', label: 'Texto alternativo (accesibilidad)' },
      title:       { type: 'text', label: 'Titulo sobre la imagen' },
      description: { type: 'text', label: 'Descripcion sobre la imagen' },
      overlayStyles: overlayGroupField as Fields<GalleryImage>['overlayStyles'],
      textStyles:    textGroupField    as Fields<GalleryImage>['textStyles'],
    },
    defaultItemProps: {
      src:          'https://placehold.co/600x400/e2e8f0/64748b?text=Imagen',
      alt:          'Descripcion de la imagen',
      title:        '',
      description:  '',
      overlayStyles: defaultOverlayStyles,
      textStyles:    defaultTextStyles,
    },
    getItemSummary: (item: { alt?: string; title?: string }) =>
      (item.title as string) || (item.alt as string) || 'Imagen',
  },

  columns: makeCollapsibleRadio('Columnas', [
    { label: '2 columnas', value: '2' },
    { label: '3 columnas', value: '3' },
    { label: '4 columnas', value: '4' },
  ]) as Fields<GalleryBlockProps>['columns'],

  gap: makeCollapsibleRadio('Separacion entre imagenes', [
    { label: 'Pequeña', value: 'sm' },
    { label: 'Mediana', value: 'md' },
    { label: 'Grande',  value: 'lg' },
  ]) as Fields<GalleryBlockProps>['gap'],

  borderRadius: makeCollapsibleRadio('Bordes redondeados', [
    { label: 'Sin redondeo', value: 'none' },
    { label: 'Pequeño',      value: 'sm' },
    { label: 'Mediano',      value: 'md' },
    { label: 'Grande',       value: 'lg' },
  ]) as Fields<GalleryBlockProps>['borderRadius'],

  padding: makeCollapsibleRadio('Espaciado interno', [
    { label: 'Pequeño', value: 'sm' },
    { label: 'Mediano', value: 'md' },
    { label: 'Grande',  value: 'lg' },
  ]) as Fields<GalleryBlockProps>['padding'],

  hoverEffect: makeCollapsibleRadio('Efecto hover', [
    { label: 'Ninguno',       value: 'none' },
    { label: 'Zoom',          value: 'zoom' },
    { label: 'Zoom + brillo', value: 'zoom-bright' },
    { label: 'Levantar',      value: 'lift' },
    { label: 'Oscurecer',     value: 'dim' },
    { label: 'Revelar',       value: 'reveal' },
  ]) as Fields<GalleryBlockProps>['hoverEffect'],
}

// ── Default props ─────────────────────────────────────────────────────────────

export const galleryBlockDefaultProps: GalleryBlockProps = {
  images: [
    {
      src: 'https://placehold.co/600x400/e2e8f0/64748b?text=Foto+1',
      alt: 'Foto 1', title: '', description: '',
      overlayStyles: { ...defaultOverlayStyles, opacity: 50 },
      textStyles: defaultTextStyles,
    },
    {
      src: 'https://placehold.co/600x400/dde6f0/64748b?text=Foto+2',
      alt: 'Foto 2', title: '', description: '',
      overlayStyles: { ...defaultOverlayStyles, opacity: 50 },
      textStyles: defaultTextStyles,
    },
    {
      src: 'https://placehold.co/600x400/d0daf0/64748b?text=Foto+3',
      alt: 'Foto 3', title: '', description: '',
      overlayStyles: { ...defaultOverlayStyles, opacity: 50 },
      textStyles: defaultTextStyles,
    },
    {
      src: 'https://placehold.co/600x400/c5d0f0/64748b?text=Foto+4',
      alt: 'Foto 4', title: '', description: '',
      overlayStyles: { ...defaultOverlayStyles, opacity: 50 },
      textStyles: defaultTextStyles,
    },
  ],
  columns:     4,
  gap:         'md',
  borderRadius: 'md',
  padding:     'md',
  hoverEffect: 'zoom',
}

// ── Hover style helper ────────────────────────────────────────────────────────

function getImgStyle(effect: GalleryHoverEffect, hovered: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
    transition: 'transform 0.4s ease, filter 0.4s ease',
    position: 'absolute', inset: 0,
  }
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

// ── Text position helper ──────────────────────────────────────────────────────

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
  gap,
  borderRadius,
  padding,
  hoverEffect = 'zoom',
}: GalleryBlockProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [hoveredIndex,  setHoveredIndex]  = useState<number | null>(null)

  const openLightbox  = useCallback((i: number) => setLightboxIndex(i), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const goNext = useCallback(() =>
    setLightboxIndex(p => p === null ? null : (p + 1) % images.length), [images.length])
  const goPrev = useCallback(() =>
    setLightboxIndex(p => p === null ? null : (p - 1 + images.length) % images.length), [images.length])

  const radius = borderRadiusMap[borderRadius]

  return (
    <div style={{ padding: paddingMap[padding] }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gapMap[gap],
      }}>
        {images.map((image, index) => {
          const hovered = hoveredIndex === index
          const ov = { ...defaultOverlayStyles, ...image.overlayStyles }
          const tx = { ...defaultTextStyles,    ...image.textStyles    }

          const hasOverlay   = ov.opacity > 0
          const overlayHex   = `${ov.color}${Math.round((ov.opacity / 100) * 255).toString(16).padStart(2, '0')}`
          const direction    = gradientDirectionMap[ov.direction]
          const showText     = !!(image.title || image.description)

          return (
            <div
              key={index}
              style={{
                position: 'relative',
                borderRadius: radius,
                overflow: 'hidden',
                aspectRatio: '4 / 3',
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
              <img
                src={image.src}
                alt={image.alt}
                style={getImgStyle(hoverEffect, hovered)}
              />

              {/* Per-image gradient overlay */}
              {hasOverlay && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(${direction}, ${overlayHex} 0%, transparent 60%)`,
                  opacity: hoverEffect === 'reveal' ? (hovered ? 0 : 1) : 1,
                  transition: 'opacity 0.4s ease',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Per-image text overlay */}
              {showText && (
                <div style={getTextPositionStyle(tx.position)}>
                  {image.title && (
                    <p style={{
                      color: tx.titleColor,
                      fontSize: titleSizeMap[tx.titleSize],
                      fontWeight: weightMap[tx.titleWeight],
                      letterSpacing: letterSpacingMap[tx.titleLetterSpacing],
                      margin: '0 0 3px',
                      lineHeight: 1.2,
                      textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                    }}>
                      {image.title}
                    </p>
                  )}
                  {image.description && (
                    <p style={{
                      color: tx.descColor,
                      fontSize: descSizeMap[tx.descSize],
                      fontWeight: weightMap[tx.descWeight],
                      margin: 0,
                      lineHeight: 1.4,
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }}>
                      {image.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen"
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
            alt={images[lightboxIndex].alt}
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

          {(images[lightboxIndex].title || images[lightboxIndex].description) && (
            <div style={{
              position: 'absolute', bottom: 40, left: '50%',
              transform: 'translateX(-50%)', textAlign: 'center',
            }}>
              {images[lightboxIndex].title && (
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>
                  {images[lightboxIndex].title}
                </p>
              )}
              {images[lightboxIndex].description && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0 }}>
                  {images[lightboxIndex].description}
                </p>
              )}
            </div>
          )}

          <span style={{
            position: 'absolute', bottom: 16,
            color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem',
          }}>
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  )
}
