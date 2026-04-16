/**
 * ButtonBlock — Renderer (read-only)
 *
 * Props idénticas al builder (apps/builder/src/blocks/ButtonBlock.tsx).
 * Nota: la prop se llama `text` (no `label`) y existe `primaryColor`.
 */
export interface ButtonBlockProps {
  text: string
  url: string
  variant: 'primary' | 'secondary' | 'outline'
  size: 'sm' | 'md' | 'lg'
  align: 'left' | 'center' | 'right'
  primaryColor: string
}

const sizeMap: Record<ButtonBlockProps['size'], { padding: string; fontSize: string }> = {
  sm: { padding: '8px 20px', fontSize: '0.875rem' },
  md: { padding: '12px 28px', fontSize: '1rem' },
  lg: { padding: '16px 40px', fontSize: '1.125rem' },
}

export function ButtonBlock({ text, url, variant, size, align, primaryColor }: ButtonBlockProps) {
  const { padding, fontSize } = sizeMap[size]

  const styles: React.CSSProperties = {
    display: 'inline-block',
    padding,
    fontSize,
    fontWeight: 600,
    borderRadius: '6px',
    textDecoration: 'none',
    border: `2px solid ${primaryColor}`,
    transition: 'opacity 0.2s',
    ...(variant === 'primary' && {
      backgroundColor: primaryColor,
      color: '#ffffff',
    }),
    ...(variant === 'secondary' && {
      backgroundColor: `${primaryColor}18`,
      color: primaryColor,
    }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      color: primaryColor,
    }),
  }

  return (
    <div style={{ padding: '16px 40px', textAlign: align }}>
      <a href={url} style={styles}>
        {text}
      </a>
    </div>
  )
}
