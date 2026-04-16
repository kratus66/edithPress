/**
 * HeroBlock — Renderer (read-only)
 *
 * Props idénticas al builder (apps/builder/src/blocks/HeroBlock.tsx).
 * El builder es la fuente de verdad del schema; no añadir props aquí
 * que no existan en el builder, ya que el JSON de la BD no las tendrá.
 */
export interface HeroBlockProps {
  title: string
  subtitle: string
  backgroundColor: string
  textColor: string
  ctaText: string
  ctaUrl: string
  textAlign: 'left' | 'center' | 'right'
  paddingY: 'sm' | 'md' | 'lg' | 'xl'
}

const paddingMap: Record<HeroBlockProps['paddingY'], string> = {
  sm: '40px',
  md: '80px',
  lg: '120px',
  xl: '160px',
}

export function HeroBlock({
  title,
  subtitle,
  backgroundColor,
  textColor,
  ctaText,
  ctaUrl,
  textAlign,
  paddingY,
}: HeroBlockProps) {
  const padding = paddingMap[paddingY]

  return (
    <section
      style={{
        backgroundColor,
        color: textColor,
        padding: `${padding} 40px`,
        textAlign,
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '16px',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            opacity: 0.85,
            marginBottom: '32px',
          }}
        >
          {subtitle}
        </p>
        {ctaText && ctaUrl && (
          <a
            href={ctaUrl}
            style={{
              display: 'inline-block',
              backgroundColor: textColor,
              color: backgroundColor,
              padding: '12px 32px',
              borderRadius: '6px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
