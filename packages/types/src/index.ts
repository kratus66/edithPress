/**
 * @edithpress/types — Tipos TypeScript compartidos entre todas las apps del monorepo.
 *
 * REGLA ARQUITECTÓNICA (ADR implícito):
 *   - Las apps IMPORTAN desde aquí, nunca entre sí.
 *   - Este paquete NO importa de ninguna app ni de @edithpress/database.
 *   - Los enums aquí son espejo de los enums de Prisma — si el schema cambia,
 *     actualizar aquí también (son el contrato público, no el privado de DB).
 *   - El tipo Block es el wire format (JSON que viaja entre API y frontends).
 *     Los discriminated unions tipados con props exactas viven en cada app.
 */

// =============================================================================
// RESPUESTAS DE API
// =============================================================================

/**
 * Respuesta estándar para un recurso único.
 * Todos los endpoints de la API devuelven { data: T }.
 *
 * @example
 *   // GET /api/v1/sites/123
 *   { data: { id: '123', name: 'Mi sitio', ... } }
 */
export interface ApiResponse<T> {
  data: T
}

/**
 * Respuesta estándar para listas paginadas.
 * Los endpoints de listado devuelven { data: T[], meta: {...} }.
 *
 * @example
 *   // GET /api/v1/sites?page=1&limit=20
 *   { data: [...], meta: { page: 1, limit: 20, total: 47 } }
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/** Metadatos de paginación incluidos en PaginatedResponse. */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
}

/**
 * Respuesta de error estándar.
 * Todos los errores HTTP de la API tienen esta forma.
 *
 * @example
 *   // 404 Not Found
 *   { error: { code: 'TENANT_NOT_FOUND', message: 'El tenant no existe', statusCode: 404 } }
 */
export interface ApiErrorResponse {
  error: {
    /** Código legible por máquinas para discriminar el error en el cliente. */
    code: string
    /** Mensaje legible por humanos (puede mostrarse al usuario). */
    message: string
    statusCode: number
  }
}

/** Parámetros de paginación para query strings (page, limit). */
export interface PaginationParams {
  page?: number
  limit?: number
}

// =============================================================================
// ENUMS DE DOMINIO
// =============================================================================
// Espejo exacto de los enums del schema de Prisma.
// Si cambias un enum en schema.prisma, actualiza aquí también.

/** Rol de un usuario dentro de un tenant. */
export enum TenantRole {
  OWNER  = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

/** Estado del ciclo de vida de una página. */
export enum PageStatus {
  DRAFT     = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED  = 'ARCHIVED',
}

/** Estado de la suscripción de Stripe de un tenant. */
export enum SubscriptionStatus {
  ACTIVE     = 'ACTIVE',
  PAST_DUE   = 'PAST_DUE',
  CANCELED   = 'CANCELED',
  TRIALING   = 'TRIALING',
  INCOMPLETE = 'INCOMPLETE',
}

/** Estado de una factura de Stripe. */
export enum InvoiceStatus {
  DRAFT         = 'DRAFT',
  OPEN          = 'OPEN',
  PAID          = 'PAID',
  VOID          = 'VOID',
  UNCOLLECTIBLE = 'UNCOLLECTIBLE',
}

/** Estado del proceso de verificación de un dominio custom. */
export enum DomainStatus {
  PENDING  = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED   = 'FAILED',
  ACTIVE   = 'ACTIVE',
}

// =============================================================================
// CONTENIDO — BLOQUES DEL PAGE BUILDER
// =============================================================================

/**
 * Block — wire format del contenido del page builder.
 *
 * Es la estructura que almacena la API (campo `content: Json` en la tabla Page)
 * y la que devuelve el endpoint GET /renderer/tenant/:slug/page/:pageSlug.
 *
 * El `type` es el nombre del componente Puck (ej: "HeroBlock", "TextBlock").
 * Los `props` son los valores editados desde el panel de propiedades.
 *
 * Los discriminated unions con props exactas (HeroBlockProps, TextBlockProps…)
 * viven en cada app (builder, renderer) porque dependen de los componentes.
 * Importar esos tipos aquí crearía acoplamiento bidireccional prohibido.
 *
 * @example
 *   const block: Block = {
 *     type: 'HeroBlock',
 *     props: { title: 'Hola mundo', backgroundColor: '#1a1a2e' }
 *   }
 */
export interface Block {
  /** Nombre del componente Puck — debe existir en la config del builder/renderer. */
  type: string
  /** Props del bloque tal como las generó Puck. Forma exacta depende del tipo. */
  props: Record<string, unknown>
}

/**
 * PageContent — el campo `content` de una página tal como devuelve la API.
 * Es un array de Block en wire format.
 */
export type PageContent = Block[]

// =============================================================================
// SITE SETTINGS
// =============================================================================

/**
 * SiteSettings — estructura del campo `settings: Json` del modelo Site.
 *
 * Este campo almacena configuración global del sitio: SEO base, colores de
 * marca, analytics, fuentes. No está normalizado en tablas separadas para
 * evitar migraciones frecuentes ante cambios de configuración.
 *
 * Todos los campos son opcionales: el objeto puede estar vacío `{}`.
 */
export interface SiteSettings {
  /** Colores de marca — usados como defaults en el builder y el renderer. */
  colors?: {
    primary?: string
    secondary?: string
    background?: string
    text?: string
  }
  /** Familia de fuente principal (Google Fonts slug, ej: "Inter", "Playfair+Display"). */
  fontFamily?: string
  /** Configuración SEO global — cada página puede sobreescribir. */
  seo?: {
    defaultTitle?: string
    titleTemplate?: string  // ej: "%s | Mi Empresa"
    defaultDescription?: string
    defaultOgImage?: string
    noIndex?: boolean
  }
  /** Integración con analytics. */
  analytics?: {
    googleAnalyticsId?: string   // G-XXXXXXXXXX
    gtmId?: string               // GTM-XXXXXXX
    metaPixelId?: string
  }
  /** Scripts de terceros para inyectar en <head> o <body>. */
  customScripts?: {
    head?: string
    bodyEnd?: string
  }
  /** Configuración del footer. */
  footer?: {
    text?: string
    showPoweredBy?: boolean
  }
}

// =============================================================================
// NAVEGACIÓN
// =============================================================================

/**
 * NavItem — un ítem de la navegación del sitio público.
 * Devuelto por GET /renderer/tenant/:slug dentro del array `navigation`.
 */
export interface NavItem {
  id: string
  title: string
  slug: string
  /** true si es la página de inicio (ruta raíz "/"). */
  isHomepage: boolean
}

// =============================================================================
// AUTENTICACIÓN
// =============================================================================

/**
 * JwtPayload — cuerpo del JWT de acceso.
 * Compartido entre la API (que lo genera) y los frontends (que lo leen).
 *
 * `sub` — userId (estándar JWT)
 * `tenantId` — el tenant activo en la sesión
 * `role` — TenantRole del usuario en ese tenant
 */
export interface JwtPayload {
  /** userId — sujeto del token (estándar JWT). */
  sub: string
  email: string
  tenantId: string
  /** TenantRole como string (usar TenantRole enum para comparar). */
  role: TenantRole | string
  /** Timestamp de expiración (Unix seconds). */
  exp?: number
  /** Timestamp de emisión (Unix seconds). */
  iat?: number
}

/** Respuesta de login/register/refresh exitoso. */
export interface AuthTokens {
  accessToken: string
  /** Segundos hasta la expiración del accessToken. */
  expiresIn: number
}

// =============================================================================
// DTOs COMPARTIDOS — TENANT
// =============================================================================

/** Representación pública de un tenant (nunca incluye datos sensibles). */
export interface TenantDto {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  planId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Payload para crear un nuevo tenant. */
export interface CreateTenantPayload {
  name: string
  /** Slug único — se convierte en subdominio: slug.edithpress.com */
  slug: string
  logoUrl?: string
}

// =============================================================================
// DTOs COMPARTIDOS — SITE
// =============================================================================

/** Representación pública de un site. */
export interface SiteDto {
  id: string
  tenantId: string
  name: string
  description: string | null
  favicon: string | null
  isPublished: boolean
  templateId: string | null
  settings: SiteSettings
  createdAt: string
  updatedAt: string
}

// =============================================================================
// DTOs COMPARTIDOS — PAGE
// =============================================================================

/** Representación pública de una página (sin el campo `content` completo). */
export interface PageDto {
  id: string
  siteId: string
  title: string
  slug: string
  metaTitle: string | null
  metaDesc: string | null
  ogImage: string | null
  status: PageStatus
  isHomepage: boolean
  order: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

/** Página con su contenido completo de bloques — usado por el builder y renderer. */
export interface PageWithContent extends PageDto {
  content: PageContent
}

// =============================================================================
// DTOs COMPARTIDOS — BILLING
// =============================================================================

/** Estado actual de la suscripción de un tenant. */
export interface SubscriptionDto {
  id: string
  tenantId: string
  planId: string
  stripeSubscriptionId: string
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

/** Plan disponible en la plataforma. */
export interface PlanDto {
  id: string
  name: string
  slug: string
  priceMonthly: string    // Decimal serializado como string
  priceYearly: string
  maxSites: number
  maxPages: number
  maxStorageGB: number
  hasCustomDomain: boolean
  hasEcommerce: boolean
  hasAnalytics: boolean
  hasWhiteLabel: boolean
}

// =============================================================================
// DTOs COMPARTIDOS — TEMPLATE
// =============================================================================

/** Template disponible en la galería (sin el campo content pesado). */
export interface TemplateDto {
  id: string
  name: string
  description: string | null
  previewUrl: string | null
  thumbnailUrl: string | null
  category: string
  tags: string[]
  isPremium: boolean
  price: string | null   // Decimal serializado como string
  createdAt: string
}

/** Template con estructura de páginas — para aplicar al crear un sitio. */
export interface TemplateWithContent extends TemplateDto {
  content: Record<string, unknown>
  updatedAt: string
}

// =============================================================================
// DTOs COMPARTIDOS — MEDIA
// =============================================================================

/** Archivo multimedia subido por un tenant. */
export interface MediaFileDto {
  id: string
  tenantId: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  altText: string | null
  createdAt: string
}

// =============================================================================
// RENDERER — CONTRATOS PÚBLICOS
// =============================================================================

/**
 * RendererSiteInfo — respuesta de GET /renderer/tenant/:slug.
 * Contiene todo lo que el layout global del renderer necesita.
 */
export interface RendererSiteInfo {
  tenant: {
    name: string
    slug: string
    logoUrl: string | null
  }
  site: {
    id: string
    name: string
    description: string | null
    favicon: string | null
    settings: SiteSettings
  }
  navigation: NavItem[]
}

/**
 * RendererPageData — respuesta de GET /renderer/tenant/:slug/page/:pageSlug.
 * Contiene el contenido de una página publicada listo para renderizar.
 */
export interface RendererPageData {
  page: {
    id: string
    title: string
    slug: string
    content: PageContent
    meta: {
      title: string
      description: string | null
      ogImage: string | null
    }
    isHomepage: boolean
    publishedAt: string | null
    updatedAt: string
  }
}
