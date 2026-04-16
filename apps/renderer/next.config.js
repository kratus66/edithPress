/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },

  // El renderer corre detrás de un proxy (Nginx/Cloudflare).
  // Necesitamos leer los headers reales (X-Tenant-Slug, X-Tenant-Domain).
  // En producción el proxy es de confianza; aquí lo indicamos explícitamente.
  experimental: {
    // serverComponentsExternalPackages no se necesita aquí,
    // pero dejamos el objeto por si necesitamos añadir flags más adelante.
  },
}

module.exports = nextConfig
