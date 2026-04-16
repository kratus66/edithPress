import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Vitest — configuración para apps/admin (Next.js + React).
 *
 * environment: 'jsdom' → simula el DOM del browser para componentes React
 * globals: true → permite usar describe/it/expect sin importarlos
 * setupFiles: configura @testing-library/react (cleanup automático, etc.)
 * coverage: umbrales mínimos definidos en la estrategia QA (70% frontend)
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.spec.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.config.{ts,tsx}',
        'src/app/layout.tsx',
        'src/app/page.tsx',
      ],
      thresholds: {
        branches: 60,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
})
