import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   DropdownMenu — Menú contextual accesible con Radix UI.
   Composición:
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button>Acciones</Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent>
         <DropdownMenuItem icon={<EditIcon />} onSelect={...}>Editar</DropdownMenuItem>
         <DropdownMenuSeparator />
         <DropdownMenuItem variant="destructive" icon={<TrashIcon />}>Eliminar</DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   ------------------------------------------------------- */

// ── Root ────────────────────────────────────────────────
export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

// ── Content ─────────────────────────────────────────────
export interface DropdownMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {}

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = 'DropdownMenuContent'

// ── Item ─────────────────────────────────────────────────
export interface DropdownMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  /** Icono a la izquierda del texto */
  icon?: React.ReactNode
  /** 'destructive' aplica color rojo */
  variant?: 'default' | 'destructive'
}

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, icon, variant = 'default', children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none',
      'transition-colors duration-100',
      'focus:bg-gray-100',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      variant === 'destructive'
        ? 'text-red-600 focus:bg-red-50 focus:text-red-700'
        : 'text-gray-700',
      className
    )}
    {...props}
  >
    {icon && (
      <span className="h-4 w-4 shrink-0" aria-hidden="true">
        {icon}
      </span>
    )}
    {children}
  </DropdownMenuPrimitive.Item>
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

// ── Separator ────────────────────────────────────────────
export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-gray-200', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

// ── Label ────────────────────────────────────────────────
export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide', className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = 'DropdownMenuLabel'
