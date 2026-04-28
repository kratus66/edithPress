'use client'

import React, { useState } from 'react'

interface NavbarMobileProps {
  navLinks: Array<{ label: string; url: string }>
  textColor: string
  backgroundColor: string
  accentColor: string
}

function sanitizeUrl(url: string): string {
  if (!url) return '#'
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) return '#'
  return url
}

export function NavbarMobile({
  navLinks,
  textColor,
  backgroundColor,
  accentColor,
}: NavbarMobileProps) {
  const [open, setOpen] = useState(false)

  if (!navLinks || navLinks.length === 0) return null

  return (
    <>
      {/* Botón hamburger — visible solo en mobile via CSS */}
      <style>{`
        .navbar-mobile-toggle { display: none; }
        @media (max-width: 768px) {
          .navbar-mobile-toggle { display: flex; }
          .navbar-desktop-links { display: none !important; }
        }
      `}</style>

      <button
        type="button"
        className="navbar-mobile-toggle"
        aria-expanded={open}
        aria-controls="navbar-mobile-menu"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: textColor,
          padding: 8,
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {open ? (
          /* X icon */
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* Hamburger icon */
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Menú desplegable */}
      {open && (
        <div
          id="navbar-mobile-menu"
          role="dialog"
          aria-label="Menú de navegación"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100,
            padding: '8px 0 16px',
          }}
        >
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: '0 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {navLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={sanitizeUrl(link.url)}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    color: textColor,
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    padding: '10px 12px',
                    borderRadius: 6,
                    letterSpacing: '0.01em',
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
