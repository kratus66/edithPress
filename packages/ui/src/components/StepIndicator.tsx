import * as React from 'react'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   StepIndicator — Indicador de progreso de pasos.
   Desktop: burbujas numeradas conectadas por líneas.
   Mobile: texto "Paso X de Y: nombre del paso".
   ------------------------------------------------------- */

export interface StepIndicatorProps {
  /** Array de nombres de los pasos */
  steps: string[]
  /** Paso actual, 0-indexed */
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* ── Mobile: texto resumido ── */}
      <p className="text-center text-sm text-gray-500 sm:hidden">
        Paso{' '}
        <span className="font-medium text-gray-700">
          {currentStep + 1}
        </span>{' '}
        de{' '}
        <span className="font-medium text-gray-700">
          {steps.length}
        </span>
        :{' '}
        <span className="font-medium text-gray-700">
          {steps[currentStep] ?? ''}
        </span>
      </p>

      {/* ── Desktop: burbujas + líneas ── */}
      <nav
        aria-label="Progreso de pasos"
        className="hidden sm:flex sm:items-center"
      >
        {steps.map((stepName, index) => {
          const isCompleted = index < currentStep
          const isCurrent   = index === currentStep
          const isPending   = index > currentStep

          return (
            <React.Fragment key={stepName}>
              {/* Línea conectora izquierda (excepto primer step) */}
              {index > 0 && (
                <div
                  className={cn(
                    'flex-1 h-px',
                    isCompleted || isCurrent
                      ? 'bg-indigo-600'
                      : 'bg-gray-200'
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step individual */}
              <div className="flex flex-col items-center gap-1.5">
                {/* Burbuja */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
                    'transition-colors duration-200',
                    isCompleted && 'bg-indigo-600 text-white',
                    isCurrent  && 'bg-indigo-600 text-white',
                    isPending  && 'bg-gray-200 text-gray-400'
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    // Checkmark
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                      className="h-4 w-4">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Label del step */}
                <span
                  className={cn(
                    'text-xs whitespace-nowrap',
                    isCurrent  && 'font-medium text-indigo-600',
                    isCompleted && 'text-gray-900',
                    isPending  && 'text-gray-400'
                  )}
                >
                  {stepName}
                </span>
              </div>

            </React.Fragment>
          )
        })}
      </nav>

      {/* Accesibilidad: estado real para screen readers */}
      <ol className="sr-only" aria-label="Pasos del proceso">
        {steps.map((stepName, index) => {
          const isCompleted = index < currentStep
          const isCurrent   = index === currentStep
          return (
            <li
              key={stepName}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {stepName}
              {isCompleted && ' (completado)'}
              {isCurrent   && ' (actual)'}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
