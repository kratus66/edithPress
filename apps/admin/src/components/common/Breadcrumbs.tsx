import Link from 'next/link'
import { cn } from '@edithpress/ui'

export interface BreadcrumbItem {
  /** Texto que se muestra */
  label: string
  /** Si se pasa href, se renderiza como enlace; si no, como texto estático */
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumbs de navegación para páginas anidadas del admin.
 *
 * Uso:
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Sitios', href: '/sites' },
 *     { label: 'Mi sitio', href: `/sites/${siteId}` },
 *     { label: 'Páginas' },
 *   ]}
 * />
 * ```
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Ruta de navegación"
      className={cn('flex items-center flex-wrap gap-1 text-sm', className)}
    >
      <ol className="flex items-center flex-wrap gap-1" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-1">
              {/* Separador */}
              {index > 0 && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-300 shrink-0"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}

              {/* Enlace o texto */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    'text-gray-500 hover:text-gray-700 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-sm',
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-medium text-gray-900' : 'text-gray-500'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
