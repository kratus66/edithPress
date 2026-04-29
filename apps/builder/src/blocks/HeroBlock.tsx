import React, { useRef, useState } from 'react'
import type { Fields } from '@measured/puck'
import { ColorPickerField } from '@/components/ColorPickerField'
import { MediaPicker } from '@/components/MediaPicker'
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

export interface EyebrowStyles {
  fontSize: 'xs' | 'sm' | 'md' | 'lg'
  fontWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  color: string
  letterSpacing: 'tight' | 'normal' | 'wide' | 'wider'
  textTransform: 'uppercase' | 'capitalize' | 'none'
}

export interface ImageConfig {
  src: string
  position: 'left' | 'right' | 'cover' | 'cover-left' | 'cover-right'
}

export interface HeroBlockProps {
  title: string
  titleHtml: string
  subtitle: string
  subtitleHtml: string
  backgroundColor: string
  imageConfig: ImageConfig
  textColor: string
  buttons: HeroButton[]
  textAlign: 'left' | 'center' | 'right'
  paddingY: 'sm' | 'md' | 'lg' | 'xl'
  fontFamily: string
  eyebrowText: string
  eyebrowStyles: EyebrowStyles
  overlayColor: string
  overlayOpacity: number
  titleStyles: TitleStyles
  subtitleStyles: SubtitleStyles
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

const eyebrowFontSizeMap: Record<EyebrowStyles['fontSize'], string> = {
  xs: '0.65rem',
  sm: '0.72rem',
  md: '0.85rem',
  lg: '1rem',
}

const eyebrowLetterSpacingMap: Record<EyebrowStyles['letterSpacing'], string> = {
  tight: '0.03em',
  normal: '0.08em',
  wide: '0.15em',
  wider: '0.25em',
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

const defaultEyebrowStyles: EyebrowStyles = {
  fontSize: 'sm',
  fontWeight: 'bold',
  color: '#9a6240',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
}

const defaultImageConfig: ImageConfig = {
  src: '',
  position: 'cover',
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

// ── HTML text editor ──────────────────────────────────────────────────────────

const HTML_BUTTONS = [
  { label: 'B',       tag: ['<strong>', '</strong>'],          title: 'Negrita',          style: { fontWeight: 700 } },
  { label: 'I',       tag: ['<em>', '</em>'],                  title: 'Itálica',          style: { fontStyle: 'italic' } },
  { label: 'U',       tag: ['<u>', '</u>'],                    title: 'Subrayado',        style: {} },
  { label: 'S',       tag: ['<s>', '</s>'],                    title: 'Tachado',          style: { textDecoration: 'line-through' } },
  { label: 'BR',      tag: ['<br/>', ''],                      title: 'Salto de línea',   style: { fontSize: 10 } },
  { label: 'Grande',  tag: ['<span style="font-size:1.3em">', '</span>'],  title: 'Texto grande',     style: { fontSize: 10 } },
  { label: 'Pequeño', tag: ['<span style="font-size:0.8em">', '</span>'],  title: 'Texto pequeño',    style: { fontSize: 10 } },
  { label: 'Color',   tag: ['<span style="color:#e84242">', '</span>'],    title: 'Color de texto',   style: { color: '#e84242', fontSize: 10 } },
  { label: 'Marca',   tag: ['<mark style="background:#fff176;padding:0 3px">', '</mark>'], title: 'Resaltar texto', style: { background: '#fff176', fontSize: 10 } },
  { label: 'Link',    tag: ['<a href="#">', '</a>'],           title: 'Enlace',           style: { color: '#2563eb', fontSize: 10 } },
]

function HtmlTextField({ value, onChange, placeholder }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  const insertTag = (open: string, close: string) => {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.slice(start, end)
    const wrapped = `${open}${selected || 'texto'}${close}`
    const next = value.slice(0, start) + wrapped + value.slice(end)
    onChange(next)
    setTimeout(() => {
      ta.focus()
      const pos = start + open.length + (selected || 'texto').length + close.length
      ta.setSelectionRange(pos, pos)
    }, 0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {HTML_BUTTONS.map(({ label, tag, title, style }) => (
          <button
            key={label}
            type="button"
            title={title}
            onClick={() => insertTag(tag[0], tag[1])}
            style={{
              padding: '3px 7px',
              fontSize: 11,
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              cursor: 'pointer',
              fontFamily: 'sans-serif',
              lineHeight: 1.4,
              ...style,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <textarea
        ref={taRef}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'HTML opcional — ej: Título <strong>importante</strong>'}
        rows={4}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          fontSize: 11,
          fontFamily: 'monospace',
          resize: 'vertical',
          boxSizing: 'border-box',
          lineHeight: 1.5,
          color: '#1e293b',
        }}
      />
      {value && (
        <div style={{
          padding: '8px 10px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          fontSize: 12,
          color: '#374151',
        }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>Vista previa:</div>
          <div dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      )}
    </div>
  )
}

// ── Collapsible HTML field ────────────────────────────────────────────────────

function CollapsibleHtmlField({ value, onChange, placeholder }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const plain = value.replace(/<[^>]+>/g, '').trim()
  const summary = plain ? (plain.length > 28 ? plain.slice(0, 28) + '…' : plain) : 'Vacío'

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: 6,
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: open ? '#f1f5f9' : '#f8fafc',
          border: 'none',
          borderBottom: open ? '1px solid #e2e8f0' : 'none',
          cursor: 'pointer',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
          {open ? '▾' : '▸'} HTML
        </span>
        {!open && (
          <span style={{
            fontSize: 11,
            color: value ? '#2563eb' : '#94a3b8',
            fontStyle: value ? 'normal' : 'italic',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '160px',
          }}>
            {summary}
          </span>
        )}
        {value && !open && (
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#2563eb', flexShrink: 0,
          }} />
        )}
      </button>
      {open && (
        <div style={{ padding: '10px 10px 12px' }}>
          <HtmlTextField value={value} onChange={onChange} placeholder={placeholder} />
        </div>
      )}
    </div>
  )
}

// ── Field label maps (for getSummary) ─────────────────────────────────────────

const sizeLabel: Record<string, string> = { xs: 'XS', sm: 'S', md: 'M', lg: 'L', xl: 'XL', xxl: 'XXL' }
const weightLabel: Record<string, string> = {
  light: 'Ligero', regular: 'Normal', medium: 'Medio', semibold: 'Semibold', bold: 'Bold',
}
const spacingLabel: Record<string, string> = { tight: 'Ajustado', normal: 'Normal', wide: 'Amplio' }
const eyebrowSpacingLabel: Record<string, string> = { tight: 'Ajustado', normal: 'Normal', wide: 'Amplio', wider: 'Muy amplio' }
const lineHeightLabel: Record<string, string> = { tight: 'Ajustado', normal: 'Normal', relaxed: 'Suelto' }
const textTransformLabel: Record<string, string> = { uppercase: 'MAYÚSCULAS', capitalize: 'Capitalizar', none: 'Normal' }
const positionLabel: Record<string, string> = {
  left: 'Izquierda', right: 'Derecha', cover: 'Fondo completo',
  'cover-left': 'Izquierda completo', 'cover-right': 'Derecha completo',
}

// ── Fields ────────────────────────────────────────────────────────────────────

export const heroBlockFields: Fields<HeroBlockProps> = {
  // ── Contenido de texto ─────────────────────────────────────────────────────
  eyebrowText: { type: 'text', label: 'Etiqueta sobre el titulo (opcional)' },
  title: { type: 'text', label: 'Titulo (texto simple)' },
  titleHtml: {
    type: 'custom',
    label: 'Titulo en HTML (sobreescribe el campo anterior)',
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
      <CollapsibleHtmlField
        value={(value as string) || ''}
        onChange={onChange}
        placeholder='Ej: El arte <strong>ancestral</strong> del <em>Vichada</em>'
      />
    ),
  },
  subtitle: { type: 'text', label: 'Subtitulo (texto simple)' },
  subtitleHtml: {
    type: 'custom',
    label: 'Subtitulo en HTML (sobreescribe el campo anterior)',
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
      <CollapsibleHtmlField
        value={(value as string) || ''}
        onChange={onChange}
        placeholder='Ej: Cada pieza cuenta una <em>historia</em> única.'
      />
    ),
  },

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

  // ── Estilos de Eyebrow (grupo colapsable) ─────────────────────────────────
  eyebrowStyles: makeCollapsibleGroup<EyebrowStyles>(
    'Etiqueta',
    [
      {
        key: 'fontSize',
        title: 'Tamaño',
        getSummary: (v) => sizeLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [{ label: 'XS', value: 'xs' }, { label: 'S', value: 'sm' },
           { label: 'M', value: 'md' }, { label: 'L', value: 'lg' }],
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
          <ColorPickerField value={(value as string) || '#9a6240'} onChange={onChange as (v: string) => void} />
        ),
      },
      {
        key: 'letterSpacing',
        title: 'Espaciado',
        getSummary: (v) => eyebrowSpacingLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [{ label: 'Ajustado', value: 'tight' }, { label: 'Normal', value: 'normal' },
           { label: 'Amplio', value: 'wide' }, { label: 'Muy amplio', value: 'wider' }],
          value, onChange,
        ),
      },
      {
        key: 'textTransform',
        title: 'Transformación',
        getSummary: (v) => textTransformLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [{ label: 'MAYÚSCULAS', value: 'uppercase' }, { label: 'Capitalizar', value: 'capitalize' },
           { label: 'Normal', value: 'none' }],
          value, onChange,
        ),
      },
    ],
    defaultEyebrowStyles,
  ) as Fields<HeroBlockProps>['eyebrowStyles'],

  // ── Alineacion y tipografia ────────────────────────────────────────────────
  textAlign: makeCollapsibleRadio('Alineacion', [
    { label: 'Izquierda', value: 'left' },
    { label: 'Centro', value: 'center' },
    { label: 'Derecha', value: 'right' },
  ]) as Fields<HeroBlockProps>['textAlign'],
  fontFamily: { type: 'text', label: 'Fuente' },

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
        render: ({ value, onChange }: { value: unknown; onChange: (v: 'solid' | 'outline' | 'ghost') => void }) => {
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
                  onClick={() => onChange(opt.value as 'solid' | 'outline' | 'ghost')}
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

  // ── Imagen ─────────────────────────────────────────────────────────────────
  imageConfig: makeCollapsibleGroup<ImageConfig>(
    'Imagen',
    [
      {
        key: 'src',
        title: 'Imagen',
        getSummary: (v) => (v as string) ? 'Configurada' : 'Sin imagen',
        render: (value, onChange) => (
          <MediaPicker
            value={(value as string) || ''}
            onChange={onChange as (v: string) => void}
            label="Imagen"
          />
        ),
      },
      {
        key: 'position',
        title: 'Posición',
        getSummary: (v) => positionLabel[v as string] ?? String(v),
        render: (value, onChange) => renderRadioOptions(
          [
            { label: 'Izquierda', value: 'left' },
            { label: 'Derecha', value: 'right' },
            { label: 'Fondo completo', value: 'cover' },
            { label: 'Izquierda completo', value: 'cover-left' },
            { label: 'Derecha completo', value: 'cover-right' },
          ],
          value, onChange,
        ),
      },
    ],
    defaultImageConfig,
  ) as Fields<HeroBlockProps>['imageConfig'],

  // ── Fondo ──────────────────────────────────────────────────────────────────
  backgroundColor: makeCollapsibleColor('Color de fondo') as Fields<HeroBlockProps>['backgroundColor'],
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
  titleHtml: '',
  subtitle: 'Ofrecemos los mejores servicios de la región',
  subtitleHtml: '',
  backgroundColor: '#faf7f4',
  imageConfig: defaultImageConfig,
  textColor: '#1a1a2e',
  buttons: [
    { text: 'Explorar coleccion', url: '#', variant: 'solid', bgColor: '#3d2314', textColor: '#ffffff' },
    { text: 'Conoce mas', url: '#', variant: 'outline', bgColor: 'transparent', textColor: '#3d2314' },
  ],
  textAlign: 'left',
  paddingY: 'lg',
  fontFamily: 'inherit',
  eyebrowText: '',
  eyebrowStyles: defaultEyebrowStyles,
  overlayColor: '#000000',
  overlayOpacity: 0,
  titleStyles: defaultTitleStyles,
  subtitleStyles: defaultSubtitleStyles,
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HeroBlock({
  title,
  titleHtml = '',
  subtitle,
  subtitleHtml = '',
  backgroundColor,
  imageConfig = defaultImageConfig,
  textColor,
  buttons = [],
  textAlign,
  paddingY,
  fontFamily = 'inherit',
  eyebrowText = '',
  eyebrowStyles = defaultEyebrowStyles,
  overlayColor = '#000000',
  overlayOpacity = 0,
  titleStyles = defaultTitleStyles,
  subtitleStyles = defaultSubtitleStyles,
}: HeroBlockProps) {
  const ic = { ...defaultImageConfig, ...imageConfig }
  const backgroundImage = ic.src
  const position = ic.position
  const layout = position === 'left' ? 'split-right'
               : position === 'right' ? 'split-left'
               : 'full'

  const ts = { ...defaultTitleStyles, ...titleStyles }
  const ss = { ...defaultSubtitleStyles, ...subtitleStyles }
  const es = { ...defaultEyebrowStyles, ...eyebrowStyles }

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
  // Alignment for flex containers (buttons row)
  const buttonsJustify =
    textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'
  // Alignment for the content block within the section
  const blockJustify =
    textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'

  const titleStyle: React.CSSProperties = {
    fontSize: resolvedTitleSize,
    fontWeight: resolvedTitleWeight,
    lineHeight: resolvedTitleWeight <= 400 ? 1.15 : 1.1,
    letterSpacing: resolvedLetterSpacing,
    color: resolvedTitleColor,
    marginBottom: '18px',
    fontFamily,
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: resolvedSubtitleSize,
    fontWeight: resolvedSubtitleWeight,
    opacity: subtitleOpacity,
    lineHeight: resolvedLineHeight,
    color: resolvedSubtitleColor,
    marginBottom: '36px',
    fontFamily,
  }

  // ── Content fragment ───────────────────────────────────────────────────────

  const content = (
    <>
      {eyebrowText && (
        <p style={{
          fontSize: eyebrowFontSizeMap[es.fontSize] ?? eyebrowFontSizeMap.sm,
          fontWeight: weightMap[es.fontWeight] ?? 700,
          letterSpacing: eyebrowLetterSpacingMap[es.letterSpacing] ?? '0.15em',
          textTransform: es.textTransform as React.CSSProperties['textTransform'],
          color: es.color || textColor,
          marginBottom: '14px',
          fontFamily,
        }}>
          {eyebrowText}
        </p>
      )}

      {titleHtml
        ? <h1 style={titleStyle} dangerouslySetInnerHTML={{ __html: titleHtml }} />
        : <h1 style={titleStyle}>{title}</h1>
      }

      {subtitleHtml
        ? <p style={subtitleStyle} dangerouslySetInnerHTML={{ __html: subtitleHtml }} />
        : <p style={subtitleStyle}>{subtitle}</p>
      }

      {activeButtons.length > 0 && (
        <div style={{ display: 'flex', gap: 14, justifyContent: buttonsJustify, flexWrap: 'wrap' }}>
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

  // ── Cover-left / Cover-right layout ───────────────────────────────────────

  if (position === 'cover-left' || position === 'cover-right') {
    const isLeft = position === 'cover-left'
    const overlayHexCover = overlayOpacity > 0
      ? `${overlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`
      : null
    return (
      <section style={{
        position: 'relative',
        display: 'flex',
        fontFamily,
        minHeight: 480,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor,
        alignItems: 'stretch',
      }}>
        {overlayHexCover && backgroundImage && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlayHexCover,
            pointerEvents: 'none',
          }} />
        )}
        {!isLeft && <div style={{ flex: '1 1 50%' }} />}
        <div style={{
          flex: '0 0 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: `${padding} clamp(32px, 5vw, 80px)`,
          color: textColor,
          textAlign,
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box',
        }}>
          {content}
        </div>
        {isLeft && <div style={{ flex: '1 1 50%' }} />}
      </section>
    )
  }

  // ── Split layout ───────────────────────────────────────────────────────────

  if (layout === 'split-left' || layout === 'split-right') {
    const isTextLeft = layout === 'split-left'
    return (
      <section style={{
        display: 'flex',
        fontFamily,
        minHeight: 480,
        backgroundColor,
        alignItems: 'stretch',
      }}>
        <div
          style={{
            flex: '1 1 50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: `${padding} clamp(32px, 5vw, 80px)`,
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
            order: isTextLeft ? 1 : 0,
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
      }
    : {}

  return (
    <section
      style={{
        position: 'relative',
        backgroundColor,
        color: textColor,
        padding: `${padding} clamp(32px, 6vw, 80px)`,
        fontFamily,
        display: 'flex',
        justifyContent: blockJustify,
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
      <div style={{
        maxWidth: '640px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        textAlign,
      }}>
        {content}
      </div>
    </section>
  )
}
