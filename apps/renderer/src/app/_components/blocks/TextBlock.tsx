/**
 * TextBlock — Renderer (read-only)
 *
 * Props idénticas al builder (apps/builder/src/blocks/TextBlock.tsx).
 *
 * SEGURIDAD: el HTML viene del CMS, escrito por el propietario del sitio.
 * La API debe sanitizarlo antes de almacenarlo (DOMPurify o equivalente).
 * El renderer confía en que la API entrega contenido limpio.
 */
export interface TextBlockProps {
  content: string
  fontSize: 'sm' | 'base' | 'lg' | 'xl'
  textColor: string
  padding: 'none' | 'sm' | 'md' | 'lg'
  maxWidth: 'narrow' | 'normal' | 'wide' | 'full'
}

const fontSizeMap: Record<TextBlockProps['fontSize'], string> = {
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
}

const paddingMap: Record<TextBlockProps['padding'], string> = {
  none: '0',
  sm: '16px 24px',
  md: '32px 40px',
  lg: '64px 40px',
}

const maxWidthMap: Record<TextBlockProps['maxWidth'], string> = {
  narrow: '600px',
  normal: '800px',
  wide: '1100px',
  full: '100%',
}

export function TextBlock({ content, fontSize, textColor, padding, maxWidth }: TextBlockProps) {
  return (
    <div
      style={{
        padding: paddingMap[padding],
        color: textColor,
      }}
    >
      <div
        style={{
          maxWidth: maxWidthMap[maxWidth],
          margin: '0 auto',
          fontSize: fontSizeMap[fontSize],
          lineHeight: 1.7,
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
