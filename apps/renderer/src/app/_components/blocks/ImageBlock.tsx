import Image from 'next/image'

/**
 * ImageBlock — Renderer (read-only)
 *
 * Props idénticas al builder (apps/builder/src/blocks/ImageBlock.tsx).
 *
 * DIFERENCIA INTENCIONADA con el builder:
 * El builder usa <img> directa (Puck corre solo en el editor, no en el servidor).
 * El renderer usa next/image para optimización automática: WebP, lazy load,
 * tamaños adaptativos. Esto es correcto y esperado.
 */
export interface ImageBlockProps {
  src: string
  alt: string
  caption: string
  width: 'content' | 'full'
  borderRadius: 'none' | 'sm' | 'md' | 'lg'
}

const borderRadiusMap: Record<ImageBlockProps['borderRadius'], string> = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
}

export function ImageBlock({ src, alt, caption, width, borderRadius }: ImageBlockProps) {
  return (
    <figure
      style={{
        margin: '0',
        padding: '24px 40px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          position: 'relative',
          width: width === 'full' ? '100%' : 'auto',
          maxWidth: '100%',
          borderRadius: borderRadiusMap[borderRadius],
          overflow: 'hidden',
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          style={{
            width: width === 'full' ? '100%' : 'auto',
            height: 'auto',
            display: 'block',
          }}
          sizes={
            width === 'full'
              ? '100vw'
              : '(max-width: 800px) 100vw, 800px'
          }
        />
      </div>
      {caption && (
        <figcaption
          style={{
            marginTop: '8px',
            fontSize: '0.875rem',
            color: '#6b7280',
            fontStyle: 'italic',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
