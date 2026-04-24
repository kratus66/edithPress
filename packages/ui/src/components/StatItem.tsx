import React from 'react'

export interface StatItemProps {
  value: string
  label: string
  icon?: string
  accentColor?: string
  textColor?: string
}

export function StatItem({
  value,
  label,
  icon,
  accentColor = '#b45309',
  textColor = '#1e293b',
}: StatItemProps) {
  return (
    <div style={{ textAlign: 'center', minWidth: 100, padding: '8px 0' }}>
      {icon && (
        <div style={{ fontSize: '2rem', lineHeight: 1, marginBottom: 8 }}>
          {icon}
        </div>
      )}
      <div style={{
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        fontWeight: 700,
        lineHeight: 1,
        color: accentColor,
        marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.9rem',
        color: textColor,
        opacity: 0.7,
        lineHeight: 1.3,
        textAlign: 'center',
      }}>
        {label}
      </div>
    </div>
  )
}
