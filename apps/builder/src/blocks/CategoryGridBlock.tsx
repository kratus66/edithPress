import React from 'react'
import type { Fields } from '@measured/puck'

export interface CategoryGridBlockProps {
  eyebrowText: string
  title: string
  columns: 2 | 3 | 4
  categories: Array<{
    image: string
    imageAlt: string
    name: string
    description: string
    url: string
  }>
  cardAspectRatio: 'square' | 'portrait' | 'landscape'
  overlayColor: string
  overlayOpacity: number
  backgroundColor: string
  textColor: string
  accentColor: string
}

const aspectRatioMap: Record<CategoryGridBlockProps['cardAspectRatio'], string> = {
  square: '1 / 1',
  portrait: '3 / 4',
  landscape: '4 / 3',
}

export const categoryGridBlockFields: Fields<CategoryGridBlockProps> = {
  eyebrowText: { type: 'text', label: 'Texto eyebrow (ej: NUESTRAS CATEGORÍAS)' },
  title: { type: 'text', label: 'Título de la sección' },
  columns: {
    type: 'radio',
    label: 'Columnas',
    options: [
      { label: '2', value: 2 as unknown as string },
      { label: '3', value: 3 as unknown as string },
      { label: '4', value: 4 as unknown as string },
    ],
  },
  categories: {
    type: 'array',
    label: 'Categorías',
    arrayFields: {
      image: { type: 'text', label: 'URL de imagen' },
      imageAlt: { type: 'text', label: 'Texto alternativo' },
      name: { type: 'text', label: 'Nombre de la categoría' },
      description: { type: 'text', label: 'Descripción breve' },
      url: { type: 'text', label: 'URL de destino' },
    },
    defaultItemProps: {
      image: 'https://placehold.co/400x500/8B6914/ffffff?text=Categoría',
      imageAlt: 'Categoría',
      name: 'Nombre de categoría',
      description: 'Descripción de la categoría',
      url: '#',
    },
    getItemSummary: (item: { name?: string }) => (item.name as string) || 'Categoría',
  },
  cardAspectRatio: {
    type: 'radio',
    label: 'Proporción de imagen',
    options: [
      { label: 'Cuadrada', value: 'square' },
      { label: 'Retrato', value: 'portrait' },
      { label: 'Paisaje', value: 'landscape' },
    ],
  },
  overlayColor: { type: 'text', label: 'Color del overlay (hex)' },
  overlayOpacity: { type: 'number', label: 'Opacidad del overlay (0–100)' },
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  accentColor: { type: 'text', label: 'Color de acento (hex)' },
}

export const categoryGridBlockDefaultProps: CategoryGridBlockProps = {
  eyebrowText: 'NUESTRAS CATEGORÍAS',
  title: 'Explora por tipo de artesanía',
  columns: 4,
  categories: [
    {
      image: 'https://placehold.co/400x500/8B6914/ffffff?text=Mochilas',
      imageAlt: 'Mochilas artesanales',
      name: 'Mochilas',
      description: 'Tejidas a mano con hilos naturales',
      url: '#',
    },
    {
      image: 'https://placehold.co/400x500/8B6914/ffffff?text=Cerámica',
      imageAlt: 'Cerámica artesanal',
      name: 'Cerámica',
      description: 'Técnicas ancestrales del Vichada',
      url: '#',
    },
    {
      image: 'https://placehold.co/400x500/8B6914/ffffff?text=Joyería',
      imageAlt: 'Joyería artesanal',
      name: 'Joyería',
      description: 'Semillas y materiales naturales',
      url: '#',
    },
    {
      image: 'https://placehold.co/400x500/8B6914/ffffff?text=Textiles',
      imageAlt: 'Textiles artesanales',
      name: 'Textiles',
      description: 'Bordados y tejidos únicos',
      url: '#',
    },
  ],
  cardAspectRatio: 'portrait',
  overlayColor: '#000000',
  overlayOpacity: 60,
  backgroundColor: '#f5f0e8',
  textColor: '#1a0f00',
  accentColor: '#7c3f00',
}

export function CategoryGridBlock({
  eyebrowText,
  title,
  columns,
  categories,
  cardAspectRatio,
  overlayColor,
  overlayOpacity,
  backgroundColor,
  textColor,
  accentColor,
}: CategoryGridBlockProps) {
  const aspectRatio = aspectRatioMap[cardAspectRatio]
  const overlayRgba = `${overlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`

  return (
    <section style={{ backgroundColor, padding: '64px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {eyebrowText && (
          <p style={{
            color: accentColor,
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: 12,
          }}>
            {eyebrowText}
          </p>
        )}
        {title && (
          <h2 style={{
            color: textColor,
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 48,
          }}>
            {title}
          </h2>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
        }}>
          {categories.map((category, i) => (
            <a
              key={i}
              href={category.url}
              style={{
                position: 'relative',
                display: 'block',
                aspectRatio,
                overflow: 'hidden',
                borderRadius: 12,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                const img = (e.currentTarget as HTMLElement).querySelector('img')
                if (img) img.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={e => {
                const img = (e.currentTarget as HTMLElement).querySelector('img')
                if (img) img.style.transform = 'scale(1)'
              }}
            >
              <img
                src={category.image}
                alt={category.imageAlt}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.3s ease',
                }}
              />
              {/* Gradient overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to top, ${overlayRgba} 0%, transparent 60%)`,
              }} />
              {/* Text overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px 16px 20px',
              }}>
                <h3 style={{
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  margin: '0 0 4px',
                  lineHeight: 1.2,
                }}>
                  {category.name}
                </h3>
                {category.description && (
                  <p style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.8rem',
                    margin: 0,
                    lineHeight: 1.4,
                  }}>
                    {category.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
