import React from 'react'
import type { Fields } from '@measured/puck'

export interface NavbarBlockProps {
  logoText: string
  logoImageUrl: string
  navLinks: Array<{ label: string; url: string }>
  backgroundColor: string
  textColor: string
  accentColor: string
  sticky: boolean
  showSearch: boolean
  showCart: boolean
  layout: 'logo-left' | 'logo-center'
}

export const navbarBlockFields: Fields<NavbarBlockProps> = {
  logoText: { type: 'text', label: 'Nombre / Logo texto' },
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
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  accentColor: { type: 'text', label: 'Color de acento (hex)' },
  layout: {
    type: 'radio',
    label: 'Disposición',
    options: [
      { label: 'Logo a la izquierda', value: 'logo-left' },
      { label: 'Logo centrado', value: 'logo-center' },
    ],
  },
  sticky: {
    type: 'radio',
    label: 'Posición',
    options: [
      { label: 'Fija al scroll', value: true as unknown as string },
      { label: 'Normal', value: false as unknown as string },
    ],
  },
  showSearch: {
    type: 'radio',
    label: 'Mostrar buscador',
    options: [
      { label: 'Sí', value: true as unknown as string },
      { label: 'No', value: false as unknown as string },
    ],
  },
  showCart: {
    type: 'radio',
    label: 'Mostrar carrito',
    options: [
      { label: 'Sí', value: true as unknown as string },
      { label: 'No', value: false as unknown as string },
    ],
  },
}

export const navbarBlockDefaultProps: NavbarBlockProps = {
  logoText: 'Mi Negocio',
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
}

export function NavbarBlock({
  logoText,
  logoImageUrl,
  navLinks,
  backgroundColor,
  textColor,
  accentColor,
  sticky,
  showSearch,
  showCart,
  layout,
}: NavbarBlockProps) {
  const navStyle: React.CSSProperties = {
    backgroundColor,
    color: textColor,
    position: sticky ? 'sticky' : 'relative',
    top: sticky ? 0 : undefined,
    zIndex: 50,
    boxShadow: '0 1px 8px rgba(0,0,0,.08)',
    width: '100%',
  }

  const Logo = (
    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
      {logoImageUrl ? (
        <img src={logoImageUrl} alt={logoText} style={{ height: 36, objectFit: 'contain' }} />
      ) : (
        <span style={{ fontWeight: 700, fontSize: '1.2rem', color: accentColor, letterSpacing: '-0.02em' }}>
          {logoText}
        </span>
      )}
    </a>
  )

  const NavLinks = (
    <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
      {navLinks.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            style={{
              color: textColor,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: 6,
              transition: 'background 0.15s',
              display: 'block',
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {showSearch && (
        <button
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor, padding: 6, borderRadius: 6, display: 'flex' }}
          aria-label="Buscar"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      )}
      {showCart && (
        <button
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor, padding: 6, borderRadius: 6, display: 'flex', position: 'relative' }}
          aria-label="Carrito"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 16, height: 16, borderRadius: '50%',
            background: accentColor, color: '#fff',
            fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>0</span>
        </button>
      )}
    </div>
  )

  return (
    <nav style={navStyle} role="navigation" aria-label="Navegación principal">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 32 }}>
        {layout === 'logo-left' ? (
          <>
            {Logo}
            <div style={{ flex: 1 }}>{NavLinks}</div>
            {Actions}
          </>
        ) : (
          <>
            {Actions}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{Logo}</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              {NavLinks}
              {Actions}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
