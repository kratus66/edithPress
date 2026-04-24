/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera un bundle standalone para Docker. Solo se activa con BUILD_STANDALONE=true
  // (en local Windows los symlinks de standalone requieren permisos de administrador)
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

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

  // Proxy de API: el browser llama a /api/v1/* en localhost:3002 (mismo origen)
  // y Next.js lo reenvía server-to-server a localhost:3001 → sin CORS
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ]
  },

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
