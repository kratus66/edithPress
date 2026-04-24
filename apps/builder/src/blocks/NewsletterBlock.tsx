import React from 'react'
import type { Fields } from '@measured/puck'

export interface NewsletterBlockProps {
  title: string
  subtitle: string
  placeholder: string
  buttonText: string
  successMessage: string
  backgroundColor: string
  textColor: string
  accentColor: string
  layout: 'centered' | 'side-by-side'
}

export const newsletterBlockFields: Fields<NewsletterBlockProps> = {
  title: { type: 'text', label: 'Título' },
  subtitle: { type: 'text', label: 'Subtítulo' },
  placeholder: { type: 'text', label: 'Placeholder del email' },
  buttonText: { type: 'text', label: 'Texto del botón' },
  successMessage: { type: 'text', label: 'Mensaje de éxito tras suscribirse' },
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  accentColor: { type: 'text', label: 'Color del botón (hex)' },
  layout: {
    type: 'radio',
    label: 'Disposición',
    options: [
      { label: 'Centrado', value: 'centered' },
      { label: 'Lado a lado', value: 'side-by-side' },
    ],
  },
}

export const newsletterBlockDefaultProps: NewsletterBlockProps = {
  title: 'Únete a nuestra comunidad',
  subtitle: 'Recibe noticias sobre nuevos productos y artesanos.',
  placeholder: 'tu@email.com',
  buttonText: 'Suscribirme',
  successMessage: '¡Gracias! Te contactaremos pronto.',
  backgroundColor: '#1e293b',
  textColor: '#ffffff',
  accentColor: '#b45309',
  layout: 'centered',
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px 16px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.1)',
  color: '#ffffff',
  fontSize: '0.95rem',
  outline: 'none',
  minWidth: 0,
}

export function NewsletterBlock({
  title,
  subtitle,
  placeholder,
  buttonText,
  backgroundColor,
  textColor,
  accentColor,
  layout,
}: NewsletterBlockProps) {
  const isCentered = layout === 'centered'

  const form = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: isCentered ? 'center' : 'flex-start' }}>
      <input
        type="email"
        placeholder={placeholder}
        readOnly
        style={{ ...inputStyle, color: textColor, border: '1px solid rgba(128,128,128,0.3)', background: 'rgba(255,255,255,0.08)' }}
      />
      <button
        type="button"
        style={{
          background: accentColor,
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.95rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {buttonText}
      </button>
    </div>
  )

  return (
    <section style={{ backgroundColor, padding: '64px 24px' }}>
      {isCentered ? (
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: textColor, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 12 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ color: textColor, opacity: 0.75, marginBottom: 28, fontSize: '1rem' }}>
              {subtitle}
            </p>
          )}
          {form}
        </div>
      ) : (
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2 style={{ color: textColor, fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', fontWeight: 700, marginBottom: 8 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ color: textColor, opacity: 0.75, fontSize: '1rem', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            {form}
          </div>
        </div>
      )}
    </section>
  )
}
