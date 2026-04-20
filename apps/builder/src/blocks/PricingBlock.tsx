import React from 'react'
import type { Fields } from '@measured/puck'

export interface PricingPlan {
  name: string
  price: string
  description: string
  features: string
  ctaText: string
  ctaUrl: string
  isHighlighted: 'true' | 'false'
}

export interface PricingBlockProps {
  title: string
  plans: PricingPlan[]
}

export const pricingBlockFields: Fields<PricingBlockProps> = {
  title: { type: 'text', label: 'Título de la sección' },
  plans: {
    type: 'array',
    label: 'Planes',
    arrayFields: {
      name: { type: 'text', label: 'Nombre del plan' },
      price: { type: 'text', label: 'Precio (ej: $29/mes)' },
      description: { type: 'text', label: 'Descripción breve' },
      features: { type: 'textarea', label: 'Características (una por línea)' },
      ctaText: { type: 'text', label: 'Texto del botón' },
      ctaUrl: { type: 'text', label: 'URL del botón' },
      isHighlighted: {
        type: 'radio',
        label: 'Destacar plan',
        options: [
          { label: 'No', value: 'false' },
          { label: 'Sí', value: 'true' },
        ],
      },
    },
    defaultItemProps: {
      name: 'Plan básico',
      price: '$9/mes',
      description: 'Perfecto para comenzar',
      features: 'Característica uno\nCaracterística dos\nCaracterística tres',
      ctaText: 'Comenzar ahora',
      ctaUrl: '#',
      isHighlighted: 'false',
    },
    getItemSummary: (item) => item.name || 'Plan',
  },
}

export const pricingBlockDefaultProps: PricingBlockProps = {
  title: 'Planes y precios',
  plans: [
    {
      name: 'Starter',
      price: '$9/mes',
      description: 'Ideal para emprendedores y proyectos personales',
      features: 'Hasta 5 páginas\n1 sitio web\nSoporte por email\nSSL incluido',
      ctaText: 'Comenzar gratis',
      ctaUrl: '#',
      isHighlighted: 'false',
    },
    {
      name: 'Pro',
      price: '$29/mes',
      description: 'Para negocios en crecimiento',
      features: 'Páginas ilimitadas\n5 sitios web\nSoporte prioritario\nDominio personalizado\nAnalítica avanzada',
      ctaText: 'Elegir Pro',
      ctaUrl: '#',
      isHighlighted: 'true',
    },
    {
      name: 'Business',
      price: '$79/mes',
      description: 'Para equipos y agencias',
      features: 'Todo de Pro\nSitios ilimitados\nSoporte 24/7\nAPI de acceso\nWhite label',
      ctaText: 'Contactar ventas',
      ctaUrl: '#',
      isHighlighted: 'false',
    },
  ],
}

function gridColumns(count: number): string {
  if (count === 1) return '1fr'
  if (count === 2) return 'repeat(2, 1fr)'
  return 'repeat(3, 1fr)'
}

export function PricingBlock({ title, plans }: PricingBlockProps) {
  return (
    <section style={{ padding: '64px 40px', backgroundColor: '#f9fafb' }}>
      {/* Título de sección */}
      {title && (
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '48px',
          }}
        >
          {title}
        </h2>
      )}

      {/* Grid de planes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns(Math.min(plans.length, 3)),
          gap: '24px',
          maxWidth: '1100px',
          margin: '0 auto',
          alignItems: 'start',
        }}
      >
        {plans.map((plan, index) => {
          const highlighted = plan.isHighlighted === 'true'
          const featureList = plan.features
            ? plan.features.split('\n').filter((f) => f.trim() !== '')
            : []

          return (
            <article
              key={index}
              style={{
                position: 'relative',
                backgroundColor: highlighted ? '#fafafe' : '#ffffff',
                border: highlighted ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: highlighted ? '32px 28px' : '28px',
                boxShadow: highlighted
                  ? '0 8px 32px rgba(79,70,229,0.12)'
                  : '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Badge "Mas popular" */}
              {highlighted && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 14px',
                    borderRadius: '99px',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Mas popular
                </div>
              )}

              {/* Nombre del plan */}
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: highlighted ? '#4f46e5' : '#374151',
                  marginBottom: '8px',
                }}
              >
                {plan.name}
              </h3>

              {/* Precio */}
              <p
                style={{
                  fontSize: '1.875rem',
                  fontWeight: 700,
                  color: '#111827',
                  lineHeight: 1.1,
                  marginBottom: '8px',
                }}
              >
                {plan.price}
              </p>

              {/* Descripcion */}
              {plan.description && (
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '24px',
                  }}
                >
                  {plan.description}
                </p>
              )}

              {/* Lista de features */}
              {featureList.length > 0 && (
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 28px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    flexGrow: 1,
                  }}
                >
                  {featureList.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '0.9375rem',
                        color: '#374151',
                      }}
                    >
                      <span
                        style={{
                          color: '#16a34a',
                          fontWeight: 700,
                          flexShrink: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        checkmark
                      </span>
                      {feature.trim()}
                    </li>
                  ))}
                </ul>
              )}

              {/* Boton CTA */}
              {plan.ctaText && (
                <a
                  href={plan.ctaUrl || '#'}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    padding: '11px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    textDecoration: 'none',
                    backgroundColor: highlighted ? '#4f46e5' : '#ffffff',
                    color: highlighted ? '#ffffff' : '#374151',
                    border: highlighted ? 'none' : '1.5px solid #d1d5db',
                    marginTop: 'auto',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.opacity = '1'
                  }}
                >
                  {plan.ctaText}
                </a>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
