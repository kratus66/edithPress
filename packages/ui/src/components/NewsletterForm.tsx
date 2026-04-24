import React from 'react'

export interface NewsletterFormProps {
  placeholder?: string
  buttonText?: string
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  status: 'idle' | 'loading' | 'success' | 'error'
  statusMessage?: string
  accentColor?: string
  textColor?: string
}

export function NewsletterForm({
  placeholder = 'tu@email.com',
  buttonText = 'Suscribirme',
  value,
  onChange,
  onSubmit,
  status,
  statusMessage,
  accentColor = '#b45309',
  textColor = '#1e293b',
}: NewsletterFormProps) {
  const isLoading = status === 'loading'

  if (status === 'success') {
    return (
      <p style={{ color: '#16a34a', fontWeight: 500, fontSize: '1rem', margin: 0 }}>
        {statusMessage}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          style={{
            flex: 1,
            minWidth: 180,
            padding: '12px 16px',
            borderRadius: 8,
            border: `1px solid ${accentColor}40`,
            fontSize: '0.95rem',
            outline: 'none',
            color: textColor,
            background: 'transparent',
            cursor: isLoading ? 'not-allowed' : 'text',
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            background: isLoading ? `${accentColor}aa` : accentColor,
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap' as const,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {isLoading ? (
            <>
              <span style={{
                width: 14, height: 14,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }} />
              Enviando...
            </>
          ) : buttonText}
        </button>
      </div>
      {status === 'error' && statusMessage && (
        <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: 8, marginBottom: 0 }}>
          {statusMessage}
        </p>
      )}
    </form>
  )
}
