import React from 'react'
import type { Fields } from '@measured/puck'

export interface SplitContentBlockProps {
  eyebrowText: string
  title: string
  body: string
  imagePosition: 'left' | 'right'
  imageLayout: 'single' | 'collage'
  images: Array<{ src: string; alt: string }>
  stats: Array<{ value: string; label: string }>
  ctaText: string
  ctaUrl: string
  ctaVariant: 'solid' | 'outline' | 'ghost' | 'none'
  backgroundColor: string
  textColor: string
  accentColor: string
  gap: 'sm' | 'md' | 'lg'
}

const gapMap: Record<SplitContentBlockProps['gap'], string> = {
  sm: '32px',
  md: '64px',
  lg: '96px',
}

export const splitContentBlockFields: Fields<SplitContentBlockProps> = {
  eyebrowText: { type: 'text', label: 'Texto eyebrow (ej: NUESTRA HISTORIA)' },
  title: { type: 'text', label: 'Título' },
  body: { type: 'textarea', label: 'Cuerpo de texto (\\n = párrafo nuevo)' },
  imagePosition: {
    type: 'radio',
    label: 'Posición de la imagen',
    options: [
      { label: 'Izquierda', value: 'left' },
      { label: 'Derecha', value: 'right' },
    ],
  },
  imageLayout: {
    type: 'radio',
    label: 'Layout de imagen',
    options: [
      { label: 'Una imagen', value: 'single' },
      { label: 'Collage', value: 'collage' },
    ],
  },
  images: {
    type: 'array',
    label: 'Imágenes',
    arrayFields: {
      src: { type: 'text', label: 'URL de la imagen' },
      alt: { type: 'text', label: 'Texto alternativo' },
    },
    defaultItemProps: {
      src: 'https://placehold.co/400x400/8B6914/ffffff?text=Imagen',
      alt: 'Imagen',
    },
    getItemSummary: (item: { alt?: string }) => (item.alt as string) || 'Imagen',
  },
  stats: {
    type: 'array',
    label: 'Estadísticas',
    arrayFields: {
      value: { type: 'text', label: 'Valor (ej: 50+)' },
      label: { type: 'text', label: 'Etiqueta (ej: Artesanos)' },
    },
    defaultItemProps: {
      value: '0',
      label: 'Estadística',
    },
    getItemSummary: (item: { label?: string }) => (item.label as string) || 'Estadística',
  },
  ctaText: { type: 'text', label: 'Texto del botón CTA' },
  ctaUrl: { type: 'text', label: 'URL del botón CTA' },
  ctaVariant: {
    type: 'radio',
    label: 'Estilo del botón',
    options: [
      { label: 'Sólido', value: 'solid' },
      { label: 'Contorno', value: 'outline' },
      { label: 'Ghost', value: 'ghost' },
      { label: 'Sin botón', value: 'none' },
    ],
  },
  backgroundColor: { type: 'text', label: 'Color de fondo (hex)' },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  accentColor: { type: 'text', label: 'Color de acento (hex)' },
  gap: {
    type: 'radio',
    label: 'Espacio entre columnas',
    options: [
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
}

export const splitContentBlockDefaultProps: SplitContentBlockProps = {
  eyebrowText: 'NUESTRA HISTORIA',
  title: 'Preservando la tradición, impulsando comunidades',
  body: 'Trabajamos de la mano con comunidades indígenas y artesanos locales.\nCada pieza que encuentras aquí es única, elaborada con técnicas ancestrales.',
  imagePosition: 'left',
  imageLayout: 'collage',
  images: [
    { src: 'https://placehold.co/400x400/8B6914/ffffff?text=Artesanos+1', alt: 'Artesanos trabajando' },
    { src: 'https://placehold.co/400x400/7c3f00/ffffff?text=Artesanos+2', alt: 'Artesanía tradicional' },
    { src: 'https://placehold.co/400x400/a0522d/ffffff?text=Artesanos+3', alt: 'Comunidad artesanal' },
  ],
  stats: [
    { value: '50+', label: 'Artesanos' },
    { value: '500+', label: 'Piezas únicas' },
    { value: '12', label: 'Comunidades' },
    { value: '100%', label: 'Hecho a mano' },
  ],
  ctaText: 'Conoce más sobre nosotros',
  ctaUrl: '#',
  ctaVariant: 'solid',
  backgroundColor: '#f5f0e8',
  textColor: '#1a0f00',
  accentColor: '#7c3f00',
  gap: 'md',
}

function CtaButton({
  ctaText,
  ctaUrl,
  ctaVariant,
  accentColor,
}: {
  ctaText: string
  ctaUrl: string
  ctaVariant: SplitContentBlockProps['ctaVariant']
  accentColor: string
}) {
  if (ctaVariant === 'none' || !ctaText) return null

  const baseStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '12px 32px',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: '0.95rem',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  }

  const variantStyle: React.CSSProperties =
    ctaVariant === 'solid'
      ? { backgroundColor: accentColor, color: '#ffffff', border: 'none' }
      : ctaVariant === 'outline'
        ? { backgroundColor: 'transparent', color: accentColor, border: `2px solid ${accentColor}` }
        : { backgroundColor: 'transparent', color: accentColor, border: 'none', textDecoration: 'underline' }

  return (
    <a href={ctaUrl} style={{ ...baseStyle, ...variantStyle }}>
      {ctaText}
    </a>
  )
}

export function SplitContentBlock({
  eyebrowText,
  title,
  body,
  imagePosition,
  imageLayout,
  images,
  stats,
  ctaText,
  ctaUrl,
  ctaVariant,
  backgroundColor,
  textColor,
  accentColor,
  gap,
}: SplitContentBlockProps) {
  const columnGap = gapMap[gap]
  const paragraphs = body.split('\n').filter(Boolean)
  const [mainImage, ...collageImages] = images

  const imageColumn = (
    <div style={{ flex: '0 0 45%', maxWidth: '45%' }}>
      {imageLayout === 'single' || !collageImages.length ? (
        <img
          src={mainImage?.src ?? ''}
          alt={mainImage?.alt ?? ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, display: 'block' }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <img
            src={mainImage?.src ?? ''}
            alt={mainImage?.alt ?? ''}
            style={{ gridColumn: '1 / -1', width: '100%', height: 280, objectFit: 'cover', borderRadius: 8, display: 'block' }}
          />
          {collageImages.slice(0, 2).map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, display: 'block' }}
            />
          ))}
        </div>
      )}
    </div>
  )

  const contentColumn = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {eyebrowText && (
        <p style={{
          color: accentColor,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          {eyebrowText}
        </p>
      )}
      {title && (
        <h2 style={{
          color: textColor,
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 20,
        }}>
          {title}
        </h2>
      )}
      {paragraphs.map((p, i) => (
        <p key={i} style={{
          color: textColor,
          opacity: 0.8,
          fontSize: '1rem',
          lineHeight: 1.7,
          marginBottom: 12,
        }}>
          {p}
        </p>
      ))}

      {stats.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px 24px',
          marginTop: 24,
          marginBottom: 32,
        }}>
          {stats.map((stat, i) => (
            <div key={i}>
              <p style={{
                color: accentColor,
                fontSize: '2rem',
                fontWeight: 800,
                lineHeight: 1,
                margin: '0 0 4px',
              }}>
                {stat.value}
              </p>
              <p style={{
                color: textColor,
                opacity: 0.65,
                fontSize: '0.85rem',
                margin: 0,
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <CtaButton ctaText={ctaText} ctaUrl={ctaUrl} ctaVariant={ctaVariant} accentColor={accentColor} />
    </div>
  )

  return (
    <section style={{ backgroundColor, padding: '64px 24px' }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: imagePosition === 'left' ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: columnGap,
      }}>
        {imageColumn}
        {contentColumn}
      </div>
    </section>
  )
}
