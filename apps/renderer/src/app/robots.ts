import type { MetadataRoute } from 'next'

/**
 * robots.ts — robots.txt dinámico por tenant
 *
 * Permite a cada tenant configurar sus reglas de indexación.
 * En FASE 0 usamos reglas permisivas por defecto.
 * En FASE 1 la API expondrá la configuración de robots del tenant.
 *
 * Se lee TENANT_SLUG para construir la URL del sitemap.
 */

const TENANT_SLUG = process.env.TENANT_SLUG ?? ''

export const revalidate = 3600

export default function robots(): MetadataRoute.Robots {
  const baseUrl = TENANT_SLUG
    ? `https://${TENANT_SLUG}.edithpress.com`
    : ''

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Excluir rutas internas del renderer de la indexación
        disallow: ['/api/'],
      },
    ],
    sitemap: baseUrl ? `${baseUrl}/sitemap.xml` : undefined,
  }
}
