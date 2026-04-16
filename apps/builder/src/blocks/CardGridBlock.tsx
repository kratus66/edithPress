import React from 'react'
import type { Fields } from '@measured/puck'

export interface Card {
  image: string
  imageAlt: string
  title: string
  description: string
  linkText: string
  linkUrl: string
}

export interface CardGridBlockProps {
  cards: Card[]
  columns: 1 | 2 | 3
  gap: 'sm' | 'md' | 'lg'
  cardBackgroundColor: string
  accentColor: string
  showImage: boolean
  borderRadius: 'none' | 'sm' | 'md' | 'lg'
  padding: 'sm' | 'md' | 'lg'
}

const gapMap: Record<CardGridBlockProps['gap'], string> = {
  sm: '12px',
  md: '24px',
  lg: '40px',
}

const paddingMap: Record<CardGridBlockProps['padding'], string> = {
  sm: '24px',
  md: '48px',
  lg: '80px',
}

const borderRadiusMap: Record<CardGridBlockProps['borderRadius'], string> = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
}

export const cardGridBlockFields: Fields<CardGridBlockProps> = {
  cards: {
    type: 'array',
    label: 'Tarjetas',
    arrayFields: {
      image: { type: 'text', label: 'URL de imagen' },
      imageAlt: { type: 'text', label: 'Alt de imagen' },
      title: { type: 'text', label: 'Título' },
      description: { type: 'textarea', label: 'Descripción' },
      linkText: { type: 'text', label: 'Texto del enlace' },
      linkUrl: { type: 'text', label: 'URL del enlace' },
    },
    defaultItemProps: {
      image: 'https://placehold.co/400x250/e2e8f0/64748b?text=Imagen',
      imageAlt: 'Imagen de la tarjeta',
      title: 'Título de la tarjeta',
      description: 'Descripción breve del servicio, producto o miembro del equipo.',
      linkText: 'Ver más',
      linkUrl: '#',
    },
    getItemSummary: (item) => item.title || 'Tarjeta',
  },
  columns: {
    type: 'radio',
    label: 'Columnas',
    options: [
      { label: '1 columna', value: 1 },
      { label: '2 columnas', value: 2 },
      { label: '3 columnas', value: 3 },
    ],
  },
  gap: {
    type: 'radio',
    label: 'Separación entre tarjetas',
    options: [
      { label: 'Pequeña', value: 'sm' },
      { label: 'Mediana', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
  showImage: {
    type: 'radio',
    label: 'Mostrar imagen',
    options: [
      { label: 'Sí', value: true },
      { label: 'No', value: false },
    ],
  },
  cardBackgroundColor: { type: 'text', label: 'Color de fondo de tarjeta (hex)' },
  accentColor: { type: 'text', label: 'Color de acento / enlace (hex)' },
  borderRadius: {
    type: 'radio',
    label: 'Bordes redondeados',
    options: [
      { label: 'Sin redondeo', value: 'none' },
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
  padding: {
    type: 'radio',
    label: 'Espaciado interno de la sección',
    options: [
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
}

export const cardGridBlockDefaultProps: CardGridBlockProps = {
  cards: [
    {
      image: 'https://placehold.co/400x250/e2e8f0/64748b?text=Servicio+1',
      imageAlt: 'Servicio 1',
      title: 'Nuestro Servicio',
      description: 'Descripción del servicio que ofrecemos con calidad y profesionalismo.',
      linkText: 'Ver más',
      linkUrl: '#',
    },
    {
      image: 'https://placehold.co/400x250/dde6f0/64748b?text=Servicio+2',
      imageAlt: 'Servicio 2',
      title: 'Otro Servicio',
      description: 'Más información sobre este servicio y lo que puedes esperar de nosotros.',
      linkText: 'Ver más',
      linkUrl: '#',
    },
    {
      image: 'https://placehold.co/400x250/d0daf0/64748b?text=Servicio+3',
      imageAlt: 'Servicio 3',
      title: 'Tercer Servicio',
      description: 'Una solución más que ofrecemos para satisfacer tus necesidades.',
      linkText: 'Ver más',
      linkUrl: '#',
    },
  ],
  columns: 3,
  gap: 'md',
  showImage: true,
  cardBackgroundColor: '#ffffff',
  accentColor: '#2563eb',
  borderRadius: 'md',
  padding: 'md',
}

export function CardGridBlock({
  cards,
  columns,
  gap,
  showImage,
  cardBackgroundColor,
  accentColor,
  borderRadius,
  padding,
}: CardGridBlockProps) {
  const radius = borderRadiusMap[borderRadius]

  return (
    <div style={{ padding: `${paddingMap[padding]} 40px` }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gapMap[gap],
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {cards.map((card, index) => (
          <article
            key={index}
            style={{
              backgroundColor: cardBackgroundColor,
              borderRadius: radius,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.boxShadow =
                '0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.1)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.boxShadow =
                '0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            {showImage && card.image && (
              <img
                src={card.image}
                alt={card.imageAlt}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
            <div
              style={{
                padding: '20px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '8px',
                  lineHeight: 1.3,
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: '#6b7280',
                  lineHeight: 1.6,
                  flexGrow: 1,
                  marginBottom: card.linkText ? '16px' : '0',
                }}
              >
                {card.description}
              </p>
              {card.linkText && (
                <a
                  href={card.linkUrl}
                  style={{
                    color: accentColor,
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    alignSelf: 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'
                  }}
                >
                  {card.linkText} →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
