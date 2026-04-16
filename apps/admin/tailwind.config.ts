import type { Config } from 'tailwindcss'
import baseConfig from '@edithpress/ui/tailwind.config'

/**
 * Tailwind config de apps/admin.
 * Extiende el config base del design system (@edithpress/ui) y agrega
 * los paths de content propios del admin.
 */
const config: Config = {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    // Incluye los componentes del paquete UI para que Tailwind genere sus clases
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}

export default config
