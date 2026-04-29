import React from 'react'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { ColorPickerField } from '@/components/ColorPickerField'

export const btnActive: React.CSSProperties = {
  padding: '5px 10px', borderRadius: 5, fontSize: 12,
  border: '2px solid #2563eb', background: '#eff6ff',
  color: '#2563eb', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 600,
  transition: 'all 0.1s',
}
export const btnInactive: React.CSSProperties = {
  padding: '5px 10px', borderRadius: 5, fontSize: 12,
  border: '1px solid #e2e8f0', background: '#fff',
  color: '#64748b', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 400,
  transition: 'all 0.1s',
}

function normalizeValue(v: unknown, fallback: string): string {
  if (v === null || v === undefined) return fallback
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') return String(v)
  return String(v)
}

function coerceOption(optValue: string): unknown {
  if (optValue === 'true') return true
  if (optValue === 'false') return false
  return optValue
}

/** Renders a row of radio-style buttons. */
export function renderRadioOptions(
  options: Array<{ label: string; value: string }>,
  currentValue: unknown,
  onChange: (v: unknown) => void,
) {
  const curr = String(currentValue ?? '')
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={curr === opt.value ? btnActive : btnInactive}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** Single field wrapped in a CollapsibleSection with radio buttons. */
export function makeCollapsibleRadio(
  title: string,
  options: Array<{ label: string; value: string }>,
  defaultValue?: string,
) {
  return {
    type: 'custom' as const,
    render: ({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) => {
      const fallback = defaultValue ?? options[0]?.value ?? ''
      const current = normalizeValue(value, fallback)
      const currentLabel = options.find(o => o.value === current)?.label ?? current
      return (
        <CollapsibleSection title={title} subtitle={currentLabel} defaultOpen={false} noBorderTop>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(coerceOption(opt.value))}
                style={current === opt.value ? btnActive : btnInactive}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CollapsibleSection>
      )
    },
  }
}

/** Single color picker wrapped in a CollapsibleSection. */
export function makeCollapsibleColor(title: string) {
  return {
    type: 'custom' as const,
    render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => {
      const color = (value as string) ?? '#000000'
      const safeColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : null
      const subtitle = safeColor
        ? color
        : color === 'transparent' ? 'Transparente' : color

      return (
        <CollapsibleSection
          title={title}
          subtitle={subtitle}
          defaultOpen={false}
          noBorderTop
        >
          <ColorPickerField value={color} onChange={onChange} />
        </CollapsibleSection>
      )
    },
  }
}

/**
 * A group of nested CollapsibleSections, all bound to sub-keys of a single object prop.
 *
 * Usage:
 *   makeCollapsibleGroup<MyStyles>('Título', [
 *     { key: 'fontSize', title: 'Tamaño', getSummary: v => String(v), render: (v, onChange) => ... },
 *   ], defaults)
 */
export function makeCollapsibleGroup<T extends object>(
  groupTitle: string,
  sectionDefs: Array<{
    key: keyof T & string
    title: string
    getSummary?: (value: unknown) => string
    render: (value: unknown, onChange: (v: unknown) => void) => React.ReactNode
  }>,
  defaults: T,
) {
  return {
    type: 'custom' as const,
    render: ({ value, onChange }: { value: unknown; onChange: (v: T) => void }) => {
      const current = { ...defaults, ...(value as Partial<T>) } as T
      const update = (key: keyof T & string, v: unknown) =>
        onChange({ ...current, [key]: v } as T)

      return (
        <CollapsibleSection title={groupTitle} defaultOpen={false} noBorderTop>
          {sectionDefs.map((def) => {
            const fieldValue = (current as Record<string, unknown>)[def.key]
            const subtitle = def.getSummary ? def.getSummary(fieldValue) : undefined
            return (
              <CollapsibleSection
                key={def.key}
                title={def.title}
                subtitle={subtitle}
                defaultOpen={false}
                noBorderTop
                nested
                cacheKey={`${groupTitle}::${def.key}`}
              >
                {def.render(fieldValue, (v) => update(def.key, v))}
              </CollapsibleSection>
            )
          })}
        </CollapsibleSection>
      )
    },
  }
}
