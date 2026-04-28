'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@edithpress/ui'

// ── Mapa pathname → título de página ──────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/sites':      'Mis sitios',
  '/templates':  'Templates',
  '/media':      'Media',
  '/domains':    'Dominios',
  '/analytics':  'Analítica',
  '/billing':    'Facturación',
  '/settings':   'Configuración',
  '/onboarding': 'Configuración inicial',
}

function usePageTitle(pathname: string): string {
  const segment = '/' + pathname.split('/').filter(Boolean)[0]
  return PAGE_TITLES[segment] ?? 'EdithPress Admin'
}

// ── UserMenu ───────────────────────────────────────────────────────────────────

interface UserMenuProps {
  email?: string
  name?: string
}

function UserMenu({ email = '', name = '' }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (email[0] ?? 'U').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          'bg-primary-600 text-sm font-semibold text-white',
          'transition-opacity hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
        )}
        aria-label="Menú de usuario"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Opciones de cuenta"
          className={cn(
            'absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-md border border-gray-200',
            'z-50 py-1',
          )}
        >
          {/* Info del usuario */}
          <div className="px-4 py-3 border-b border-gray-100">
            {name && (
              <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            )}
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          <Link
            href="/settings"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Configuración
          </Link>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                // TODO: conectar con auth signOut en FASE 1
                window.location.href = '/login'
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Header ─────────────────────────────────────────────────────────────────────

interface HeaderProps {
  /** Callback para abrir el MobileNav (solo visible en mobile) */
  onMenuOpen: () => void
  /** Info del usuario para el avatar/menú */
  userEmail?: string
  userName?: string
}

/**
 * Barra superior del admin panel.
 *
 * Desktop (md+):
 *   - Muestra el título de la página actual
 *   - Avatar con menú desplegable de usuario
 *
 * Mobile:
 *   - Logo de EdithPress
 *   - Botón hamburger que llama a onMenuOpen → abre MobileNav
 *   - Avatar con menú de usuario
 *
 * Se posiciona sticky con `top-0` para que permanezca visible al hacer scroll.
 * El layout padre debe añadir `md:pl-60` para que no se solape con el Sidebar.
 */
export function Header({ onMenuOpen, userEmail, userName }: HeaderProps) {
  const pathname = usePathname()
  const pageTitle = usePageTitle(pathname)

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6',
        // El layout padre ya aplica md:pl-60 para desplazar el contenido tras el Sidebar.
        // No se añade ml-60 aquí para evitar doble offset a 768px (el breakpoint md).
      )}
    >
      {/* ── Mobile: botón hamburger + logo ── */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onMenuOpen}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md text-gray-500',
            'hover:bg-gray-100 hover:text-gray-900 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
          )}
          aria-label="Abrir menú de navegación"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
          aria-label="EdithPress — Ir al dashboard"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
            <span className="text-xs font-bold text-white" aria-hidden="true">E</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">EdithPress</span>
        </Link>
      </div>

      {/* ── Desktop: título de la página ── */}
      <h1 className="hidden md:block text-lg font-semibold text-gray-900 flex-1 min-w-0 truncate">
        {pageTitle}
      </h1>

      {/* ── Spacer mobile ── */}
      <div className="flex-1 md:hidden" aria-hidden="true" />

      {/* ── Acciones derechas: user menu ── */}
      <div className="flex items-center gap-2">
        <UserMenu email={userEmail} name={userName} />
      </div>
    </header>
  )
}
