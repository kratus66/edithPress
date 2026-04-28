import React from 'react'
import type { Fields } from '@measured/puck'
import { ColorPickerField } from '@/components/ColorPickerField'
import {
  makeCollapsibleRadio,
  makeCollapsibleColor,
  makeCollapsibleGroup,
  renderRadioOptions,
} from '@/lib/fieldHelpers'

export interface HeroButton {
  text: string
  url: string
  variant: 'solid' | 'outline' | 'ghost'
  bgColor: string
  textColor: string
}

export interface TitleStyles {
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  fontWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  color: string
  letterSpacing: 'tight' | 'normal' | 'wide'
}

export interface SubtitleStyles {
  fontSize: 'sm' | 'md' | 'lg' | 'xl'
  fontWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  color: string
  opacity: number
  lineHeight: 'tight' | 'normal' | 'relaxed'
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
  eyebrowText: string
  eyebrowColor: string
  overlayColor: string
  overlayOpacity: number
  titleStyles: TitleStyles
  subtitleStyles: SubtitleStyles
  layout: 'full' | 'split-left' | 'split-right'
}

// ── Style maps ────────────────────────────────────────────────────────────────

const paddingMap: Record<HeroBlockProps['paddingY'], string> = {
  sm: '40px',
  md: '80px',
  lg: '120px',
  xl: '160px',
}

const titleFontSizeMap: Record<TitleStyles['fontSize'], string> = {
  sm: '1.5rem',
  md: '2.25rem',
  lg: 'clamp(2rem, 5vw, 3.5rem)',
  xl: 'clamp(2.5rem, 6vw, 5rem)',
  xxl: 'clamp(3rem, 8vw, 7rem)',
}

const subtitleFontSizeMap: Record<SubtitleStyles['fontSize'], string> = {
  sm: '0.9rem',
  md: '1.05rem',
  lg: 'clamp(1rem, 2.5vw, 1.25rem)',
  xl: 'clamp(1.2rem, 3vw, 1.6rem)',
}

const weightMap: Record<TitleStyles['fontWeight'], number> = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

const letterSpacingMap: Record<TitleStyles['letterSpacing'], string> = {
  tight: '-0.03em',
  normal: '0em',
  wide: '0.06em',
}

const lineHeightMap: Record<SubtitleStyles['lineHeight'], number> = {
  tight: 1.3,
  normal: 1.6,
  relaxed: 1.9,
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const defaultTitleStyles: TitleStyles = {
  fontSize: 'lg',
  fontWeight: 'bold',
  color: '',
  letterSpacing: 'normal',
}

const defaultSubtitleStyles: SubtitleStyles = {
  fontSize: 'lg',
  fontWeight: 'regular',
  color: '',
  opacity: 82,
  lineHeight: 'normal',
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

// ── Field label maps (for getSummary) ─────────────────────────────────────────

const sizeLabel: Record<string, string> = { sm: 'S', md: 'M', lg: 'L', xl: 'XL', xxl: 'XXL' }
const weightLabel: Record<string, string> = {
  light: 'Ligero', regular: 'Normal', medium: 'Medio', semibold: 'Semibold', bold: 'Bold',
}
const spacingLabel: Record<string, string> = { tight: 'Ajustado', normal: 'Normal', wide: 'Amplio' }
const lineHeightLabel: Record<string, string> = { tight: 'Ajustado', normal: 'Normal', relaxed: 'Suelto' }

// ── Fields ────────────────────────────────────────────────────────────────────

export const heroBlockFields: Fields<HeroBlockProps> = {
  // ── Contenido de texto ─────────────────────────────────────────────────────
  eyebrowText: { type: 'text', label: 'Etiqueta sobre el titulo (opcional)' },
  title: { type: 'text', label: 'Titulo (H1)' },
  subtitle: { type: 'text', label: 'Subtitulo' },

  // ── Estilos de Titulo (grupo colapsable anidado) ───────────────────────────
  titleStyles: makeCollapsibleGroup<TitleStyles>(
    'Titulo',
    [
      {
        key: 'fontSize',
        title: 'Tamano',
        getSummary: (v) => sizeLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [{ label: 'S', value: 'sm' }, { label: 'M', value: 'md' }, { label: 'L', value: 'lg' },
           { label: 'XL', value: 'xl' }, { label: 'XXL', value: 'xxl' }],
          value, onChange,
        ),
      },
      {
        key: 'fontWeight',
        title: 'Peso',
        getSummary: (v) => weightLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [{ label: 'Ligero', value: 'light' }, { label: 'Normal', value: 'regular' },
           { label: 'Medio', value: 'medium' }, { label: 'Semibold', value: 'semibold' },
           { label: 'Bold', value: 'bold' }],
          value, onChange,
        ),
      },
      {
        key: 'color',
        title: 'Color',
        getSummary: (v) => (v as string) || 'Heredado',
        render: (value, onChange) => (
          <ColorPickerField value={(value as string) || '#ffffff'} onChange={onChange as (v: string) => void} />
        ),
      },
      {
        key: 'letterSpacing',
        title: 'Espaciado',
        getSummary: (v) => spacingLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [{ label: 'Ajustado', value: 'tight' }, { label: 'Normal', value: 'normal' },
           { label: 'Amplio', value: 'wide' }],
          value, onChange,
        ),
      },
    ],
    defaultTitleStyles,
  ) as Fields<HeroBlockProps>['titleStyles'],

  // ── Estilos de Subtitulo (grupo colapsable anidado) ────────────────────────
  subtitleStyles: makeCollapsibleGroup<SubtitleStyles>(
    'Subtitulo',
    [
      {
        key: 'fontSize',
        title: 'Tamano',
        getSummary: (v) => sizeLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [{ label: 'S', value: 'sm' }, { label: 'M', value: 'md' }, { label: 'L', value: 'lg' },
           { label: 'XL', value: 'xl' }],
          value, onChange,
        ),
      },
      {
        key: 'fontWeight',
        title: 'Peso',
        getSummary: (v) => weightLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [{ label: 'Ligero', value: 'light' }, { label: 'Normal', value: 'regular' },
           { label: 'Medio', value: 'medium' }, { label: 'Semibold', value: 'semibold' },
           { label: 'Bold', value: 'bold' }],
          value, onChange,
        ),
      },
      {
        key: 'color',
        title: 'Color',
        getSummary: (v) => (v as string) || 'Heredado',
        render: (value, onChange) => (
          <ColorPickerField value={(value as string) || '#ffffff'} onChange={onChange as (v: string) => void} />
        ),
      },
      {
        key: 'opacity',
        title: 'Opacidad',
        getSummary: (v) => `${v}%`,
        render: (value, onChange) => (
          <RangeField value={value} onChange={onChange as (v: number) => void} />
        ),
      },
      {
        key: 'lineHeight',
        title: 'Interlineado',
        getSummary: (v) => lineHeightLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [{ label: 'Ajustado', value: 'tight' }, { label: 'Normal', value: 'normal' },
           { label: 'Suelto', value: 'relaxed' }],
          value, onChange,
        ),
      },
    ],
    defaultSubtitleStyles,
  ) as Fields<HeroBlockProps>['subtitleStyles'],

  // ── Eyebrow ────────────────────────────────────────────────────────────────
  eyebrowColor: makeCollapsibleColor('Color de la etiqueta') as Fields<HeroBlockProps>['eyebrowColor'],

  // ── Alineacion y tipografia ────────────────────────────────────────────────
  textAlign: makeCollapsibleRadio('Alineacion', [
    { label: 'Izquierda', value: 'left' },
    { label: 'Centro', value: 'center' },
    { label: 'Derecha', value: 'right' },
  ]) as Fields<HeroBlockProps>['textAlign'],
  fontFamily: { type: 'text', label: 'Fuente' },

  // ── Disposicion ────────────────────────────────────────────────────────────
  layout: makeCollapsibleRadio('Disposicion', [
    { label: 'Completo', value: 'full' },
    { label: 'Texto izquierda', value: 'split-left' },
    { label: 'Texto derecha', value: 'split-right' },
  ]) as Fields<HeroBlockProps>['layout'],
  paddingY: makeCollapsibleRadio('Altura del hero', [
    { label: 'Pequeno', value: 'sm' },
    { label: 'Mediano', value: 'md' },
    { label: 'Grande', value: 'lg' },
    { label: 'Extra grande', value: 'xl' },
  ]) as Fields<HeroBlockProps>['paddingY'],

  // ── Botones ────────────────────────────────────────────────────────────────
  buttons: {
    type: 'array',
    label: 'Botones',
    arrayFields: {
      text: { type: 'text', label: 'Texto' },
      url: { type: 'text', label: 'URL' },
      variant: {
        type: 'custom',
        label: 'Estilo',
        render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => {
          const current = (value as string) || 'solid'
          const options = [
            { value: 'solid',   label: 'Solido' },
            { value: 'outline', label: 'Contorno' },
            { value: 'ghost',   label: 'Ghost' },
          ]
          return (
            <div style={{ display: 'flex', gap: 4 }}>
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    borderRadius: 6,
                    border: current === opt.value ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: current === opt.value ? '#eff6ff' : '#fff',
                    color: current === opt.value ? '#2563eb' : '#64748b',
                    fontWeight: current === opt.value ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: 'sans-serif',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )
        },
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
      text: 'Boton',
      url: '#',
      variant: 'solid',
      bgColor: '#ffffff',
      textColor: '#1a1a2e',
    },
    getItemSummary: (item: { text?: string }) => (item.text as string) || 'Boton',
  },

  // ── Fondo ──────────────────────────────────────────────────────────────────
  backgroundColor: makeCollapsibleColor('Color de fondo') as Fields<HeroBlockProps>['backgroundColor'],
  backgroundImage: { type: 'text', label: 'URL imagen de fondo / columna' },
  overlayColor: makeCollapsibleColor('Color del overlay') as Fields<HeroBlockProps>['overlayColor'],
  overlayOpacity: {
    type: 'custom',
    label: 'Opacidad del overlay (0 = sin overlay)',
    render: ({ value, onChange }: { value: unknown; onChange: (v: number) => void }) => (
      <RangeField value={value} onChange={onChange} />
    ),
  },
  textColor: makeCollapsibleColor('Color base del texto') as Fields<HeroBlockProps>['textColor'],
}

// ── Default props ─────────────────────────────────────────────────────────────

export const heroBlockDefaultProps: HeroBlockProps = {
  title: 'Bienvenido a mi negocio',
  subtitle: 'Ofrecemos los mejores servicios de la region',
  backgroundColor: '#faf7f4',
  backgroundImage: '',
  textColor: '#1a1a2e',
  buttons: [
    { text: 'Explorar coleccion', url: '#', variant: 'solid', bgColor: '#3d2314', textColor: '#ffffff' },
    { text: 'Conoce mas', url: '#', variant: 'outline', bgColor: 'transparent', textColor: '#3d2314' },
  ],
  textAlign: 'left',
  paddingY: 'lg',
  fontFamily: 'inherit',
  eyebrowText: '',
  eyebrowColor: '#9a6240',
  overlayColor: '#000000',
  overlayOpacity: 0,
  titleStyles: defaultTitleStyles,
  subtitleStyles: defaultSubtitleStyles,
  layout: 'full',
}

// ── Component ─────────────────────────────────────────────────────────────────

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
  eyebrowText = '',
  eyebrowColor = '#9a6240',
  overlayColor = '#000000',
  overlayOpacity = 0,
  titleStyles = defaultTitleStyles,
  subtitleStyles = defaultSubtitleStyles,
  layout = 'full',
}: HeroBlockProps) {
  const ts = { ...defaultTitleStyles, ...titleStyles }
  const ss = { ...defaultSubtitleStyles, ...subtitleStyles }

  const padding = paddingMap[paddingY] ?? '120px'
  const resolvedTitleSize = titleFontSizeMap[ts.fontSize] ?? titleFontSizeMap.lg
  const resolvedTitleWeight = weightMap[ts.fontWeight] ?? 700
  const resolvedTitleColor = ts.color || textColor
  const resolvedLetterSpacing = letterSpacingMap[ts.letterSpacing] ?? '0em'

  const resolvedSubtitleSize = subtitleFontSizeMap[ss.fontSize] ?? subtitleFontSizeMap.lg
  const resolvedSubtitleWeight = weightMap[ss.fontWeight] ?? 400
  const resolvedSubtitleColor = ss.color || textColor
  const resolvedLineHeight = lineHeightMap[ss.lineHeight] ?? 1.6
  const subtitleOpacity = (ss.opacity ?? 82) / 100

  const activeButtons = buttons.filter(b => b.text)
  const justifyContent =
    textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'

  // ── Content fragment ───────────────────────────────────────────────────────

  const content = (
    <>
      {eyebrowText && (
        <p style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: eyebrowColor || textColor,
          marginBottom: '14px',
          fontFamily,
        }}>
          {eyebrowText}
        </p>
      )}

      <h1 style={{
        fontSize: resolvedTitleSize,
        fontWeight: resolvedTitleWeight,
        lineHeight: resolvedTitleWeight <= 400 ? 1.15 : 1.1,
        letterSpacing: resolvedLetterSpacing,
        color: resolvedTitleColor,
        marginBottom: '18px',
        fontFamily,
      }}>
        {title}
      </h1>

      <p style={{
        fontSize: resolvedSubtitleSize,
        fontWeight: resolvedSubtitleWeight,
        opacity: subtitleOpacity,
        lineHeight: resolvedLineHeight,
        color: resolvedSubtitleColor,
        marginBottom: '36px',
        fontFamily,
      }}>
        {subtitle}
      </p>

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
    </>
  )

  // ── Split layout ───────────────────────────────────────────────────────────

  if (layout === 'split-left' || layout === 'split-right') {
    const isTextLeft = layout === 'split-left'
    return (
      <section style={{ display: 'flex', fontFamily, minHeight: 480 }}>
        <div
          style={{
            flex: '1 1 50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: `${padding} clamp(32px, 5vw, 80px)`,
            backgroundColor,
            color: textColor,
            textAlign,
            order: isTextLeft ? 0 : 1,
            boxSizing: 'border-box',
          }}
        >
          {content}
        </div>
        <div
          style={{
            flex: '1 1 50%',
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: backgroundImage ? 'transparent' : '#e2e8f0',
            order: isTextLeft ? 1 : 0,
            minHeight: 400,
          }}
        />
      </section>
    )
  }

  // ── Full layout ────────────────────────────────────────────────────────────

  const overlayHex = overlayOpacity > 0
    ? `${overlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`
    : null

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
      {overlayHex && backgroundImage && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: overlayHex,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        {content}
      </div>
    </section>
  )
}
