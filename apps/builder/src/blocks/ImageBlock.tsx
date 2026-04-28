import React from 'react'
import type { Fields } from '@measured/puck'
import { makeCollapsibleRadio } from '@/lib/fieldHelpers'

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

export const imageBlockFields: Fields<ImageBlockProps> = {
  src: { type: 'text', label: 'URL de la imagen' },
  alt: { type: 'text', label: 'Texto alternativo (accesibilidad)' },
  caption: { type: 'text', label: 'Pie de foto (opcional)' },
  width: makeCollapsibleRadio('Ancho', [
    { label: 'Contenido', value: 'content' },
    { label: 'Completo', value: 'full' },
  ]) as Fields<ImageBlockProps>['width'],
  borderRadius: makeCollapsibleRadio('Bordes redondeados', [
    { label: 'Sin redondeo', value: 'none' },
    { label: 'Pequeño', value: 'sm' },
    { label: 'Mediano', value: 'md' },
    { label: 'Grande', value: 'lg' },
  ]) as Fields<ImageBlockProps>['borderRadius'],
}

export const imageBlockDefaultProps: ImageBlockProps = {
  src: 'https://placehold.co/800x400/e2e8f0/64748b?text=Imagen',
  alt: 'Descripción de la imagen',
  caption: '',
  width: 'content',
  borderRadius: 'md',
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
      <img
        src={src}
        alt={alt}
        style={{
          width: width === 'full' ? '100%' : 'auto',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: borderRadiusMap[borderRadius],
          display: 'block',
          margin: '0 auto',
        }}
      />
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
