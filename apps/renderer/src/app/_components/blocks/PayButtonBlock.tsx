import Image from 'next/image'
import { sanitizeUrl } from '../../../lib/sanitize-url'

export interface PayButtonBlockProps {
  productName: string
  description: string
  price: string
  image: string
  provider: 'wompi' | 'payu' | 'mercadopago' | 'nequi' | 'otro'
  paymentLink: string
  buttonText: string
  buttonColor: string
  buttonTextColor: string
  backgroundColor: string
  textColor: string
  note: string
  layout: 'card' | 'banner'
}

const PROVIDER_LABELS: Record<PayButtonBlockProps['provider'], string> = {
  wompi: 'Wompi',
  payu: 'PayU',
  mercadopago: 'Mercado Pago',
  nequi: 'Nequi',
  otro: 'Pago seguro',
}

export function PayButtonBlock({
  productName,
  description,
  price,
  image,
  provider,
  paymentLink,
  buttonText,
  buttonColor,
  buttonTextColor,
  backgroundColor,
  textColor,
  note,
  layout,
}: PayButtonBlockProps) {
  const providerLabel = PROVIDER_LABELS[provider] ?? 'Pago seguro'
  const isBanner = layout === 'banner'
  const safeLink = sanitizeUrl(paymentLink)

  const lockSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )

  const cardStyle: React.CSSProperties = isBanner
    ? {
        maxWidth: 900,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: '24px 32px',
        boxShadow: '0 2px 16px rgba(0,0,0,.08)',
        flexWrap: 'wrap' as const,
      }
    : {
        maxWidth: 420,
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,.10)',
      }

  return (
    <section style={{ backgroundColor, padding: 'clamp(48px, 8vw, 80px) clamp(24px, 6vw, 80px)' }}>
      <div style={cardStyle}>
        {image && (
          <div style={isBanner
            ? { width: 120, height: 120, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative' }
            : { width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: '#f1f5f9', position: 'relative' }
          }>
            <Image
              src={image}
              alt={productName}
              fill
              sizes={isBanner ? '120px' : '(max-width: 480px) 100vw, 420px'}
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <div style={isBanner ? { flex: 1 } : { padding: '24px' }}>
          <h3 style={{
            color: textColor,
            fontSize: isBanner ? '1.15rem' : '1.25rem',
            fontWeight: 700,
            margin: '0 0 6px',
            lineHeight: 1.3,
          }}>
            {productName}
          </h3>

          {description && (
            <p style={{
              color: textColor,
              opacity: 0.65,
              fontSize: '0.9rem',
              margin: '0 0 16px',
              lineHeight: 1.5,
            }}>
              {description}
            </p>
          )}

          <p style={{
            color: buttonColor,
            fontSize: isBanner ? '1.5rem' : '1.75rem',
            fontWeight: 800,
            margin: '0 0 20px',
            letterSpacing: '-0.01em',
          }}>
            {price}
          </p>

          <a
            href={safeLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: buttonColor,
              color: buttonTextColor,
              padding: isBanner ? '12px 24px' : '14px 32px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              width: isBanner ? 'auto' : '100%',
              letterSpacing: '0.01em',
            }}
          >
            {lockSvg}
            {buttonText}
          </a>

          <p style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            color: textColor,
            opacity: 0.45,
            fontSize: '0.75rem',
            margin: '12px 0 0',
            justifyContent: isBanner ? 'flex-start' : 'center',
          }}>
            {lockSvg}
            {note || `Pago seguro con ${providerLabel}`}
          </p>
        </div>
      </div>
    </section>
  )
}
