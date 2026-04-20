import * as React from 'react'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   TemplateCard — Card para elegir plantillas de sitio.
   Muestra preview de imagen (o placeholder), badge de
   categoría, badge Premium opcional, y footer con nombre
   y contador de uso.
   ------------------------------------------------------- */

export interface TemplateCardProps {
  id: string
  name: string
  description?: string
  category: string
  previewImageUrl?: string
  isPremium?: boolean
  usageCount?: number
  isSelected?: boolean
  onClick: (id: string) => void
}

export function TemplateCard({
  id,
  name,
  description,
  category,
  previewImageUrl,
  isPremium = false,
  usageCount,
  isSelected = false,
  onClick,
}: TemplateCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Plantilla: ${name}${isSelected ? ' (seleccionada)' : ''}`}
      onClick={() => onClick(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(id)
        }
      }}
      className={cn(
        'group cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-600'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      )}
    >
      {/* ── Zona de imagen 16/9 ── */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {previewImageUrl ? (
          <img
            src={previewImageUrl}
            alt={`Preview de la plantilla ${name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          // Placeholder sin imagen
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              className="h-10 w-10 text-gray-300" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 3.75H3a.75.75 0 00-.75.75v15c0 .414.336.75.75.75h18a.75.75 0 00.75-.75V4.5A.75.75 0 0021 3.75z" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/40 opacity-0 transition-opacity duration-200',
            'group-hover:opacity-100'
          )}
          aria-hidden="true"
        >
          <span className="rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-900">
            Seleccionar
          </span>
        </div>

        {/* Checkmark isSelected */}
        {isSelected && (
          <div
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600"
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              className="h-4 w-4 text-white">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Badge Premium (arriba derecha, si no hay checkmark de selección) */}
        {isPremium && !isSelected && (
          <div className="absolute right-2 top-2">
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-black">
              Premium
            </span>
          </div>
        )}

        {/* Badge Premium junto al checkmark */}
        {isPremium && isSelected && (
          <div className="absolute right-10 top-2">
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-black">
              Premium
            </span>
          </div>
        )}

        {/* Badge de categoría (abajo izquierda) */}
        <div className="absolute bottom-2 left-2">
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs capitalize text-gray-700 backdrop-blur-sm">
            {category}
          </span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500 truncate">{description}</p>
        )}
        {usageCount !== undefined && usageCount > 0 && (
          <p className="mt-0.5 text-xs text-gray-400">Usado {usageCount} veces</p>
        )}
      </div>
    </div>
  )
}
