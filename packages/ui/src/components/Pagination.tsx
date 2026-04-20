import * as React from 'react'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   Pagination — Navegación paginada con ellipsis y
   resumen "Mostrando X-Y de Z".
   ------------------------------------------------------- */

export interface PaginationProps {
  /** Página actual (1-indexed) */
  currentPage: number
  /** Total de páginas */
  totalPages: number
  /** Total de registros (para el resumen) */
  totalItems?: number
  /** Registros por página (para el resumen) */
  pageSize?: number
  /** Callback al cambiar de página */
  onPageChange: (page: number) => void
  className?: string
}

// ── Utilidad: genera la secuencia de páginas con ellipsis ─
function buildPageSequence(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: Array<number | 'ellipsis'> = []
  const delta = 1 // páginas a cada lado del actual

  const leftSibling  = Math.max(current - delta, 2)
  const rightSibling = Math.min(current + delta, total - 1)

  pages.push(1)

  if (leftSibling > 2) pages.push('ellipsis')

  for (let i = leftSibling; i <= rightSibling; i++) {
    pages.push(i)
  }

  if (rightSibling < total - 1) pages.push('ellipsis')

  pages.push(total)

  return pages
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  className,
}: PaginationProps) {
  const sequence = buildPageSequence(currentPage, totalPages)

  // Rango para el resumen "Mostrando X-Y de Z"
  const from = totalItems ? (currentPage - 1) * pageSize + 1 : null
  const to   = totalItems ? Math.min(currentPage * pageSize, totalItems) : null

  const buttonBase = cn(
    'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-sm',
    'border border-gray-200 bg-white text-gray-700',
    'transition-colors duration-100',
    'hover:bg-gray-50 hover:border-gray-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
    'disabled:cursor-not-allowed disabled:opacity-40'
  )

  return (
    <div
      className={cn('flex flex-col items-center gap-3 sm:flex-row sm:justify-between', className)}
      aria-label="Navegación de páginas"
    >
      {/* Resumen */}
      {totalItems != null && from != null && to != null && (
        <p className="text-sm text-gray-500">
          Mostrando{' '}
          <span className="font-medium text-gray-700">{from}</span>
          {' '}–{' '}
          <span className="font-medium text-gray-700">{to}</span>
          {' '}de{' '}
          <span className="font-medium text-gray-700">{totalItems}</span>
        </p>
      )}

      {/* Controles */}
      <nav aria-label="Paginación" className="flex items-center gap-1">
        {/* Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
          className={buttonBase}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            className="h-4 w-4" aria-hidden="true">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Páginas con ellipsis */}
        {sequence.map((item, idx) => {
          if (item === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                aria-hidden="true"
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400"
              >
                &hellip;
              </span>
            )
          }

          const isActive = item === currentPage
          return (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Página ${item}`}
              className={cn(
                buttonBase,
                isActive && 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:border-primary-700'
              )}
            >
              {item}
            </button>
          )
        })}

        {/* Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Página siguiente"
          className={buttonBase}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            className="h-4 w-4" aria-hidden="true">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  )
}
