import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   Modal — Diálogo accesible basado en Radix UI Dialog.
   Composición:
     <Modal open={open} onClose={setOpen}>
       <ModalBody>...</ModalBody>
       <ModalFooter>...</ModalFooter>
     </Modal>
   ------------------------------------------------------- */

// ── Variantes de tamaño ─────────────────────────────────
const contentVariants = cva(
  [
    'relative z-50 flex flex-col',
    'w-full bg-white rounded-xl shadow-md',
    'border border-gray-200',
    // Animación de entrada/salida
    'duration-200',
    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  ],
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// ── Tipos ───────────────────────────────────────────────
export interface ModalProps {
  /** Controla visibilidad desde el padre */
  open: boolean
  /** Callback cuando el modal se cierra (Esc o click en overlay) */
  onClose: (open: boolean) => void
  /** Título visible en el header del modal */
  title?: string
  /** Descripción accesible (puede ser visualmente oculta) */
  description?: string
  /** Tamaño del panel: sm | md | lg | xl */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children?: React.ReactNode
}

// ── Componente principal ────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
          )}
        />

        {/* Centrado en pantalla */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPrimitive.Content
            className={cn(contentVariants({ size }))}
            aria-describedby={description ? 'modal-description' : undefined}
          >
            {/* Header */}
            {title && (
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
                <DialogPrimitive.Title className="text-base font-semibold text-gray-900">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  aria-label="Cerrar modal"
                  className={cn(
                    'rounded-md p-1 text-gray-400 hover:text-gray-600',
                    'transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600'
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    className="h-5 w-5" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </DialogPrimitive.Close>
              </div>
            )}

            {description && (
              <DialogPrimitive.Description id="modal-description" className="sr-only">
                {description}
              </DialogPrimitive.Description>
            )}

            {children}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// ── Sub-componentes ──────────────────────────────────────

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalBody({ className, children, ...props }: ModalBodyProps) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalFooter({ className, children, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
