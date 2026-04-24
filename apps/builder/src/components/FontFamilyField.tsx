'use client'

import React, { useEffect } from 'react'

// Fuentes de sistema (siempre disponibles)
const SYSTEM_FONTS = [
  { label: 'Predeterminado', value: 'inherit' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
]

// Fuentes de Google Fonts (se cargan dinámicamente)
const GOOGLE_FONTS = [
  { label: 'Inter', value: 'Inter, sans-serif', gfName: 'Inter' },
  { label: 'Roboto', value: 'Roboto, sans-serif', gfName: 'Roboto' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif', gfName: 'Open+Sans' },
  { label: 'Lato', value: 'Lato, sans-serif', gfName: 'Lato' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif', gfName: 'Montserrat' },
  { label: 'Poppins', value: 'Poppins, sans-serif', gfName: 'Poppins' },
  { label: 'Raleway', value: 'Raleway, sans-serif', gfName: 'Raleway' },
  { label: 'Nunito', value: 'Nunito, sans-serif', gfName: 'Nunito' },
  { label: 'Oswald', value: 'Oswald, sans-serif', gfName: 'Oswald' },
  { label: 'Merriweather', value: 'Merriweather, serif', gfName: 'Merriweather' },
  { label: 'Playfair Display', value: '"Playfair Display", serif', gfName: 'Playfair+Display' },
  { label: 'Ubuntu', value: 'Ubuntu, sans-serif', gfName: 'Ubuntu' },
  { label: 'Bebas Neue', value: '"Bebas Neue", cursive', gfName: 'Bebas+Neue' },
  { label: 'Pacifico', value: 'Pacifico, cursive', gfName: 'Pacifico' },
  { label: 'Dancing Script', value: '"Dancing Script", cursive', gfName: 'Dancing+Script' },
]

function loadGoogleFont(gfName: string) {
  if (typeof document === 'undefined') return
  const id = `gf-${gfName.toLowerCase().replace(/\+/g, '-')}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${gfName}:wght@400;600;700&display=swap`
  document.head.appendChild(link)
}

// Precargar todas las fuentes Google al montar el campo (para que el preview sea inmediato)
function preloadAllGoogleFonts() {
  GOOGLE_FONTS.forEach(f => loadGoogleFont(f.gfName))
}

interface FontFamilyFieldProps {
  value: string
  onChange: (value: string) => void
}

export function FontFamilyField({ value, onChange }: FontFamilyFieldProps) {
  useEffect(() => { preloadAllGoogleFonts() }, [])

  const allFonts = [...SYSTEM_FONTS, ...GOOGLE_FONTS]
  const currentFont = allFonts.find(f => f.value === value)
  const previewFamily = value || 'inherit'

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <select
        value={value}
        onChange={e => {
          const selected = GOOGLE_FONTS.find(f => f.value === e.target.value)
          if (selected) loadGoogleFont(selected.gfName)
          onChange(e.target.value)
        }}
        style={{
          width: '100%', padding: '6px 8px',
          border: '1px solid #e2e8f0', borderRadius: 6,
          fontSize: 13, cursor: 'pointer',
          fontFamily: previewFamily,
          background: '#fff',
        }}
      >
        <optgroup label="Sistema">
          {SYSTEM_FONTS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </optgroup>
        <optgroup label="Google Fonts">
          {GOOGLE_FONTS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </optgroup>
      </select>

      {/* Preview de la fuente seleccionada */}
      <div style={{
        marginTop: 6, padding: '8px 10px',
        background: '#f8fafc', borderRadius: 6,
        border: '1px solid #f1f5f9',
      }}>
        <p style={{
          margin: 0, fontSize: 16,
          fontFamily: previewFamily,
          color: '#1e293b',
          lineHeight: 1.4,
        }}>
          {currentFont?.label ?? 'Fuente'} — Aa Bb Cc 123
        </p>
        <p style={{
          margin: '4px 0 0', fontSize: 12,
          fontFamily: previewFamily,
          color: '#64748b',
        }}>
          El rápido zorro marrón salta sobre el perro perezoso
        </p>
      </div>
    </div>
  )
}
