'use client'

import { useEffect } from 'react'

/**
 * Error boundary global del renderer.
 *
 * Se activa cuando un Server Component lanza una excepción no capturada.
 * Muestra un mensaje genérico sin branding de tenant (no tenemos contexto seguro)
 * y ofrece un botón para reintentar sin recargar la página entera.
 *
 * Debe ser un Client Component ('use client') — requisito de Next.js App Router.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log al servicio de monitoreo (Sentry, Datadog, etc.) en producción.
    // Por ahora solo lo mandamos a la consola del servidor.
    console.error('[renderer] Unhandled error:', error)
  }, [error])

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
          fontSize: '4rem',
          fontWeight: 700,
          margin: 0,
          lineHeight: 1,
          color: '#d1d5db',
        }}
      >
        500
      </h1>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginTop: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        Algo salió mal
      </h2>
      <p style={{ color: '#6b7280', maxWidth: '400px', marginBottom: '2rem' }}>
        Ha ocurrido un error inesperado. Intenta de nuevo o vuelve más tarde.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: '#1d4ed8',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.625rem 1.25rem',
            backgroundColor: '#ffffff',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          Ir al inicio
        </a>
      </div>
      {error.digest && (
        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.75rem',
            color: '#9ca3af',
            fontFamily: 'monospace',
          }}
        >
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
