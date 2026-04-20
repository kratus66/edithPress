import * as React from 'react'
import { cn } from '../lib/utils'
import { Skeleton } from './Skeleton'

/* -------------------------------------------------------
   StatCard — Tarjeta de métrica/estadística para dashboard.
   Muestra valor grande, cambio porcentual vs período y
   un icono opcional.
   ------------------------------------------------------- */

export interface StatCardProps {
  /** Título descriptivo de la métrica */
  title: string
  /** Valor principal a mostrar */
  value: string | number
  /** Cambio porcentual vs período anterior (positivo o negativo) */
  change?: number
  /** Etiqueta del período comparado, ej: "vs mes anterior" */
  changeLabel?: string
  /** Icono React (ej: componente lucide-react) */
  icon?: React.ReactNode
  /** Si true: muestra skeleton en lugar del valor */
  isLoading?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  isLoading = false,
  className,
}: StatCardProps) {
  // ── Render del indicador de cambio ──
  function renderChange() {
    if (change === undefined) return null

    if (change > 0) {
      return (
        <span className="text-sm text-green-600">
          ▲ {change}%
        </span>
      )
    }
    if (change < 0) {
      return (
        <span className="text-sm text-red-600">
          ▼ {Math.abs(change)}%
        </span>
      )
    }
    return (
      <span className="text-sm text-gray-400">— sin cambio</span>
    )
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
        className
      )}
    >
      {/* Icono — círculo en esquina superior derecha */}
      {icon && (
        <div
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100"
          aria-hidden="true"
        >
          <span className="text-indigo-600">{icon}</span>
        </div>
      )}

      {/* Título */}
      <p className="text-sm font-medium text-gray-500">{title}</p>

      {/* Valor principal */}
      <div className="mt-2">
        {isLoading ? (
          <Skeleton variant="rect" className="h-9 w-20" />
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        )}
      </div>

      {/* Cambio porcentual */}
      {!isLoading && (change !== undefined) && (
        <div className="mt-2 flex items-center gap-1.5">
          {renderChange()}
          {changeLabel && (
            <span className="text-xs text-gray-400">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
