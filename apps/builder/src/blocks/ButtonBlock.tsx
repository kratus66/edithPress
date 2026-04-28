import React from 'react'
import type { Fields } from '@measured/puck'
import { makeCollapsibleRadio, makeCollapsibleColor } from '@/lib/fieldHelpers'

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

export const buttonBlockFields: Fields<ButtonBlockProps> = {
  text: { type: 'text', label: 'Texto del botón' },
  url: { type: 'text', label: 'URL de destino' },
  variant: makeCollapsibleRadio('Estilo', [
    { label: 'Primario', value: 'primary' },
    { label: 'Secundario', value: 'secondary' },
    { label: 'Contorno', value: 'outline' },
  ]) as Fields<ButtonBlockProps>['variant'],
  size: makeCollapsibleRadio('Tamaño', [
    { label: 'Pequeño', value: 'sm' },
    { label: 'Mediano', value: 'md' },
    { label: 'Grande', value: 'lg' },
  ]) as Fields<ButtonBlockProps>['size'],
  align: makeCollapsibleRadio('Alineación', [
    { label: 'Izquierda', value: 'left' },
    { label: 'Centro', value: 'center' },
    { label: 'Derecha', value: 'right' },
  ]) as Fields<ButtonBlockProps>['align'],
  primaryColor: makeCollapsibleColor('Color principal') as Fields<ButtonBlockProps>['primaryColor'],
}

export const buttonBlockDefaultProps: ButtonBlockProps = {
  text: 'Más información',
  url: '/contacto',
  variant: 'primary',
  size: 'md',
  align: 'center',
  primaryColor: '#2563eb',
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
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    border: `2px solid ${primaryColor}`,
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
