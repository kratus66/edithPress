'use client'

import React, { useState, useEffect, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  children: ReactNode
  defaultOpen?: boolean
  noBorderTop?: boolean
  nested?: boolean
  cacheKey?: string
}

const openStateCache = new Map<string, boolean>()

export function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = true,
  noBorderTop = false,
  nested = false,
  cacheKey,
}: CollapsibleSectionProps) {
  const stateKey = cacheKey ?? title

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const cached = openStateCache.get(stateKey)
    return cached !== undefined ? cached : defaultOpen
  })

  useEffect(() => {
    const cached = openStateCache.get(stateKey)
    if (cached !== undefined && cached !== isOpen) {
      setIsOpen(cached)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey])

  const toggle = () => {
    setIsOpen(prev => {
      const next = !prev
      openStateCache.set(stateKey, next)
      return next
    })
  }

  if (nested) {
    return (
      <div style={{ borderTop: '1px solid var(--puck-color-grey-10, #e8ecf0)' }}>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          style={{
            padding: '8px 16px 8px 20px',
            width: '100%',
            background: isOpen ? 'var(--puck-color-grey-11, #f1f5f9)' : 'var(--puck-color-grey-12, #f8fafc)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10.5px',
            fontWeight: 500,
            color: 'var(--puck-color-grey-04, #6b7280)',
            fontFamily: 'var(--puck-font-family, inherit)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            userSelect: 'none',
            boxSizing: 'border-box',
            gap: 8,
          }}
        >
          <span style={{ flexShrink: 0 }}>{title}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
            {!isOpen && subtitle && (
              <span style={{
                fontSize: '10px',
                color: 'var(--puck-color-grey-05, #94a3b8)',
                fontWeight: 400,
                textTransform: 'none',
                letterSpacing: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 90,
              }}>
                {subtitle}
              </span>
            )}
            <svg
              width="12"
              height="12"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
                flexShrink: 0,
                opacity: 0.5,
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
          </span>
        </button>
        {isOpen && (
          <div style={{
            padding: '10px 16px 12px 20px',
            background: 'var(--puck-color-grey-12, #f8fafc)',
          }}>
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
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
          gap: 8,
        }}
      >
        <span style={{ flexShrink: 0 }}>{title}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
          {!isOpen && subtitle && (
            <span style={{
              fontSize: '10px',
              color: 'var(--puck-color-grey-06, #94a3b8)',
              fontWeight: 400,
              textTransform: 'none',
              letterSpacing: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 90,
            }}>
              {subtitle}
            </span>
          )}
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
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '12px 16px 16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}
