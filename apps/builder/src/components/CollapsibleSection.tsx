'use client'

import React, { useState, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  noBorderTop?: boolean
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  noBorderTop = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        style={{
          padding: '12px 16px',
          width: '100%',
          background: 'var(--puck-color-white)',
          border: 'none',
          borderBottom: isOpen ? '1px solid var(--puck-color-grey-09)' : 'none',
          borderTop: noBorderTop ? 'none' : '1px solid var(--puck-color-grey-09)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--puck-font-size-xxs, 11px)',
          fontWeight: 600,
          color: 'var(--puck-color-grey-04, #6b7280)',
          fontFamily: 'var(--puck-font-family, inherit)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          userSelect: 'none',
          boxSizing: 'border-box',
        }}
      >
        <span>{title}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
            opacity: 0.6,
          }}
        >
          <path
            d="M3 5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <div style={{ padding: '12px 16px 16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}
