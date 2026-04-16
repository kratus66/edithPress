// Tokens CSS — importar en el entry de cada app
export type {} // satisface TypeScript para el CSS import

// Utilidades
export { cn } from './lib/utils'

// Componentes base
export { Button, buttonVariants }     from './components/Button'
export type { ButtonProps }            from './components/Button'

export { Input }                       from './components/Input'
export type { InputProps }             from './components/Input'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
}                                      from './components/Card'

export { Badge, badgeVariants }        from './components/Badge'
export type { BadgeProps }             from './components/Badge'

export { Alert, alertVariants }        from './components/Alert'
export type { AlertProps }             from './components/Alert'
