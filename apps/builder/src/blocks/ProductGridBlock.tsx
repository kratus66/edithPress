import React, { useState } from 'react'
import type { Fields } from '@measured/puck'

export interface ProductGridBlockProps {
  title: string
  subtitle: string
  columns: 2 | 3 | 4
  products: Array<{
    image: string
    imageAlt: string
    category: string
    name: string
    description: string
    price: string
    artisan: string
    ctaText: string
    ctaUrl: string
  }>
  backgroundColor: string
  textColor: string
  accentColor: string
  showCategory: boolean
  showArtisan: boolean
  cardStyle: 'shadow' | 'border' | 'minimal'
  // NUEVO Sprint 03.2 — props opcionales, defaults retro-compatibles
  eyebrowText?: string
  viewAllText?: string
  viewAllUrl?: string
  categoryPosition?: 'badge' | 'above-name'
  showCta?: boolean
}

const cardStyleMap: Record<ProductGridBlockProps['cardStyle'], React.CSSProperties> = {
  shadow: { boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
  border: { border: '1px solid #e2e8f0' },
  minimal: {},
}

export const productGridBlockFields: Fields<ProductGridBlockProps> = {
  title: { type: 'text', label: 'Título de la sección' },
  subtitle: { type: 'text', label: 'Subtítulo (opcional)' },
  columns: {
    type: 'radio',
    label: 'Columnas',
    options: [
      { label: '2', value: 2 as unknown as string },
      { label: '3', value: 3 as unknown as string },
      { label: '4', value: 4 as unknown as string },
    ],
  },
  products: {
    type: 'array',
    label: 'Productos',
    arrayFields: {
      image: { type: 'text', label: 'URL de imagen' },
      imageAlt: { type: 'text', label: 'Texto alternativo' },
      category: { type: 'text', label: 'Categoría' },
      name: { type: 'text', label: 'Nombre del producto' },
      description: { type: 'text', label: 'Descripción breve' },
      price: { type: 'text', label: 'Precio (ej: $85.000)' },
      artisan: { type: 'text', label: 'Artesano/a (opcional)' },
      ctaText: { type: 'text', label: 'Texto del botón' },
      ctaUrl: { type: 'text', label: 'URL del botón' },
    },
    defaultItemProps: {
      image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Producto',
      imageAlt: 'Producto',
      category: 'Categoría',
      name: 'Nombre del producto',
      description: 'Descripción breve del producto.',
      price: '$0.000',
      artisan: '',
      ctaText: 'Ver producto',
      ctaUrl: '#',
    },
    getItemSummary: (item: { name?: string }) => (item.name as string) || 'Producto',
  },
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  accentColor: { type: 'text', label: 'Color de acento (hex)' },
  showCategory: {
    type: 'radio',
    label: 'Mostrar categoría',
    options: [
      { label: 'Sí', value: true as unknown as string },
      { label: 'No', value: false as unknown as string },
    ],
  },
  showArtisan: {
    type: 'radio',
    label: 'Mostrar artesano/a',
    options: [
      { label: 'Sí', value: true as unknown as string },
      { label: 'No', value: false as unknown as string },
    ],
  },
  cardStyle: {
    type: 'radio',
    label: 'Estilo de tarjeta',
    options: [
      { label: 'Sombra', value: 'shadow' },
      { label: 'Borde', value: 'border' },
      { label: 'Minimal', value: 'minimal' },
    ],
  },
  // NUEVO Sprint 03.2
  eyebrowText: { type: 'text', label: 'Texto eyebrow (sobre el título, opcional)' },
  viewAllText: { type: 'text', label: 'Texto del enlace "Ver todos" (opcional)' },
  viewAllUrl: { type: 'text', label: 'URL del enlace "Ver todos"' },
  categoryPosition: {
    type: 'radio',
    label: 'Posición de la categoría',
    options: [
      { label: 'Badge sobre imagen', value: 'badge' },
      { label: 'Sobre el nombre', value: 'above-name' },
    ],
  },
  showCta: {
    type: 'radio',
    label: 'Mostrar botón CTA en cada producto',
    options: [
      { label: 'Sí', value: true as unknown as string },
      { label: 'No', value: false as unknown as string },
    ],
  },
}

export const productGridBlockDefaultProps: ProductGridBlockProps = {
  title: 'Nuestros Productos',
  subtitle: '',
  columns: 3,
  products: [
    {
      image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+1',
      imageAlt: 'Producto 1',
      category: 'Mochilas',
      name: 'Mochila Wayuu Premium',
      description: 'Tejida a mano con hilos de colores vibrantes y diseños únicos.',
      price: '$85.000',
      artisan: 'María López',
      ctaText: 'Ver producto',
      ctaUrl: '#',
    },
    {
      image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+2',
      imageAlt: 'Producto 2',
      category: 'Cerámica',
      name: 'Vasija de Barro Artesanal',
      description: 'Pieza única de cerámica con técnicas ancestrales del Vichada.',
      price: '$45.000',
      artisan: 'Carlos Ruiz',
      ctaText: 'Ver producto',
      ctaUrl: '#',
    },
    {
      image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+3',
      imageAlt: 'Producto 3',
      category: 'Joyería',
      name: 'Collar de Semillas Naturales',
      description: 'Elaborado con semillas recolectadas en la selva amazónica.',
      price: '$32.000',
      artisan: 'Ana Torres',
      ctaText: 'Ver producto',
      ctaUrl: '#',
    },
  ],
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  accentColor: '#b45309',
  showCategory: true,
  showArtisan: false,
  cardStyle: 'shadow',
  // NUEVO Sprint 03.2 — defaults retro-compatibles
  eyebrowText: '',
  viewAllText: '',
  viewAllUrl: '#',
  categoryPosition: 'badge',
  showCta: true,
}

// SVG icons (lucide-react style, 24x24 viewBox)
const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx={9} cy={21} r={1} />
    <circle cx={20} cy={21} r={1} />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

export function ProductGridBlock({
  title,
  subtitle,
  columns,
  products,
  backgroundColor,
  textColor,
  accentColor,
  showCategory,
  showArtisan,
  cardStyle,
  // NUEVO Sprint 03.2
  eyebrowText = '',
  viewAllText = '',
  viewAllUrl = '#',
  categoryPosition = 'badge',
  showCta = true,
}: ProductGridBlockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const cardBase: React.CSSProperties = {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s, box-shadow 0.15s',
    ...cardStyleMap[cardStyle],
  }

  return (
    <section style={{ backgroundColor, padding: '48px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section header — flex space-between when viewAllText is set */}
        <div style={{
          display: 'flex',
          alignItems: viewAllText ? 'flex-end' : undefined,
          justifyContent: viewAllText ? 'space-between' : undefined,
          marginBottom: 40,
        }}>
          <div style={{ flex: 1 }}>
            {eyebrowText && (
              <p style={{
                color: accentColor,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textAlign: viewAllText ? 'left' : 'center',
                marginBottom: 10,
              }}>
                {eyebrowText}
              </p>
            )}
            {title && (
              <h2 style={{
                color: textColor,
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 700,
                textAlign: viewAllText ? 'left' : 'center',
                marginBottom: subtitle ? 8 : 0,
              }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{
                color: textColor,
                opacity: 0.7,
                textAlign: viewAllText ? 'left' : 'center',
                fontSize: '1.05rem',
                marginBottom: 0,
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {viewAllText && (
            <a href={viewAllUrl} style={{
              color: accentColor,
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              borderBottom: `2px solid ${accentColor}`,
              paddingBottom: 2,
              whiteSpace: 'nowrap',
              marginLeft: 24,
            }}>
              {viewAllText}
            </a>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 24,
        }}>
          {products.map((product, i) => (
            <div key={i} style={cardBase}>
              {/* Imagen */}
              <div
                style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f1f5f9' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Badge de categoría sobre imagen — solo cuando categoryPosition es 'badge' */}
                {showCategory && product.category && categoryPosition === 'badge' && (
                  <span style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    background: accentColor,
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 20,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {product.category}
                  </span>
                )}
                {/* Hover overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    opacity: hoveredIndex === i ? 1 : 0,
                    transition: 'opacity 200ms ease',
                    pointerEvents: hoveredIndex === i ? 'auto' : 'none',
                  }}
                >
                  <button
                    type="button"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.85)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1e293b',
                      flexShrink: 0,
                    }}
                  >
                    <HeartIcon />
                  </button>
                  <button
                    type="button"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.85)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1e293b',
                      flexShrink: 0,
                    }}
                  >
                    <CartIcon />
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Categoría sobre el nombre — solo cuando categoryPosition es 'above-name' */}
                {showCategory && product.category && categoryPosition === 'above-name' && (
                  <p style={{
                    color: accentColor,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    margin: '0 0 4px',
                  }}>
                    {product.category}
                  </p>
                )}
                <h3 style={{
                  color: textColor,
                  fontSize: '1rem',
                  fontWeight: 600,
                  margin: '0 0 6px',
                  lineHeight: 1.3,
                }}>
                  {product.name}
                </h3>
                {product.description && (
                  <p style={{
                    color: textColor,
                    opacity: 0.65,
                    fontSize: '0.85rem',
                    margin: '0 0 8px',
                    lineHeight: 1.5,
                    flex: 1,
                  }}>
                    {product.description}
                  </p>
                )}
                {showArtisan && product.artisan && (
                  <p style={{
                    color: textColor,
                    opacity: 0.55,
                    fontSize: '0.8rem',
                    fontStyle: 'italic',
                    margin: '0 0 12px',
                  }}>
                    Por {product.artisan}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12 }}>
                  <span style={{ color: accentColor, fontWeight: 700, fontSize: '1.1rem' }}>
                    {product.price}
                  </span>
                  {showCta && (
                    <a
                      href={product.ctaUrl}
                      style={{
                        background: accentColor,
                        color: '#fff',
                        padding: '7px 14px',
                        borderRadius: 6,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.ctaText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
