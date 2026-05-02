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

const fontWeightMap: Record<TextBlockProps['fontWeight'], number> = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

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

const paddingMap: Record<TextBlockProps['padding'], string> = {
  none: '0',
  sm: '16px 24px',
  md: '32px 40px',
  lg: '64px 40px',
}

const maxWidthMap: Record<TextBlockProps['maxWidth'], string> = {
  narrow: '480px',
  normal: '720px',
  wide: '1040px',
  full: '100%',
}

export function TextBlock({
  content,
  fontSize,
  fontWeight,
  textAlign,
  lineHeight,
  letterSpacing,
  textColor,
  backgroundColor,
  fontFamily,
  padding,
  maxWidth,
}: TextBlockProps) {
  return (
    <div
      style={{
        padding: paddingMap[padding ?? 'md'],
        backgroundColor: backgroundColor ?? 'transparent',
        fontFamily: fontFamily ?? 'inherit',
      }}
    >
      <div
        style={{
          maxWidth: maxWidthMap[maxWidth ?? 'normal'],
          margin: '0 auto',
          fontSize: fontSizeMap[fontSize ?? 'base'],
          fontWeight: fontWeightMap[fontWeight ?? 'regular'],
          textAlign: textAlign ?? 'left',
          lineHeight: lineHeightMap[lineHeight ?? 'normal'],
          letterSpacing: letterSpacingMap[letterSpacing ?? 'normal'],
          color: textColor ?? 'inherit',
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
