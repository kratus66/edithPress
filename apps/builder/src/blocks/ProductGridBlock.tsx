import React, { useState } from 'react'
import type { Fields } from '@measured/puck'
import { makeCollapsibleRadio, makeCollapsibleColor, makeCollapsibleGroup, renderRadioOptions } from '@/lib/fieldHelpers'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { ColorPickerField } from '@/components/ColorPickerField'

// ─── Typography interfaces ───────────────────────────────────────────────────

export interface TypographyStyle {
  color: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
  textAlign: string
}

interface HeaderTypography {
  eyebrow: TypographyStyle
  title: TypographyStyle
  subtitle: TypographyStyle
}

interface CardTypography {
  name: TypographyStyle
  description: TypographyStyle
  price: TypographyStyle
  artisan: TypographyStyle
  category: TypographyStyle
}

export interface ViewAllStyle {
  color: string
  backgroundColor: string
  borderColor: string
  fontSize: string
  fontWeight: string
  borderRadius: string
}

export interface EyebrowStyle {
  color: string
  fontSize: string
  fontWeight: string
  letterSpacing: string
  textAlign: string
}

// ─── Block props ─────────────────────────────────────────────────────────────

export interface ProductGridBlockProps {
  title: string
  subtitle: string
  columns: 2 | 3 | 4
  products: Array<{
    image: string
    imageAlt: string
    category: string
    name: string
    description: string
    price: string
    artisan: string
    ctaText: string
    ctaUrl: string
    ctaType?: 'link' | 'whatsapp'
  }>
  backgroundColor: string
  textColor: string
  accentColor: string
  showCategory: boolean
  showArtisan: boolean
  cardStyle: 'shadow' | 'border' | 'minimal'
  eyebrowText?: string
  viewAllText?: string
  viewAllUrl?: string
  categoryPosition?: 'badge' | 'above-name'
  showCta?: boolean
  whatsappPhone?: string
  headerTypography?: HeaderTypography
  cardTypography?: CardTypography
  viewAllStyle?: ViewAllStyle
  eyebrowStyle?: EyebrowStyle
}

// ─── Typography option lists ─────────────────────────────────────────────────

const fontFamilyOptions = [
  { label: 'Heredado', value: 'inherit' },
  { label: 'Geist', value: 'Geist, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Playfair', value: 'Playfair Display, serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'System', value: 'system-ui, sans-serif' },
]
const fontSizeOptions = [
  { label: 'XS', value: 'xs' },
  { label: 'SM', value: 'sm' },
  { label: 'Base', value: 'base' },
  { label: 'LG', value: 'lg' },
  { label: 'XL', value: 'xl' },
  { label: '2XL', value: '2xl' },
  { label: '3XL', value: '3xl' },
]
const fontWeightOptions = [
  { label: 'Ligero', value: 'light' },
  { label: 'Normal', value: 'regular' },
  { label: 'Medio', value: 'medium' },
  { label: 'Semi', value: 'semibold' },
  { label: 'Bold', value: 'bold' },
]
const lineHeightOptions = [
  { label: 'Compacto', value: 'tight' },
  { label: 'Normal', value: 'normal' },
  { label: 'Amplio', value: 'relaxed' },
  { label: 'Suelto', value: 'loose' },
]
const letterSpacingOptions = [
  { label: 'Apretado', value: 'tight' },
  { label: 'Normal', value: 'normal' },
  { label: 'Amplio', value: 'wide' },
  { label: 'Más', value: 'wider' },
  { label: 'Máx', value: 'widest' },
]
const textAlignOptions = [
  { label: '← Izq', value: 'left' },
  { label: '— Centro', value: 'center' },
  { label: 'Der →', value: 'right' },
]

// ─── CSS value maps ───────────────────────────────────────────────────────────

const fontSizeCSS: Record<string, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
}
const fontWeightCSS: Record<string, number> = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
const lineHeightCSS: Record<string, number> = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
  loose: 2.2,
}
const letterSpacingCSS: Record<string, string> = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.05em',
  wider: '0.1em',
  widest: '0.18em',
}

function typoCSS(t: Partial<TypographyStyle>, fallback: React.CSSProperties = {}): React.CSSProperties {
  return {
    ...fallback,
    ...(t.color ? { color: t.color } : {}),
    ...(t.fontFamily && t.fontFamily !== 'inherit' ? { fontFamily: t.fontFamily } : {}),
    ...(t.fontSize && fontSizeCSS[t.fontSize] ? { fontSize: fontSizeCSS[t.fontSize] } : {}),
    ...(t.fontWeight && fontWeightCSS[t.fontWeight] !== undefined ? { fontWeight: fontWeightCSS[t.fontWeight] } : {}),
    ...(t.lineHeight && lineHeightCSS[t.lineHeight] ? { lineHeight: lineHeightCSS[t.lineHeight] } : {}),
    ...(t.letterSpacing && letterSpacingCSS[t.letterSpacing] ? { letterSpacing: letterSpacingCSS[t.letterSpacing] } : {}),
    ...(t.textAlign && t.textAlign !== 'inherit' ? { textAlign: t.textAlign as React.CSSProperties['textAlign'] } : {}),
  }
}

// ─── Default typography values ────────────────────────────────────────────────

const emptyTypo: TypographyStyle = {
  color: '',
  fontFamily: 'inherit',
  fontSize: '',
  fontWeight: '',
  lineHeight: '',
  letterSpacing: '',
  textAlign: 'inherit',
}

const defaultHeaderTypo: HeaderTypography = {
  eyebrow:  { ...emptyTypo, fontSize: 'xs',   fontWeight: 'bold',     letterSpacing: 'wider' },
  title:    { ...emptyTypo, fontSize: '2xl',  fontWeight: 'bold' },
  subtitle: { ...emptyTypo, fontSize: 'base' },
}

const defaultCardTypo: CardTypography = {
  name:        { ...emptyTypo, fontWeight: 'semibold' },
  description: { ...emptyTypo, fontSize: 'sm' },
  price:       { ...emptyTypo, fontSize: 'lg', fontWeight: 'bold' },
  artisan:     { ...emptyTypo, fontSize: 'sm' },
  category:    { ...emptyTypo, fontSize: 'xs', fontWeight: 'bold', letterSpacing: 'wide' },
}

const defaultViewAllStyle: ViewAllStyle = {
  color: '',
  backgroundColor: 'transparent',
  borderColor: '#d1d5db',
  fontSize: 'sm',
  fontWeight: 'medium',
  borderRadius: '6px',
}

const defaultEyebrowStyle: EyebrowStyle = {
  color: '',
  fontSize: 'xs',
  fontWeight: 'bold',
  letterSpacing: 'wider',
  textAlign: 'inherit',
}

// ─── TypographyEditor component ───────────────────────────────────────────────

function TypographyEditor({
  value,
  onChange,
  id,
}: {
  value: TypographyStyle
  onChange: (v: unknown) => void
  id: string
}) {
  function update(key: keyof TypographyStyle, v: unknown) {
    onChange({ ...value, [key]: v })
  }

  const fontLabel       = fontFamilyOptions.find(o => o.value === (value.fontFamily || 'inherit'))?.label ?? 'Heredado'
  const sizeLabel       = fontSizeOptions.find(o => o.value === value.fontSize)?.label ?? '—'
  const weightLabel     = fontWeightOptions.find(o => o.value === value.fontWeight)?.label ?? '—'
  const lhLabel         = lineHeightOptions.find(o => o.value === value.lineHeight)?.label ?? '—'
  const lsLabel         = letterSpacingOptions.find(o => o.value === value.letterSpacing)?.label ?? '—'
  const alignLabel      = (value.textAlign && value.textAlign !== 'inherit')
    ? textAlignOptions.find(o => o.value === value.textAlign)?.label ?? value.textAlign
    : 'Heredado'

  return (
    <div>
      <CollapsibleSection title="Color" subtitle={value.color || 'Heredado'} nested noBorderTop defaultOpen={false} cacheKey={`${id}-color`}>
        <ColorPickerField value={value.color || '#000000'} onChange={(c) => update('color', c)} />
      </CollapsibleSection>
      <CollapsibleSection title="Fuente" subtitle={fontLabel} nested noBorderTop defaultOpen={false} cacheKey={`${id}-family`}>
        {renderRadioOptions(fontFamilyOptions, value.fontFamily || 'inherit', (v) => update('fontFamily', v))}
      </CollapsibleSection>
      <CollapsibleSection title="Tamaño" subtitle={sizeLabel} nested noBorderTop defaultOpen={false} cacheKey={`${id}-size`}>
        {renderRadioOptions(fontSizeOptions, value.fontSize || '', (v) => update('fontSize', v))}
      </CollapsibleSection>
      <CollapsibleSection title="Grosor" subtitle={weightLabel} nested noBorderTop defaultOpen={false} cacheKey={`${id}-weight`}>
        {renderRadioOptions(fontWeightOptions, value.fontWeight || '', (v) => update('fontWeight', v))}
      </CollapsibleSection>
      <CollapsibleSection title="Interlineado" subtitle={lhLabel} nested noBorderTop defaultOpen={false} cacheKey={`${id}-lh`}>
        {renderRadioOptions(lineHeightOptions, value.lineHeight || '', (v) => update('lineHeight', v))}
      </CollapsibleSection>
      <CollapsibleSection title="Espaciado entre letras" subtitle={lsLabel} nested noBorderTop defaultOpen={false} cacheKey={`${id}-ls`}>
        {renderRadioOptions(letterSpacingOptions, value.letterSpacing || '', (v) => update('letterSpacing', v))}
      </CollapsibleSection>
      <CollapsibleSection title="Alineación" subtitle={alignLabel} nested noBorderTop defaultOpen={false} cacheKey={`${id}-align`}>
        {renderRadioOptions(textAlignOptions, value.textAlign || 'inherit', (v) => update('textAlign', v))}
      </CollapsibleSection>
    </div>
  )
}

// ─── getSummaryTypo helper ────────────────────────────────────────────────────

function getSummaryTypo(v: unknown): string {
  const s = v as Partial<TypographyStyle> | null
  if (!s) return 'Sin personalizar'
  const parts: string[] = []
  if (s.color) parts.push(s.color)
  if (s.fontSize) parts.push(s.fontSize)
  if (s.fontWeight) parts.push(s.fontWeight)
  return parts.join(' · ') || 'Sin personalizar'
}

// ─── Card style map ───────────────────────────────────────────────────────────

const cardStyleMap: Record<ProductGridBlockProps['cardStyle'], React.CSSProperties> = {
  shadow:  { boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
  border:  { border: '1px solid #e2e8f0' },
  minimal: {},
}

// ─── Field definitions ────────────────────────────────────────────────────────

export const productGridBlockFields: Fields<ProductGridBlockProps> = {
  title:    { type: 'text', label: 'Título de la sección' },
  subtitle: { type: 'text', label: 'Subtítulo (opcional)' },

  columns: makeCollapsibleRadio('Columnas', [
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
  ]) as Fields<ProductGridBlockProps>['columns'],

  backgroundColor: makeCollapsibleColor('Color de fondo') as Fields<ProductGridBlockProps>['backgroundColor'],
  textColor:       makeCollapsibleColor('Color del texto') as Fields<ProductGridBlockProps>['textColor'],
  accentColor:     makeCollapsibleColor('Color de acento') as Fields<ProductGridBlockProps>['accentColor'],

  headerTypography: makeCollapsibleGroup<HeaderTypography>(
    'Tipografía — Encabezado',
    [
      {
        key: 'eyebrow',
        title: 'Texto eyebrow',
        getSummary: getSummaryTypo,
        render: (v, onChange) => (
          <TypographyEditor
            id="hdr-eyebrow"
            value={{ ...defaultHeaderTypo.eyebrow, ...(v as Partial<TypographyStyle> ?? {}) }}
            onChange={onChange}
          />
        ),
      },
      {
        key: 'title',
        title: 'Título principal',
        getSummary: getSummaryTypo,
        render: (v, onChange) => (
          <TypographyEditor
            id="hdr-title"
            value={{ ...defaultHeaderTypo.title, ...(v as Partial<TypographyStyle> ?? {}) }}
            onChange={onChange}
          />
        ),
      },
      {
        key: 'subtitle',
        title: 'Subtítulo',
        getSummary: getSummaryTypo,
        render: (v, onChange) => (
          <TypographyEditor
            id="hdr-subtitle"
            value={{ ...defaultHeaderTypo.subtitle, ...(v as Partial<TypographyStyle> ?? {}) }}
            onChange={onChange}
          />
        ),
      },
    ],
    defaultHeaderTypo,
  ) as Fields<ProductGridBlockProps>['headerTypography'],

  cardTypography: makeCollapsibleGroup<CardTypography>(
    'Tipografía — Tarjetas',
    [
      {
        key: 'name',
        title: 'Nombre del producto',
        getSummary: getSummaryTypo,
        render: (v, onChange) => (
          <TypographyEditor
            id="card-name"
            value={{ ...defaultCardTypo.name, ...(v as Partial<TypographyStyle> ?? {}) }}
            onChange={onChange}
          />
        ),
      },
      {
        key: 'description',
        title: 'Descripción',
        getSummary: getSummaryTypo,
        render: (v, onChange) => (
          <TypographyEditor
            id="card-desc"
            value={{ ...defaultCardTypo.description, ...(v as Partial<TypographyStyle> ?? {}) }}
            onChange={onChange}
          />
        ),
      },
      {
        key: 'price',
        title: 'Precio',
        getSummary: getSummaryTypo,
        render: (v, onChange) => (
          <TypographyEditor
            id="card-price"
            value={{ ...defaultCardTypo.price, ...(v as Partial<TypographyStyle> ?? {}) }}
            onChange={onChange}
          />
        ),
      },
      {
        key: 'artisan',
        title: 'Artesano/a',
        getSummary: getSummaryTypo,
        render: (v, onChange) => (
          <TypographyEditor
            id="card-artisan"
            value={{ ...defaultCardTypo.artisan, ...(v as Partial<TypographyStyle> ?? {}) }}
            onChange={onChange}
          />
        ),
      },
      {
        key: 'category',
        title: 'Categoría',
        getSummary: getSummaryTypo,
        render: (v, onChange) => (
          <TypographyEditor
            id="card-category"
            value={{ ...defaultCardTypo.category, ...(v as Partial<TypographyStyle> ?? {}) }}
            onChange={onChange}
          />
        ),
      },
    ],
    defaultCardTypo,
  ) as Fields<ProductGridBlockProps>['cardTypography'],

  showCategory: makeCollapsibleRadio('Mostrar categoría', [
    { label: 'Sí', value: 'true' },
    { label: 'No', value: 'false' },
  ]) as Fields<ProductGridBlockProps>['showCategory'],

  showArtisan: makeCollapsibleRadio('Mostrar artesano/a', [
    { label: 'Sí', value: 'true' },
    { label: 'No', value: 'false' },
  ]) as Fields<ProductGridBlockProps>['showArtisan'],

  cardStyle: makeCollapsibleRadio('Estilo de tarjeta', [
    { label: 'Sombra', value: 'shadow' },
    { label: 'Borde', value: 'border' },
    { label: 'Minimal', value: 'minimal' },
  ]) as Fields<ProductGridBlockProps>['cardStyle'],

  categoryPosition: makeCollapsibleRadio('Posición categoría', [
    { label: 'Badge sobre imagen', value: 'badge' },
    { label: 'Sobre el nombre', value: 'above-name' },
  ]) as Fields<ProductGridBlockProps>['categoryPosition'],

  showCta: makeCollapsibleRadio('Mostrar botón CTA', [
    { label: 'Sí', value: 'true' },
    { label: 'No', value: 'false' },
  ]) as Fields<ProductGridBlockProps>['showCta'],

  whatsappPhone: {
    type: 'custom',
    label: '',
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
      <CollapsibleSection title="WhatsApp" defaultOpen={false} cacheKey="pgb-whatsapp">
        <label style={{ display: 'block', fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Número (sin + ni espacios)
        </label>
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: 573001234567"
          style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
        />
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 6, marginBottom: 0 }}>
          Solo necesario cuando el tipo del CTA es WhatsApp
        </p>
      </CollapsibleSection>
    ),
  },

  eyebrowText: {
    type: 'custom',
    label: '',
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
      <CollapsibleSection title="Texto Eyebrow" defaultOpen={false} cacheKey="pgb-eyebrow-text">
        <label style={{ display: 'block', fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Texto
        </label>
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Nuestra Colección"
          style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
        />
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 6, marginBottom: 0 }}>
          Tipografía del eyebrow en &quot;Tipografía — Encabezado&quot;
        </p>
      </CollapsibleSection>
    ),
  },

  eyebrowStyle: makeCollapsibleGroup<EyebrowStyle>(
    'Estilo Eyebrow',
    [
      {
        key: 'color',
        title: 'Color del texto',
        getSummary: (v) => (v as string) || 'Heredado',
        render: (v, onChange) => (
          <ColorPickerField value={(v as string) || '#000000'} onChange={(c) => onChange(c)} />
        ),
      },
      {
        key: 'fontSize',
        title: 'Tamaño',
        getSummary: (v) => getSummaryTypo({ fontSize: v as string }),
        render: (v, onChange) => renderRadioOptions(fontSizeOptions, v, onChange),
      },
      {
        key: 'fontWeight',
        title: 'Grosor',
        getSummary: (v) => getSummaryTypo({ fontWeight: v as string }),
        render: (v, onChange) => renderRadioOptions(fontWeightOptions, v, onChange),
      },
      {
        key: 'letterSpacing',
        title: 'Espaciado letras',
        getSummary: (v) => getSummaryTypo({ letterSpacing: v as string }),
        render: (v, onChange) => renderRadioOptions(letterSpacingOptions, v, onChange),
      },
      {
        key: 'textAlign',
        title: 'Alineación',
        getSummary: (v) => (v as string) || 'Heredar',
        render: (v, onChange) => renderRadioOptions(
          [{ label: 'Heredar', value: 'inherit' }, ...textAlignOptions],
          v,
          onChange,
        ),
      },
    ],
    defaultEyebrowStyle,
  ) as Fields<ProductGridBlockProps>['eyebrowStyle'],

  viewAllText: {
    type: 'custom',
    label: '',
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
      <CollapsibleSection title='Enlace "Ver todos"' defaultOpen={false} cacheKey="pgb-viewall-text">
        <label style={{ display: 'block', fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Texto del enlace
        </label>
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Ver toda la colección"
          style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
        />
      </CollapsibleSection>
    ),
  },

  viewAllUrl: {
    type: 'custom',
    label: '',
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
      <CollapsibleSection title="URL del enlace" defaultOpen={false} cacheKey="pgb-viewall-url" noBorderTop>
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#"
          style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
        />
      </CollapsibleSection>
    ),
  },

  viewAllStyle: makeCollapsibleGroup<ViewAllStyle>(
    'Estilo "Ver todos"',
    [
      {
        key: 'color',
        title: 'Color del texto',
        getSummary: (v) => (v as string) || 'Usa color del bloque',
        render: (v, onChange) => (
          <ColorPickerField value={(v as string) || '#000000'} onChange={(c) => onChange(c)} />
        ),
      },
      {
        key: 'backgroundColor',
        title: 'Fondo del botón',
        getSummary: (v) => (v as string) || 'Transparente',
        render: (v, onChange) => (
          <ColorPickerField value={(v as string) || '#ffffff'} onChange={(c) => onChange(c)} />
        ),
      },
      {
        key: 'borderColor',
        title: 'Color del borde',
        getSummary: (v) => (v as string) || '#d1d5db',
        render: (v, onChange) => (
          <ColorPickerField value={(v as string) || '#d1d5db'} onChange={(c) => onChange(c)} />
        ),
      },
      {
        key: 'fontSize',
        title: 'Tamaño',
        getSummary: (v) => getSummaryTypo({ fontSize: v as string }),
        render: (v, onChange) => renderRadioOptions(fontSizeOptions, v, onChange),
      },
      {
        key: 'fontWeight',
        title: 'Grosor',
        getSummary: (v) => getSummaryTypo({ fontWeight: v as string }),
        render: (v, onChange) => renderRadioOptions(fontWeightOptions, v, onChange),
      },
      {
        key: 'borderRadius',
        title: 'Radio del borde',
        getSummary: (v) => (v as string) || '6px',
        render: (v, onChange) => renderRadioOptions(
          [
            { label: 'Recto', value: '4px' },
            { label: 'Suave', value: '6px' },
            { label: 'Redondo', value: '8px' },
            { label: 'Pill', value: '9999px' },
          ],
          v,
          onChange,
        ),
      },
    ],
    defaultViewAllStyle,
  ) as Fields<ProductGridBlockProps>['viewAllStyle'],

  products: {
    type: 'array',
    label: 'Productos',
    arrayFields: {
      image:       { type: 'text', label: 'URL de imagen' },
      imageAlt:    { type: 'text', label: 'Texto alternativo' },
      category:    { type: 'text', label: 'Categoría' },
      name:        { type: 'text', label: 'Nombre del producto' },
      description: { type: 'text', label: 'Descripción breve' },
      price:       { type: 'text', label: 'Precio (ej: $85.000)' },
      artisan:     { type: 'text', label: 'Artesano/a (opcional)' },
      ctaText:     { type: 'text', label: 'Texto del botón' },
      ctaUrl:      { type: 'text', label: 'URL del botón (solo si tipo = Enlace)' },
      ctaType: {
        type: 'radio',
        label: 'Tipo de botón',
        options: [
          { label: 'Enlace', value: 'link' },
          { label: 'WhatsApp', value: 'whatsapp' },
        ],
      },
    },
    defaultItemProps: {
      image:       'https://placehold.co/400x300/e2e8f0/64748b?text=Producto',
      imageAlt:    'Producto',
      category:    'Categoría',
      name:        'Nombre del producto',
      description: 'Descripción breve del producto.',
      price:       '$0.000',
      artisan:     '',
      ctaText:     'Consultar',
      ctaUrl:      '#',
      ctaType:     'link',
    },
    getItemSummary: (item: { name?: string }) => (item.name as string) || 'Producto',
  },
}

// ─── Default props ────────────────────────────────────────────────────────────

export const productGridBlockDefaultProps: ProductGridBlockProps = {
  title:    'Nuestros Productos',
  subtitle: '',
  columns:  3,
  products: [
    {
      image:       'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+1',
      imageAlt:    'Producto 1',
      category:    'Mochilas',
      name:        'Mochila Wayuu Premium',
      description: 'Tejida a mano con hilos de colores vibrantes y diseños únicos.',
      price:       '$85.000',
      artisan:     'María López',
      ctaText:     'Ver producto',
      ctaUrl:      '#',
    },
    {
      image:       'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+2',
      imageAlt:    'Producto 2',
      category:    'Cerámica',
      name:        'Vasija de Barro Artesanal',
      description: 'Pieza única de cerámica con técnicas ancestrales del Vichada.',
      price:       '$45.000',
      artisan:     'Carlos Ruiz',
      ctaText:     'Ver producto',
      ctaUrl:      '#',
    },
    {
      image:       'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+3',
      imageAlt:    'Producto 3',
      category:    'Joyería',
      name:        'Collar de Semillas Naturales',
      description: 'Elaborado con semillas recolectadas en la selva amazónica.',
      price:       '$32.000',
      artisan:     'Ana Torres',
      ctaText:     'Ver producto',
      ctaUrl:      '#',
    },
  ],
  backgroundColor:   '#ffffff',
  textColor:         '#1e293b',
  accentColor:       '#b45309',
  showCategory:      true,
  showArtisan:       false,
  cardStyle:         'shadow',
  eyebrowText:       '',
  viewAllText:       '',
  viewAllUrl:        '#',
  categoryPosition:  'badge',
  showCta:           true,
  whatsappPhone:     '',
  headerTypography:  defaultHeaderTypo,
  cardTypography:    defaultCardTypo,
  viewAllStyle:      defaultViewAllStyle,
  eyebrowStyle:      defaultEyebrowStyle,
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx={9} cy={21} r={1} />
    <circle cx={20} cy={21} r={1} />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

// ─── WhatsApp URL builder ─────────────────────────────────────────────────────

function buildWhatsAppUrl(phone: string, productName: string, price: string): string {
  const text = `Hola, me interesa ${productName} (${price})`
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

// ─── ProductGridBlock component ───────────────────────────────────────────────

export function ProductGridBlock({
  title,
  subtitle,
  columns,
  products,
  backgroundColor,
  textColor,
  accentColor,
  showCategory,
  showArtisan,
  cardStyle,
  eyebrowText = '',
  viewAllText = '',
  viewAllUrl = '#',
  categoryPosition = 'badge',
  showCta = true,
  whatsappPhone = '',
  headerTypography,
  cardTypography,
  viewAllStyle,
  eyebrowStyle,
}: ProductGridBlockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Merge user overrides on top of defaults
  const hTypo = {
    eyebrow:  { ...defaultHeaderTypo.eyebrow,  ...headerTypography?.eyebrow },
    title:    { ...defaultHeaderTypo.title,    ...headerTypography?.title },
    subtitle: { ...defaultHeaderTypo.subtitle, ...headerTypography?.subtitle },
  }
  const cTypo = {
    name:        { ...defaultCardTypo.name,        ...cardTypography?.name },
    description: { ...defaultCardTypo.description, ...cardTypography?.description },
    price:       { ...defaultCardTypo.price,       ...cardTypography?.price },
    artisan:     { ...defaultCardTypo.artisan,     ...cardTypography?.artisan },
    category:    { ...defaultCardTypo.category,    ...cardTypography?.category },
  }

  const vas = { ...defaultViewAllStyle, ...(viewAllStyle ?? {}) }
  const eas = { ...defaultEyebrowStyle, ...(eyebrowStyle ?? {}) }

  // Resolved eyebrowStyle as a partial TypographyStyle for typoCSS merging
  const eyebrowStyleResolved: Partial<TypographyStyle> = {
    ...(eas.color ? { color: eas.color } : {}),
    ...(eas.fontSize ? { fontSize: eas.fontSize } : {}),
    ...(eas.fontWeight ? { fontWeight: eas.fontWeight } : {}),
    ...(eas.letterSpacing ? { letterSpacing: eas.letterSpacing } : {}),
    ...(eas.textAlign ? { textAlign: eas.textAlign } : {}),
  }

  const cardBase: React.CSSProperties = {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s, box-shadow 0.15s',
    ...cardStyleMap[cardStyle],
  }

  return (
    <section style={{ backgroundColor, padding: 'clamp(48px, 8vw, 80px) clamp(24px, 6vw, 80px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section header — flex space-between when viewAllText is set */}
        <div style={{
          display: 'flex',
          alignItems: viewAllText ? 'flex-end' : undefined,
          justifyContent: viewAllText ? 'space-between' : undefined,
          marginBottom: 40,
        }}>
          <div style={{ flex: 1 }}>
            {eyebrowText && (
              <p style={typoCSS({ ...hTypo.eyebrow, ...eyebrowStyleResolved }, {
                color: accentColor,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textAlign: (eyebrowStyleResolved.textAlign && eyebrowStyleResolved.textAlign !== 'inherit')
                  ? eyebrowStyleResolved.textAlign as 'left' | 'center' | 'right'
                  : hTypo.eyebrow.textAlign !== 'inherit'
                    ? hTypo.eyebrow.textAlign as 'left' | 'center' | 'right'
                    : viewAllText ? 'left' : 'center',
                marginBottom: 10,
              })}>
                {eyebrowText}
              </p>
            )}
            {title && (
              <h2 style={typoCSS(hTypo.title, {
                color: textColor,
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 700,
                textAlign: hTypo.title.textAlign !== 'inherit'
                  ? hTypo.title.textAlign as 'left' | 'center' | 'right'
                  : viewAllText ? 'left' : 'center',
                marginBottom: subtitle ? 8 : 0,
                margin: 0,
              })}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={typoCSS(hTypo.subtitle, {
                color: textColor,
                opacity: 0.7,
                textAlign: hTypo.subtitle.textAlign !== 'inherit'
                  ? hTypo.subtitle.textAlign as 'left' | 'center' | 'right'
                  : viewAllText ? 'left' : 'center',
                fontSize: '1.05rem',
                marginBottom: 0,
              })}>
                {subtitle}
              </p>
            )}
          </div>
          {viewAllText && (
            <a href={viewAllUrl} style={{
              color: vas.color || textColor,
              fontWeight: fontWeightCSS[vas.fontWeight] ?? 500,
              fontSize: fontSizeCSS[vas.fontSize] ?? '0.875rem',
              border: `1px solid ${vas.borderColor || '#d1d5db'}`,
              borderRadius: vas.borderRadius || '6px',
              backgroundColor: vas.backgroundColor || 'transparent',
              textDecoration: 'none',
              padding: '8px 18px',
              whiteSpace: 'nowrap',
              marginLeft: 24,
              flexShrink: 0,
            }}>
              {viewAllText}
            </a>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 24,
        }}>
          {products.map((product, i) => (
            <div key={i} style={cardBase}>
              {/* Image */}
              <div
                style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f1f5f9' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Category badge — only when categoryPosition is 'badge' */}
                {showCategory && product.category && categoryPosition === 'badge' && (
                  <span style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    background: accentColor,
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 20,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {product.category}
                  </span>
                )}
                {/* Hover overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  opacity: hoveredIndex === i ? 1 : 0,
                  transition: 'opacity 200ms ease',
                  pointerEvents: hoveredIndex === i ? 'auto' : 'none',
                }}>
                  <button
                    type="button"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.85)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1e293b',
                      flexShrink: 0,
                    }}
                  >
                    <HeartIcon />
                  </button>
                  <button
                    type="button"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.85)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: product.ctaType === 'whatsapp' ? '#25D366' : '#1e293b',
                      flexShrink: 0,
                    }}
                  >
                    {product.ctaType === 'whatsapp' ? <WhatsAppIcon /> : <CartIcon />}
                  </button>
                </div>
              </div>

              {/* Card content */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Category above name — only when categoryPosition is 'above-name' */}
                {showCategory && product.category && categoryPosition === 'above-name' && (
                  <p style={typoCSS(cTypo.category, {
                    color: accentColor,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    margin: '0 0 4px',
                  })}>
                    {product.category}
                  </p>
                )}
                <h3 style={typoCSS(cTypo.name, {
                  color: textColor,
                  fontSize: '1rem',
                  fontWeight: 600,
                  margin: '0 0 6px',
                  lineHeight: 1.3,
                })}>
                  {product.name}
                </h3>
                {product.description && (
                  <p style={typoCSS(cTypo.description, {
                    color: textColor,
                    opacity: 0.65,
                    fontSize: '0.85rem',
                    margin: '0 0 8px',
                    lineHeight: 1.5,
                    flex: 1,
                  })}>
                    {product.description}
                  </p>
                )}
                {showArtisan && product.artisan && (
                  <p style={typoCSS(cTypo.artisan, {
                    color: textColor,
                    opacity: 0.55,
                    fontSize: '0.8rem',
                    fontStyle: 'italic',
                    margin: '0 0 12px',
                  })}>
                    Por {product.artisan}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12 }}>
                  <span style={typoCSS(cTypo.price, {
                    color: accentColor,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  })}>
                    {product.price}
                  </span>
                  {showCta && (() => {
                    const isWa = product.ctaType === 'whatsapp' && whatsappPhone
                    const href = isWa
                      ? buildWhatsAppUrl(whatsappPhone, product.name, product.price)
                      : product.ctaUrl
                    const bgColor = isWa ? '#25D366' : accentColor
                    return (
                      <a
                        href={href}
                        target={isWa ? '_blank' : undefined}
                        rel={isWa ? 'noopener noreferrer' : undefined}
                        style={{
                          background: bgColor,
                          color: '#fff',
                          padding: '7px 14px',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        {isWa && <WhatsAppIcon />}
                        {product.ctaText}
                      </a>
                    )
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
