import React from 'react'
import type { Fields } from '@measured/puck'
import { ColorPickerField } from '@/components/ColorPickerField'
import { FontFamilyField } from '@/components/FontFamilyField'
import { makeCollapsibleRadio, makeCollapsibleColor } from '@/lib/fieldHelpers'

export interface LogoLine {
  text: string
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  weight: 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  spacing: 'tight' | 'normal' | 'wide' | 'wider'
  transform: 'none' | 'uppercase' | 'capitalize'
  color: string   // hex color — soporta también los valores legacy 'accent' | 'text' | 'muted'
  fontFamily: string  // '' = heredar fuente global
}

export interface NavbarBlockProps {
  logoText: string
  logoLines: LogoLine[]
  logoImageUrl: string
  navLinks: Array<{ label: string; url: string }>
  backgroundColor: string
  textColor: string
  accentColor: string
  sticky: boolean
  showSearch: boolean
  showCart: boolean
  layout: 'logo-left' | 'logo-left-links-center' | 'logo-center'
  navFontWeight: 'light' | 'regular' | 'medium'
  borderStyle: 'shadow' | 'border' | 'none'
}

const SIZE_MAP: Record<LogoLine['size'], string> = {
  xs: '0.6rem',
  sm: '0.75rem',
  base: '0.9rem',
  lg: '1.05rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
}

const WEIGHT_MAP: Record<LogoLine['weight'], number> = {
  thin: 100,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

const SPACING_MAP: Record<LogoLine['spacing'], string> = {
  tight: '-0.02em',
  normal: '0em',
  wide: '0.08em',
  wider: '0.18em',
}

const NAV_FONT_WEIGHT_MAP = { light: 300, regular: 400, medium: 500 } as const

export const navbarBlockFields: Fields<NavbarBlockProps> = {
  logoLines: {
    type: 'array',
    label: 'Líneas del logo',
    arrayFields: {
      text: { type: 'text', label: 'Texto' },
      size: {
        type: 'select',
        label: 'Tamaño',
        options: [
          { label: 'XS (0.6rem)', value: 'xs' },
          { label: 'SM (0.75rem)', value: 'sm' },
          { label: 'Base (0.9rem)', value: 'base' },
          { label: 'LG (1.05rem)', value: 'lg' },
          { label: 'XL (1.25rem)', value: 'xl' },
          { label: '2XL (1.5rem)', value: '2xl' },
        ],
      },
      weight: {
        type: 'select',
        label: 'Peso',
        options: [
          { label: 'Thin (100)', value: 'thin' },
          { label: 'Light (300)', value: 'light' },
          { label: 'Regular (400)', value: 'regular' },
          { label: 'Medium (500)', value: 'medium' },
          { label: 'Semibold (600)', value: 'semibold' },
          { label: 'Bold (700)', value: 'bold' },
        ],
      },
      spacing: {
        type: 'select',
        label: 'Espaciado de letras',
        options: [
          { label: 'Tight', value: 'tight' },
          { label: 'Normal', value: 'normal' },
          { label: 'Wide', value: 'wide' },
          { label: 'Wider', value: 'wider' },
        ],
      },
      transform: {
        type: 'select',
        label: 'Transformación',
        options: [
          { label: 'Ninguna', value: 'none' },
          { label: 'MAYÚSCULAS', value: 'uppercase' },
          { label: 'Capitalizado', value: 'capitalize' },
        ],
      },
      color: {
        type: 'custom',
        label: 'Color',
        render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
          <ColorPickerField value={value as string} onChange={onChange} />
        ),
      },
      fontFamily: {
        type: 'custom',
        label: 'Fuente',
        render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
          <FontFamilyField value={value as string} onChange={onChange} />
        ),
      },
    },
    defaultItemProps: {
      text: 'Mi Negocio',
      size: 'lg',
      weight: 'semibold',
      spacing: 'tight',
      transform: 'none',
      color: '#b45309',
      fontFamily: '',
    },
    getItemSummary: (item: { text?: string }) => (item.text as string) || 'Línea',
  },
  logoText: { type: 'text', label: 'Logo texto (fallback legacy)' },
  logoImageUrl: { type: 'text', label: 'URL del logo (imagen, opcional)' },
  navLinks: {
    type: 'array',
    label: 'Enlaces de navegación',
    arrayFields: {
      label: { type: 'text', label: 'Texto' },
      url: { type: 'text', label: 'URL' },
    },
    defaultItemProps: { label: 'Nuevo enlace', url: '#' },
    getItemSummary: (item: { label?: string }) => (item.label as string) || 'Enlace',
  },
  backgroundColor: makeCollapsibleColor('Color de fondo') as Fields<NavbarBlockProps>['backgroundColor'],
  textColor: makeCollapsibleColor('Color del texto') as Fields<NavbarBlockProps>['textColor'],
  accentColor: makeCollapsibleColor('Color de acento') as Fields<NavbarBlockProps>['accentColor'],
  layout: makeCollapsibleRadio('Disposición', [
    { label: 'Logo izq. · Links izq.', value: 'logo-left' },
    { label: 'Logo izq. · Links centrados', value: 'logo-left-links-center' },
    { label: 'Logo centrado', value: 'logo-center' },
  ]) as Fields<NavbarBlockProps>['layout'],
  navFontWeight: makeCollapsibleRadio('Peso de los links', [
    { label: 'Ligero', value: 'light' },
    { label: 'Normal', value: 'regular' },
    { label: 'Medio', value: 'medium' },
  ]) as Fields<NavbarBlockProps>['navFontWeight'],
  borderStyle: makeCollapsibleRadio('Separador inferior', [
    { label: 'Sombra', value: 'shadow' },
    { label: 'Línea fina', value: 'border' },
    { label: 'Ninguno', value: 'none' },
  ]) as Fields<NavbarBlockProps>['borderStyle'],
  sticky: makeCollapsibleRadio('Posición', [
    { label: 'Fija al scroll', value: 'true' },
    { label: 'Normal', value: 'false' },
  ]) as Fields<NavbarBlockProps>['sticky'],
  showSearch: makeCollapsibleRadio('Mostrar buscador', [
    { label: 'Sí', value: 'true' },
    { label: 'No', value: 'false' },
  ]) as Fields<NavbarBlockProps>['showSearch'],
  showCart: makeCollapsibleRadio('Mostrar carrito', [
    { label: 'Sí', value: 'true' },
    { label: 'No', value: 'false' },
  ]) as Fields<NavbarBlockProps>['showCart'],
}

export const navbarBlockDefaultProps: NavbarBlockProps = {
  logoText: '',
  logoLines: [
    { text: 'Mi Negocio', size: 'lg', weight: 'semibold', spacing: 'tight', transform: 'none', color: '#b45309', fontFamily: '' },
  ],
  logoImageUrl: '',
  navLinks: [
    { label: 'Inicio', url: '/' },
    { label: 'Productos', url: '/productos' },
    { label: 'Nosotros', url: '/nosotros' },
    { label: 'Contacto', url: '/contacto' },
  ],
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  accentColor: '#b45309',
  sticky: true,
  showSearch: true,
  showCart: false,
  layout: 'logo-left',
  navFontWeight: 'medium',
  borderStyle: 'shadow',
}

function resolveLineColor(color: string, accentColor: string, textColor: string): string {
  if (color === 'accent') return accentColor   // legacy
  if (color === 'muted') return `${textColor}99` // legacy
  if (color === 'text') return textColor         // legacy
  return color                                   // hex o cualquier valor CSS válido
}

function isTruthy(v: unknown): boolean {
  return v !== false && v !== 'false' && Boolean(v)
}

export function NavbarBlock({
  logoText,
  logoLines,
  logoImageUrl,
  navLinks,
  backgroundColor,
  textColor,
  accentColor,
  sticky,
  showSearch,
  showCart,
  layout,
  navFontWeight,
  borderStyle,
}: NavbarBlockProps) {
  const isSticky = isTruthy(sticky)
  const hasSearch = isTruthy(showSearch)
  const hasCart = isTruthy(showCart)

  const navStyle: React.CSSProperties = {
    backgroundColor,
    color: textColor,
    position: isSticky ? 'sticky' : 'relative',
    top: isSticky ? 0 : undefined,
    zIndex: 50,
    width: '100%',
    boxShadow: borderStyle === 'shadow' ? '0 1px 8px rgba(0,0,0,.08)' : 'none',
    borderBottom: borderStyle === 'border' ? `1px solid ${textColor}22` : 'none',
  }

  const hasLines = Array.isArray(logoLines) && logoLines.length > 0
  const hasMultipleLines = hasLines && logoLines.length > 1

  const Logo = (
    <a href="/" style={{ display: 'flex', alignItems: hasMultipleLines ? 'flex-start' : 'center', gap: 10, textDecoration: 'none' }}>
      {logoImageUrl ? (
        <img src={logoImageUrl} alt={hasLines ? logoLines[0]?.text : logoText} style={{ height: 36, objectFit: 'contain' }} />
      ) : hasLines ? (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          {logoLines.map((line, i) => (
            <span
              key={i}
              style={{
                fontSize: SIZE_MAP[line.size] ?? '1.05rem',
                fontWeight: WEIGHT_MAP[line.weight] ?? 600,
                letterSpacing: SPACING_MAP[line.spacing] ?? '-0.02em',
                textTransform: line.transform === 'none' ? undefined : line.transform,
                color: resolveLineColor(line.color, accentColor, textColor),
                fontFamily: line.fontFamily || undefined,
              }}
            >
              {line.text}
            </span>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontWeight: 600, fontSize: '1.05rem', color: accentColor, letterSpacing: '-0.01em' }}>
            {logoText}
          </span>
        </div>
      )}
    </a>
  )

  const linkWeight = NAV_FONT_WEIGHT_MAP[navFontWeight] ?? 500

  const NavLinks = (
    <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
      {navLinks.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            style={{
              color: textColor,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: linkWeight,
              padding: '6px 14px',
              borderRadius: 4,
              display: 'block',
              letterSpacing: '0.01em',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = accentColor }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = textColor }}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )

  const Actions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {hasSearch && (
        <button
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor, padding: 8, borderRadius: 6, display: 'flex' }}
          aria-label="Buscar"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      )}
      {hasCart && (
        <button
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor, padding: 8, borderRadius: 6, display: 'flex', position: 'relative' }}
          aria-label="Carrito"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 15, height: 15, borderRadius: '50%',
            background: accentColor, color: '#fff',
            fontSize: 9, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>0</span>
        </button>
      )}
    </div>
  )

  return (
    <nav style={navStyle} role="navigation" aria-label="Navegación principal">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center' }}>

        {layout === 'logo-left' && (
          <>
            {Logo}
            <div style={{ flex: 1, paddingLeft: 32 }}>{NavLinks}</div>
            {Actions}
          </>
        )}

        {layout === 'logo-left-links-center' && (
          <>
            <div style={{ flex: 1 }}>{Logo}</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>{NavLinks}</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>{Actions}</div>
          </>
        )}

        {layout === 'logo-center' && (
          <>
            <div style={{ flex: 1 }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{Logo}</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
              {NavLinks}
              {Actions}
            </div>
          </>
        )}

      </div>
    </nav>
  )
}
