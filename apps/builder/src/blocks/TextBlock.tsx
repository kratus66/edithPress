import React from 'react'
import type { Fields } from '@measured/puck'

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

export const textBlockFields: Fields<TextBlockProps> = {
  content: {
    type: 'textarea',
    label: 'Contenido (HTML básico permitido)',
  },
  fontSize: {
    type: 'radio',
    label: 'Tamaño de fuente',
    options: [
      { label: 'Pequeño', value: 'sm' },
      { label: 'Normal', value: 'base' },
      { label: 'Grande', value: 'lg' },
      { label: 'Extra grande', value: 'xl' },
    ],
  },
  textColor: { type: 'text', label: 'Color del texto (hex)' },
  padding: {
    type: 'radio',
    label: 'Espaciado interno',
    options: [
      { label: 'Ninguno', value: 'none' },
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
  maxWidth: {
    type: 'radio',
    label: 'Ancho máximo',
    options: [
      { label: 'Estrecho', value: 'narrow' },
      { label: 'Normal', value: 'normal' },
      { label: 'Ancho', value: 'wide' },
      { label: 'Completo', value: 'full' },
    ],
  },
}

export const textBlockDefaultProps: TextBlockProps = {
  content: '<p>Escribe tu contenido aquí. Puedes usar <strong>negrita</strong>, <em>cursiva</em> o <a href="#">enlaces</a>.</p>',
  fontSize: 'base',
  textColor: '#111827',
  padding: 'md',
  maxWidth: 'normal',
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
        // El contenido viene del CMS — solo se renderiza en el editor,
        // controlado por el propietario del sitio (no entrada de usuarios finales)
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
