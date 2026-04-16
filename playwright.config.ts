import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright — configuración E2E para EdithPress.
 *
 * Apps y sus URLs base:
 *   - Admin (Dashboard):  http://localhost:3000
 *   - API (NestJS):       http://localhost:3001
 *   - Builder:            http://localhost:3002
 *   - Renderer:           http://localhost:3003
 *
 * Para ejecutar:
 *   pnpm test:e2e                     # headless
 *   pnpm exec playwright test --ui    # con interfaz visual
 *
 * Antes de correr en CI, instalar browsers:
 *   pnpm exec playwright install --with-deps chromium
 */
export default defineConfig({
  // Directorio donde viven los tests E2E
  testDir: './e2e',
  testMatch: '**/*.e2e.spec.ts',

  // Tiempo máximo por test completo (incluye retries)
  timeout: 30_000,

  // Tiempo para cada expect
  expect: { timeout: 5_000 },

  // Intentos de reintento en CI para evitar flakiness por red/timing
  retries: process.env.CI ? 2 : 0,

  // Paralelismo: en CI correr en serie para reducir uso de recursos
  workers: process.env.CI ? 1 : undefined,

  // Reportes: HTML para revisar en local, lista compacta para CI
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  // Configuración compartida por todos los proyectos
  use: {
    // URL base del Admin (dashboard principal)
    baseURL: 'http://localhost:3000',

    // Guardar screenshots y traces cuando un test falla
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    // ─── Admin dashboard (flujos de usuario autenticado) ───
    {
      name: 'admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: '**/admin/**/*.e2e.spec.ts',
    },

    // ─── Builder (flujos de edición de páginas) ───
    {
      name: 'builder-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3002',
      },
      testMatch: '**/builder/**/*.e2e.spec.ts',
    },

    // ─── API smoke tests (sin browser — directamente HTTP) ───
    {
      name: 'api-smoke',
      testMatch: '**/api/**/*.e2e.spec.ts',
    },

    // ─── Renderer — páginas públicas (Chrome + Firefox) ───
    {
      name: 'renderer-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3003',
      },
      testMatch: '**/renderer/**/*.e2e.spec.ts',
    },
    {
      name: 'renderer-firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:3003',
      },
      testMatch: '**/renderer/**/*.e2e.spec.ts',
    },
  ],

  // Servidor local a levantar antes de los tests (opcional — comentar si se levanta manualmente)
  // webServer: [
  //   {
  //     command: 'pnpm --filter @edithpress/api dev',
  //     url: 'http://localhost:3001/api/v1/health',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 30_000,
  //   },
  //   {
  //     command: 'pnpm --filter @edithpress/admin dev',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 60_000,
  //   },
  // ],
})
