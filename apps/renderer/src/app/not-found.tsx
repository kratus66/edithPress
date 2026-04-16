import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe.',
  robots: { index: false, follow: false },
}

/**
 * Página 404 global del renderer.
 *
 * Se muestra cuando:
 * - El tenant no existe (slug no encontrado en la API)
 * - La página del tenant no existe (slug de página no encontrado)
 * - La ruta no coincide con ningún pattern del App Router
 *
 * El diseño es neutral (sin branding de ningún tenant) porque no sabemos
 * a qué tenant pertenece la visita cuando llegamos a este punto.
 */
export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#f9fafb',
        color: '#111827',
      }}
    >
      <h1
        style={{
          fontSize: '6rem',
          fontWeight: 700,
          margin: 0,
          lineHeight: 1,
          color: '#d1d5db',
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginTop: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        Página no encontrada
      </h2>
      <p style={{ color: '#6b7280', maxWidth: '400px', marginBottom: '2rem' }}>
        La página que buscas no existe o ha sido eliminada.
      </p>
      <a
        href="/"
        style={{
          display: 'inline-block',
          padding: '0.625rem 1.25rem',
          backgroundColor: '#1d4ed8',
          color: '#ffffff',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
        }}
      >
        Ir al inicio
      </a>
    </div>
  )
}
