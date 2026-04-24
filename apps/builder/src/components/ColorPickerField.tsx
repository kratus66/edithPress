'use client'

import React, { useEffect, useRef, useState } from 'react'

const PRESETS = [
  // Neutros
  '#ffffff', '#f8fafc', '#f1f5f9', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#1e293b', '#0f172a', '#000000',
  // Rojos
  '#fef2f2', '#fca5a5', '#ef4444', '#dc2626', '#991b1b',
  // Naranjas
  '#fff7ed', '#fdba74', '#f97316', '#ea580c', '#9a3412',
  // Amarillos
  '#fefce8', '#fde68a', '#eab308', '#ca8a04', '#854d0e',
  // Verdes
  '#f0fdf4', '#86efac', '#22c55e', '#16a34a', '#166534',
  // Azules
  '#eff6ff', '#93c5fd', '#3b82f6', '#2563eb', '#1d4ed8',
  // Índigos
  '#eef2ff', '#a5b4fc', '#6366f1', '#4f46e5', '#3730a3',
  // Morados
  '#fdf4ff', '#d8b4fe', '#a855f7', '#9333ea', '#7e22ce',
  // Rosas
  '#fdf2f8', '#f9a8d4', '#ec4899', '#db2777', '#9d174d',
]

interface ColorPickerFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function ColorPickerField({ value, onChange }: ColorPickerFieldProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const safeColor = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'

  return (
    <div ref={ref} style={{ position: 'relative', fontFamily: 'sans-serif' }}>
      {/* Fila principal: swatch + hex input + selector nativo */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          title="Abrir paleta"
          style={{
            width: 32, height: 32, flexShrink: 0,
            borderRadius: 6, cursor: 'pointer',
            background: safeColor,
            border: '2px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,.12)',
          }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          style={{
            flex: 1, padding: '5px 8px',
            border: '1px solid #e2e8f0', borderRadius: 6,
            fontSize: 12, fontFamily: 'monospace',
            outline: 'none',
          }}
        />
        <input
          type="color"
          value={safeColor}
          onChange={e => onChange(e.target.value)}
          title="Selector nativo"
          style={{
            width: 32, height: 32, padding: 2,
            borderRadius: 6, border: '1px solid #e2e8f0',
            cursor: 'pointer', flexShrink: 0,
          }}
        />
      </div>

      {/* Paleta desplegable */}
      {open && (
        <div style={{
          position: 'absolute', top: 38, left: 0, zIndex: 9999,
          background: '#fff', borderRadius: 10, padding: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,.18)',
          border: '1px solid #e2e8f0', width: 218,
        }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Paleta de colores
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
            {PRESETS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => { onChange(color); setOpen(false) }}
                title={color}
                style={{
                  width: 18, height: 18, borderRadius: 3, padding: 0,
                  background: color, cursor: 'pointer',
                  border: value === color ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  boxSizing: 'border-box',
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 10, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: '#64748b' }}>Color personalizado</p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="color"
                value={safeColor}
                onChange={e => { onChange(e.target.value) }}
                style={{ width: 32, height: 28, padding: 2, borderRadius: 4, border: '1px solid #e2e8f0', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="#000000"
                style={{
                  flex: 1, padding: '4px 8px',
                  border: '1px solid #e2e8f0', borderRadius: 6,
                  fontSize: 12, fontFamily: 'monospace',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
