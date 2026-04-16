import type { Metadata } from 'next'
import './globals.css'

/**
 * Root layout del renderer de EdithPress.
 *
 * NOTA: El metadata real (title, description, OG, etc.) se define en cada
 * page.tsx mediante generateMetadata(), usando los datos del tenant/página.
 * Este layout solo aporta el shell mínimo.
 *
 * Fuentes: usamos system-ui para evitar cargar Google Fonts externos
 * (añaden ~300ms de latencia). Cada tenant puede definir su fuente propia
 * en su configuración de sitio (FASE 2).
 */
export const metadata: Metadata = {
  title: 'Cargando sitio...',
  description: '',
  // El renderer en sí no debe indexarse — cada página del tenant
  // define su propio canonical y sus propios robots.
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
