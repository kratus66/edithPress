import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind sin conflictos.
 * Ejemplo: cn('px-4 py-2', condition && 'bg-primary-600')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
