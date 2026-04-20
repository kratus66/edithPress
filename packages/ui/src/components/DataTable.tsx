import * as React from 'react'
import { cn } from '../lib/utils'
import { Skeleton } from './Skeleton'

/* -------------------------------------------------------
   DataTable — Tabla de datos genérica con soporte para:
   - Columnas tipadas con render personalizado
   - Estado de carga con skeleton
   - Estado vacío con mensaje y acción opcional
   ------------------------------------------------------- */

// ── Tipos ───────────────────────────────────────────────
export interface DataTableColumn<TRow extends Record<string, unknown>> {
  /** Clave única de la columna */
  key: string
  /** Cabecera visible */
  header: string
  /** Función render — recibe la fila completa */
  render?: (row: TRow) => React.ReactNode
  /** Clases extras para las celdas de esta columna */
  cellClassName?: string
  /** Clases extras para la cabecera */
  headerClassName?: string
}

export interface DataTableProps<TRow extends Record<string, unknown>> {
  /** Definición de columnas */
  columns: DataTableColumn<TRow>[]
  /** Datos a mostrar */
  data: TRow[]
  /** Clave que identifica cada fila (default: "id") */
  rowKey?: keyof TRow
  /** Si true: muestra skeleton de carga */
  isLoading?: boolean
  /** Número de filas skeleton (default: 5) */
  skeletonRows?: number
  /** Mensaje del estado vacío */
  emptyMessage?: string
  /** Nodo adicional en el empty state (ej: botón "Crear") */
  emptyAction?: React.ReactNode
  className?: string
}

// ── Componente ──────────────────────────────────────────
export function DataTable<TRow extends Record<string, unknown>>({
  columns,
  data,
  rowKey = 'id' as keyof TRow,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = 'No hay registros para mostrar.',
  emptyAction,
  className,
}: DataTableProps<TRow>) {
  return (
    <div className={cn('w-full overflow-hidden rounded-lg border border-gray-200', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          {/* Cabecera */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500',
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {/* Estado de carga */}
            {isLoading &&
              Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton variant="rect" className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Datos */}
            {!isLoading &&
              data.length > 0 &&
              data.map((row) => {
                const key = String(row[rowKey] ?? Math.random())
                return (
                  <tr
                    key={key}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-gray-700',
                          col.cellClassName
                        )}
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.key as keyof TRow] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })}

            {/* Estado vacío */}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    {/* Icono documento vacío */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5"
                      className="h-12 w-12 text-gray-300" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p className="text-sm text-gray-500">{emptyMessage}</p>
                    {emptyAction}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
