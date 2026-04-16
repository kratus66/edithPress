/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig
