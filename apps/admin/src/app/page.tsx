import Link from 'next/link'

/**
 * Placeholder raíz — redirige automáticamente al login cuando el sistema
 * de autenticación esté activo. Por ahora muestra un estado Coming Soon.
 */
export default function RootPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      {/* Logo / marca */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-600">
          <span className="text-2xl font-bold text-white">E</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">EdithPress Admin</h1>
        <p className="text-gray-500">SaaS CMS Platform — Panel de administración</p>
      </div>

      {/* Estado */}
      <div className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-bg-primary px-8 py-6 shadow-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary-600" />
          En desarrollo — FASE 0
        </span>
        <p className="mt-2 text-sm text-gray-500">
          Configura el entorno y levanta el backend para continuar.
        </p>
      </div>

      {/* Links de acceso rápido */}
      <nav className="flex gap-4 text-sm">
        <Link
          href="/login"
          className="font-medium text-primary-600 underline-offset-4 hover:underline"
        >
          Ir al login
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href="/dashboard"
          className="font-medium text-gray-500 underline-offset-4 hover:underline"
        >
          Dashboard (requiere auth)
        </Link>
      </nav>
    </main>
  )
}
