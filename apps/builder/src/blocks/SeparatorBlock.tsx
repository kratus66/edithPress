import React from 'react'
import type { Fields } from '@measured/puck'
import { makeCollapsibleRadio, makeCollapsibleColor } from '@/lib/fieldHelpers'

export interface SeparatorBlockProps {
  style: 'solid' | 'dashed' | 'dotted'
  color: string
  thickness: number
  paddingY: 'sm' | 'md' | 'lg'
  maxWidth: 'narrow' | 'normal' | 'full'
}

const paddingMap: Record<SeparatorBlockProps['paddingY'], string> = {
  sm: '16px',
  md: '32px',
  lg: '64px',
}

const maxWidthMap: Record<SeparatorBlockProps['maxWidth'], string> = {
  narrow: '400px',
  normal: '800px',
  full: '100%',
}

export const separatorBlockFields: Fields<SeparatorBlockProps> = {
  style: makeCollapsibleRadio('Estilo de línea', [
    { label: 'Sólida', value: 'solid' },
    { label: 'Discontinua', value: 'dashed' },
    { label: 'Punteada', value: 'dotted' },
  ]) as Fields<SeparatorBlockProps>['style'],
  color: makeCollapsibleColor('Color') as Fields<SeparatorBlockProps>['color'],
  thickness: {
    type: 'number',
    label: 'Grosor (px)',
    min: 1,
    max: 8,
  },
  paddingY: makeCollapsibleRadio('Espaciado vertical', [
    { label: 'Pequeño', value: 'sm' },
    { label: 'Mediano', value: 'md' },
    { label: 'Grande', value: 'lg' },
  ]) as Fields<SeparatorBlockProps>['paddingY'],
  maxWidth: makeCollapsibleRadio('Ancho', [
    { label: 'Estrecho', value: 'narrow' },
    { label: 'Normal', value: 'normal' },
    { label: 'Completo', value: 'full' },
  ]) as Fields<SeparatorBlockProps>['maxWidth'],
}

export const separatorBlockDefaultProps: SeparatorBlockProps = {
  style: 'solid',
  color: '#e5e7eb',
  thickness: 1,
  paddingY: 'md',
  maxWidth: 'normal',
}

export function SeparatorBlock({ style, color, thickness, paddingY, maxWidth }: SeparatorBlockProps) {
  return (
    <div
      style={{
        padding: `${paddingMap[paddingY]} 40px`,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <hr
        style={{
          width: maxWidthMap[maxWidth],
          borderStyle: style,
          borderColor: color,
          borderWidth: `${thickness}px 0 0 0`,
          margin: 0,
        }}
      />
    </div>
  )
}
