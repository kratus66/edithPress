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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100;300;400;500;600;700;900&family=Geist+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
