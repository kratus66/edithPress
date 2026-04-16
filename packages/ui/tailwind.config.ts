import type { Config } from 'tailwindcss'

/**
 * Tailwind base config para @edithpress/ui.
 * Las apps extienden esta config con:
 *   import baseConfig from '@edithpress/ui/tailwind.config'
 *   export default { ...baseConfig, content: [...] }
 *
 * Los valores usan CSS custom properties definidas en tokens.css,
 * de modo que cambiar un token se propaga a toda la aplicación.
 */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          900: 'var(--color-primary-900)',
        },
        accent: {
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
        },
        gray: {
          50:  'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          500: 'var(--color-gray-500)',
          700: 'var(--color-gray-700)',
          900: 'var(--color-gray-900)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error:   'var(--color-error)',
        info:    'var(--color-info)',
        bg: {
          primary:   'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary:  'var(--color-bg-tertiary)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs:   ['var(--text-xs)',   { lineHeight: 'var(--leading-normal)' }],
        sm:   ['var(--text-sm)',   { lineHeight: 'var(--leading-normal)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        lg:   ['var(--text-lg)',   { lineHeight: 'var(--leading-normal)' }],
        xl:   ['var(--text-xl)',   { lineHeight: 'var(--leading-tight)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
      },
      borderRadius: {
        DEFAULT: 'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        fast:   'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow:   'var(--transition-slow)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky:   'var(--z-sticky)',
        fixed:    'var(--z-fixed)',
        modal:    'var(--z-modal)',
        toast:    'var(--z-toast)',
      },
    },
  },
  plugins: [],
}

export default config
