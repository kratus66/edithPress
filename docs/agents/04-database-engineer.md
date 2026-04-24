# Agente 04 — Database Engineer
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: Database Engineer
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como Database Engineer de EdithPress, lee docs/agents/04-database-engineer.md"

---

## Responsabilidades
- Diseñar y mantener el schema de PostgreSQL (Prisma)
- Crear y gestionar migrations
- Diseñar estrategia de índices y optimización de queries
- Configurar Redis (estructura de caché, sesiones, rate limiting)
- Estrategia de backups y recuperación ante desastres
- Seed data para desarrollo y testing

## Stack / Herramientas
- PostgreSQL 16
- Prisma ORM (schema + migrations + client)
- Redis 7 (ioredis client)
- pgAdmin o DBeaver para administración local

## Dependencias con otros agentes
- Entrega a: Backend (PrismaClient, queries), DevOps (backup scripts)
- Recibe de: Architect (decisiones de schema), BA (reglas de negocio)

---

## Schema Prisma (packages/database/prisma/schema.prisma)

### Modelos principales

```prisma
// ==================== USUARIOS Y AUTH ====================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  firstName     String?
  lastName      String?
  avatarUrl     String?
  emailVerified Boolean   @default(false)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  tenantUsers   TenantUser[]
  refreshTokens RefreshToken[]
  auditLogs     AuditLog[]

  @@index([email])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
}

// ==================== TENANTS ====================

model Tenant {
  id          String       @id @default(cuid())
  name        String
  slug        String       @unique  // subdominio: slug.edithpress.com
  logoUrl     String?
  planId      String
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  plan          Plan           @relation(fields: [planId], references: [id])
  tenantUsers   TenantUser[]
  sites         Site[]
  subscription  Subscription?
  domains       Domain[]
  mediaFiles    MediaFile[]

  @@index([slug])
}

model TenantUser {
  id        String     @id @default(cuid())
  tenantId  String
  userId    String
  role      TenantRole @default(EDITOR)
  createdAt DateTime   @default(now())

  tenant    Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([tenantId, userId])
  @@index([tenantId])
  @@index([userId])
}

enum TenantRole {
  OWNER
  EDITOR
  VIEWER
}

// ==================== SITIOS Y PÁGINAS ====================

model Site {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  description String?
  favicon     String?
  isPublished Boolean  @default(false)
  templateId  String?
  settings    Json     @default("{}")  // SEO, analytics, colores globales
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  pages       Page[]
  template    Template? @relation(fields: [templateId], references: [id])

  @@index([tenantId])
}

model Page {
  id          String      @id @default(cuid())
  siteId      String
  title       String
  slug        String
  content     Json        @default("[]")  // Array de bloques del page builder
  metaTitle   String?
  metaDesc    String?
  ogImage     String?
  status      PageStatus  @default(DRAFT)
  isHomepage  Boolean     @default(false)
  order       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  publishedAt DateTime?

  site        Site        @relation(fields: [siteId], references: [id], onDelete: Cascade)
  versions    PageVersion[]

  @@unique([siteId, slug])
  @@index([siteId])
  @@index([status])
}

model PageVersion {
  id        String   @id @default(cuid())
  pageId    String
  content   Json
  createdAt DateTime @default(now())
  createdBy String   // userId

  page      Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)

  @@index([pageId])
}

enum PageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ==================== TEMPLATES ====================

model Template {
  id          String   @id @default(cuid())
  name        String
  description String?
  previewUrl  String?
  thumbnailUrl String?
  content     Json     // Estructura de páginas del template
  category    String
  tags        String[]
  isPremium   Boolean  @default(false)
  price       Decimal? @db.Decimal(10, 2)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sites       Site[]

  @@index([category])
  @@index([isPremium])
}

// ==================== BILLING ====================

model Plan {
  id                String   @id @default(cuid())
  name              String   // Starter, Business, Pro, Enterprise
  slug              String   @unique
  stripePriceIdMonthly String?
  stripePriceIdYearly  String?
  priceMonthly      Decimal  @db.Decimal(10, 2)
  priceYearly       Decimal  @db.Decimal(10, 2)
  maxSites          Int      // -1 = ilimitado
  maxPages          Int      // -1 = ilimitado
  maxStorageGB      Int
  hasCustomDomain   Boolean  @default(false)
  hasEcommerce      Boolean  @default(false)
  hasAnalytics      Boolean  @default(false)
  hasWhiteLabel     Boolean  @default(false)
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())

  tenants       Tenant[]
  subscriptions Subscription[]
}

model Subscription {
  id                   String             @id @default(cuid())
  tenantId             String             @unique
  planId               String
  stripeSubscriptionId String             @unique
  stripeCustomerId     String
  status               SubscriptionStatus
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  plan      Plan     @relation(fields: [planId], references: [id])
  invoices  Invoice[]
}

model Invoice {
  id               String        @id @default(cuid())
  subscriptionId   String
  stripeInvoiceId  String        @unique
  amount           Decimal       @db.Decimal(10, 2)
  currency         String        @default("usd")
  status           InvoiceStatus
  pdfUrl           String?
  createdAt        DateTime      @default(now())

  subscription     Subscription  @relation(fields: [subscriptionId], references: [id])
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  TRIALING
  INCOMPLETE
}

enum InvoiceStatus {
  DRAFT
  OPEN
  PAID
  VOID
  UNCOLLECTIBLE
}

// ==================== DOMINIOS ====================

model Domain {
  id          String       @id @default(cuid())
  tenantId    String
  domain      String       @unique
  status      DomainStatus @default(PENDING)
  verifiedAt  DateTime?
  sslStatus   String?
  createdAt   DateTime     @default(now())

  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([domain])
}

enum DomainStatus {
  PENDING
  VERIFIED
  FAILED
  ACTIVE
}

// ==================== MEDIA ====================

model MediaFile {
  id         String   @id @default(cuid())
  tenantId   String
  fileName   String
  fileType   String
  fileSize   Int
  url        String
  s3Key      String
  altText    String?
  createdAt  DateTime @default(now())
  uploadedBy String

  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
}

// ==================== AUDIT ====================

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  tenantId  String?
  action    String
  entity    String
  entityId  String?
  metadata  Json?
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([userId])
  @@index([createdAt])
}
```

---

## Redis — Estructura de Caché

```
# Sesiones y tokens
session:{userId}              → { tenantId, role, ... }   TTL: 15min
refresh_token:{token}         → userId                     TTL: 7d
rate_limit:{ip}:{endpoint}    → count                      TTL: 60s

# Caché de contenido
site:{siteId}                 → JSON del sitio             TTL: 5min
page:{pageId}                 → JSON de la página          TTL: 5min
tenant:{slug}                 → tenantId                   TTL: 30min

# Jobs / Colas (Bull)
queue:email                   → jobs de email transaccional
queue:media-processing        → resize de imágenes
queue:domain-verification     → verificación de dominios
```

---

## Índices Clave
- `users.email` — login
- `tenants.slug` — resolución de subdominio en cada request
- `pages.siteId + status` — listar páginas publicadas
- `pages.siteId + slug` — routing del renderer
- `subscriptions.stripeSubscriptionId` — webhooks de Stripe
- `domains.domain` — resolución de custom domains

---

## Checklist de Progreso

### FASE 0
- [x] Schema Prisma diseñado (modelos principales)
- [x] Estrategia Redis documentada
- [x] Índices clave identificados
- [x] `packages/database` inicializado (package.json, tsconfig)
- [x] `schema.prisma` creado en el repositorio
- [x] Primera migration generada (`npx prisma migrate dev`)
- [x] Seed script básico (planes, admin user)
- [x] Conexión a Postgres verificada en local (PostgreSQL 17)

### FASE 1 — MVP
- [ ] Migrations para todos los modelos del MVP
- [ ] Seed con 4 planes (Starter, Business, Pro, Enterprise)
- [ ] PrismaClient singleton configurado
- [ ] Prisma middleware para soft deletes (si aplica)
- [ ] Query logging en development

### FASE 2 — v1
- [ ] Índices de performance validados con EXPLAIN ANALYZE
- [ ] Estrategia de backups automatizados
- [ ] Migración a producción documentada
- [ ] Connection pooling (PgBouncer o Prisma Accelerate)

---

## Buenas Prácticas de Base de Datos

### Diseño de schema
- **Nunca almacenar contraseñas en texto plano** — siempre `passwordHash` con bcrypt
- Todo modelo tiene `createdAt` y `updatedAt` como mínimo
- IDs con `cuid()` en lugar de `autoincrement()` — más seguros para URLs públicas y multi-tenancy
- Campos `Json` para datos semiestructurados (content de páginas, settings) — documentar su estructura en comentarios
- Enums de Prisma para campos con valores fijos — nunca strings libres para estados

### Migrations
- Cada migration hace **exactamente una cosa** (agregar una tabla, no cinco)
- Nunca editar una migration ya aplicada — crear una nueva
- Nombres descriptivos: `add_page_versions_table`, no `migration_001`
- Antes de correr una migration en producción: probar en staging con datos reales
- **Migrations destructivas** (drop column, drop table) requieren aprobación del PM

### Índices
- Regla de oro: índice en toda columna usada en `WHERE`, `JOIN` u `ORDER BY` en queries frecuentes
- No sobre-indexar: cada índice tiene costo en escritura
- Revisar queries lentas con `EXPLAIN ANALYZE` antes de agregar índices nuevos
- El composite index `[siteId, slug]` en Page es crítico para el renderer — no olvidar

### Prisma — patrones obligatorios
- **PrismaClient singleton**: una sola instancia compartida, nunca `new PrismaClient()` en cada request
- En tests de integración: usar `$transaction` con rollback — nunca contaminar la DB de test
- Logging de queries en development: `log: ['query', 'error']` para detectar N+1
- Nunca usar `prisma.$queryRaw` salvo que sea absolutamente necesario — y si se usa, parametrizar SIEMPRE

### Redis
- Siempre definir TTL en cada key — nunca guardar sin expiración
- Prefijos de namespace: `session:`, `cache:`, `rate_limit:`, `queue:` para evitar colisiones
- Usar `SETEX` o `SET ... EX` en lugar de `SET` + `EXPIRE` por separado (operación atómica)

---

## Tareas Asignadas — FASE 0 (Activa)

> Depende de: ARCH-01, ARCH-02 (monorepo), DEVOPS-01 (Postgres corriendo)

### Tarea DB-01 — Inicializar packages/database
**Prioridad**: CRÍTICA — El backend no puede funcionar sin esto
**Criterio de Done**: `packages/database` es un workspace válido con Prisma instalado
**Pasos**:
1. Verificar que `packages/database/package.json` tiene `name: "@edithpress/database"`
2. Instalar dependencias: `prisma` (devDep) y `@prisma/client` (dep)
3. Crear `packages/database/prisma/schema.prisma` con el schema completo (ver sección Schema arriba)
4. Crear `packages/database/src/index.ts` con el singleton de PrismaClient:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'
```

### Tarea DB-02 — Generar primera migration
**Prioridad**: CRÍTICA
**Criterio de Done**: `npx prisma migrate dev --name init` corre sin errores, tablas creadas en Postgres
**Depende de**: DB-01, DEVOPS-01 (Postgres running), DEVOPS-02 (.env con DATABASE_URL)
**Verificación**:
```bash
cd packages/database
npx prisma migrate dev --name init
npx prisma studio  # Abrir en browser para verificar tablas
```

### Tarea DB-03 — Crear seed script
**Prioridad**: ALTA
**Criterio de Done**: `pnpm db:seed` crea los 4 planes y 1 super admin sin errores
**Archivo**: `packages/database/prisma/seed.ts`
**Datos a sembrar**:
- Plan Starter (id: "starter", $9.99/mes)
- Plan Business (id: "business", $29.99/mes)
- Plan Pro (id: "pro", $79.99/mes)
- Plan Enterprise (id: "enterprise", custom)
- Super Admin user: `admin@edithpress.com` / contraseña hasheada con bcrypt

### Tarea DB-04 — Configurar Prisma en turbo.json
**Prioridad**: ALTA
**Criterio de Done**: `pnpm db:generate` desde la raíz regenera el cliente Prisma correctamente
**Depende de**: ARCH-01 (turbo.json base)

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-04-13
**Próxima tarea**: DB-05 (FASE 1) — PrismaClient singleton validado con backend

---

## Sprint 03.1 — Actividades Realizadas (2026-04-24)

### DB-SPRINT03.1-01: Modelo NewsletterSubscriber
- Agregado modelo `NewsletterSubscriber` en `packages/database/prisma/schema.prisma`
- Campos: id, siteId, email, subscribedAt, isActive, source
- Restricción `@@unique([siteId, email])` — previene suscripciones duplicadas por sitio
- Índices en siteId y email para performance
- Relación inversa `newsletterSubscribers` añadida al modelo `Site`

### DB-SPRINT03.1-02: Migración
- Migración ejecutada: `20260424194132_add_newsletter_subscriber`
- Aplicada en base de datos de desarrollo (PostgreSQL en localhost:5435)
- Prisma Client regenerado automáticamente

**Estado**: DB actualizado a FASE 3.1
