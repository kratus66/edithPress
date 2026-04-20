import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   Toast — Notificaciones de acción basadas en Radix UI.
   Uso:
     <ToastProvider>
       ...app...
       <ToastViewport />
     </ToastProvider>

     const { toast } = useToast()
     toast({ title: 'Guardado', variant: 'success' })
   ------------------------------------------------------- */

// ── Variantes visuales ──────────────────────────────────
const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-start gap-3',
    'overflow-hidden rounded-lg border p-4 shadow-md',
    'transition-all duration-200',
    'data-[swipe=cancel]:translate-x-0',
    'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
    'data-[swipe=move]:transition-none',
    'data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
  ],
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white text-gray-900',
        success: 'border-green-200 bg-green-50 text-green-900',
        error:   'border-red-200   bg-red-50   text-red-900',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        info:    'border-primary-100 bg-primary-50 text-primary-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// ── Iconos inline por variante ──────────────────────────
const variantIcon: Record<string, React.ReactNode> = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
      className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
      className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
      className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
      className="h-5 w-5 shrink-0 text-primary-600" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  ),
}

// ── Tipos ───────────────────────────────────────────────
export interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextValue {
  toast: (data: Omit<ToastData, 'id'>) => void
  dismiss: (id: string) => void
}

// ── Context ─────────────────────────────────────────────
const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}

// ── Provider ────────────────────────────────────────────
export interface ToastProviderProps {
  children: React.ReactNode
  /** Duración por defecto en ms (default 4000) */
  defaultDuration?: number
}

export function ToastProvider({ children, defaultDuration = 4000 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const toast = React.useCallback(
    (data: Omit<ToastData, 'id'>) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, duration: defaultDuration, ...data }])
    },
    [defaultDuration]
  )

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration}
            onOpenChange={(open) => { if (!open) dismiss(t.id) }}
            className={cn(toastVariants({ variant: t.variant }))}
          >
            {/* Icono */}
            {t.variant && variantIcon[t.variant] != null && variantIcon[t.variant]}

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              {t.title && (
                <ToastPrimitive.Title className="text-sm font-semibold leading-tight">
                  {t.title}
                </ToastPrimitive.Title>
              )}
              {t.description && (
                <ToastPrimitive.Description className="mt-0.5 text-sm opacity-80">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>

            {/* Cerrar */}
            <ToastPrimitive.Close
              aria-label="Cerrar notificación"
              className={cn(
                'shrink-0 rounded-md p-1',
                'opacity-60 hover:opacity-100 transition-opacity',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600'
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                className="h-4 w-4" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

// ── Viewport ────────────────────────────────────────────
export function ToastViewport({ className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        'fixed top-4 right-4 z-[9999]',
        'flex flex-col gap-2',
        'w-full max-w-sm',
        'outline-none',
        className
      )}
      {...props}
    />
  )
}
