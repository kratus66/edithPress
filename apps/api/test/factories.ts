/**
 * QA-05 — Factories de datos de test para apps/api.
 *
 * Uso:
 *   import { createUser, createTenant, createSite, createPage } from '../test/factories'
 *
 * Principios:
 *   - Cada factory retorna datos válidos y autoconsistentes por defecto.
 *   - El argumento `overrides` permite personalizar solo los campos necesarios.
 *   - Los IDs usan cuid-like strings estáticos para que los tests sean deterministas.
 *   - No dependen de la DB — son objetos en memoria para mocks y stubs.
 *
 * Para tests de integración que necesitan insertar en DB real, usar estas
 * factories como base y llamar a prisma.model.create({ data: createX() }).
 */

// ─── Contadores para IDs únicos dentro de una suite ──────────────────────────

let counter = 0
const nextId = (prefix: string) => `${prefix}-${String(++counter).padStart(4, '0')}`

// ─── TYPES (reflejo ligero de los modelos Prisma) ────────────────────────────

export type TenantRole = 'OWNER' | 'EDITOR' | 'VIEWER'
export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface TestUser {
  id: string
  email: string
  passwordHash: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  emailVerified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TestTenant {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  planId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TestTenantUser {
  id: string
  tenantId: string
  userId: string
  role: TenantRole
  createdAt: Date
}

export interface TestSite {
  id: string
  tenantId: string
  name: string
  description: string | null
  favicon: string | null
  isPublished: boolean
  templateId: string | null
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface TestPage {
  id: string
  siteId: string
  title: string
  slug: string
  content: unknown[]
  metaTitle: string | null
  metaDesc: string | null
  ogImage: string | null
  status: PageStatus
  isHomepage: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

export interface TestPlan {
  id: string
  name: string
  slug: string
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  priceMonthly: number
  priceYearly: number
  maxSites: number
  maxPages: number
  maxStorageGB: number
  hasCustomDomain: boolean
  hasEcommerce: boolean
  hasAnalytics: boolean
  hasWhiteLabel: boolean
  isActive: boolean
  createdAt: Date
}

// ─── FACTORIES ────────────────────────────────────────────────────────────────

/**
 * Factory: User
 *
 * El passwordHash es un bcrypt $2b$12$ válido para la contraseña "Password123".
 * Generado una vez: no lo regeneres en cada test (es costoso en tiempo).
 */
export function createUser(overrides: Partial<TestUser> = {}): TestUser {
  const now = new Date()
  return {
    id: nextId('user'),
    email: `test-${counter}@example.com`,
    // bcrypt hash de "Password123" con 12 rounds — pre-computado para performance
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQN6WsNRwCGi',
    firstName: 'Test',
    lastName: 'User',
    avatarUrl: null,
    emailVerified: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/**
 * Factory: Tenant
 */
export function createTenant(overrides: Partial<TestTenant> = {}): TestTenant {
  const now = new Date()
  const id = nextId('tenant')
  return {
    id,
    name: `Test Workspace ${counter}`,
    slug: `test-workspace-${counter}`,
    logoUrl: null,
    planId: 'plan-starter-0001',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/**
 * Factory: TenantUser (relación User ↔ Tenant con rol)
 */
export function createTenantUser(
  overrides: Partial<TestTenantUser> & { tenantId: string; userId: string },
): TestTenantUser {
  return {
    id: nextId('tu'),
    role: 'OWNER',
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Factory: Site
 */
export function createSite(
  overrides: Partial<TestSite> & { tenantId: string },
): TestSite {
  const now = new Date()
  return {
    id: nextId('site'),
    name: `Test Site ${counter}`,
    description: null,
    favicon: null,
    isPublished: false,
    templateId: null,
    settings: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/**
 * Factory: Page
 */
export function createPage(
  overrides: Partial<TestPage> & { siteId: string },
): TestPage {
  const now = new Date()
  return {
    id: nextId('page'),
    title: `Test Page ${counter}`,
    slug: `test-page-${counter}`,
    content: [],
    metaTitle: null,
    metaDesc: null,
    ogImage: null,
    status: 'DRAFT',
    isHomepage: false,
    order: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    ...overrides,
  }
}

/**
 * Factory: Plan (el Plan "starter" que necesita AuthService.register)
 */
export function createPlan(overrides: Partial<TestPlan> = {}): TestPlan {
  return {
    id: 'plan-starter-0001',
    name: 'Starter',
    slug: 'starter',
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    priceMonthly: 0,
    priceYearly: 0,
    maxSites: 1,
    maxPages: 5,
    maxStorageGB: 1,
    hasCustomDomain: false,
    hasEcommerce: false,
    hasAnalytics: false,
    hasWhiteLabel: false,
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  }
}

// ─── CONJUNTOS PREARMADOS ─────────────────────────────────────────────────────

/**
 * Crea un conjunto coherente {user, tenant, tenantUser} listo para usar
 * en tests de auth, sites, etc. Ideal para el beforeEach de suites completas.
 */
export function createUserWithTenant(
  userOverrides: Partial<TestUser> = {},
  tenantOverrides: Partial<TestTenant> = {},
): { user: TestUser; tenant: TestTenant; tenantUser: TestTenantUser } {
  const user = createUser(userOverrides)
  const tenant = createTenant(tenantOverrides)
  const tenantUser = createTenantUser({
    userId: user.id,
    tenantId: tenant.id,
    role: 'OWNER',
  })
  return { user, tenant, tenantUser }
}
