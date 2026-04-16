import type { Config } from 'tailwindcss'

/**
 * Tailwind config de apps/renderer.
 * El renderer no usa el paquete UI (no tiene componentes de UI propios),
 * pero sí usa los tokens CSS del design system via globals.css.
 * Los bloques usan clases de Tailwind directamente.
 */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
