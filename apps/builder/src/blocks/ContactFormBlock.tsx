'use client'

import React, { useState, useCallback } from 'react'
import type { Fields } from '@measured/puck'

export interface ContactFormBlockProps {
  title: string
  subtitle: string
  namePlaceholder: string
  emailPlaceholder: string
  messagePlaceholder: string
  buttonText: string
  successMessage: string
  errorMessage: string
  backgroundColor: string
  accentColor: string
  padding: 'sm' | 'md' | 'lg'
}

const paddingMap: Record<ContactFormBlockProps['padding'], string> = {
  sm: '24px',
  md: '48px',
  lg: '80px',
}

export const contactFormBlockFields: Fields<ContactFormBlockProps> = {
  title: { type: 'text', label: 'Título del formulario' },
  subtitle: { type: 'text', label: 'Subtítulo / descripción' },
  namePlaceholder: { type: 'text', label: 'Placeholder: Nombre' },
  emailPlaceholder: { type: 'text', label: 'Placeholder: Email' },
  messagePlaceholder: { type: 'text', label: 'Placeholder: Mensaje' },
  buttonText: { type: 'text', label: 'Texto del botón de envío' },
  successMessage: { type: 'text', label: 'Mensaje de éxito' },
  errorMessage: { type: 'text', label: 'Mensaje de error' },
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  accentColor: { type: 'text', label: 'Color de acento (hex)' },
  padding: {
    type: 'radio',
    label: 'Espaciado vertical',
    options: [
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
}

export const contactFormBlockDefaultProps: ContactFormBlockProps = {
  title: 'Contáctanos',
  subtitle: 'Completa el formulario y te responderemos a la brevedad.',
  namePlaceholder: 'Tu nombre',
  emailPlaceholder: 'tu@email.com',
  messagePlaceholder: 'Escribe tu mensaje aquí...',
  buttonText: 'Enviar mensaje',
  successMessage: '¡Mensaje enviado! Nos pondremos en contacto pronto.',
  errorMessage: 'Ocurrió un error al enviar. Por favor, inténtalo de nuevo.',
  backgroundColor: '#f8fafc',
  accentColor: '#2563eb',
  padding: 'md',
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ContactFormBlock({
  title,
  subtitle,
  namePlaceholder,
  emailPlaceholder,
  messagePlaceholder,
  buttonText,
  successMessage,
  errorMessage,
  backgroundColor,
  accentColor,
  padding,
}: ContactFormBlockProps) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [values, setValues] = useState({ name: '', email: '', message: '' })

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setValues((prev) => ({ ...prev, [name]: value }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setStatus('submitting')
      try {
        // En producción, esto llama a la API: POST /api/contact
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setStatus('success')
        setValues({ name: '', email: '', message: '' })
      } catch {
        setStatus('error')
      }
    },
    []
  )

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
  }

  return (
    <section
      style={{
        backgroundColor,
        padding: `${paddingMap[padding]} 40px`,
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {title && (
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p
            style={{
              color: '#6b7280',
              fontSize: '1rem',
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            {subtitle}
          </p>
        )}

        {status === 'success' ? (
          <div
            role="alert"
            style={{
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '8px',
              padding: '20px 24px',
              textAlign: 'center',
              color: '#15803d',
              fontSize: '1rem',
            }}
          >
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {status === 'error' && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#b91c1c',
                  fontSize: '0.875rem',
                }}
              >
                {errorMessage}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="cf-name" style={labelStyle}>
                Nombre
              </label>
              <input
                id="cf-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder={namePlaceholder}
                value={values.name}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = accentColor
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="cf-email" style={labelStyle}>
                Email
              </label>
              <input
                id="cf-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={emailPlaceholder}
                value={values.email}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = accentColor
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label htmlFor="cf-message" style={labelStyle}>
                Mensaje
              </label>
              <textarea
                id="cf-message"
                name="message"
                required
                rows={5}
                placeholder={messagePlaceholder}
                value={values.message}
                onChange={handleChange}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = accentColor
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: accentColor,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: status === 'submitting' ? 'wait' : 'pointer',
                opacity: status === 'submitting' ? 0.75 : 1,
                transition: 'opacity 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {status === 'submitting' ? 'Enviando...' : buttonText}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
