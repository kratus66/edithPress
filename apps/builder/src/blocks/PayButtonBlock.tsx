import React from 'react'
import type { Fields } from '@measured/puck'
import { makeCollapsibleRadio, makeCollapsibleColor } from '@/lib/fieldHelpers'

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

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export const payButtonBlockFields: Fields<PayButtonBlockProps> = {
  productName: { type: 'text', label: 'Nombre del producto' },
  description: { type: 'textarea', label: 'Descripción (opcional)' },
  price: { type: 'text', label: 'Precio (ej: $85.000)' },
  image: { type: 'text', label: 'URL de imagen del producto (opcional)' },
  provider: makeCollapsibleRadio('Pasarela de pago', [
    { label: 'Wompi', value: 'wompi' },
    { label: 'PayU', value: 'payu' },
    { label: 'Mercado Pago', value: 'mercadopago' },
    { label: 'Nequi', value: 'nequi' },
    { label: 'Otro', value: 'otro' },
  ]) as Fields<PayButtonBlockProps>['provider'],
  paymentLink: { type: 'text', label: 'Enlace de pago (URL generada en tu pasarela)' },
  buttonText: { type: 'text', label: 'Texto del botón' },
  buttonColor: makeCollapsibleColor('Color del botón') as Fields<PayButtonBlockProps>['buttonColor'],
  buttonTextColor: makeCollapsibleColor('Color del texto del botón') as Fields<PayButtonBlockProps>['buttonTextColor'],
  backgroundColor: makeCollapsibleColor('Color de fondo') as Fields<PayButtonBlockProps>['backgroundColor'],
  textColor: makeCollapsibleColor('Color del texto') as Fields<PayButtonBlockProps>['textColor'],
  note: { type: 'text', label: 'Nota debajo del botón (opcional, ej: Envío incluido)' },
  layout: makeCollapsibleRadio('Diseño', [
    { label: 'Tarjeta centrada', value: 'card' },
    { label: 'Banner horizontal', value: 'banner' },
  ]) as Fields<PayButtonBlockProps>['layout'],
}

export const payButtonBlockDefaultProps: PayButtonBlockProps = {
  productName: 'Mochila Wayuu Premium',
  description: 'Tejida a mano con hilos de colores vibrantes. Pieza única e irrepetible.',
  price: '$85.000',
  image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Producto',
  provider: 'wompi',
  paymentLink: '#',
  buttonText: 'Pagar ahora',
  buttonColor: '#2563eb',
  buttonTextColor: '#ffffff',
  backgroundColor: '#f8fafc',
  textColor: '#1e293b',
  note: 'Pago 100% seguro · Envío a todo Colombia',
  layout: 'card',
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

  const containerStyle: React.CSSProperties = {
    backgroundColor,
    padding: '48px 24px',
  }

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
    <section style={containerStyle}>
      <div style={cardStyle}>
        {/* Imagen */}
        {image && (
          <div style={isBanner
            ? { width: 120, height: 120, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }
            : { width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: '#f1f5f9' }
          }>
            <img
              src={image}
              alt={productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Contenido */}
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
            href={paymentLink}
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
              transition: 'opacity 0.15s',
            }}
          >
            <LockIcon />
            {buttonText}
          </a>

          {/* Nota de seguridad */}
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
            <LockIcon />
            {note || `Pago seguro con ${providerLabel}`}
          </p>
        </div>
      </div>
    </section>
  )
}
