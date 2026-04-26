'use client'

/**
 * FooterNewsletter — sub-componente client del FooterBlock.
 *
 * Se mantiene separado para que FooterBlock sea Server Component.
 * Si siteId no está disponible el formulario se deshabilita silenciosamente.
 */
import { useState } from 'react'

interface FooterNewsletterProps {
  title: string
  subtitle: string
  placeholder: string
  buttonText: string
  textColor: string
  accentColor: string
  newsletterBackgroundColor: string
  siteId?: string
}

export function FooterNewsletter({
  title,
  subtitle,
  placeholder,
  buttonText,
  textColor,
  accentColor,
  newsletterBackgroundColor,
  siteId,
}: FooterNewsletterProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const mutedColor = `${textColor}99`
  const disabled = !siteId || status === 'loading'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!siteId) return
    // RFC 5321 — validación de formato básica antes del fetch (la validación definitiva ocurre en el backend)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      setStatus('error')
      setMessage('Por favor ingresa un email válido.')
      return
    }
    setStatus('loading')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${apiUrl}/api/v1/sites/${siteId}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), source: 'footer-newsletter' }),
      })
      if (res.ok) {
        setStatus('success')
        setMessage('Gracias por suscribirte.')
        setEmail('')
      } else {
        throw new Error()
      }
    } catch {
      setStatus('error')
      setMessage('Ocurrió un error. Intenta de nuevo más tarde.')
    }
  }

  return (
    <div style={{ backgroundColor: newsletterBackgroundColor, padding: '48px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ color: textColor, fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ color: mutedColor, fontSize: '0.95rem', marginBottom: 24 }}>
            {subtitle}
          </p>
        )}
        {status === 'success' ? (
          <p style={{ color: '#4ade80', fontWeight: 500, fontSize: '1rem', margin: 0 }}>
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
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
                type="submit"
                disabled={disabled}
                style={{
                  backgroundColor: status === 'loading' ? `${accentColor}aa` : accentColor,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {status === 'loading' ? '...' : buttonText}
              </button>
            </div>
            {status === 'error' && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: 8, marginBottom: 0 }}>
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
