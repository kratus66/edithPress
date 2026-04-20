/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera un bundle standalone para poder correr en Docker sin node_modules
  output: 'standalone',

  // Transpila los packages del monorepo
  transpilePackages: ['@edithpress/types'],

  images: {
    // Dominios permitidos para next/image
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000', // MinIO en dev
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com', // R2 en prod
      },
      // Servicios de placeholder usados en desarrollo y demos
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // Imágenes de Unsplash (usadas frecuentemente en demos de tenants)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // El renderer corre detrás de un proxy (Nginx/Cloudflare).
  // Necesitamos leer los headers reales (X-Tenant-Slug, X-Tenant-Domain).
  // En producción el proxy es de confianza; aquí lo indicamos explícitamente.
  experimental: {
    // serverComponentsExternalPackages no se necesita aquí,
    // pero dejamos el objeto por si necesitamos añadir flags más adelante.
  },

  // SEC-SPRINT02-03 — Security headers para el renderer de sitios públicos
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Bloquea que el renderer sea embebido en iframes de terceros
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Previene sniffing de content-type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Limita referrer a origen estricto en cross-origin
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Desactiva features de hardware no necesarias
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
