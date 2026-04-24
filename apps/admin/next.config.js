/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera un bundle standalone para Docker. Solo se activa con BUILD_STANDALONE=true
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Transpila los packages del monorepo para que Next.js los entienda
  transpilePackages: ['@edithpress/ui', '@edithpress/types'],

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

  // Variables de entorno expuestas al cliente — siempre via NEXT_PUBLIC_
  // (las variables sin prefijo solo están disponibles en el servidor)
  env: {},

  // SEC-SPRINT02-03 — Security headers para el panel de administración
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Panel admin nunca debe ser embebible en iframes externos
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
