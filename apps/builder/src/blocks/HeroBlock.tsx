import React from 'react'
import type { Fields } from '@measured/puck'
import { ColorPickerField } from '@/components/ColorPickerField'

export interface HeroButton {
  text: string
  url: string
  variant: 'solid' | 'outline' | 'ghost'
  bgColor: string
  textColor: string
}

export interface HeroBlockProps {
  title: string
  subtitle: string
  backgroundColor: string
  backgroundImage: string
  textColor: string
  buttons: HeroButton[]
  textAlign: 'left' | 'center' | 'right'
  paddingY: 'sm' | 'md' | 'lg' | 'xl'
  fontFamily: string
  titleFontSize: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  titleFontWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  subtitleFontSize: 'sm' | 'md' | 'lg' | 'xl'
  eyebrowText: string
  overlayColor: string
  overlayOpacity: number
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

const titleWeightMap: Record<HeroBlockProps['titleFontWeight'], number> = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

// Slider de rango reutilizable para campos numéricos
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

export const heroBlockFields: Fields<HeroBlockProps> = {
  // ── Texto ──────────────────────────────────────────────────────────────────
  eyebrowText: { type: 'text', label: 'Etiqueta sobre el título (opcional)' },
  title: { type: 'text', label: 'Título (H1)' },
  subtitle: { type: 'text', label: 'Subtítulo' },

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
  titleFontWeight: {
    type: 'radio',
    label: 'Peso del título',
    options: [
      { label: 'Ligero', value: 'light' },
      { label: 'Normal', value: 'regular' },
      { label: 'Medio', value: 'medium' },
      { label: 'Semibold', value: 'semibold' },
      { label: 'Bold', value: 'bold' },
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
  textAlign: {
    type: 'radio',
    label: 'Alineación',
    options: [
      { label: 'Izquierda', value: 'left' },
      { label: 'Centro', value: 'center' },
      { label: 'Derecha', value: 'right' },
    ],
  },
  fontFamily: { type: 'text', label: 'Fuente' },

  // ── Botones ────────────────────────────────────────────────────────────────
  buttons: {
    type: 'array',
    label: 'Botones',
    arrayFields: {
      text: { type: 'text', label: 'Texto' },
      url: { type: 'text', label: 'URL' },
      variant: {
        type: 'radio',
        label: 'Estilo',
        options: [
          { label: 'Sólido', value: 'solid' },
          { label: 'Contorno', value: 'outline' },
          { label: 'Ghost', value: 'ghost' },
        ],
      },
      bgColor: {
        type: 'custom',
        label: 'Color de fondo',
        render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
          <ColorPickerField value={value as string} onChange={onChange} />
        ),
      },
      textColor: {
        type: 'custom',
        label: 'Color del texto',
        render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
          <ColorPickerField value={value as string} onChange={onChange} />
        ),
      },
    },
    defaultItemProps: {
      text: 'Botón',
      url: '#',
      variant: 'solid',
      bgColor: '#ffffff',
      textColor: '#1a1a2e',
    },
    getItemSummary: (item: { text?: string }) => (item.text as string) || 'Botón',
  },

  // ── Fondo ──────────────────────────────────────────────────────────────────
  backgroundColor: {
    type: 'custom',
    label: 'Color de fondo',
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
      <ColorPickerField value={value as string} onChange={onChange} />
    ),
  },
  backgroundImage: { type: 'text', label: 'URL imagen de fondo' },
  overlayColor: {
    type: 'custom',
    label: 'Color del overlay sobre la imagen',
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
      <ColorPickerField value={value as string} onChange={onChange} />
    ),
  },
  overlayOpacity: {
    type: 'custom',
    label: 'Transparencia del overlay (0 = sin overlay)',
    render: ({ value, onChange }: { value: unknown; onChange: (v: number) => void }) => (
      <RangeField value={value} onChange={onChange} />
    ),
  },
  textColor: {
    type: 'custom',
    label: 'Color del texto',
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
      <ColorPickerField value={value as string} onChange={onChange} />
    ),
  },
  paddingY: {
    type: 'radio',
    label: 'Altura del hero',
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
  buttons: [
    { text: 'Contáctanos', url: '/contacto', variant: 'solid', bgColor: '#ffffff', textColor: '#1a1a2e' },
  ],
  textAlign: 'center',
  paddingY: 'lg',
  fontFamily: 'inherit',
  titleFontSize: 'lg',
  titleFontWeight: 'bold',
  subtitleFontSize: 'lg',
  eyebrowText: '',
  overlayColor: '#000000',
  overlayOpacity: 0,
}

export function HeroBlock({
  title,
  subtitle,
  backgroundColor,
  backgroundImage,
  textColor,
  buttons = [],
  textAlign,
  paddingY,
  fontFamily = 'inherit',
  titleFontSize = 'lg',
  titleFontWeight = 'bold',
  subtitleFontSize = 'lg',
  eyebrowText = '',
  overlayColor = '#000000',
  overlayOpacity = 0,
}: HeroBlockProps) {
  const padding = paddingMap[paddingY] ?? '120px'
  const resolvedTitleSize = titleFontSizeMap[titleFontSize] ?? titleFontSizeMap.lg
  const resolvedSubtitleSize = subtitleFontSizeMap[subtitleFontSize] ?? subtitleFontSizeMap.lg
  const resolvedTitleWeight = titleWeightMap[titleFontWeight] ?? 700
  const activeButtons = buttons.filter(b => b.text)

  const bgStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }
    : {}

  const overlayHex = overlayOpacity > 0
    ? `${overlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`
    : null

  const justifyContent =
    textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'

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
      {/* Overlay transparente sobre la imagen de fondo */}
      {overlayHex && backgroundImage && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: overlayHex,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>

        {/* Etiqueta eyebrow */}
        {eyebrowText && (
          <p style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            opacity: 0.75,
            marginBottom: '14px',
            fontFamily,
          }}>
            {eyebrowText}
          </p>
        )}

        {/* Título principal */}
        <h1 style={{
          fontSize: resolvedTitleSize,
          fontWeight: resolvedTitleWeight,
          lineHeight: resolvedTitleWeight <= 400 ? 1.15 : 1.1,
          letterSpacing: resolvedTitleWeight <= 400 ? '-0.01em' : '0em',
          marginBottom: '16px',
          fontFamily,
        }}>
          {title}
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: resolvedSubtitleSize,
          opacity: 0.82,
          lineHeight: 1.6,
          marginBottom: '36px',
          fontFamily,
        }}>
          {subtitle}
        </p>

        {/* Botones */}
        {activeButtons.length > 0 && (
          <div style={{ display: 'flex', gap: 14, justifyContent, flexWrap: 'wrap' }}>
            {activeButtons.map((btn, i) => {
              const isSolid = btn.variant === 'solid'
              const isOutline = btn.variant === 'outline'
              return (
                <a
                  key={i}
                  href={btn.url || '#'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: isSolid ? (btn.bgColor || textColor) : 'transparent',
                    color: btn.textColor || textColor,
                    padding: '13px 28px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    fontFamily,
                    border: isOutline ? `2px solid ${btn.textColor || textColor}` : 'none',
                    textDecoration: btn.variant === 'ghost' ? 'underline' : 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  {btn.text}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
