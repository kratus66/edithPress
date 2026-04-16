/**
 * SeparatorBlock — Renderer (read-only)
 *
 * Props idénticas al builder (apps/builder/src/blocks/SeparatorBlock.tsx).
 * `style` es el estilo de línea CSS (solid/dashed/dotted), no un concepto visual.
 * `thickness` es el grosor en px (number). `maxWidth` controla el ancho de la línea.
 */
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

export function SeparatorBlock({ style, color, thickness, paddingY, maxWidth }: SeparatorBlockProps) {
  return (
    <div
      style={{
        padding: `${paddingMap[paddingY]} 40px`,
        display: 'flex',
        justifyContent: 'center',
      }}
      role="separator"
      aria-hidden="true"
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
