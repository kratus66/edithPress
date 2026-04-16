import * as React from 'react'
import { cn } from '../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label visible asociado al input (genera htmlFor automáticamente) */
  label?: string
  /** Texto de ayuda debajo del input */
  helperText?: string
  /** Mensaje de error — activa el estado error visual */
  error?: string
  /** Icono a la izquierda del campo */
  leftIcon?: React.ReactNode
  /** Icono a la derecha del campo (ej: toggle contraseña) */
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    // Genera un id si no se provee, para el htmlFor del label
    const inputId = id ?? React.useId()
    const helperId = helperText ? `${inputId}-helper` : undefined
    const errorId  = error       ? `${inputId}-error`  : undefined

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium',
              error ? 'text-error' : 'text-gray-700'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-describedby={errorId ?? helperId}
            aria-invalid={!!error}
            className={cn(
              'w-full rounded-md border bg-bg-primary text-sm text-gray-900',
              'px-3 py-2',
              'placeholder:text-gray-500',
              'transition-colors duration-[var(--transition-fast)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-0 focus-visible:border-primary-600',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
              error
                ? 'border-error focus-visible:ring-error'
                : 'border-gray-200 hover:border-gray-500',
              leftIcon  && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs text-error" role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
