import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { template: '%s | Super Admin — EdithPress', default: 'Super Admin' },
}

const superAdminNav = [
  { href: '/super-admin/dashboard', label: 'Dashboard' },
  { href: '/super-admin/tenants',   label: 'Tenants' },
  { href: '/super-admin/plans',     label: 'Planes' },
]

/**
 * Layout del área de super admin. Solo accesible para usuarios con rol SUPER_ADMIN.
 * La verificación real de rol se hará en FASE 1 con middleware + next-auth.
 * Por ahora el guard está en el backend (JWT payload).
 */
export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar — dark */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-6 border-b border-white/10 bg-gray-900 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
            <span className="text-xs font-bold text-white">E</span>
          </div>
          <span className="text-sm font-semibold text-white">EdithPress</span>
          <span className="ml-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">SUPER</span>
        </div>

        <nav className="flex items-center gap-1" aria-label="Super admin navigation">
          {superAdminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto">
          <Link
            href="/dashboard"
            className="text-xs text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
          >
            ← Volver al admin tenant
          </Link>
        </div>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
