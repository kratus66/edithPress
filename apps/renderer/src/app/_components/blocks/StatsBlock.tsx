import React from 'react'

export interface StatsBlockProps {
  stats: Array<{
    value: string
    label: string
    icon: string
  }>
  backgroundColor: string
  textColor: string
  accentColor: string
  layout: 'row' | 'row-with-dividers'
  padding: 'sm' | 'md' | 'lg'
}

const paddingMap: Record<StatsBlockProps['padding'], string> = {
  sm: '24px 24px',
  md: '48px 24px',
  lg: '80px 24px',
}

export function StatsBlock({
  stats,
  backgroundColor,
  textColor,
  accentColor,
  layout,
  padding,
}: StatsBlockProps) {
  if (!stats?.length) return null

  return (
    <section style={{ backgroundColor, padding: paddingMap[padding] }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 32,
      }}>
        {stats.map((stat, i) => (
          <React.Fragment key={i}>
            {layout === 'row-with-dividers' && i > 0 && (
              <div style={{
                width: 1,
                height: 64,
                background: textColor,
                opacity: 0.15,
                flexShrink: 0,
              }} />
            )}
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              {stat.icon && (
                <div style={{ fontSize: '2rem', lineHeight: 1, marginBottom: 8 }}>
                  {stat.icon}
                </div>
              )}
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                lineHeight: 1,
                color: accentColor,
                marginBottom: 6,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: textColor,
                opacity: 0.7,
                lineHeight: 1.3,
              }}>
                {stat.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}
