import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceso',
}

/**
 * Layout compartido para las rutas de autenticación:
 * /login, /register, /verify-email
 *
 * Centra el contenido verticalmente y añade el fondo con la marca.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo — Branding (oculto en mobile) */}
      <aside className="hidden w-1/2 flex-col justify-between bg-primary-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <span className="text-lg font-semibold text-white">EdithPress</span>
        </div>

        <blockquote className="space-y-2">
          <p className="text-xl text-white/90">
            &ldquo;Crea sitios web profesionales sin escribir una línea de código.&rdquo;
          </p>
          <footer className="text-sm text-white/60">— Equipo EdithPress</footer>
        </blockquote>

        <p className="text-xs text-white/40">© 2026 EdithPress. Todos los derechos reservados.</p>
      </aside>

      {/* Panel derecho — Formulario */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  )
}
