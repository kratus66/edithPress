import React from 'react'
import type { Fields } from '@measured/puck'

export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin'

export interface FooterBlockProps {
  logoText: string
  logoSubtext: string
  logoImageUrl: string
  tagline: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  socialLinks: Array<{ platform: SocialPlatform; url: string }>
  columns: Array<{ heading: string; links: Array<{ label: string; url: string }> }>
  copyright: string
  legalLinks: Array<{ label: string; url: string }>
  backgroundColor: string
  textColor: string
  accentColor: string
  showNewsletter: boolean
  newsletterTitle: string
  newsletterSubtitle: string
  newsletterPlaceholder: string
  newsletterButtonText: string
  newsletterBackgroundColor: string
}

function getSocialIcon(platform: SocialPlatform): JSX.Element {
  switch (platform) {
    case 'instagram':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    case 'twitter':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    default:
      return <span />
  }
}

export const footerBlockFields: Fields<FooterBlockProps> = {
  logoText: { type: 'text', label: 'Texto del logo' },
  logoSubtext: { type: 'text', label: 'Subtexto del logo (opcional)' },
  logoImageUrl: { type: 'text', label: 'URL de imagen del logo (opcional)' },
  tagline: { type: 'text', label: 'Tagline / descripción breve' },
  contactEmail: { type: 'text', label: 'Email de contacto' },
  contactPhone: { type: 'text', label: 'Teléfono de contacto (opcional)' },
  contactAddress: { type: 'text', label: 'Dirección (opcional)' },
  socialLinks: {
    type: 'array',
    label: 'Redes sociales',
    arrayFields: {
      platform: {
        type: 'select',
        label: 'Plataforma',
        options: [
          { label: 'Instagram', value: 'instagram' },
          { label: 'Facebook', value: 'facebook' },
          { label: 'Twitter / X', value: 'twitter' },
          { label: 'YouTube', value: 'youtube' },
          { label: 'TikTok', value: 'tiktok' },
          { label: 'LinkedIn', value: 'linkedin' },
        ],
      },
      url: { type: 'text', label: 'URL' },
    },
    defaultItemProps: { platform: 'instagram' as SocialPlatform, url: '#' },
    getItemSummary: (item: { platform?: string }) => (item.platform as string) || 'Red social',
  },
  columns: {
    type: 'array',
    label: 'Columnas de navegación',
    arrayFields: {
      heading: { type: 'text', label: 'Título de la columna' },
      links: {
        type: 'array',
        label: 'Enlace',
        arrayFields: {
          label: { type: 'text', label: 'Texto del enlace' },
          url: { type: 'text', label: 'URL' },
        },
        defaultItemProps: { label: 'Enlace', url: '#' },
        getItemSummary: (item: { label?: string }) => (item.label as string) || 'Enlace',
      },
    },
    defaultItemProps: { heading: 'Columna', links: [{ label: 'Enlace', url: '#' }] },
    getItemSummary: (item: { heading?: string }) => (item.heading as string) || 'Columna',
  },
  copyright: { type: 'text', label: 'Texto de copyright' },
  legalLinks: {
    type: 'array',
    label: 'Enlace legales',
    arrayFields: {
      label: { type: 'text', label: 'Texto del enlace' },
      url: { type: 'text', label: 'URL' },
    },
    defaultItemProps: { label: 'Enlace legal', url: '#' },
    getItemSummary: (item: { label?: string }) => (item.label as string) || 'Enlace legal',
  },
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  accentColor: { type: 'text', label: 'Color de acento (hex)' },
  showNewsletter: {
    type: 'radio',
    label: 'Mostrar sección newsletter',
    options: [
      { label: 'Sí', value: true as unknown as string },
      { label: 'No', value: false as unknown as string },
    ],
  },
  newsletterTitle: { type: 'text', label: 'Título del newsletter' },
  newsletterSubtitle: { type: 'text', label: 'Subtítulo del newsletter' },
  newsletterPlaceholder: { type: 'text', label: 'Placeholder del input' },
  newsletterButtonText: { type: 'text', label: 'Texto del botón de suscripción' },
  newsletterBackgroundColor: { type: 'text', label: 'Color de fondo del newsletter (hex)' },
}

export const footerBlockDefaultProps: FooterBlockProps = {
  logoText: 'Mi Negocio',
  logoSubtext: '',
  logoImageUrl: '',
  tagline: 'Conectando productos únicos con el mundo.',
  contactEmail: 'contacto@minegocio.com',
  contactPhone: '',
  contactAddress: '',
  socialLinks: [
    { platform: 'instagram', url: '#' },
    { platform: 'facebook', url: '#' },
  ],
  columns: [
    {
      heading: 'TIENDA',
      links: [
        { label: 'Todos los productos', url: '#' },
        { label: 'Novedades', url: '#' },
        { label: 'Ofertas', url: '#' },
      ],
    },
    {
      heading: 'EMPRESA',
      links: [
        { label: 'Sobre nosotros', url: '#' },
        { label: 'Artesanos', url: '#' },
        { label: 'Blog', url: '#' },
      ],
    },
    {
      heading: 'AYUDA',
      links: [
        { label: 'Preguntas frecuentes', url: '#' },
        { label: 'Envíos y devoluciones', url: '#' },
        { label: 'Contacto', url: '#' },
      ],
    },
  ],
  copyright: '© 2024 Mi Negocio. Todos los derechos reservados.',
  legalLinks: [
    { label: 'Política de privacidad', url: '#' },
    { label: 'Términos y condiciones', url: '#' },
  ],
  backgroundColor: '#1a0f00',
  textColor: '#f5f0e8',
  accentColor: '#c4622d',
  showNewsletter: true,
  newsletterTitle: 'Únete a nuestra comunidad',
  newsletterSubtitle: 'Recibe noticias, historias de artesanos y ofertas exclusivas.',
  newsletterPlaceholder: 'Tu correo electrónico',
  newsletterButtonText: 'Suscribirse',
  newsletterBackgroundColor: '#2d1a0a',
}

export function FooterBlock({
  logoText,
  logoSubtext,
  logoImageUrl,
  tagline,
  contactEmail,
  contactPhone,
  contactAddress,
  socialLinks,
  columns,
  copyright,
  legalLinks,
  backgroundColor,
  textColor,
  accentColor,
  showNewsletter,
  newsletterTitle,
  newsletterSubtitle,
  newsletterPlaceholder,
  newsletterButtonText,
  newsletterBackgroundColor,
}: FooterBlockProps) {
  const mutedColor = `${textColor}99`

  return (
    <footer style={{ backgroundColor, color: textColor, fontFamily: 'inherit' }}>
      {/* Newsletter band */}
      {showNewsletter && (
        <div style={{ backgroundColor: newsletterBackgroundColor, padding: '48px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ color: textColor, fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>
              {newsletterTitle}
            </h3>
            {newsletterSubtitle && (
              <p style={{ color: mutedColor, fontSize: '0.95rem', marginBottom: 24 }}>
                {newsletterSubtitle}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto' }}>
              <input
                type="email"
                placeholder={newsletterPlaceholder}
                readOnly
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: `1px solid ${accentColor}`,
                  backgroundColor: 'transparent',
                  color: textColor,
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                disabled
                style={{
                  backgroundColor: accentColor,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'default',
                  whiteSpace: 'nowrap',
                }}
              >
                {newsletterButtonText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main footer grid */}
      <div style={{ padding: '56px 24px 40px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: `minmax(200px, 1fr) repeat(${columns.length}, 1fr)`,
          gap: '40px 32px',
        }}>
          {/* Brand column */}
          <div>
            {logoImageUrl ? (
              <img src={logoImageUrl} alt={logoText} style={{ height: 40, marginBottom: 8, display: 'block' }} />
            ) : (
              <div style={{ marginBottom: logoSubtext ? 4 : 12 }}>
                <span style={{ color: accentColor, fontWeight: 800, fontSize: '1.3rem' }}>
                  {logoText}
                </span>
              </div>
            )}
            {logoSubtext && (
              <p style={{ color: mutedColor, fontSize: '0.8rem', margin: '0 0 12px' }}>
                {logoSubtext}
              </p>
            )}
            {tagline && (
              <p style={{ color: mutedColor, fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 220 }}>
                {tagline}
              </p>
            )}
            {/* Contact info */}
            {contactEmail && (
              <p style={{ color: mutedColor, fontSize: '0.8rem', margin: '0 0 4px' }}>
                {contactEmail}
              </p>
            )}
            {contactPhone && (
              <p style={{ color: mutedColor, fontSize: '0.8rem', margin: '0 0 4px' }}>
                {contactPhone}
              </p>
            )}
            {contactAddress && (
              <p style={{ color: mutedColor, fontSize: '0.8rem', margin: '0 0 16px' }}>
                {contactAddress}
              </p>
            )}
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: `${accentColor}33`,
                      color: accentColor,
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      textDecoration: 'none',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav columns */}
          {columns.map((col, ci) => (
            <div key={ci}>
              <h4 style={{
                color: accentColor,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map((link, li) => (
                  <li key={li} style={{ marginBottom: 10 }}>
                    <a href={link.url} style={{
                      color: mutedColor,
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                    }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: `1px solid rgba(255,255,255,0.08)`,
        padding: '20px 24px',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          <p style={{ color: mutedColor, fontSize: '0.8rem', margin: 0 }}>
            {copyright}
          </p>
          {legalLinks.length > 0 && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {legalLinks.map((link, i) => (
                <a key={i} href={link.url} style={{ color: mutedColor, fontSize: '0.8rem', textDecoration: 'none' }}>
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
