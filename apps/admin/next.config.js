/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig
