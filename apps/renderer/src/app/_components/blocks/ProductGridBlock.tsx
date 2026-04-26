/**
 * ProductGridBlock — Renderer (read-only)
 *
 * Sprint 03.2: añadido soporte para eyebrowText, viewAllText/viewAllUrl,
 * categoryPosition ('above-name'), showCta.
 * Usa next/image para las imágenes de productos.
 * Todos los hrefs pasan por sanitizeUrl().
 * Reemplaza la versión anterior que usaba Tailwind — ahora 100% inline styles.
 */
import Image from 'next/image'
import { sanitizeUrl } from '../../../lib/sanitize-url'

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
  // Sprint 03.2 — opcionales, defaults retro-compatibles
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
  eyebrowText = '',
  viewAllText = '',
  viewAllUrl = '#',
  categoryPosition = 'badge',
  showCta = true,
}: ProductGridBlockProps) {
  if (!products?.length) return null

  const overlayStyles = `
    .pgb-img-wrapper { position: relative; overflow: hidden; }
    .pgb-overlay {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      opacity: 0;
      transition: opacity 200ms ease;
      pointer-events: none;
    }
    .pgb-img-wrapper:hover .pgb-overlay {
      opacity: 1;
      pointer-events: auto;
    }
    .pgb-action-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.85);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1e293b;
      flex-shrink: 0;
    }
    .pgb-action-btn:hover {
      background: rgba(255,255,255,1);
    }
  `

  const cardBase: React.CSSProperties = {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    ...cardStyleMap[cardStyle],
  }

  return (
    <section style={{ backgroundColor, padding: '48px 24px' }}>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: overlayStyles }} />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header: eyebrow + title + viewAllText */}
        {eyebrowText && (
          <p style={{
            color: accentColor,
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: 10,
          }}>
            {eyebrowText}
          </p>
        )}

        {/* Título con "Ver todos" alineado a la derecha si viewAllText existe */}
        {title && (
          viewAllText ? (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: subtitle ? 8 : 40, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{
                color: textColor,
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 700,
                margin: 0,
              }}>
                {title}
              </h2>
              <a href={sanitizeUrl(viewAllUrl ?? '#')} style={{
                color: accentColor,
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
                borderBottom: `2px solid ${accentColor}`,
                paddingBottom: 2,
                whiteSpace: 'nowrap',
              }}>
                {viewAllText}
              </a>
            </div>
          ) : (
            <h2 style={{
              color: textColor,
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: subtitle ? 8 : 40,
            }}>
              {title}
            </h2>
          )
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
              {/* Imagen del producto */}
              <div className="pgb-img-wrapper" style={{ aspectRatio: '4/3', background: '#f1f5f9' }}>
                <Image
                  src={product.image}
                  alt={product.imageAlt || product.name}
                  fill
                  sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${Math.round(100 / columns)}vw`}
                  style={{ objectFit: 'cover' }}
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
                <div className="pgb-overlay">
                  {/* Heart icon */}
                  <button type="button" className="pgb-action-btn" aria-label="Agregar a favoritos">
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
                  </button>
                  {/* Shopping cart icon */}
                  <button type="button" className="pgb-action-btn" aria-label="Agregar al carrito">
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
                  </button>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Categoría sobre el nombre — small-caps cuando categoryPosition es 'above-name' */}
                {showCategory && product.category && categoryPosition === 'above-name' && (
                  <p style={{
                    color: accentColor,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontVariant: 'small-caps',
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
                      href={sanitizeUrl(product.ctaUrl)}
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

        {/* Enlace "Ver todos" centrado — solo se muestra cuando NO hay título (fallback) */}
        {viewAllText && !title && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a href={sanitizeUrl(viewAllUrl ?? '#')} style={{
              color: accentColor,
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              borderBottom: `2px solid ${accentColor}`,
              paddingBottom: 2,
            }}>
              {viewAllText}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
