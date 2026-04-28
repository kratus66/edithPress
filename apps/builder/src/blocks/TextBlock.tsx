import React from 'react'
import type { Fields } from '@measured/puck'
import { makeCollapsibleRadio, makeCollapsibleColor } from '@/lib/fieldHelpers'

export interface TextBlockProps {
  content: string
  fontSize: 'sm' | 'base' | 'lg' | 'xl'
  fontWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  textAlign: 'left' | 'center' | 'right'
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose' | 'xloose'
  letterSpacing: 'tight' | 'normal' | 'wide' | 'wider' | 'widest'
  textColor: string
  backgroundColor: string
  fontFamily: string
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

// Los valores usan un % del ancho disponible para que sean visibles en CUALQUIER ancho de canvas
const maxWidthMap: Record<TextBlockProps['maxWidth'], string> = {
  narrow: '480px',
  normal: '720px',
  wide: '1040px',
  full: '100%',
}

const fontWeightMap: Record<TextBlockProps['fontWeight'], number> = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

// Rango ampliado para que la diferencia sea visualmente obvia
const lineHeightMap: Record<TextBlockProps['lineHeight'], number> = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
  loose: 2.2,
  xloose: 2.8,
}

const letterSpacingMap: Record<TextBlockProps['letterSpacing'], string> = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.05em',
  wider: '0.1em',
  widest: '0.18em',
}

export const textBlockFields: Fields<TextBlockProps> = {
  content: {
    type: 'textarea',
    label: 'Contenido (HTML básico permitido)',
  },
  fontSize: makeCollapsibleRadio('Tamaño de fuente', [
    { label: 'S', value: 'sm' },
    { label: 'M', value: 'base' },
    { label: 'L', value: 'lg' },
    { label: 'XL', value: 'xl' },
  ]) as Fields<TextBlockProps>['fontSize'],
  fontWeight: makeCollapsibleRadio('Peso de fuente', [
    { label: 'Ligero', value: 'light' },
    { label: 'Normal', value: 'regular' },
    { label: 'Medio', value: 'medium' },
    { label: 'Semibold', value: 'semibold' },
    { label: 'Bold', value: 'bold' },
  ]) as Fields<TextBlockProps>['fontWeight'],
  textAlign: makeCollapsibleRadio('Alineación', [
    { label: 'Izquierda', value: 'left' },
    { label: 'Centro', value: 'center' },
    { label: 'Derecha', value: 'right' },
  ]) as Fields<TextBlockProps>['textAlign'],
  lineHeight: makeCollapsibleRadio('Interlineado (espacio entre líneas)', [
    { label: 'Ajustado', value: 'tight' },
    { label: 'Normal', value: 'normal' },
    { label: 'Relajado', value: 'relaxed' },
    { label: 'Suelto', value: 'loose' },
    { label: 'Muy suelto', value: 'xloose' },
  ]) as Fields<TextBlockProps>['lineHeight'],
  letterSpacing: makeCollapsibleRadio('Espaciado entre letras', [
    { label: 'Comprimido', value: 'tight' },
    { label: 'Normal', value: 'normal' },
    { label: 'Amplio', value: 'wide' },
    { label: 'Más amplio', value: 'wider' },
    { label: 'Máximo', value: 'widest' },
  ]) as Fields<TextBlockProps>['letterSpacing'],
  textColor: makeCollapsibleColor('Color del texto') as Fields<TextBlockProps>['textColor'],
  backgroundColor: makeCollapsibleColor('Color de fondo') as Fields<TextBlockProps>['backgroundColor'],
  fontFamily: { type: 'text', label: 'Fuente' },
  padding: makeCollapsibleRadio('Espaciado interno', [
    { label: 'Ninguno', value: 'none' },
    { label: 'Pequeño', value: 'sm' },
    { label: 'Mediano', value: 'md' },
    { label: 'Grande', value: 'lg' },
  ]) as Fields<TextBlockProps>['padding'],
  maxWidth: makeCollapsibleRadio('Ancho máximo', [
    { label: 'Estrecho  480px', value: 'narrow' },
    { label: 'Normal  720px', value: 'normal' },
    { label: 'Ancho  1040px', value: 'wide' },
    { label: 'Completo', value: 'full' },
  ]) as Fields<TextBlockProps>['maxWidth'],
}

export const textBlockDefaultProps: TextBlockProps = {
  content: '<p>Escribe tu contenido aquí. Puedes usar <strong>negrita</strong>, <em>cursiva</em> o <a href="#">enlaces</a>.</p>',
  fontSize: 'base',
  fontWeight: 'regular',
  textAlign: 'left',
  lineHeight: 'relaxed',
  letterSpacing: 'normal',
  textColor: '#111827',
  backgroundColor: 'transparent',
  fontFamily: 'inherit',
  padding: 'md',
  maxWidth: 'normal',
}

export function TextBlock({
  content,
  fontSize = 'base',
  fontWeight = 'regular',
  textAlign = 'left',
  lineHeight = 'relaxed',
  letterSpacing = 'normal',
  textColor,
  backgroundColor = 'transparent',
  fontFamily = 'inherit',
  padding = 'md',
  maxWidth = 'normal',
}: TextBlockProps) {
  return (
    <div style={{ backgroundColor, fontFamily }}>
      <div
        style={{
          maxWidth: maxWidthMap[maxWidth] ?? '720px',
          margin: '0 auto',
          padding: paddingMap[padding] ?? '32px 40px',
          fontSize: fontSizeMap[fontSize] ?? '1rem',
          fontWeight: fontWeightMap[fontWeight] ?? 400,
          lineHeight: lineHeightMap[lineHeight] ?? 1.8,
          letterSpacing: letterSpacingMap[letterSpacing] ?? '0',
          textAlign,
          color: textColor,
          fontFamily,
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
