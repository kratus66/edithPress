'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

/**
 * Providers del lado cliente para apps/admin.
 *
 * Se separa del root layout (Server Component) para cumplir la regla:
 * solo añadir 'use client' cuando sea estrictamente necesario.
 *
 * QueryClient se crea dentro de useState para que cada solicitud de SSR
 * tenga su propia instancia (evita compartir estado entre usuarios).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // No refetch automático al recuperar el foco de la ventana en admin
            refetchOnWindowFocus: false,
            // Reintentar una sola vez antes de marcar error
            retry: 1,
            // Datos se consideran frescos 30 segundos
            staleTime: 30_000,
          },
          mutations: {
            // No reintentar mutaciones fallidas (evita efectos secundarios dobles)
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
