import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const alertVariants = cva(
  [
    'relative w-full rounded-lg border p-4',
    'flex gap-3',
    '[&>svg]:mt-0.5 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        success: [
          'border-green-200 bg-green-50 text-green-800',
          '[&>svg]:text-green-600',
        ],
        error: [
          'border-red-200 bg-red-50 text-red-800',
          '[&>svg]:text-red-600',
        ],
        warning: [
          'border-amber-200 bg-amber-50 text-amber-800',
          '[&>svg]:text-amber-600',
        ],
        info: [
          'border-primary-100 bg-primary-50 text-primary-800',
          '[&>svg]:text-primary-600',
        ],
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

/* -------------------------------------------------------
   Iconos inline — sin dependencia de lucide-react en el
   nivel del design system base. Las apps pueden sobreescribir
   pasando su propio icono como children.
   ------------------------------------------------------- */
const defaultIcons: Record<string, React.ReactNode> = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  ),
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  /** Ocultar icono por defecto */
  hideIcon?: boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, hideIcon = false, children, ...props }, ref) => {
    const roleMap = { error: 'alert', success: 'status', warning: 'alert', info: 'status' } as const
    const liveMap = { error: 'assertive', success: 'polite', warning: 'assertive', info: 'polite' } as const
    const v = variant ?? 'info'

    return (
      <div
        ref={ref}
        role={roleMap[v]}
        aria-live={liveMap[v]}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {!hideIcon && defaultIcons[v]}
        <div className="flex-1">
          {title && (
            <p className="mb-1 text-sm font-semibold">{title}</p>
          )}
          {children && (
            <p className="text-sm">{children}</p>
          )}
        </div>
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export { Alert, alertVariants }
