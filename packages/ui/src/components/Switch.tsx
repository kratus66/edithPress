import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   Switch — Toggle accesible con role="switch" via Radix UI.
   Uso:
     <Switch checked={enabled} onCheckedChange={setEnabled} label="Activo" />
   ------------------------------------------------------- */

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Label visible asociado al switch */
  label?: string
  /** Descripción adicional debajo del label */
  description?: string
}

export function Switch({ label, description, className, id, ...props }: SwitchProps) {
  const generatedId = React.useId()
  const switchId = id ?? generatedId
  const descriptionId = description ? `${switchId}-description` : undefined

  return (
    <div className="flex items-start gap-3">
      <SwitchPrimitive.Root
        id={switchId}
        aria-describedby={descriptionId}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
          'border-2 border-transparent',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-primary-600',
          'data-[state=unchecked]:bg-gray-200',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm',
            'ring-0 transition-transform duration-200',
            'data-[state=checked]:translate-x-5',
            'data-[state=unchecked]:translate-x-0'
          )}
        />
      </SwitchPrimitive.Root>

      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={switchId}
              className="cursor-pointer text-sm font-medium text-gray-700 select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descriptionId} className="text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
