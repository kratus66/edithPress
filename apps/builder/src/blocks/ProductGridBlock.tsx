import React from 'react'
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
}

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
}: ProductGridBlockProps) {
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
        {title && (
          <h2 style={{
            color: textColor,
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: subtitle ? 8 : 40,
          }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p style={{
            color: textColor,
            opacity: 0.7,
            textAlign: 'center',
            fontSize: '1.05rem',
            marginBottom: 40,
          }}>
            {subtitle}
          </p>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 24,
        }}>
          {products.map((product, i) => (
            <div key={i} style={cardBase}>
              {/* Imagen */}
              <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f1f5f9' }}>
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {showCategory && product.category && (
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
              </div>

              {/* Contenido */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
