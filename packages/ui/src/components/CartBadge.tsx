import React from 'react'

export interface CartBadgeProps {
  count: number
  color?: string
}

export function CartBadge({ count, color = '#b45309' }: CartBadgeProps) {
  if (count <= 0) return null

  return (
    <span style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: color,
      color: '#fff',
      fontSize: 10,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  )
}
