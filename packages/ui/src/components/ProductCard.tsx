import React from 'react'

export interface ProductCardProps {
  image: string
  imageAlt?: string
  category?: string
  name: string
  description?: string
  price: string
  artisan?: string
  ctaText: string
  ctaUrl: string
  accentColor?: string
  style?: 'shadow' | 'border' | 'minimal'
  showCategory?: boolean
  showArtisan?: boolean
}

const cardStyleMap: Record<'shadow' | 'border' | 'minimal', React.CSSProperties> = {
  shadow: { boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
  border: { border: '1px solid #e2e8f0' },
  minimal: {},
}

export function ProductCard({
  image,
  imageAlt = '',
  category,
  name,
  description,
  price,
  artisan,
  ctaText,
  ctaUrl,
  accentColor = '#b45309',
  style = 'shadow',
  showCategory = true,
  showArtisan = false,
}: ProductCardProps) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s, box-shadow 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? '0 8px 24px rgba(0,0,0,.12)'
          : style === 'shadow' ? '0 2px 12px rgba(0,0,0,.08)' : 'none',
        ...(style !== 'shadow' ? cardStyleMap[style] : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagen */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f1f5f9' }}>
        <img
          src={image}
          alt={imageAlt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {showCategory && category && (
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
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          }}>
            {category}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          color: '#1e293b',
          fontSize: '1rem',
          fontWeight: 600,
          margin: '0 0 6px',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        }}>
          {name}
        </h3>
        {description && (
          <p style={{
            color: '#64748b',
            fontSize: '0.85rem',
            margin: '0 0 8px',
            lineHeight: 1.5,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {description}
          </p>
        )}
        {showArtisan && artisan && (
          <p style={{
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontStyle: 'italic',
            margin: '0 0 12px',
          }}>
            Por {artisan}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12 }}>
          <span style={{ color: accentColor, fontWeight: 700, fontSize: '1.1rem' }}>
            {price}
          </span>
          <a
            href={ctaUrl}
            style={{
              background: accentColor,
              color: '#fff',
              padding: '7px 14px',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {ctaText}
          </a>
        </div>
      </div>
    </div>
  )
}
