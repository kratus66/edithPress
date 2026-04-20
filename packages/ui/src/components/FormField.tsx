import * as React from 'react'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   FormField — Wrapper accesible para cualquier control
   de formulario. Proporciona label, hint, error y
   marcador de campo requerido.

   Uso:
     <FormField label="Email" error={errors.email} required>
       <Input ... />
     </FormField>
   ------------------------------------------------------- */

export interface FormFieldProps {
  /** Texto del label visible */
  label?: string
  /** ID del control — conecta label con el input via htmlFor */
  htmlFor?: string
  /** Mensaje de error (rojo, rol alert) */
  error?: string
  /** Texto de ayuda (gris, debajo del control) */
  hint?: string
  /** Muestra asterisco rojo junto al label */
  required?: boolean
  children?: React.ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
  className,
}: FormFieldProps) {
  const generatedId = React.useId()
  const fieldId = htmlFor ?? generatedId
  const errorId = error ? `${fieldId}-error` : undefined
  const hintId  = hint  ? `${fieldId}-hint`  : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'text-sm font-medium',
            error ? 'text-red-600' : 'text-gray-700'
          )}
        >
          {label}
          {required && (
            <span className="ml-1 text-red-600" aria-hidden="true">*</span>
          )}
          {required && (
            <span className="sr-only">(requerido)</span>
          )}
        </label>
      )}

      {/* Clonar el children para inyectar id, aria-describedby, aria-invalid */}
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          id: (child.props as Record<string, unknown>).id ?? fieldId,
          'aria-describedby': errorId ?? hintId,
          'aria-invalid': error ? true : undefined,
          'aria-required': required ? true : undefined,
        })
      })}

      {error && (
        <p id={errorId} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  )
}
