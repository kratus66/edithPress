// Tokens CSS — importar en el entry de cada app
export type {} // satisface TypeScript para el CSS import

// Utilidades
export { cn } from './lib/utils'

// ── Componentes base (FASE 0) ────────────────────────────

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

// ── Componentes Sprint 02 ────────────────────────────────

// Toast
export { ToastProvider, ToastViewport, useToast } from './components/Toast'
export type { ToastData, ToastProviderProps }       from './components/Toast'

// Modal
export { Modal, ModalBody, ModalFooter }            from './components/Modal'
export type { ModalProps, ModalBodyProps, ModalFooterProps } from './components/Modal'

// DataTable
export { DataTable }                               from './components/DataTable'
export type { DataTableColumn, DataTableProps }    from './components/DataTable'

// Pagination
export { Pagination }                              from './components/Pagination'
export type { PaginationProps }                    from './components/Pagination'

// FormField
export { FormField }                               from './components/FormField'
export type { FormFieldProps }                     from './components/FormField'

// Select
export { Select }                                  from './components/Select'
export type { SelectProps, SelectOption }          from './components/Select'

// Textarea
export { Textarea }                                from './components/Textarea'
export type { TextareaProps }                      from './components/Textarea'

// Skeleton
export { Skeleton }                                from './components/Skeleton'
export type { SkeletonProps }                      from './components/Skeleton'

// DropdownMenu
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}                                                  from './components/DropdownMenu'
export type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
}                                                  from './components/DropdownMenu'

// Switch
export { Switch }                                  from './components/Switch'
export type { SwitchProps }                        from './components/Switch'

// ── Componentes nuevos Sprint 02 ─────────────────────────

// TemplateCard
export { TemplateCard }                            from './components/TemplateCard'
export type { TemplateCardProps }                  from './components/TemplateCard'

// StatCard
export { StatCard }                                from './components/StatCard'
export type { StatCardProps }                      from './components/StatCard'

// StepIndicator
export { StepIndicator }                           from './components/StepIndicator'
export type { StepIndicatorProps }                 from './components/StepIndicator'

// ── Componentes Sprint 03.1 ──────────────────────────────

// ProductCard
export { ProductCard }                             from './components/ProductCard'
export type { ProductCardProps }                   from './components/ProductCard'

// NewsletterForm
export { NewsletterForm }                          from './components/NewsletterForm'
export type { NewsletterFormProps }                from './components/NewsletterForm'

// StatItem
export { StatItem }                                from './components/StatItem'
export type { StatItemProps }                      from './components/StatItem'

// CartBadge
export { CartBadge }                               from './components/CartBadge'
export type { CartBadgeProps }                     from './components/CartBadge'
