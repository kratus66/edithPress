import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1',
    'rounded-full px-2.5 py-0.5',
    'text-xs font-medium',
    'border',
    'transition-colors',
  ],
  {
    variants: {
      variant: {
        // Estados genéricos
        default:     'border-gray-200  bg-gray-100   text-gray-700',
        primary:     'border-primary-100 bg-primary-50  text-primary-700',
        success:     'border-green-200  bg-green-50   text-green-700',
        warning:     'border-amber-200  bg-amber-50   text-amber-700',
        error:       'border-red-200    bg-red-50     text-red-700',
        // Planes de EdithPress
        starter:     'border-gray-200   bg-gray-100   text-gray-700',
        business:    'border-primary-100 bg-primary-50  text-primary-700',
        pro:         'border-violet-200  bg-violet-50  text-violet-700',
        // Estados de contenido
        published:   'border-green-200  bg-green-50   text-green-700',
        draft:       'border-amber-200  bg-amber-50   text-amber-700',
        archived:    'border-gray-200   bg-gray-100   text-gray-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
