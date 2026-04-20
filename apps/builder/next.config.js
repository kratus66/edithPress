/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera un bundle standalone para poder correr en Docker sin node_modules
  output: 'standalone',

  // Transpila los packages del monorepo para que Next.js los entienda
  transpilePackages: ['@edithpress/ui', '@edithpress/types'],

  images: {
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

  env: {},

  // SEC-SPRINT02-03 — Security headers para el editor visual (builder)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // DENY para el builder: nunca debe ser embebible en iframes de terceros
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
