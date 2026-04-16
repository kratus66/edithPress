# EdithPress — Prompts Sprint 02 (MVP Beta)
**Generado**: 2026-04-16 | **PM**: Agente 01

> Estado actual: FASE 1 completada (~85% promedio). Este sprint cierra los bloqueos críticos para MVP Beta.
> Ejecutar en chats separados — uno por agente.
> Observación: El trabajo realizado por los agentes 04, 12 y 09 se completó de forma exitosa. Quedan pendientes los trabajos de los agentes 10 y 11.

---

## AGENTE 05 — Backend Developer
> Chat: "Actúa como Backend Developer de EdithPress, lee docs/agents/05-backend-developer.md"

```
Eres el Backend Developer (Agente 05) de EdithPress. Lee docs/agents/05-backend-developer.md
para tener tu contexto completo de rol, convenciones y buenas prácticas.

ESTADO ACTUAL — Lo que YA está implementado en apps/api/src/modules/:
- ✅ auth: register, login, refresh, logout, verify-email (JWT + bcrypt OK)
- ✅ sites: CRUD completo + publish/unpublish
- ✅ pages: CRUD + versioning + publish
- ✅ media: upload S3/MinIO + list + delete
- ✅ billing: Stripe checkout + customer portal
- ✅ renderer: endpoints públicos ISR
- ✅ templates: GET list + GET by id
- ✅ tenants: create + get + update + stats
- ✅ users: get + update + soft-delete
- ✅ content: save (básico)

TAREAS DE ESTE SPRINT (en orden de prioridad):

--- TAREA API-SPRINT02-01: Redis para Refresh Tokens ---
Prioridad: CRÍTICA (bloquea seguridad de auth)

Lee apps/api/src/modules/auth/auth.service.ts completo.
Actualmente los refresh tokens se guardan SOLO en PostgreSQL (tabla RefreshToken).
El plan original requiere Redis como layer primario de revocación rápida.

Implementar:
1. Si no existe, crear apps/api/src/modules/redis/redis.module.ts y redis.service.ts
   - Usar ioredis (ya debe estar en package.json, verificar)
   - Configurar con REDIS_URL desde ConfigService
   - Exportar RedisService

2. En auth.service.ts, cuando se crea un refresh token:
   - Guardar en Redis: SET refresh:{userId}:{tokenId} "1" EX 604800
   - Mantener también el registro en PostgreSQL (para auditoría)

3. En el método de refresh:
   - Primero verificar existencia en Redis (O(1) lookup)
   - Si no está en Redis, denegar aunque esté en PostgreSQL
   - Al rotar: DEL el token viejo de Redis, SET el nuevo

4. En logout:
   - DEL refresh:{userId}:{tokenId} de Redis inmediatamente
   - Marcar como revocado en PostgreSQL

Criterio de Done: Un refresh token revocado (logout) no puede usarse aunque no haya expirado.

--- TAREA API-SPRINT02-02: Stripe Webhook Completo ---
Prioridad: CRÍTICA (bloquea activación de suscripciones)

Lee apps/api/src/modules/billing/billing.service.ts y billing.controller.ts completos.
El webhook handler parsea eventos pero la lógica de actualización de BD es incompleta.

Implementar handlers completos para:

1. customer.subscription.created:
   - Buscar tenant por stripe_customer_id (en Subscription o Tenant)
   - Crear registro Subscription si no existe:
     { tenantId, stripeSubscriptionId, status, planId, currentPeriodStart, currentPeriodEnd }

2. customer.subscription.updated:
   - prisma.subscription.update() con: status, currentPeriodEnd, cancelAtPeriodEnd, planId
   - Si status cambia a ACTIVE desde PAST_DUE: loguear en AuditLog

3. customer.subscription.deleted:
   - Marcar subscription.status = CANCELED
   - NO eliminar el registro (mantener historial)

4. invoice.payment_succeeded:
   - prisma.invoice.upsert({ where: { stripeInvoiceId }, ... })
   - Campos: amount, currency, status: PAID, paidAt, invoicePdf (URL de Stripe)

5. invoice.payment_failed:
   - Crear Invoice con status: FAILED
   - Actualizar Subscription.status = PAST_DUE
   - (El email de notificación lo maneja Stripe Dashboard — no implementar aquí todavía)

Criterio de Done: Registrar en logs que cada evento se procesó. Usar `console.log('[Billing Webhook]', event.type)`.

--- TAREA API-SPRINT02-03: Integración Resend para Emails ---
Prioridad: ALTA

Lee apps/api/src/modules/auth/auth.service.ts para identificar los stubs de email.
El package @resend/node puede NO estar instalado — ejecutar: cd apps/api && pnpm add @resend/node

Implementar:
1. Crear apps/api/src/modules/mailer/mailer.module.ts y mailer.service.ts
   
   MailerService con estos métodos:
   - sendVerificationEmail(to: string, token: string): Promise<void>
     Subject: "Verifica tu cuenta en EdithPress"
     Body: link a {APP_URL}/verify-email?token={token}
   
   - sendPasswordResetEmail(to: string, token: string): Promise<void>
     Subject: "Restablecer contraseña — EdithPress"
     Body: link a {APP_URL}/reset-password?token={token}
   
   - sendContactFormEmail(opts: { siteOwnerEmail: string, fromName: string, fromEmail: string, message: string }): Promise<void>
     Subject: "Nuevo mensaje desde tu sitio — EdithPress"

   Los templates son HTML simple. No usar librerías de templates — string literals son suficientes.
   Usar process.env.RESEND_FROM_EMAIL como remitente (ej: "EdithPress <noreply@edithpress.com>")

2. Reemplazar en auth.service.ts los comentarios TODO de email con llamadas reales a MailerService

3. Registrar MailerModule en AppModule

--- TAREA API-SPRINT02-04: Password Reset Flow ---
Prioridad: ALTA (complementa Resend)

El schema Prisma ya tiene las tablas base. Verificar si existe PasswordResetToken en
packages/database/prisma/schema.prisma. Si no existe, agregar:

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  user      User     @relation(fields: [userId], references: [id])
  @@index([userId])
}

Luego en packages/database ejecutar: pnpm prisma migrate dev --name add_password_reset_token

Implementar en auth.service.ts y auth.controller.ts:
- POST /auth/forgot-password: genera token seguro (crypto.randomBytes(32)), hashea con SHA-256,
  guarda en BD con expiresAt = ahora + 1h, envía email vía MailerService
- POST /auth/reset-password: valida token (no usado, no expirado), actualiza password con bcrypt,
  marca tokenHash como usado

Criterio de Done: Un usuario puede solicitar reset, recibir email, y cambiar su contraseña.

--- TAREA API-SPRINT02-05: Módulo Admin (Super Admin) ---
Prioridad: MEDIA (necesario para Agente 06)

Crear apps/api/src/modules/admin/ con:

admin.guard.ts — verifica que req.user.tenantSlug === 'super-admin'
admin.module.ts
admin.controller.ts — prefijo: /admin, todos con @UseGuards(JwtAuthGuard, SuperAdminGuard)
admin.service.ts

Endpoints:
- GET /admin/stats → { totalTenants, newThisWeek, mrr, publishedSites }
  mrr = suma de precios de suscripciones ACTIVE según plan
- GET /admin/tenants → paginado, con search y status filter, incluye plan name + site count
- GET /admin/tenants/:id → detalle completo con sites + users + subscription
- PATCH /admin/tenants/:id/status → { isActive: boolean }
- GET /admin/plans → lista con tenant count por plan
- PATCH /admin/plans/:id → actualizar límites del plan

Registrar AdminModule en AppModule.

RESTRICCIONES GENERALES:
- No romper ningún endpoint existente
- Toda operación que modifica datos múltiples usa prisma.$transaction
- Sin errores de TypeScript strict
- Al terminar: cd apps/api && pnpm build para verificar compilación
```

---

## AGENTE 06 — Frontend Admin
> Chat: "Actúa como Frontend Admin Developer de EdithPress, lee docs/agents/06-frontend-admin.md"

```
Eres el Frontend Admin Developer (Agente 06) de EdithPress. Lee docs/agents/06-frontend-admin.md
para tener tu contexto completo de rol, convenciones y buenas prácticas.

ESTADO ACTUAL — Lo que YA está implementado en apps/admin/src/:
- ✅ (auth)/login — formulario funcional con Zod + useLogin hook
- ✅ (auth)/register — formulario funcional
- ✅ (auth)/verify-email — página de verificación
- ✅ (tenant)/dashboard — KPIs + listado de sitios
- ✅ (tenant)/sites — grid + create + detail + settings + pages list
- ✅ (tenant)/billing — plan actual + upgrade + portal Stripe
- ✅ API client en src/lib/api-client.ts con interceptor de token
- ⚠️  (tenant)/media — página existe pero funcionalidad incompleta
- ⚠️  (super-admin)/dashboard, /tenants, /plans — existen pero sin datos reales
- ❌ middleware.ts — NO EXISTE — las rutas (tenant)/* NO están protegidas

TAREAS DE ESTE SPRINT (en orden de prioridad):

--- TAREA ADMIN-SPRINT02-01: Middleware de Autenticación ---
Prioridad: CRÍTICA

Lee primero: apps/admin/src/hooks/useLogin.ts y apps/admin/src/lib/api-client.ts

Problema: el token probablemente se guarda en localStorage, pero Next.js middleware
no puede leer localStorage. Necesitamos mover el token a cookies.

Paso 1 — API Route para manejar sesión:
Crear apps/admin/src/app/api/auth/session/route.ts
  - POST: recibe { accessToken, refreshToken } en body, setea cookies httpOnly:
    * "access_token" — maxAge: 900 (15 min), httpOnly, secure en prod, sameSite: lax
    * "refresh_token" — maxAge: 604800 (7 días), httpOnly, secure en prod, sameSite: lax
  - DELETE: limpia ambas cookies (logout)

Paso 2 — Actualizar useLogin.ts:
Después del POST /auth/login exitoso, llamar a:
  fetch('/api/auth/session', { method: 'POST', body: JSON.stringify({ accessToken, refreshToken }) })
Eliminar cualquier localStorage.setItem de tokens.

Paso 3 — Actualizar api-client.ts:
El interceptor de request ya no lee de localStorage.
En el cliente (browser) el token está en la cookie httpOnly — el browser lo envía automáticamente
hacia las API routes de Next.js, pero NO hacia la API externa directamente.
Para llamadas directas a la API externa, crear una API route proxy:
  apps/admin/src/app/api/proxy/[...path]/route.ts
  Que lea la cookie y agregue el Authorization header antes de hacer forward a la API.
  O alternativamente, usar un endpoint BFF en Next.js para las llamadas autenticadas.

Paso 4 — Crear apps/admin/src/middleware.ts:
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/sites') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/media') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/templates') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/domains') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/super-admin')

  // Rutas de auth (redirigir si ya está logueado)
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

Paso 5 — AuthContext:
Crear apps/admin/src/contexts/AuthContext.tsx con:
- user: { id, email, firstName, lastName, tenantId, role } | null
- isLoading: boolean
- logout(): llama DELETE /api/auth/session y redirige a /login
- Decodifica el JWT de la cookie (solo en client, usar jwt-decode o parseo manual del payload)

Criterio de Done: Navegar a /dashboard sin estar logueado redirige a /login.
Después de login, /login redirige a /dashboard.

--- TAREA ADMIN-SPRINT02-02: Página de Media Completa ---
Prioridad: ALTA

Lee apps/admin/src/app/(tenant)/media/page.tsx primero.

Implementar MediaLibrary completa:

1. Grid de archivos con react-dropzone para upload drag-and-drop:
   - Área de drop visible siempre (no solo hover)
   - Preview de imágenes en el grid (thumbnail 150x150)
   - Para PDFs: ícono de PDF + nombre del archivo
   - Para videos: ícono de video + nombre

2. Upload:
   - POST /api/v1/media/upload con FormData (campo "file")
   - Barra de progreso durante upload (usar axios onUploadProgress)
   - Toast de éxito/error al terminar
   - Refrescar la lista automáticamente

3. Acciones por archivo:
   - Copiar URL al portapapeles (navigator.clipboard.writeText)
   - Eliminar con modal de confirmación (DELETE /api/v1/media/:id)
   - Ver imagen en lightbox (modal con imagen grande)

4. Filtros:
   - Tabs: Todos / Imágenes / Documentos / Videos
   - Barra de búsqueda por nombre

5. Paginación:
   - GET /api/v1/media?page=1&limit=24&type=image
   - Botones de paginación abajo

Usar componentes del @edithpress/ui ya existentes: Button, Card, Badge, Alert.
Si falta algún componente (Modal, Toast), implementarlo inline en esta página — no bloquear
esperando que el Agente 12 entregue.

--- TAREA ADMIN-SPRINT02-03: Super Admin Dashboard con Datos Reales ---
Prioridad: MEDIA

Lee apps/admin/src/app/(super-admin)/ — todos los archivos existentes.

NOTA: Los endpoints GET /admin/stats, GET /admin/tenants, etc. serán implementados
por el Agente 05 (Backend). Si aún no están listos, usa datos mock con una nota TODO visible.

Implementar:
1. /super-admin/dashboard:
   - 4 KPI cards: Total Tenants, Nuevos esta semana, MRR, Sitios publicados
   - Tabla de últimos 10 tenants registrados
   - Datos desde GET /api/v1/admin/stats y GET /api/v1/admin/tenants?limit=10

2. /super-admin/tenants:
   - Tabla con columnas: Nombre, Plan, Estado (badge), Sites, Fecha registro, Acciones
   - Acciones: Ver detalles, Suspender/Activar (PATCH /api/v1/admin/tenants/:id/status)
   - Búsqueda por nombre
   - Filtro por estado (activo/suspendido)
   - Paginación

3. /super-admin/plans:
   - Lista de los 4 planes con sus límites y precios
   - Tabla: Plan, Precio/mes, Precio/año, Max Sites, Max Páginas, Storage, Tenants activos
   - Datos desde GET /api/v1/admin/plans

--- TAREA ADMIN-SPRINT02-04: Flujo de Password Reset ---
Prioridad: ALTA (complementa API)

Crear:
- apps/admin/src/app/(auth)/forgot-password/page.tsx
  Formulario: solo email. POST /api/v1/auth/forgot-password
  Mostrar mensaje de éxito: "Revisa tu email para continuar"

- apps/admin/src/app/(auth)/reset-password/page.tsx
  Lee ?token= de la URL. Formulario: nueva contraseña + confirmación.
  POST /api/v1/auth/reset-password con { token, password }
  Redirigir a /login con mensaje de éxito.

Agregar link "¿Olvidaste tu contraseña?" en la página de login.

RESTRICCIONES GENERALES:
- Server Components por defecto, 'use client' solo cuando sea necesario
- React Query para todo data fetching en Client Components
- next/image para todas las imágenes
- next/link para toda la navegación
- Al terminar: cd apps/admin && pnpm build
```

---

## AGENTE 07 — Frontend Builder
> Chat: "Actúa como Frontend Builder Developer de EdithPress, lee docs/agents/07-frontend-builder.md"

```
Eres el Frontend Builder Developer (Agente 07) de EdithPress. Lee docs/agents/07-frontend-builder.md
para tener tu contexto completo de rol, convenciones y buenas prácticas.

ESTADO ACTUAL — Lo que YA está implementado en apps/builder/src/:
- ✅ Página del editor: /builder/[siteId]/[pageId]
- ✅ Bloques Puck implementados: HeroBlock, TextBlock, ImageBlock, ButtonBlock,
     SeparatorBlock, GalleryBlock, ContactFormBlock, CardGridBlock
- ✅ Configuración de Puck (puck.config.ts o similar)
- ✅ API client básico para guardar contenido
- ⚠️  BuilderToolbar existe pero UI de propiedades puede estar incompleta
- ❌ Autosave NO implementado (guardado manual únicamente)
- ❌ Preview en tiempo real NO implementado

TAREAS DE ESTE SPRINT:

--- TAREA BUILDER-SPRINT02-01: Autosave ---
Prioridad: CRÍTICA

Lee todos los archivos del builder antes de empezar. Entiende cómo Puck expone
el estado del contenido (probablemente a través del callback onChange o usePuck hook).

Implementar:
1. Crear apps/builder/src/hooks/useAutosave.ts:

   interface UseAutosaveOptions {
     pageId: string
     siteId: string
     data: any // el data object de Puck
     enabled: boolean
   }

   interface UseAutosaveReturn {
     status: 'saved' | 'saving' | 'unsaved' | 'error'
     lastSaved: Date | null
     saveNow: () => Promise<void>
   }

   Lógica:
   - Cuando `data` cambia, marcar status = 'unsaved'
   - Debounce de 3 segundos: después de 3s sin cambios, guardar automáticamente
   - Guardado periódico: cada 30s si hay cambios pendientes
   - Al guardar: POST /api/v1/content/save con { pageId, siteId, content: data }
   - En beforeunload: guardar sincrónicamente si hay cambios sin guardar
   - Si el guardado falla: status = 'error', reintentar 1 vez después de 5s

2. Integrar useAutosave en el componente del editor:
   - Conectar el `data` de Puck al hook
   - Mostrar el status en la toolbar (ver tarea siguiente)

--- TAREA BUILDER-SPRINT02-02: Toolbar Mejorada ---
Prioridad: ALTA

Lee BuilderToolbar.tsx (o el componente de toolbar) completo.

Implementar/mejorar la toolbar superior del editor con:

1. Indicador de estado de guardado (lado izquierdo):
   - "saved" → ✓ Guardado (texto gris)
   - "saving" → Guardando... (con spinner pequeño)
   - "unsaved" → Cambios sin guardar (texto naranja)
   - "error" → Error al guardar — Reintentar (rojo, clickeable)

2. Nombre de la página editable (centro):
   - Muestra el título de la página como texto clickeable
   - Al hacer click, se convierte en un input inline
   - Al presionar Enter o perder foco, guarda via PATCH /api/v1/sites/{siteId}/pages/{pageId}
   - Badge de estado junto al nombre: BORRADOR (gris) / PUBLICADA (verde)

3. Acciones (lado derecho):
   - Botón "Vista previa" → abre panel lateral con iframe (ver tarea siguiente)
   - Botón "Guardar borrador" → llama saveNow() del hook de autosave
   - Botón "Publicar" (CTA principal) → confirma con modal "¿Publicar esta página?",
     luego POST /api/v1/sites/{siteId}/pages/{pageId}/publish
     Badge cambia a PUBLICADA tras éxito

--- TAREA BUILDER-SPRINT02-03: Preview en Iframe ---
Prioridad: MEDIA

Implementar panel de vista previa:

1. Botón "Vista previa" en toolbar abre un drawer lateral (50% del ancho de pantalla)
   El drawer tiene:
   - Header: "Vista previa" + toggle Mobile/Desktop + botón "Abrir en nueva pestaña" + X para cerrar
   - Iframe apuntando a: {RENDERER_URL}/{pageSlug}?preview=1
   
   Toggle Mobile/Desktop cambia el width del iframe:
   - Mobile: 390px (iPhone 14 Pro width)
   - Desktop: 100% del panel

2. Botón "Abrir en nueva pestaña":
   window.open(`${RENDERER_URL}/${pageSlug}?preview=1`, '_blank')

3. El renderer ya soporta draft mode — el query param ?preview=1 indica que se deben
   mostrar contenidos en borrador. Verificar cómo el renderer detecta esto y usar
   el mecanismo correcto (puede ser un token o simplemente el query param).

--- TAREA BUILDER-SPRINT02-04: Verificar Campos de Bloques en Puck ---
Prioridad: MEDIA

Lee cada archivo en apps/builder/src/blocks/ (o donde estén definidos los bloques).
Para cada bloque, verificar que los fields de Puck estén completos:

HeroBlock:
  - title: { type: 'text', label: 'Título' }
  - subtitle: { type: 'text', label: 'Subtítulo' }
  - ctaText: { type: 'text', label: 'Texto del botón' }
  - ctaUrl: { type: 'text', label: 'URL del botón' }
  - backgroundImage: { type: 'text', label: 'URL imagen de fondo' }

TextBlock:
  - content: { type: 'textarea', label: 'Contenido' }

ImageBlock:
  - src: { type: 'text', label: 'URL de imagen' }
  - alt: { type: 'text', label: 'Descripción (alt text)' }
  - caption: { type: 'text', label: 'Pie de foto (opcional)' }

ButtonBlock:
  - label: { type: 'text', label: 'Texto del botón' }
  - url: { type: 'text', label: 'URL de destino' }
  - variant: { type: 'select', label: 'Estilo', options: [
      { label: 'Principal', value: 'primary' },
      { label: 'Secundario', value: 'secondary' },
      { label: 'Contorno', value: 'outline' }
    ]}

GalleryBlock:
  - images: { type: 'array', label: 'Imágenes', arrayFields: {
      src: { type: 'text', label: 'URL' },
      alt: { type: 'text', label: 'Alt text' }
    }}
  - columns: { type: 'select', label: 'Columnas', options: [
      { label: '2 columnas', value: '2' },
      { label: '3 columnas', value: '3' },
      { label: '4 columnas', value: '4' }
    ]}

ContactFormBlock:
  - title: { type: 'text', label: 'Título del formulario' }
  - submitLabel: { type: 'text', label: 'Texto del botón enviar' }

CardGridBlock:
  - cards: { type: 'array', label: 'Tarjetas', arrayFields: {
      title: { type: 'text', label: 'Título' },
      description: { type: 'text', label: 'Descripción' },
      imageUrl: { type: 'text', label: 'URL imagen' },
      link: { type: 'text', label: 'URL de enlace' }
    }}

Si algún campo ya está definido correctamente, NO lo cambies.
Si hay campos con nombres distintos pero equivalentes, mantener los nombres existentes
(el renderer usa el mismo JSON — romper los nombres rompe los sitios publicados).

RESTRICCIONES GENERALES:
- No cambiar el schema JSON de los bloques (compatibilidad con renderer)
- Zustand para estado del editor si se necesita (ya está en las dependencias según el doc del agente)
- Al terminar: cd apps/builder && pnpm build
```

---

## AGENTE 08 — Frontend Renderer
> Chat: "Actúa como Frontend Renderer Developer de EdithPress, lee docs/agents/08-frontend-renderer.md"

```
Eres el Frontend Renderer Developer (Agente 08) de EdithPress. Lee docs/agents/08-frontend-renderer.md
para tener tu contexto completo de rol, convenciones y buenas prácticas.

ESTADO ACTUAL — Lo que YA está implementado en apps/renderer/src/:
- ✅ /[[...slug]] catch-all route para páginas dinámicas
- ✅ ISR con revalidate=3600
- ✅ Draft Mode para previews desde el builder
- ✅ BlockRenderer que mapea tipo → componente
- ✅ 8 bloques renderizados: Hero, Text, Image, Button, Separator, Gallery, ContactForm, CardGrid
- ✅ Metadata dinámico (title, description)
- ✅ Navegación sticky del sitio
- ✅ Middleware de tenant identification
- ⚠️  Imágenes con <img> en lugar de next/image
- ❌ sitemap.xml dinámico NO existe
- ❌ robots.txt dinámico NO existe
- ❌ OG images incompletos (falta og:image real)
- ❌ Páginas 404/error personalizadas por tenant

TAREAS DE ESTE SPRINT:

--- TAREA RENDERER-SPRINT02-01: Sitemap Dinámico ---
Prioridad: ALTA (SEO crítico)

Crear apps/renderer/src/app/sitemap.ts:

import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Obtener el host para identificar el tenant
  const headersList = headers()
  const host = headersList.get('host') || ''
  const tenantSlug = host.split('.')[0] // mysite.edithpress.com → 'mysite'
  
  // Llamar a la API para obtener páginas publicadas
  const res = await fetch(`${process.env.API_URL}/api/v1/renderer/tenant/${tenantSlug}`, {
    headers: { 'X-Renderer-Secret': process.env.RENDERER_SECRET! },
    next: { revalidate: 3600 }
  })
  
  // Construir el sitemap con las páginas del tenant
  // Homepage: priority 1.0, changeFrequency 'daily'
  // Otras páginas: priority 0.8, changeFrequency 'weekly'
}

Lee el endpoint GET /renderer/tenant/:slug para ver qué datos devuelve (nav, pages list).
Si el endpoint no incluye la lista completa de páginas, puede que necesites ajustarlo —
coordinar con Agente 05 si es necesario.

--- TAREA RENDERER-SPRINT02-02: Robots.txt Dinámico ---
Prioridad: MEDIA

Crear apps/renderer/src/app/robots.ts:

import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = headers()
  const host = headersList.get('host') || ''
  const tenantSlug = host.split('.')[0]
  
  // Obtener el estado del sitio (isPublished)
  // Si isPublished = true → permitir crawlers
  // Si isPublished = false → Disallow todo
  
  return {
    rules: isPublished
      ? { userAgent: '*', allow: '/' }
      : { userAgent: '*', disallow: '/' },
    sitemap: `https://${host}/sitemap.xml`
  }
}

--- TAREA RENDERER-SPRINT02-03: Optimización con next/image ---
Prioridad: ALTA (Core Web Vitals)

Lee todos los componentes de bloques en apps/renderer/src/components/blocks/ (o donde estén).
Reemplazar TODOS los <img> por <Image> de next/image.

En apps/renderer/next.config.js (o next.config.ts), agregar:
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',  // MinIO local
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',  // S3 en prod
        pathname: '/**',
      },
      // Agregar el hostname de MinIO/S3 en producción según NEXT_PUBLIC_CDN_URL
    ],
    formats: ['image/avif', 'image/webp'],
  }

Por bloque:
- HeroBlock: <Image fill priority alt={...} /> con object-cover
- ImageBlock: <Image width={800} height={600} alt={...} />
- GalleryBlock: <Image width={400} height={300} alt={...} /> por imagen
- CardGridBlock: <Image width={400} height={250} alt={...} /> por tarjeta

--- TAREA RENDERER-SPRINT02-04: Meta Tags OG Completos ---
Prioridad: ALTA

Lee cómo se generan los metadata en las páginas actuales.

Para cada página agregar/mejorar:
- og:image: si el contenido tiene una imagen (HeroBlock.backgroundImage o ImageBlock.src),
  usar esa URL. Si no hay imagen, usar el favicon del sitio como fallback.
- og:type: 'website' para homepage, 'article' para otras
- twitter:card: 'summary_large_image'
- canonical: `https://${siteSlug}.edithpress.com/${pageSlug}`

Estructura sugerida para generateMetadata:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const page = await getPageData(...)
  const ogImage = extractFirstImage(page.content) || page.site.faviconUrl
  
  return {
    title: page.title,
    description: page.metaDescription,
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      images: ogImage ? [{ url: ogImage }] : [],
      type: page.isHomepage ? 'website' : 'article',
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: `https://${siteSlug}.edithpress.com/${pageSlug}` }
  }
}
```

--- TAREA RENDERER-SPRINT02-05: Páginas de Error ---
Prioridad: MEDIA

1. apps/renderer/src/app/not-found.tsx:
   - Obtener el tenant desde el host para mostrar el nombre/logo del sitio
   - Mensaje: "Página no encontrada"
   - Link a la homepage del sitio
   - Estilo consistente con el resto del sitio

2. apps/renderer/src/app/error.tsx:
   - Error boundary para fallos generales
   - Mensaje genérico de error (no exponer stack traces)
   - Botón "Intentar de nuevo"

3. Si el tenant slug no existe (host inválido):
   - Redirigir a la página principal de EdithPress o mostrar 404 genérico

RESTRICCIONES GENERALES:
- No cambiar el sistema de tenant detection (middleware)
- No cambiar el formato JSON de los bloques
- Mantener Draft Mode funcionando
- Al terminar: cd apps/renderer && pnpm build — verificar que ISR pre-renders sin errores
```

---

## AGENTE 04 — Database Engineer
> Chat: "Actúa como Database Engineer de EdithPress, lee docs/agents/04-database-engineer.md"

```
Eres el Database Engineer (Agente 04) de EdithPress. Lee docs/agents/04-database-engineer.md
para tener tu contexto completo de rol, convenciones y buenas prácticas.

ESTADO ACTUAL:
- ✅ Schema Prisma completo con todos los modelos (User, Tenant, Site, Page, Media, etc.)
- ✅ Migración inicial creada (20260413135858_init)
- ✅ Seed con 4 planes + super admin
- ✅ Row-level isolation via Prisma extension
- ❌ PasswordResetToken model NO existe — bloqueando Agente 05
- ❌ Redis no tiene estructura de caché documentada
- ⚠️  Índices de performance no verificados para queries más frecuentes

TAREAS DE ESTE SPRINT:

--- TAREA DB-SPRINT02-01: Agregar PasswordResetToken ---
Prioridad: CRÍTICA (bloqueante para Agente 05)

Lee packages/database/prisma/schema.prisma completo.

Agregar al schema:
model PasswordResetToken {
  id        String    @id @default(cuid())
  userId    String
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

Agregar la relación inversa en el modelo User:
  passwordResetTokens PasswordResetToken[]

Crear la migración:
  cd packages/database
  pnpm prisma migrate dev --name add_password_reset_token

Verificar que la migración aplica sin errores y regenerar el client:
  pnpm prisma generate

--- TAREA DB-SPRINT02-02: Índices de Performance ---
Prioridad: MEDIA

Los queries más frecuentes en producción serán:

1. Buscar páginas publicadas por sitio (renderer hace esto en cada request):
   En Page: @@index([siteId, status, slug])
   Verificar si existe, si no agregar.

2. Buscar sitio por tenant y slug (renderer):
   En Site: @@index([tenantId, isPublished])
   Verificar si existe.

3. Buscar tenant por slug (renderer lo hace en cada request):
   En Tenant: el campo slug debe ser @unique — verificar que está marcado como @unique.

4. Buscar MediaFile por tenantId (listado paginado):
   En MediaFile: @@index([tenantId, createdAt])

5. Buscar Subscription por tenantId:
   En Subscription: @@index([tenantId, status])

Para cada índice faltante: agregar en el schema y crear migración:
  pnpm prisma migrate dev --name add_performance_indexes

--- TAREA DB-SPRINT02-03: Seed Enriquecido para Desarrollo ---
Prioridad: BAJA

Actualizar packages/database/prisma/seed.ts para agregar:

1. Un tenant de demo completo:
   - Tenant: { name: 'Demo Agency', slug: 'demo-agency', planId: 'business' }
   - User: { email: 'demo@edithpress.com', password: 'Demo123!' }
   - TenantUser: OWNER
   - 1 Site publicado con 3 páginas (homepage + about + contact)
   - Contenido básico en cada página (usando el formato JSON de bloques Puck)

2. El contenido de las páginas de demo debe usar bloques reales:
   Homepage: [HeroBlock, TextBlock, CardGridBlock]
   About: [HeroBlock, TextBlock, ImageBlock]
   Contact: [HeroBlock, ContactFormBlock]

Esto permite que el equipo pruebe el renderer con datos reales sin configurar todo manualmente.

Ejecutar seed actualizado:
  cd packages/database && pnpm prisma db seed

RESTRICCIONES:
- No cambiar modelos existentes de forma breaking
- Toda migración debe aplicar sin datos — es entorno de desarrollo
- Documentar en un comentario en el schema qué versión de Prisma se usa
```

---

## AGENTE 12 — UX Designer
> Chat: "Actúa como UX Designer de EdithPress, lee docs/agents/12-ux-designer.md"

```
Eres el UX Designer (Agente 12) de EdithPress. Lee docs/agents/12-ux-designer.md
para tener tu contexto completo de rol, design system y componentes.

ESTADO ACTUAL — packages/ui/src/:
- ✅ Button (con loading state, variantes)
- ✅ Input (con error display)
- ✅ Card
- ✅ Badge (con variantes de estado)
- ✅ Alert (error/success/warning/info)
- ✅ Dialog (básico)
- ❌ Los componentes restantes NO existen — bloqueando a Agente 06 y 07

CONTEXTO CRÍTICO:
El Agente 06 (Admin) y Agente 07 (Builder) necesitan estos componentes.
Sin ellos, tienen que implementar UI inline en sus páginas (inconsistente).
Tu entrega en este sprint desbloquea a ambos agentes.

TAREAS DE ESTE SPRINT:

Lee primero TODOS los archivos en packages/ui/src/ para entender el
estilo, naming convention y estructura de los componentes existentes.
Luego implementa los siguientes (en este orden de prioridad):

--- COMPONENTE 1: Toast / Notificaciones (ToastProvider + useToast) ---
Prioridad: CRÍTICA — usado por builder (autosave) y admin (upload media)

Archivo: packages/ui/src/Toast.tsx y packages/ui/src/hooks/useToast.ts

Toast individual:
  Props: { id, message, type: 'success'|'error'|'warning'|'info', duration?: number }
  Posición: fixed, bottom-right
  Animación: slide-in desde abajo, fade-out al expirar

ToastProvider: context que gestiona la cola de toasts (máx 3 visibles)

Hook useToast:
  const { toast } = useToast()
  toast.success('Guardado correctamente')   // duration: 4000ms
  toast.error('Error al subir archivo')     // duration: 6000ms (errores más tiempo)
  toast.warning('Límite de plan alcanzado') // duration: 5000ms
  toast.info('Publicando cambios...')       // duration: 3000ms

Agregar <ToastProvider> como wrapper en el export principal (o instrucciones para añadirlo al root layout).

--- COMPONENTE 2: Modal (mejorar Dialog existente) ---
Prioridad: CRÍTICA — usado para confirmaciones de delete, publicar, etc.

Lee el Dialog.tsx existente y extiéndelo (no reemplazar si tiene lógica correcta).

Modal.tsx con:
  Props: isOpen, onClose, title, size: 'sm'|'md'|'lg'|'xl', children
  
  Sub-componentes:
  - Modal.Body: el contenido
  - Modal.Footer: acciones (flex row, gap, justify-end)
  
  Tamaños:
  - sm: max-w-sm
  - md: max-w-md (default)
  - lg: max-w-lg
  - xl: max-w-2xl
  
  Cerrar con: X button, click en overlay, tecla Escape
  Trap focus mientras está abierto (accesibilidad)

--- COMPONENTE 3: DataTable ---
Prioridad: ALTA — tablas de tenants, media, páginas

DataTable.tsx:
  interface Column<T> {
    key: keyof T | string
    header: string
    render?: (row: T) => React.ReactNode
    width?: string
    sortable?: boolean
  }

  Props:
  - data: T[]
  - columns: Column<T>[]
  - isLoading?: boolean → skeleton de 5 filas
  - emptyMessage?: string → empty state con ícono
  - onRowClick?: (row: T) => void → cursor pointer si existe

  Estados:
  - Loading: skeleton rows con animación pulse
  - Empty: ícono + mensaje configurable
  - Con datos: tabla con header sticky, hover en rows

--- COMPONENTE 4: Pagination ---
Prioridad: ALTA — listas paginadas de media, tenants, páginas

Pagination.tsx:
  Props: currentPage, totalPages, onPageChange, totalItems, itemsPerPage
  
  Mostrar: "Mostrando 1–10 de 45 resultados" (texto pequeño, gris)
  
  Botones:
  - ← Anterior (disabled si currentPage === 1)
  - números: [1] [2] [3] ... [7] [8] (máx 5 páginas visibles, ellipsis si hay más)
  - Siguiente → (disabled si currentPage === totalPages)

--- COMPONENTE 5: FormField ---
Prioridad: ALTA — todos los formularios del admin

FormField.tsx:
  Props: label, error?, required?, htmlFor?, hint?, children
  
  Estructura:
  <div>
    <label htmlFor={htmlFor}>{label}{required && <span aria-hidden>*</span>}</label>
    {children}
    {hint && <p className="text-xs text-gray-500">{hint}</p>}
    {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
  </div>

--- COMPONENTE 6: Select ---
Prioridad: ALTA — filtros, variantes de bloques, selección de plan

Select.tsx:
  Props: value, onChange, options: {value: string, label: string}[], 
         placeholder?, disabled?, error?, name?, id?
  
  Implementar sobre select nativo de HTML — estilizado con Tailwind.
  Debe verse consistente con Input existente (mismos bordes, padding, focus ring).
  Con ícono de chevron-down.

--- COMPONENTE 7: Textarea ---
Prioridad: MEDIA

Textarea.tsx:
  Props: value, onChange, rows?, placeholder?, error?, disabled?, 
         resize?: 'none'|'vertical'|'both' (default: 'vertical')
  
  Consistente visualmente con Input.

--- COMPONENTE 8: Skeleton ---
Prioridad: MEDIA

Skeleton.tsx:
  Props: className?, width?, height?, variant?: 'text'|'rect'|'circle'
  
  - text: w-full h-4 rounded (para líneas de texto)
  - rect: w-full h-full rounded (para imágenes/cards)
  - circle: rounded-full (para avatares)
  
  Animación Tailwind: animate-pulse bg-gray-200

--- COMPONENTE 9: DropdownMenu ---
Prioridad: MEDIA

DropdownMenu.tsx:
  Props:
  - trigger: React.ReactNode (el elemento que abre el menú)
  - items: Array<{
      label: string
      onClick: () => void
      icon?: React.ReactNode
      variant?: 'default' | 'destructive'
      separator?: boolean  // línea separadora antes de este item
    }>
  
  Implementar con posicionamiento relativo/absoluto básico.
  Cerrar al hacer click fuera (useEffect con event listener).
  Cerrar al presionar Escape.

--- COMPONENTE 10: Switch ---
Prioridad: BAJA

Switch.tsx:
  Props: checked, onChange, label?, disabled?, id?
  
  Toggle visual (pill que se mueve). Accesible con role="switch" y aria-checked.
  Colores: checked=indigo-600, unchecked=gray-200.

REQUISITOS DE ENTREGA:
1. Cada componente en su propio archivo en packages/ui/src/
2. Exportar TODO desde packages/ui/src/index.ts
3. Tipos TypeScript explícitos en todas las props (interfaces, no type inline)
4. Clases Tailwind — no CSS en línea
5. Accesibilidad básica en todos (labels, roles ARIA, keyboard nav en Modal/Dropdown)
6. Al terminar: cd packages/ui && pnpm build — sin errores TypeScript
```

---

## AGENTE 09 — DevOps Engineer
> Chat: "Actúa como DevOps Engineer de EdithPress, lee docs/agents/09-devops-engineer.md"

```
Eres el DevOps Engineer (Agente 09) de EdithPress. Lee docs/agents/09-devops-engineer.md
para tener tu contexto completo de rol, stack y convenciones.

ESTADO ACTUAL:
- ✅ docker-compose.yml existe con servicios base
- ✅ Las 4 apps corren localmente con pnpm dev
- ✅ PostgreSQL y Redis configurados en docker-compose
- ✅ MinIO configurado en docker-compose
- ❌ Variables de entorno .env.example no está actualizado o no existe
- ❌ Dockerfiles de producción para las 4 apps NO existen
- ❌ GitHub Actions CI/CD NO configurado
- ❌ Wildcard DNS para *.edithpress.com no documentado

TAREAS DE ESTE SPRINT:

--- TAREA DEVOPS-SPRINT02-01: Variables de Entorno Completas ---
Prioridad: CRÍTICA (todos los agentes necesitan esto)

Lee el docker-compose.yml actual. Lee los archivos .env o .env.example de cada app.

Crear/actualizar en la raíz del monorepo: .env.example con TODAS las variables necesarias:
  # Base de datos
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edithpress

  # Redis
  REDIS_URL=redis://localhost:6379

  # JWT
  JWT_SECRET=change-me-in-production-min-32-chars
  JWT_REFRESH_SECRET=change-me-in-production-min-32-chars-different

  # URLs de las apps
  APP_URL=http://localhost:3010
  API_URL=http://localhost:3011
  BUILDER_URL=http://localhost:3002
  RENDERER_URL=http://localhost:3003

  # MinIO / S3
  S3_ENDPOINT=http://localhost:9000
  S3_ACCESS_KEY=minioadmin
  S3_SECRET_KEY=minioadmin
  S3_BUCKET_NAME=edithpress-media
  S3_REGION=us-east-1
  NEXT_PUBLIC_CDN_URL=http://localhost:9000/edithpress-media

  # Stripe
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...

  # Resend
  RESEND_API_KEY=re_...
  RESEND_FROM_EMAIL=EdithPress <noreply@edithpress.com>

  # Renderer
  RENDERER_SECRET=internal-secret-for-renderer-api-calls

  # Admin
  NEXTAUTH_SECRET=change-me-in-production

Verificar que cada app tiene su .env.local o .env con las variables correctas.
Documentar en el README o en el archivo cuáles son opcionales vs requeridas.

--- TAREA DEVOPS-SPRINT02-02: Dockerfiles de Producción ---
Prioridad: ALTA

Crear un Dockerfile multi-stage para cada app siguiendo el patrón de Next.js:

apps/api/Dockerfile:
  - Stage builder: instala deps, compila TypeScript
  - Stage production: solo node_modules de prod + dist/
  - Puerto: 3011

apps/admin/Dockerfile:
  - Stage builder: pnpm build (genera .next/standalone)
  - Stage production: copia standalone + public + .next/static
  - Puerto: 3010
  - next.config.js debe tener output: 'standalone'

apps/builder/Dockerfile: similar al admin, puerto 3002
apps/renderer/Dockerfile: similar al admin, puerto 3003

Crear docker-compose.prod.yml:
  - Usa los Dockerfiles de producción
  - Variables desde .env (no hardcodeadas)
  - Sin volúmenes de desarrollo
  - Nginx como reverse proxy (imagen nginx:alpine)
  - Configuración de Nginx con upstream para cada app

--- TAREA DEVOPS-SPRINT02-03: GitHub Actions CI ---
Prioridad: MEDIA

Crear .github/workflows/ci.yml:

on:
  push: branches: [main, develop]
  pull_request: branches: [main]

jobs:
  lint:
    - pnpm install
    - pnpm lint (si hay linting configurado)
    - pnpm typecheck (tsc --noEmit en cada app)

  build:
    needs: lint
    - pnpm install
    - pnpm build (Turbo build de todas las apps)

  (NO agregar deploy todavía — eso es para cuando haya un servidor de staging configurado)

--- TAREA DEVOPS-SPRINT02-04: Wildcard DNS Local para Desarrollo ---
Prioridad: MEDIA (necesario para testear el renderer multi-tenant)

Documentar en docs/development-setup.md:

Para testear subdominios localmente (tenants.edithpress.com):
Opción 1 — dnsmasq (Mac/Linux):
  - Instalar dnsmasq
  - Configurar: address=/.edithpress.local/127.0.0.1
  - Usar .edithpress.local en dev en lugar de .edithpress.com

Opción 2 — /etc/hosts manual:
  Agregar entradas: 127.0.0.1 demo-agency.edithpress.local
  (Para cada tenant de prueba)

Opción 3 — ngrok/Cloudflare Tunnel para testing real con HTTPS

Actualizar apps/renderer/src/middleware.ts si usa hostname hardcodeado,
para que funcione tanto con .edithpress.com como con .edithpress.local en dev.

RESTRICCIONES:
- No hacer push a ningún registry de Docker sin confirmación del usuario
- No agregar secretos reales en ningún archivo del repo
- Los Dockerfiles deben funcionar con el monorepo (contexto en la raíz, no en la app)
```

---

## AGENTE 11 — QA / Testing Engineer
> Chat: "Actúa como QA Testing Engineer de EdithPress, lee docs/agents/11-qa-testing.md"

```
Eres el QA Testing Engineer (Agente 11) de EdithPress. Lee docs/agents/11-qa-testing.md
para tener tu contexto completo de rol, stack de testing y convenciones.

ESTADO ACTUAL:
- ✅ Jest configurado en apps/api (package.json tiene jest config)
- ❌ CERO tests implementados en todo el proyecto
- ❌ Sin cobertura mínima
- ❌ Sin tests E2E

NOTA: El proyecto tiene deuda técnica de testing significativa.
Este sprint establece la base — no es necesario alcanzar 80% de cobertura ahora,
sino dejar la infraestructura correcta y los tests más críticos funcionando.

TAREAS DE ESTE SPRINT:

--- TAREA QA-SPRINT02-01: Tests Unitarios del AuthService ---
Prioridad: CRÍTICA (auth es el módulo más crítico de seguridad)

Lee apps/api/src/modules/auth/auth.service.ts completo.

Crear apps/api/src/modules/auth/auth.service.spec.ts:

Casos a testear:
1. register():
   - ✅ Crea user + tenant + tenantUser cuando los datos son válidos
   - ✅ Lanza ConflictException si el email ya existe
   - ✅ El password se hashea (el hash NO es igual al password original)
   - ✅ Envía email de verificación (mock del MailerService)

2. login():
   - ✅ Retorna accessToken + refreshToken con credenciales válidas
   - ✅ Lanza UnauthorizedException con contraseña incorrecta
   - ✅ Lanza UnauthorizedException con email no registrado
   - ✅ Lanza ForbiddenException si emailVerified = false

3. refreshToken():
   - ✅ Rota los tokens cuando el refresh token es válido
   - ✅ Lanza UnauthorizedException si el token no existe en Redis/BD
   - ✅ Lanza UnauthorizedException si el token está expirado

4. logout():
   - ✅ Elimina el refresh token de Redis y PostgreSQL

Mock strategy:
- PrismaService: mock completo (no BD real en unit tests)
- RedisService: mock (jest.fn())
- MailerService: mock
- JwtService: usar el real (es puro, no tiene side effects)

--- TAREA QA-SPRINT02-02: Tests de Integración — Endpoints Auth ---
Prioridad: ALTA

Crear apps/api/test/auth.e2e-spec.ts (con Supertest, usando BD de test):

Flujos completos:
1. POST /api/v1/auth/register → 201 + { data: { user, tenant } }
2. POST /api/v1/auth/register con email duplicado → 409 Conflict
3. POST /api/v1/auth/login con credenciales correctas → 200 + tokens en cookies
4. POST /api/v1/auth/login con contraseña incorrecta → 401
5. POST /api/v1/auth/refresh con cookie válida → 200 + nuevos tokens
6. POST /api/v1/auth/logout → 200 + cookies limpias

Setup: usar una BD PostgreSQL de test separada (TEST_DATABASE_URL en .env.test)
O usar el test container de PostgreSQL si está disponible.

--- TAREA QA-SPRINT02-03: Tests Unitarios BillingService ---
Prioridad: MEDIA

Lee apps/api/src/modules/billing/billing.service.ts completo.

Crear apps/api/src/modules/billing/billing.service.spec.ts:

1. handleWebhook():
   - ✅ Procesa customer.subscription.updated correctamente
   - ✅ Procesa invoice.payment_succeeded — crea Invoice en BD
   - ✅ Lanza BadRequestException si el HMAC es inválido
   - ✅ No falla con eventos desconocidos (graceful ignore)

2. createCheckoutSession():
   - ✅ Llama a Stripe con los parámetros correctos
   - ✅ Retorna la URL de checkout

Mock: StripeService (o directamente el Stripe SDK)

--- TAREA QA-SPRINT02-04: Script de Smoke Tests ---
Prioridad: MEDIA

Crear apps/api/test/smoke.test.ts que se pueda correr contra staging/prod:

Verificar que estos endpoints responden correctamente:
- GET /api/v1/health → 200
- POST /api/v1/auth/login (con credenciales de test) → 200
- GET /api/v1/templates → 200 con array no vacío

Crear package.json script: "test:smoke": "jest test/smoke.test.ts --testPathPattern=smoke"

Este test debe ser seguro para correr en producción (no modifica datos).

RESTRICCIONES:
- No hacer tests frágiles (que dependan del orden de ejecución)
- Cada test limpia sus datos (beforeEach/afterEach)
- Los tests unitarios no deben hacer llamadas reales a Stripe, Resend, S3
- Coverage mínimo esta sprint: 60% en auth.service.ts (aumentar gradualmente)
- Al terminar: cd apps/api && pnpm test para verificar que todo pasa
```

---

## AGENTE 10 — Security Engineer
> Chat: "Actúa como Security Engineer de EdithPress, lee docs/agents/10-security-engineer.md"

```
Eres el Security Engineer (Agente 10) de EdithPress. Lee docs/agents/10-security-engineer.md
para tener tu contexto completo de rol, herramientas y checklist de seguridad.

ESTADO ACTUAL — Seguridad implementada:
- ✅ Helmet.js con headers de seguridad
- ✅ JWT (15min access + 7d refresh) con bcrypt 12 rounds
- ✅ TenantGuard (previene IDOR entre tenants)
- ✅ RolesGuard (OWNER/EDITOR/VIEWER)
- ✅ Rate limiting: 100/min global, 5/min en login
- ✅ Validación de DTOs con class-validator (whitelist + forbidNonWhitelisted)
- ✅ CORS restringido a APP_URL
- ✅ Validación de tipos de archivo en media upload
- ⚠️  Redis refresh token revocation implementado parcialmente
- ❌ CSP headers no configurados (solo Helmet defaults)
- ❌ npm audit: 15 vulnerabilidades conocidas (desde commit 7b2b43e)
- ❌ XSS en contenido del builder — no hay sanitización de HTML
- ❌ Sin protección de enumeración de usuarios en /auth/forgot-password

TAREAS DE ESTE SPRINT:

--- TAREA SEC-SPRINT02-01: Sanitización XSS en Builder Content ---
Prioridad: CRÍTICA

El mayor riesgo de XSS está en el TextBlock — si un editor malicioso guarda
HTML/script en el contenido, el renderer lo renderizaría en el sitio público.

Lee apps/api/src/modules/content/content.service.ts.
Lee cómo se guarda el contenido de las páginas.

Implementar:
1. En content.service.ts, antes de guardar a BD, sanitizar el contenido:
   - Instalar DOMPurify + jsdom (server-side): cd apps/api && pnpm add dompurify jsdom @types/dompurify @types/jsdom
   - Función sanitizeBlockContent(content: any): any que recorre todos los bloques
     y sanitiza los campos que pueden contener HTML:
     * TextBlock.content: DOMPurify.sanitize(value, { ALLOWED_TAGS: ['p','br','b','i','u','a','ul','ol','li','h2','h3'] })
     * Cualquier campo que sea un string largo (title, description) se deja como plain text (strip tags)
   - Aplicar antes de prisma.page.update({ data: { content } })

2. En el renderer, para renderizar TextBlock:
   - Usar dangerouslySetInnerHTML SOLO para TextBlock (que ya viene sanitizado)
   - Todos los demás campos (title, url, etc.): renderizar como texto plano (no dangerouslySetInnerHTML)

--- TAREA SEC-SPRINT02-02: Protección de Enumeración en Auth ---
Prioridad: ALTA

Problema: POST /auth/forgot-password puede usarse para enumerar usuarios válidos
(respuesta diferente para email registrado vs no registrado).

Fix en auth.service.ts en el método forgotPassword():
- Siempre retornar la MISMA respuesta, sin importar si el email existe o no:
  return { message: 'Si el email está registrado, recibirás un enlace de restablecimiento' }
- Procesar el envío de email en background (no await) para que el tiempo de respuesta
  sea igual en ambos casos
- Agregar rate limit estricto en este endpoint: 3 intentos por IP por hora

También revisar POST /auth/login:
- El mensaje de error no debe distinguir entre "email no existe" vs "contraseña incorrecta"
- Ambos casos deben retornar: "Credenciales inválidas" (no "Usuario no encontrado")

--- TAREA SEC-SPRINT02-03: Content Security Policy ---
Prioridad: ALTA

Lee apps/api/src/main.ts donde está configurado Helmet.

La CSP default de Helmet es muy restrictiva y puede romper la app.
Configurar una CSP que funcione con la app:

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],  // Next.js requiere esto
        styleSrc: ["'self'", "'unsafe-inline'"],   // Tailwind requiere esto
        imgSrc: ["'self'", "data:", "blob:", process.env.NEXT_PUBLIC_CDN_URL || "http://localhost:9000"],
        connectSrc: ["'self'", process.env.API_URL || "http://localhost:3011"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,  // Required for media embeds
  })
)

Para las apps Next.js (admin, builder, renderer), agregar en next.config.js:
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ]
  }]
}

--- TAREA SEC-SPRINT02-04: Auditoría de Dependencias ---
Prioridad: MEDIA

Ejecutar en la raíz del monorepo:
  pnpm audit

Analizar las 15 vulnerabilidades reportadas en el commit 7b2b43e.
Clasificar por severidad: Critical / High / Medium / Low

Para cada vulnerabilidad Critical o High:
1. Identificar qué package está afectado
2. Verificar si hay una versión parcheada disponible
3. Si hay fix: pnpm update {package}@{version} en el workspace correcto
4. Si NO hay fix: documentar el riesgo y workaround si existe

Crear docs/security-audit-sprint02.md con:
- Lista de vulnerabilidades encontradas
- Las que fueron parcheadas
- Las que permanecen con justificación
- Fecha del audit: 2026-04-16

RESTRICCIONES:
- No degradar funcionalidad para implementar seguridad — buscar el balance
- Los cambios en CSP deben ser probados para no romper el admin/builder/renderer
- Las sanitizaciones XSS no deben alterar contenido válido
- Documentar cada decisión de seguridad con su justificación
```

---

## Dependencias entre Agentes (orden de ejecución recomendado)

```
Semana 1:
  Agente 04 (DB)      → debe ir primero (PasswordResetToken)
  Agente 05 (Backend) → en paralelo con 04 (excepto password reset que depende de 04)
  Agente 12 (UX/UI)   → en paralelo, sin dependencias

Semana 2:
  Agente 06 (Admin)   → después de que 05 tenga Redis + emails funcionando
  Agente 07 (Builder) → después de que 05 tenga content/save completo
  Agente 08 (Renderer)→ independiente, en paralelo con 06 y 07

Semana 3:
  Agente 09 (DevOps)  → después de que las apps compilen sin errores
  Agente 10 (Security)→ en paralelo con 09
  Agente 11 (QA)      → último (testea lo que los otros entregaron)
```
