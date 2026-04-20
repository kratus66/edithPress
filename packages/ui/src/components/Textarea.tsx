import * as React from 'react'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   Textarea — Área de texto estilizada con Tailwind.
   Prop `resize` controla el comportamiento de resize.
   ------------------------------------------------------- */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Comportamiento de resize CSS */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  /** Mensaje de error */
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, resize = 'vertical', error, disabled, ...props }, ref) => {
    const resizeClass: Record<string, string> = {
      none:       'resize-none',
      vertical:   'resize-y',
      horizontal: 'resize-x',
      both:       'resize',
    }

    return (
      <div className="flex flex-col gap-1">
        <textarea
          ref={ref}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-md border bg-white text-sm text-gray-900',
            'px-3 py-2',
            'placeholder:text-gray-400',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-gray-200 hover:border-gray-400',
            resizeClass[resize],
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
