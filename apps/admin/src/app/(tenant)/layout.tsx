'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'

/**
 * Layout del área autenticada del tenant (dashboard, sites, media, etc.)
 *
 * Estructura desktop (md+):
 *   [Sidebar fijo 240px] | [Header sticky] + [contenido]
 *
 * Estructura mobile:
 *   [Header sticky con hamburger] + [contenido]
 *   [MobileNav drawer — overlay]
 *
 * TODO FASE 1: pasar userEmail y userName reales desde la sesión (next-auth).
 */
export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Sidebar — solo desktop */}
      <Sidebar />

      {/* Mobile nav drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Área de contenido — empujada a la derecha del sidebar en desktop */}
      <div className="md:pl-60 flex flex-col min-h-screen">
        <Header
          onMenuOpen={() => setMobileNavOpen(true)}
          // TODO: inyectar datos reales del usuario desde sesión
          userEmail="usuario@ejemplo.com"
          userName="Usuario"
        />

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
