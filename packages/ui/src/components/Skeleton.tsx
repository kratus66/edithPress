import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

/* -------------------------------------------------------
   Skeleton — Placeholder animado para estados de carga.
   Variantes: text | rect | circle
   ------------------------------------------------------- */

const skeletonVariants = cva(
  ['animate-pulse bg-gray-200'],
  {
    variants: {
      variant: {
        text:   'rounded h-4 w-full',
        rect:   'rounded-md',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'rect',
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
}
