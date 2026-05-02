'use client'

import { useState } from 'react'

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
  siteId?: string
}

export function NewsletterBlock({
  title,
  subtitle,
  placeholder,
  buttonText,
  successMessage,
  backgroundColor,
  textColor,
  accentColor,
  layout,
  siteId,
}: NewsletterBlockProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
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
        body: JSON.stringify({ email: email.toLowerCase().trim(), source: 'newsletter-block' }),
      })
      if (res.ok) {
        setStatus('success')
        setMessage(successMessage)
        setEmail('')
      } else {
        throw new Error()
      }
    } catch {
      setStatus('error')
      setMessage('Ocurrió un error. Intenta de nuevo más tarde.')
    }
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid rgba(128,128,128,0.3)',
    background: 'rgba(255,255,255,0.08)',
    color: textColor,
    fontSize: '0.95rem',
    outline: 'none',
    minWidth: 0,
  }

  const buttonStyle: React.CSSProperties = {
    background: status === 'loading' ? `${accentColor}aa` : accentColor,
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
  }

  const Form = (
    <form onSubmit={handleSubmit}>
      {status === 'success' ? (
        <p style={{ color: '#4ade80', fontWeight: 500, fontSize: '1rem', margin: 0 }}>
          {message}
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={placeholder}
              disabled={status === 'loading'}
              style={inputStyle}
            />
            <button type="submit" disabled={status === 'loading'} style={buttonStyle}>
              {status === 'loading' ? '...' : buttonText}
            </button>
          </div>
          {status === 'error' && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: 8, marginBottom: 0 }}>
              {message}
            </p>
          )}
        </>
      )}
    </form>
  )

  const isCentered = layout === 'centered'

  return (
    <section style={{ backgroundColor, padding: 'clamp(48px, 8vw, 80px) clamp(24px, 6vw, 80px)' }}>
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
          {Form}
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
            {Form}
          </div>
        </div>
      )}
    </section>
  )
}
