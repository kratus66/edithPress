import { sanitizeUrl } from '../../../lib/sanitize-url'

export interface HeroButton {
  text: string
  url: string
  variant: 'solid' | 'outline' | 'ghost'
  bgColor: string
  textColor: string
}

export interface TitleStyles {
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  fontWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  color: string
  letterSpacing: 'tight' | 'normal' | 'wide'
}

export interface SubtitleStyles {
  fontSize: 'sm' | 'md' | 'lg' | 'xl'
  fontWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  color: string
  opacity: number
  lineHeight: 'tight' | 'normal' | 'relaxed'
}

export interface EyebrowStyles {
  fontSize: 'xs' | 'sm' | 'md' | 'lg'
  fontWeight: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  color: string
  letterSpacing: 'tight' | 'normal' | 'wide' | 'wider'
  textTransform: 'uppercase' | 'capitalize' | 'none'
}

export interface ImageConfig {
  src: string
  position: 'left' | 'right' | 'cover' | 'cover-left' | 'cover-right'
}

export interface HeroBlockProps {
  title: string
  titleHtml?: string
  subtitle: string
  subtitleHtml?: string
  backgroundColor: string
  imageConfig: ImageConfig
  textColor: string
  buttons: HeroButton[]
  textAlign: 'left' | 'center' | 'right'
  paddingY: 'sm' | 'md' | 'lg' | 'xl'
  fontFamily: string
  eyebrowText: string
  eyebrowStyles: EyebrowStyles
  overlayColor: string
  overlayOpacity: number
  titleStyles: TitleStyles
  subtitleStyles: SubtitleStyles
}

const paddingMap: Record<HeroBlockProps['paddingY'], string> = {
  sm: '40px', md: '80px', lg: '120px', xl: '160px',
}
const titleFontSizeMap: Record<TitleStyles['fontSize'], string> = {
  sm: '1.5rem', md: '2.25rem', lg: 'clamp(2rem,5vw,3.5rem)',
  xl: 'clamp(2.5rem,6vw,5rem)', xxl: 'clamp(3rem,8vw,7rem)',
}
const subtitleFontSizeMap: Record<SubtitleStyles['fontSize'], string> = {
  sm: '0.9rem', md: '1.05rem', lg: 'clamp(1rem,2.5vw,1.25rem)', xl: 'clamp(1.2rem,3vw,1.6rem)',
}
const weightMap: Record<TitleStyles['fontWeight'], number> = {
  light: 300, regular: 400, medium: 500, semibold: 600, bold: 700,
}
const letterSpacingMap: Record<TitleStyles['letterSpacing'], string> = {
  tight: '-0.03em', normal: '0em', wide: '0.06em',
}
const lineHeightMap: Record<SubtitleStyles['lineHeight'], number> = {
  tight: 1.3, normal: 1.6, relaxed: 1.9,
}
const eyebrowFontSizeMap: Record<EyebrowStyles['fontSize'], string> = {
  xs: '0.65rem', sm: '0.72rem', md: '0.85rem', lg: '1rem',
}
const eyebrowLetterSpacingMap: Record<EyebrowStyles['letterSpacing'], string> = {
  tight: '0.03em', normal: '0.08em', wide: '0.15em', wider: '0.25em',
}

const defaultTitleStyles: TitleStyles    = { fontSize: 'lg', fontWeight: 'bold',    color: '', letterSpacing: 'normal' }
const defaultSubtitleStyles: SubtitleStyles = { fontSize: 'lg', fontWeight: 'regular', color: '', opacity: 82, lineHeight: 'normal' }
const defaultEyebrowStyles: EyebrowStyles   = { fontSize: 'sm', fontWeight: 'bold',    color: '#9a6240', letterSpacing: 'wide', textTransform: 'uppercase' }
const defaultImageConfig: ImageConfig       = { src: '', position: 'cover' }

export function HeroBlock({
  title,
  titleHtml = '',
  subtitle,
  subtitleHtml = '',
  backgroundColor,
  imageConfig = defaultImageConfig,
  textColor,
  buttons = [],
  textAlign,
  paddingY,
  fontFamily = 'inherit',
  eyebrowText = '',
  eyebrowStyles = defaultEyebrowStyles,
  overlayColor = '#000000',
  overlayOpacity = 0,
  titleStyles = defaultTitleStyles,
  subtitleStyles = defaultSubtitleStyles,
}: HeroBlockProps) {
  const ic = { ...defaultImageConfig, ...imageConfig }
  const backgroundImage = ic.src
  const position = ic.position
  const layout = position === 'left' ? 'split-right'
               : position === 'right' ? 'split-left'
               : 'full'

  const ts = { ...defaultTitleStyles,    ...titleStyles }
  const ss = { ...defaultSubtitleStyles, ...subtitleStyles }
  const es = { ...defaultEyebrowStyles,  ...eyebrowStyles }

  const padding              = paddingMap[paddingY] ?? '120px'
  const resolvedTitleSize    = titleFontSizeMap[ts.fontSize]    ?? titleFontSizeMap.lg
  const resolvedTitleWeight  = weightMap[ts.fontWeight]         ?? 700
  const resolvedTitleColor   = ts.color || textColor
  const resolvedLetterSpacing= letterSpacingMap[ts.letterSpacing] ?? '0em'
  const resolvedSubtitleSize = subtitleFontSizeMap[ss.fontSize]  ?? subtitleFontSizeMap.lg
  const resolvedSubtitleWeight=weightMap[ss.fontWeight]          ?? 400
  const resolvedSubtitleColor= ss.color || textColor
  const resolvedLineHeight   = lineHeightMap[ss.lineHeight]      ?? 1.6
  const subtitleOpacity      = (ss.opacity ?? 82) / 100

  const activeButtons  = buttons.filter(b => b.text)
  const buttonsJustify = textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'
  const blockJustify   = textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'

  const titleStyle: React.CSSProperties = {
    fontSize: resolvedTitleSize, fontWeight: resolvedTitleWeight,
    lineHeight: resolvedTitleWeight <= 400 ? 1.15 : 1.1,
    letterSpacing: resolvedLetterSpacing, color: resolvedTitleColor,
    marginBottom: '18px', fontFamily,
  }
  const subtitleStyle: React.CSSProperties = {
    fontSize: resolvedSubtitleSize, fontWeight: resolvedSubtitleWeight,
    opacity: subtitleOpacity, lineHeight: resolvedLineHeight,
    color: resolvedSubtitleColor, marginBottom: '36px', fontFamily,
  }

  const content = (
    <>
      {eyebrowText && (
        <p style={{
          fontSize: eyebrowFontSizeMap[es.fontSize] ?? eyebrowFontSizeMap.sm,
          fontWeight: weightMap[es.fontWeight] ?? 700,
          letterSpacing: eyebrowLetterSpacingMap[es.letterSpacing] ?? '0.15em',
          textTransform: es.textTransform as React.CSSProperties['textTransform'],
          color: es.color || textColor, marginBottom: '14px', fontFamily,
        }}>
          {eyebrowText}
        </p>
      )}

      {titleHtml
        ? <h1 style={titleStyle} dangerouslySetInnerHTML={{ __html: titleHtml }} />
        : <h1 style={titleStyle}>{title}</h1>
      }

      {subtitleHtml
        ? <p style={subtitleStyle} dangerouslySetInnerHTML={{ __html: subtitleHtml }} />
        : <p style={subtitleStyle}>{subtitle}</p>
      }

      {activeButtons.length > 0 && (
        <div style={{ display: 'flex', gap: 14, justifyContent: buttonsJustify, flexWrap: 'wrap' }}>
          {activeButtons.map((btn, i) => {
            const isSolid   = btn.variant === 'solid'
            const isOutline = btn.variant === 'outline'
            return (
              <a key={i} href={sanitizeUrl(btn.url || '#')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                backgroundColor: isSolid ? (btn.bgColor || textColor) : 'transparent',
                color: btn.textColor || textColor,
                padding: '13px 28px', borderRadius: '6px',
                fontWeight: 600, fontSize: '0.95rem', fontFamily,
                border: isOutline ? `2px solid ${btn.textColor || textColor}` : 'none',
                textDecoration: btn.variant === 'ghost' ? 'underline' : 'none',
                letterSpacing: '0.01em',
              }}>
                {btn.text}
              </a>
            )
          })}
        </div>
      )}
    </>
  )

  // ── Cover-left / Cover-right ───────────────────────────────────────────────

  if (position === 'cover-left' || position === 'cover-right') {
    const isLeft = position === 'cover-left'
    const overlayHexCover = overlayOpacity > 0
      ? `${overlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`
      : null
    return (
      <section style={{
        position: 'relative', display: 'flex', fontFamily, minHeight: 480,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundColor, alignItems: 'stretch',
      }}>
        {overlayHexCover && backgroundImage && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: overlayHexCover, pointerEvents: 'none' }} />
        )}
        {!isLeft && <div style={{ flex: '1 1 50%' }} />}
        <div style={{
          flex: '0 0 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: `${padding} clamp(32px,5vw,80px)`, color: textColor, textAlign,
          position: 'relative', zIndex: 1, boxSizing: 'border-box',
        }}>
          {content}
        </div>
        {isLeft && <div style={{ flex: '1 1 50%' }} />}
      </section>
    )
  }

  // ── Split layout ───────────────────────────────────────────────────────────

  if (layout === 'split-left' || layout === 'split-right') {
    const isTextLeft = layout === 'split-left'
    return (
      <section style={{ display: 'flex', fontFamily, minHeight: 480, backgroundColor, alignItems: 'stretch' }}>
        <div style={{
          flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: `${padding} clamp(32px,5vw,80px)`, color: textColor, textAlign,
          order: isTextLeft ? 0 : 1, boxSizing: 'border-box',
        }}>
          {content}
        </div>
        <div style={{
          flex: '1 1 50%',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center',
          order: isTextLeft ? 1 : 0,
        }} />
      </section>
    )
  }

  // ── Full layout ────────────────────────────────────────────────────────────

  const overlayHex = overlayOpacity > 0
    ? `${overlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`
    : null

  const bgStyle: React.CSSProperties = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : {}

  return (
    <section style={{
      position: 'relative',
      backgroundColor, color: textColor,
      padding: `${padding} clamp(24px, 6vw, 80px)`,
      fontFamily,
      ...bgStyle,
    }}>
      {overlayHex && backgroundImage && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: overlayHex, pointerEvents: 'none' }} />
      )}
      <div style={{
        maxWidth: 1200, margin: '0 auto', width: '100%',
        display: 'flex', justifyContent: blockJustify,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: '640px', width: '100%', textAlign }}>
          {content}
        </div>
      </div>
    </section>
  )
}
