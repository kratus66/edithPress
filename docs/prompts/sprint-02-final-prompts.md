# EdithPress — Prompts Sprint 02 (Final)
**Generado**: 2026-04-16 | **PM**: Agente 01

> Estado al generar este documento:
> - ✅ Completados: Agente 04 (DB), Agente 09 (DevOps base), Agente 12 (UI)
> - ✅ Completados parcialmente: Agente 10 (Security — npm audit + Helmet + CORS), Agente 11 (QA — 95 tests activos)
> - ⏳ Pendientes: Agentes 05, 06, 07, 08 (features), Agente 09 (Dockerfiles prod), Agente 10 (XSS + CSP + enum), Agente 11 (integration tests sites/pages + CI)
>
> **Instrucción**: Abrir un chat nuevo por agente, pegar el prompt completo de su sección.

---

## AGENTE 05 — Backend Developer
**Abrir chat nuevo → "Actúa como Backend Developer de EdithPress, lee docs/agents/05-backend-developer.md"**

```
Eres el Backend Developer (Agente 05) de EdithPress.
Lee docs/agents/05-backend-developer.md para tener tu contexto completo de rol, convenciones y buenas prácticas.

ESTADO ACTUAL — Lo que YA está implementado en apps/api/src/modules/:
- ✅ auth: register, login, refresh, logout, verify-email (JWT + bcrypt OK)
- ✅ sites: CRUD completo + publish/unpublish
- ✅ pages: CRUD + versioning + publish
- ✅ media: upload S3/MinIO + list + delete
- ✅ billing: Stripe checkout + customer portal (webhooks PARCIALES — ver tarea)
- ✅ renderer: endpoints públicos para ISR
- ✅ templates: GET list + GET by id
- ✅ tenants: create + get + update + stats
- ✅ users: get + update + soft-delete
- ✅ content: save (básico, SIN sanitización — la implementa Agente 10)
- ⚠️  auth: forgot-password DTO existe (apps/api/src/modules/auth/dto/forgot-password.dto.ts) pero la lógica NO está implementada
- ❌ Redis module: NO existe
- ❌ Mailer module: NO existe
- ❌ Admin module (super-admin endpoints): NO existe

TAREAS DE ESTE SPRINT (ejecutar en orden):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Redis para Revocación de Refresh Tokens
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/auth/auth.service.ts completo antes de empezar.

1. Verificar que ioredis está en package.json. Si no: cd apps/api && pnpm add ioredis
2. Crear apps/api/src/modules/redis/redis.module.ts:
   - Módulo global con un proveedor REDIS_CLIENT usando ioredis
   - Configurar con process.env.REDIS_URL
   - Exportar el cliente para inyectar en otros módulos

3. Crear apps/api/src/modules/redis/redis.service.ts con métodos:
   - set(key: string, value: string, ttlSeconds: number): Promise<void>
   - get(key: string): Promise<string | null>
   - del(key: string): Promise<void>

4. En auth.service.ts — integrar Redis en el flujo de refresh tokens:
   - Al crear refresh token: SET refresh:{userId}:{tokenId} "1" EX 604800
   - Al validar refresh: verificar en Redis PRIMERO (si no está → denegar aunque esté en PG)
   - Al rotar tokens: DEL token viejo de Redis, SET nuevo token
   - Al logout: DEL inmediatamente de Redis

5. Registrar RedisModule en AppModule.

Criterio de Done: POST /auth/logout → el token queda inválido inmediatamente (no espera expiración).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Completar Stripe Webhook Handlers
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/billing/billing.service.ts y billing.controller.ts completos.
Los eventos llegan y se parsean, pero la lógica de actualización de BD está incompleta.

Implementar handlers completos para:

1. customer.subscription.created:
   - Buscar tenant por stripeCustomerId
   - prisma.subscription.upsert() con: stripeSubscriptionId, status, planId, currentPeriodStart, currentPeriodEnd

2. customer.subscription.updated:
   - prisma.subscription.update() con: status, currentPeriodEnd, cancelAtPeriodEnd
   - Si planId cambia: actualizar también Tenant.planId

3. customer.subscription.deleted:
   - Marcar subscription.status = CANCELED (no eliminar el registro)

4. invoice.payment_succeeded:
   - prisma.invoice.upsert({ where: { stripeInvoiceId } }) con: amount, currency, status: PAID, pdfUrl

5. invoice.payment_failed:
   - Crear/actualizar Invoice con status OPEN
   - Actualizar Subscription.status = PAST_DUE

Usar console.log('[Billing Webhook]', event.type) al inicio de cada handler para trazabilidad.
Cada handler usa prisma.$transaction si modifica más de una tabla.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Módulo Mailer con Resend
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Instalar: cd apps/api && pnpm add @resend/node
2. Crear apps/api/src/modules/mailer/mailer.module.ts y mailer.service.ts

MailerService con 3 métodos:
- sendVerificationEmail(to: string, token: string): Promise<void>
  Subject: "Verifica tu cuenta en EdithPress"
  Body (HTML simple, string literal): link a {APP_URL}/verify-email?token={token}

- sendPasswordResetEmail(to: string, token: string): Promise<void>
  Subject: "Restablecer contraseña — EdithPress"
  Body: link a {APP_URL}/reset-password?token={token} (expira en 1 hora)

- sendContactFormEmail(opts: { siteOwnerEmail, fromName, fromEmail, message }): Promise<void>
  Subject: "Nuevo mensaje desde tu sitio"

Remitente: process.env.RESEND_FROM_EMAIL || "EdithPress <noreply@edithpress.com>"
Si RESEND_API_KEY no está configurado (dev local): loguear el email en consola en lugar de enviarlo.

3. Reemplazar los comentarios // TODO: send email en auth.service.ts con llamadas reales a MailerService.
4. Registrar MailerModule en AppModule.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Flujo Password Reset
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El modelo PasswordResetToken YA EXISTE en el schema (lo agregó el Agente 04).
Verificar que la migración se aplicó: cd packages/database && pnpm prisma migrate status

En auth.service.ts implementar:
- forgotPassword(email: string): Promise<void>
  1. Buscar user por email (si no existe → retornar sin error, misma respuesta siempre)
  2. Generar token: crypto.randomBytes(32).toString('hex')
  3. Hashear con SHA-256: crypto.createHash('sha256').update(token).digest('hex')
  4. Guardar en BD: PasswordResetToken { userId, tokenHash, expiresAt: Date.now() + 3600000 }
  5. Enviar email vía MailerService.sendPasswordResetEmail(email, token)
  6. Siempre retornar el MISMO mensaje independientemente de si el email existe:
     { message: 'Si el email está registrado, recibirás instrucciones por correo' }

- resetPassword(token: string, newPassword: string): Promise<void>
  1. Hashear token recibido (SHA-256)
  2. Buscar PasswordResetToken por tokenHash donde usedAt IS NULL y expiresAt > now
  3. Si no existe → throw UnauthorizedException('Token inválido o expirado')
  4. Actualizar User.passwordHash con bcrypt.hash(newPassword, 12)
  5. Marcar PasswordResetToken.usedAt = new Date()

En auth.controller.ts agregar los endpoints:
- POST /auth/forgot-password (público, DTO: ForgotPasswordDto con email)
- POST /auth/reset-password (público, DTO: ResetPasswordDto con token + password)

ForgotPasswordDto ya existe en apps/api/src/modules/auth/dto/forgot-password.dto.ts — revisar y completar.
Crear ResetPasswordDto con: token (string, IsNotEmpty), password (string, MinLength(8), Matches(/regex/)).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Módulo Super Admin
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/api/src/modules/admin/ con:

admin.guard.ts — verifica que req.user sea super-admin:
  Si el User tiene un TenantUser con role OWNER en un tenant con slug === 'super-admin'
  (o alternativamente: agregar campo isAdmin: Boolean en User y verificarlo)

admin.module.ts, admin.controller.ts (prefijo /admin), admin.service.ts

Endpoints (todos con @UseGuards(JwtAuthGuard, SuperAdminGuard)):
- GET /admin/stats
  Response: { totalTenants, newThisWeek, activeSites, mrr }
  mrr = suma de Plan.priceMonthly de todas las Subscription con status ACTIVE

- GET /admin/tenants?page=1&limit=20&search=&status=
  Response paginado: { data: [{ id, name, slug, plan, isActive, siteCount, createdAt }], total }

- GET /admin/tenants/:id
  Response: tenant completo con sites + users + subscription

- PATCH /admin/tenants/:id/status
  Body: { isActive: boolean }
  Actualiza Tenant.isActive

- GET /admin/plans
  Response: planes con tenant count activo por plan

Registrar AdminModule en AppModule.

RESTRICCIONES:
- No romper ningún endpoint existente
- Toda operación multi-tabla usa prisma.$transaction
- Sin errores de TypeScript strict
- Al terminar: cd apps/api && pnpm build
```

---

## AGENTE 06 — Frontend Admin
**Abrir chat nuevo → "Actúa como Frontend Admin Developer de EdithPress, lee docs/agents/06-frontend-admin.md"**

```
Eres el Frontend Admin Developer (Agente 06) de EdithPress.
Lee docs/agents/06-frontend-admin.md para tu contexto completo.

ESTADO ACTUAL — apps/admin/src/:
- ✅ (auth)/login — formulario funcional con Zod + API call
- ✅ (auth)/register — funcional
- ✅ (auth)/verify-email — funcional
- ✅ (tenant)/dashboard — KPIs + listado de sitios
- ✅ (tenant)/sites — grid + create + detail + settings + pages list
- ✅ (tenant)/billing — plan actual + upgrade + portal Stripe
- ✅ apps/admin/next.config.js — tiene security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- ⚠️  (tenant)/media — página existe pero sin upload UI real
- ⚠️  (super-admin)/dashboard, /tenants, /plans — existen pero con datos mock/skeleton
- ❌ middleware.ts — NO EXISTE — rutas (tenant)/* NO están protegidas
- ❌ (auth)/forgot-password — NO EXISTE
- ❌ (auth)/reset-password — NO EXISTE

TAREAS DE ESTE SPRINT (en orden de prioridad):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Middleware de Autenticación (BLOQUEANTE DE SEGURIDAD)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee primero: todos los archivos de apps/admin/src/lib/ y apps/admin/src/hooks/ para
entender cómo se maneja el token actualmente.

El objetivo es proteger todas las rutas del tenant y super-admin con un middleware de Next.js.
El problema: Next.js middleware no puede leer localStorage, necesita cookies.

PASO 1 — API Route para gestión de sesión:
Crear apps/admin/src/app/api/auth/session/route.ts:
- POST: recibe { accessToken, refreshToken } en body
  → setea cookie httpOnly "access_token" (maxAge: 900) y "refresh_token" (maxAge: 604800)
  → sameSite: 'lax', secure: process.env.NODE_ENV === 'production'
- DELETE: limpia ambas cookies (para logout)

PASO 2 — Actualizar el hook/función de login:
Después de recibir los tokens del backend, llamar inmediatamente a:
  fetch('/api/auth/session', { method: 'POST', body: JSON.stringify({ accessToken, refreshToken }) })
Eliminar cualquier localStorage.setItem de tokens.

PASO 3 — Crear apps/admin/src/middleware.ts:
```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/sites') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/media') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/templates') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/domains') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/super-admin')

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|_next/data).*)'],
}
```

PASO 4 — Actualizar el cliente HTTP (api-client.ts):
El browser envía cookies httpOnly automáticamente al mismo origen (Next.js API routes).
Para llamadas a la API externa (puerto 3001), el token debe ir en el header Authorization.
Leer el token: en Client Components usar un endpoint GET /api/auth/session que retorne
el accessToken decodificado (sin el valor real de la cookie, solo el payload del JWT).

PASO 5 — Actualizar logout:
Llamar DELETE /api/auth/session + redirect a /login.

Criterio de Done: Navegar a /dashboard sin sesión → redirige a /login.
Después de login → /dashboard funciona. Logout → /login.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Páginas de Password Reset
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/admin/src/app/(auth)/forgot-password/page.tsx:
- Formulario: campo email + botón "Enviar enlace"
- POST /api/v1/auth/forgot-password con { email }
- Siempre mostrar mensaje de éxito tras submit:
  "Si el email está registrado, recibirás un enlace para restablecer tu contraseña."
- Link "← Volver al login"

Crear apps/admin/src/app/(auth)/reset-password/page.tsx:
- Leer ?token= de la URL (useSearchParams)
- Si no hay token: mostrar error "Enlace inválido" + link a /forgot-password
- Formulario: nueva contraseña + confirmar contraseña (Zod: min 8 chars, deben coincidir)
- POST /api/v1/auth/reset-password con { token, password }
- En éxito: redirect a /login con query ?reset=true
- En /login: si reset=true → mostrar toast/alert "Contraseña actualizada correctamente"

Agregar en apps/admin/src/app/(auth)/login/page.tsx:
- Link "¿Olvidaste tu contraseña?" → /forgot-password (abajo del botón de login)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Media Library Funcional
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/admin/src/app/(tenant)/media/page.tsx primero.

Implementar MediaLibrary completa en esa página:

1. Zona de upload (drag-and-drop):
   - Usar react-dropzone (instalar si no está: pnpm add react-dropzone)
   - Área visible permanente con borde punteado: "Arrastra archivos aquí o click para seleccionar"
   - Tipos aceptados: image/*, application/pdf
   - Al soltar archivos: mostrar progreso de upload (barra de progreso o spinner por archivo)
   - POST /api/v1/media/upload con FormData (campo "file")
   - Toast de éxito o error al terminar cada upload
   - Refrescar la grid automáticamente tras upload exitoso

2. Grid de archivos:
   - GET /api/v1/media?page=1&limit=24
   - Cards de 150x150: thumbnail para imágenes, ícono PDF para documentos
   - Nombre del archivo truncado + tamaño en KB/MB
   - Hover: mostrar botones "Copiar URL" y "Eliminar"

3. Acciones:
   - Copiar URL: navigator.clipboard.writeText(file.url) + Toast "URL copiada"
   - Eliminar: Modal de confirmación → DELETE /api/v1/media/:id → refrescar grid

4. Filtros (tabs simples):
   - Todos / Imágenes / Documentos

5. Paginación básica: Anterior / Siguiente

Si los componentes Toast o Modal no están en @edithpress/ui todavía,
implementarlos inline con Tailwind en esta página (no bloquear esperando al Agente 12).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Super Admin Dashboard con Datos Reales
Prioridad: MEDIA (depende de que Agente 05 entregue los endpoints /admin/*)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTA: Los endpoints GET /api/v1/admin/* serán implementados por Agente 05.
Si no están listos aún, dejar datos mock con comentario // TODO: conectar a /admin/*

Implementar en las páginas existentes de super-admin:

/super-admin/dashboard:
- 4 KPI cards: Total Tenants, Nuevos esta semana, MRR ($), Sitios publicados
- Tabla de últimos 5 tenants registrados (nombre, plan, fecha)
- Datos: GET /api/v1/admin/stats + GET /api/v1/admin/tenants?limit=5&sort=createdAt

/super-admin/tenants:
- Tabla con columnas: Nombre, Plan, Estado (Badge activo/suspendido), Sites, Creado, Acciones
- Acción "Suspender/Activar" → PATCH /api/v1/admin/tenants/:id/status + confirm modal
- Búsqueda en tiempo real (debounce 300ms)
- Paginación: GET /api/v1/admin/tenants?page=X&search=Y

/super-admin/plans:
- Tabla: Plan, Precio/mes, Precio/año, Max Sites, Max Páginas, Tenants activos
- Datos: GET /api/v1/admin/plans

RESTRICCIONES:
- Server Components por defecto; 'use client' solo cuando sea necesario
- React Query para data fetching en Client Components
- next/image para todas las imágenes (no <img>)
- next/link para toda la navegación interna
- Al terminar: cd apps/admin && pnpm build
```

---

## AGENTE 07 — Frontend Builder
**Abrir chat nuevo → "Actúa como Frontend Builder Developer de EdithPress, lee docs/agents/07-frontend-builder.md"**

```
Eres el Frontend Builder Developer (Agente 07) de EdithPress.
Lee docs/agents/07-frontend-builder.md para tu contexto completo.

ESTADO ACTUAL — apps/builder/src/:
- ✅ Editor Puck funcionando en /builder/[siteId]/[pageId]
- ✅ 8 bloques implementados: HeroBlock, TextBlock, ImageBlock, ButtonBlock,
     SeparatorBlock, GalleryBlock, ContactFormBlock, CardGridBlock
- ✅ Carga y guardado manual de contenido
- ✅ Toolbar básica visible
- ✅ apps/builder/next.config.js tiene security headers
- ❌ Autosave NO implementado
- ❌ Preview en iframe NO implementado
- ❌ Indicador de estado de guardado NO existe
- ❌ Botón Publicar puede estar incompleto

Lee TODOS los archivos del editor antes de empezar para entender la estructura actual.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Autosave con Indicador de Estado
Prioridad: CRÍTICA (pérdida de datos si no se implementa)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/hooks/useAutosave.ts:

```typescript
type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

interface UseAutosaveOptions {
  pageId: string
  data: any          // el objeto data que devuelve Puck (content JSON)
  onSave: (data: any) => Promise<void>
  debounceMs?: number  // default: 3000
}

interface UseAutosaveReturn {
  status: SaveStatus
  lastSaved: Date | null
  saveNow: () => Promise<void>
}
```

Lógica interna:
- Cuando data cambia → status = 'unsaved'
- Después de debounceMs sin cambios → llamar onSave(data)
  - Durante: status = 'saving'
  - Éxito: status = 'saved', lastSaved = new Date()
  - Error: status = 'error' (mostrar en toolbar), reintentar 1 vez tras 5s
- Guardado periódico: cada 30s si status === 'unsaved'
- beforeunload: guardar sincrónicamente si hay cambios pendientes

Integrar en el componente del editor:
- Pasar el data de Puck al hook (via onChange del Puck editor)
- La función onSave llama PUT /api/v1/pages/{pageId}/content con { content: data }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Toolbar Mejorada
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee el componente de toolbar existente y mejóralo (no reescribir desde cero).

Layout de la toolbar (3 zonas):
┌─────────────────────────────────────────────────────────────┐
│ [← Volver]  [Indicador estado]  │  [Nombre página]  │  [Vista previa] [Guardar] [Publicar] │
└─────────────────────────────────────────────────────────────┘

Zona izquierda — Indicador de estado (conectado al useAutosave):
- 'saved'   → "✓ Guardado" (texto gris)
- 'saving'  → spinner + "Guardando..."
- 'unsaved' → "● Cambios sin guardar" (punto naranja)
- 'error'   → "✗ Error al guardar — Reintentar" (rojo, clic llama saveNow())

Zona centro — Nombre de la página:
- Mostrar el título de la página como texto clickeable
- Al hacer clic: input inline que reemplaza el texto
- Enter o blur → PATCH /api/v1/sites/{siteId}/pages/{pageId} con { title }
- Badge junto al nombre: "BORRADOR" (gris) o "PUBLICADA" (verde) según el status de la página

Zona derecha — Acciones:
- Botón "Vista previa" → abre panel de preview (ver Tarea 3)
- Botón "Guardar borrador" (outline) → llama saveNow()
- Botón "Publicar" (primary) → modal de confirmación → POST /api/v1/sites/{siteId}/pages/{pageId}/publish
  → En éxito: badge cambia a PUBLICADA + toast "Página publicada"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Preview en Iframe
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Implementar panel de preview como un Drawer/Sidebar lateral (50% ancho):

Activación: botón "Vista previa" en toolbar abre/cierra el drawer
El drawer tiene:
- Header: "Vista previa" | toggle [💻 Desktop] [📱 Mobile] | botón "↗ Nueva pestaña" | botón X
- Iframe con src apuntando al renderer:
  {NEXT_PUBLIC_RENDERER_URL}/{pageSlug}
  (el renderer ya soporta Draft Mode para mostrar contenido en borrador)

Toggle Desktop/Mobile:
- Desktop: iframe a 100% del panel
- Mobile: iframe a 390px centrado con fondo gris oscuro alrededor

Botón "Nueva pestaña":
  window.open(`${NEXT_PUBLIC_RENDERER_URL}/${pageSlug}`, '_blank')

Nota: NEXT_PUBLIC_RENDERER_URL debe estar en las variables de entorno.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Verificar Campos de Bloques en Puck Config
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee el puck-config.ts (o donde estén definidos los componentes de Puck).
Para cada bloque, verificar que los fields estén completos.

Si ya están completos: NO cambiar nada.
Si faltan fields: agregar SOLO los faltantes (no cambiar nombres de props existentes
— romper los nombres rompe los sitios ya publicados).

Campos mínimos esperados:
- HeroBlock: title, subtitle, ctaText, ctaUrl, backgroundImage, backgroundColor
- TextBlock: content (textarea para HTML)
- ImageBlock: src, alt, caption
- ButtonBlock: label, url, variant (select: primary/secondary/outline)
- GalleryBlock: images (array: src+alt), columns (select: 2/3/4)
- ContactFormBlock: title, submitLabel
- CardGridBlock: cards (array: title+description+imageUrl+link), columns (select: 1/2/3)
- SeparatorBlock: style (select: solid/dashed/dotted), color, margin

RESTRICCIONES:
- No cambiar el schema JSON del contenido (compatibilidad con renderer y páginas publicadas)
- Al terminar: cd apps/builder && pnpm build
```

---

## AGENTE 08 — Frontend Renderer
**Abrir chat nuevo → "Actúa como Frontend Renderer Developer de EdithPress, lee docs/agents/08-frontend-renderer.md"**

```
Eres el Frontend Renderer Developer (Agente 08) de EdithPress.
Lee docs/agents/08-frontend-renderer.md para tu contexto completo.

ESTADO ACTUAL — apps/renderer/src/:
- ✅ Routing dinámico catch-all /[[...slug]] funcionando
- ✅ ISR con revalidate=3600
- ✅ Draft Mode para previews del builder
- ✅ BlockRenderer con 8 bloques renderizando
- ✅ Metadata dinámica (title, description)
- ✅ Navegación sticky entre páginas del sitio
- ✅ Middleware de tenant (subdominio → header X-Tenant-Slug)
- ✅ apps/renderer/next.config.js tiene security headers + remotePatterns configurados
- ❌ <img> en bloques — NO usa next/image todavía
- ❌ sitemap.ts — NO EXISTE
- ❌ robots.ts — NO EXISTE
- ❌ OG image (og:image) incompleto en generateMetadata
- ❌ not-found.tsx y error.tsx — NO EXISTEN (o son genéricos de Next.js)

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Reemplazar <img> por next/image en todos los bloques
Prioridad: ALTA (impacto directo en LCP y Core Web Vitals)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee todos los archivos de bloques en apps/renderer/src/.

Reemplazar cada <img> con <Image> de next/image:
- HeroBlock (imagen de fondo): usar <Image fill priority alt="" />
  con style={{ objectFit: 'cover' }} en el contenedor relativo
- ImageBlock: <Image width={800} height={600} alt={alt || ''} />
- GalleryBlock: <Image width={400} height={300} alt={img.alt || ''} /> por imagen
- CardGridBlock: <Image width={400} height={250} alt={card.title} /> por tarjeta

Lee apps/renderer/next.config.js para verificar que remotePatterns ya incluye
los dominios de MinIO local y S3 en producción.
Si faltan patrones: agregar para localhost:9000 y *.amazonaws.com.

Asegurarse de que cada <Image> tiene width, height o fill para evitar CLS.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Sitemap Dinámico
Prioridad: ALTA (crítico para SEO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/renderer/src/app/sitemap.ts:

```typescript
import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = headers()
  const host = headersList.get('host') || ''
  const tenantSlug = host.split('.')[0]

  try {
    const res = await fetch(
      `${process.env.API_URL}/api/v1/renderer/tenant/${tenantSlug}/pages`,
      { next: { revalidate: 3600 } }
    )
    const pages = await res.json()

    return pages.map((page: any) => ({
      url: `https://${host}/${page.slug === '/' ? '' : page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: page.isHomepage ? 'daily' : 'weekly',
      priority: page.isHomepage ? 1.0 : 0.8,
    }))
  } catch {
    return []
  }
}
```

NOTA: Verificar qué endpoint del renderer devuelve la lista de páginas publicadas de un tenant.
Lee apps/api/src/modules/renderer/renderer.controller.ts para saber qué endpoints existen.
Si no existe un endpoint de listado de páginas: usar el endpoint del sitio que devuelve la nav
y construir el sitemap con las páginas de la navegación.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Robots.txt Dinámico
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/renderer/src/app/robots.ts:

```typescript
import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = headers()
  const host = headersList.get('host') || ''
  const tenantSlug = host.split('.')[0]

  let isPublished = true
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/v1/renderer/tenant/${tenantSlug}`,
      { next: { revalidate: 3600 } }
    )
    const site = await res.json()
    isPublished = site?.isPublished ?? true
  } catch {}

  return {
    rules: isPublished
      ? [{ userAgent: '*', allow: '/' }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: `https://${host}/sitemap.xml`,
  }
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Meta Tags OG Completos
Prioridad: ALTA (redes sociales y compartir)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee cómo se genera el metadata en la página principal (generateMetadata).

Mejorar para incluir:
- og:image: extraer la primera imagen del contenido de la página
  (buscar el primer bloque con backgroundImage o src prop)
  Si no hay imagen: usar site.faviconUrl como fallback
- og:type: 'website' para homepage, 'article' para otras páginas
- twitter:card: 'summary_large_image'
- alternates.canonical: URL completa con el dominio correcto

Función helper extractFirstImage(blocks: any[]): string | null:
  Iterar bloques en orden: HeroBlock → ImageBlock → GalleryBlock → CardGridBlock
  Retornar la primera URL de imagen encontrada en props

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Páginas de Error por Tenant
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/renderer/src/app/not-found.tsx:
- Leer el tenant del host para mostrar el nombre del sitio si está disponible
- Mensaje claro: "Página no encontrada"
- Botón "Ir al inicio" → href="/"
- Estilo mínimo con Tailwind (centrado, sans-serif)

Crear apps/renderer/src/app/error.tsx (error boundary de Next.js):
```typescript
'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1>Algo salió mal</h1>
      <button onClick={reset}>Intentar de nuevo</button>
    </div>
  )
}
```

RESTRICCIONES:
- No cambiar el middleware de tenant detection
- No cambiar el formato JSON de los bloques (compatibilidad con builder)
- Mantener Draft Mode funcionando
- Al terminar: cd apps/renderer && pnpm build
```

---

## AGENTE 09 — DevOps Engineer
**Abrir chat nuevo → "Actúa como DevOps Engineer de EdithPress, lee docs/agents/09-devops-engineer.md"**

```
Eres el DevOps Engineer (Agente 09) de EdithPress.
Lee docs/agents/09-devops-engineer.md para tu contexto completo.

ESTADO ACTUAL:
- ✅ docker-compose.yml con Postgres + Redis + MinIO + Mailpit funcionando
- ✅ .env.example base existe en la raíz
- ✅ GitHub Actions CI con lint + typecheck (parcial)
- ✅ setup.sh básico existe
- ❌ .env.example NO tiene todas las variables nuevas (Resend, RENDERER_SECRET, etc.)
- ❌ Dockerfiles de producción NO existen para ninguna app
- ❌ docker-compose.prod.yml NO existe
- ❌ Documentación de wildcard DNS local NO existe

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — .env.example Actualizado y Completo
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee el .env.example actual. Lee los archivos .env o el código de cada app para identificar
todas las variables que se usan.

Actualizar .env.example con TODAS las variables del proyecto:

# ========================
# BASE DE DATOS
# ========================
DATABASE_URL=postgresql://edithpress:devpassword123@localhost:5432/edithpress_dev

# ========================
# REDIS
# ========================
REDIS_URL=redis://localhost:6379

# ========================
# JWT
# ========================
JWT_SECRET=CHANGE_ME_generate_with_openssl_rand_hex_64
JWT_REFRESH_SECRET=CHANGE_ME_different_secret_openssl_rand_hex_64

# ========================
# URLS DE APPS
# ========================
APP_URL=http://localhost:3010
API_URL=http://localhost:3011
NEXT_PUBLIC_API_URL=http://localhost:3011
BUILDER_URL=http://localhost:3002
RENDERER_URL=http://localhost:3003
NEXT_PUBLIC_RENDERER_URL=http://localhost:3003

# ========================
# MINIO / S3
# ========================
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio_dev
S3_SECRET_KEY=minio_dev_password
S3_BUCKET_NAME=edithpress-media
S3_REGION=us-east-1
NEXT_PUBLIC_CDN_URL=http://localhost:9000/edithpress-media

# ========================
# STRIPE
# ========================
STRIPE_SECRET_KEY=sk_test_CHANGE_ME
STRIPE_WEBHOOK_SECRET=whsec_CHANGE_ME
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_CHANGE_ME

# ========================
# RESEND (emails)
# ========================
RESEND_API_KEY=re_CHANGE_ME
RESEND_FROM_EMAIL=EdithPress <noreply@edithpress.com>

# ========================
# INTERNO
# ========================
RENDERER_SECRET=CHANGE_ME_internal_secret_for_renderer_calls
NEXTAUTH_SECRET=CHANGE_ME_nextauth_secret

Marcar con comentario # REQUIRED cuáles son obligatorias para que el proyecto corra.
Marcar con # OPTIONAL las que tienen fallback o son para producción únicamente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Dockerfiles Multi-Stage para las 4 Apps
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El contexto de build SIEMPRE es la raíz del monorepo (para acceder a packages/).
Cada Dockerfile usa multi-stage: stage "builder" + stage "runner".

apps/api/Dockerfile (NestJS):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile
COPY apps/api/ ./apps/api/
RUN cd packages/database && pnpm prisma generate
RUN cd apps/api && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
EXPOSE 3011
CMD ["node", "apps/api/dist/main"]
```

apps/admin/Dockerfile (Next.js standalone):
Antes de crear: verificar que apps/admin/next.config.js tiene `output: 'standalone'`.
Si no lo tiene: agregarlo.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/admin/package.json ./apps/admin/
RUN pnpm install --frozen-lockfile
COPY apps/admin/ ./apps/admin/
RUN cd apps/admin && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public
EXPOSE 3010
CMD ["node", "apps/admin/server.js"]
```

Crear Dockerfiles similares para apps/builder (puerto 3002) y apps/renderer (puerto 3003).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — docker-compose.prod.yml
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear docker-compose.prod.yml en la raíz con:
- Servicios: api, admin, builder, renderer (usando sus Dockerfiles)
- Servicio nginx (nginx:alpine) como reverse proxy
- Variables de entorno desde .env (no hardcodeadas)
- Sin volúmenes de dev (ni bind mounts)
- Healthchecks en cada servicio
- Red interna (bridge) para comunicación entre servicios

Crear infrastructure/nginx/nginx.prod.conf con:
- Upstream para cada app
- Virtual hosts: admin.edithpress.com, api.edithpress.com, builder.edithpress.com
- Wildcard: *.edithpress.com → renderer (con header X-Tenant-Slug extraído del subdominio)
- Catch-all: custom domains → renderer (con header X-Tenant-Domain)
- proxy_set_header X-Real-IP $remote_addr en todas las reglas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — GitHub Actions CI Completo
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee .github/workflows/ para ver qué existe. Actualizar o crear ci.yml:

```yaml
name: CI
on:
  push: { branches: [main, develop] }
  pull_request: { branches: [main] }

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:generate
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint-typecheck
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_DB: test, POSTGRES_USER: test, POSTGRES_PASSWORD: test }
        ports: ['5432:5432']
        options: --health-cmd pg_isready --health-interval 10s --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:generate && pnpm db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret-min-32-chars-xxxxxxxxxx
          JWT_REFRESH_SECRET: test-refresh-secret-32-chars-xxxxx
```

RESTRICCIONES:
- No hacer push a ningún registry sin confirmación del usuario
- No incluir secretos reales en ningún archivo
- Los Dockerfiles deben funcionar con `docker build -f apps/api/Dockerfile .` desde la raíz
```

---

## AGENTE 10 — Security Engineer
**Abrir chat nuevo → "Actúa como Security Engineer de EdithPress, lee docs/agents/10-security-engineer.md"**

```
Eres el Security Engineer (Agente 10) de EdithPress.
Lee docs/agents/10-security-engineer.md para tu contexto completo.

ESTADO ACTUAL — Seguridad implementada:
- ✅ Helmet.js configurado con headers de seguridad
- ✅ JWT (15min access + 7d refresh) + bcrypt 12 rounds
- ✅ TenantGuard (previene IDOR), RolesGuard (RBAC)
- ✅ Rate limiting: 100/min global, 5/min en login
- ✅ Validación DTOs con whitelist + forbidNonWhitelisted
- ✅ CORS restringido a APP_URL
- ✅ npm audit: 30→15 vulnerabilidades (justificadas en docs/security-checklist.md)
- ✅ apps/admin/next.config.js: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- ✅ apps/builder/next.config.js: mismos security headers
- ✅ apps/renderer/next.config.js: security headers + remotePatterns
- ✅ apps/api/src/main.ts: actualizado este sprint (verificar qué cambió)
- ✅ apps/api/src/modules/content/content.service.ts: modificado este sprint (verificar si DOMPurify ya está)
- ✅ apps/api/src/modules/auth/dto/forgot-password.dto.ts: creado este sprint

Lee TODOS los archivos modificados antes de empezar para no duplicar trabajo.

TAREAS DE ESTE SPRINT (verificar primero si ya están implementadas):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Sanitización XSS en Contenido del Builder
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/content/content.service.ts completo.

Si DOMPurify YA ESTÁ implementado: verificar que cubre todos los casos y documentar.
Si NO está implementado:

1. Instalar: cd apps/api && pnpm add dompurify jsdom && pnpm add -D @types/dompurify @types/jsdom

2. Crear apps/api/src/common/utils/sanitize.ts:
```typescript
import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'

const window = new JSDOM('').window
const purify = DOMPurify(window as any)

const ALLOWED_HTML_TAGS = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote']
const ALLOWED_HTML_ATTR = ['href', 'target', 'rel']

export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ALLOWED_HTML_TAGS,
    ALLOWED_ATTR: ALLOWED_HTML_ATTR,
  })
}

export function sanitizeBlockContent(blocks: any[]): any[] {
  if (!Array.isArray(blocks)) return blocks
  return blocks.map(block => {
    if (block.type === 'TextBlock' && block.props?.content) {
      return { ...block, props: { ...block.props, content: sanitizeHtml(block.props.content) } }
    }
    return block
  })
}
```

3. En content.service.ts, antes de prisma.page.update():
   ```typescript
   import { sanitizeBlockContent } from '../../common/utils/sanitize'
   // ...
   const sanitizedContent = sanitizeBlockContent(content)
   await prisma.page.update({ data: { content: sanitizedContent } })
   ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Protección de Enumeración en Auth
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/auth/auth.service.ts completo.

Verificar/implementar en el método forgotPassword():
- SIEMPRE retornar el mismo mensaje, sin importar si el email existe:
  { message: 'Si el email está registrado, recibirás instrucciones por correo' }
- El envío del email NO debe ser awaited (fire-and-forget):
  this.mailerService.sendPasswordResetEmail(email, token).catch(() => {})
  Esto asegura tiempos de respuesta iguales para emails existentes y no existentes

Verificar en login() que el mensaje de error NO distingue entre:
- "Email no registrado" → debe ser "Credenciales inválidas"
- "Contraseña incorrecta" → debe ser "Credenciales inválidas"
Ambos casos deben retornar exactamente el mismo mensaje y código de error.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Content Security Policy Completo
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/main.ts completo.

Si CSP ya está configurado más allá de los defaults de Helmet: documentar y verificar.
Si NO está configurado:

En main.ts, actualizar la configuración de helmet():
```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:9000'],
        connectSrc: ["'self'", process.env.APP_URL || 'http://localhost:3010'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
)
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Auditoría de Seguridad del Módulo Auth
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leer apps/api/src/modules/auth/ completo (controller, service, guards, constants).

Verificar contra el security checklist (docs/security-checklist.md):
1. ✓/✗ bcrypt rounds = 12
2. ✓/✗ JWT secret mínimo 32 chars (validado en arranque)
3. ✓/✗ Refresh token en httpOnly cookie (no en body de respuesta)
4. ✓/✗ Rate limiting en /auth/login y /auth/register
5. ✓/✗ Mensajes de error genéricos (no revelan si el email existe)
6. ✓/✗ Tokens de verificación de email son opacos (no JWT)
7. ✓/✗ Token de reset de password tiene expiración y se invalida tras uso

Para cada punto que falle: implementar el fix.
Documentar el resultado en docs/security-audit-sprint02.md (actualizar si ya existe).

RESTRICCIONES:
- No degradar funcionalidad para añadir seguridad
- Los cambios en Helmet/CSP deben probarse — un CSP muy restrictivo rompe Next.js
- Documentar cada decisión con su justificación
- Al terminar: cd apps/api && pnpm build
```

---

## AGENTE 11 — QA Testing Engineer
**Abrir chat nuevo → "Actúa como QA Testing Engineer de EdithPress, lee docs/agents/11-qa-testing.md"**

```
Eres el QA Testing Engineer (Agente 11) de EdithPress.
Lee docs/agents/11-qa-testing.md para tu contexto completo.

ESTADO ACTUAL — Tests implementados:
- ✅ auth.service.spec.ts — 17 unit tests (login, register, refresh, logout)
- ✅ sites.service.spec.ts — 15 unit tests
- ✅ pages.service.spec.ts — 21 unit tests
- ✅ tenants.service.spec.ts — 12 unit tests
- ✅ billing.service.spec.ts — 13 unit tests (handleWebhook, createCheckoutSession)
- ✅ auth.e2e-spec.ts — 17 tests E2E (register/login/refresh/logout)
- ✅ e2e/tenant-isolation.e2e.spec.ts — 6 tests E2E
- ✅ apps/api/test/smoke.test.ts — smoke tests
- ✅ Total: ~95 tests activos
- ❌ Integration tests de sites y pages endpoints — NO existen
- ❌ E2E: Flujo 1 (registro → primer sitio) — NO existe
- ❌ CI pipeline con tests automáticos en GitHub Actions — NO existe

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Integration Tests: Endpoints de Sites
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/sites/sites.controller.ts y sites.service.ts completos.
Lee apps/api/test/auth.e2e-spec.ts para entender el patrón de tests de integración.

Crear apps/api/test/sites.e2e-spec.ts:

Setup: usar supertest + la app de NestJS levantada en memoria con una DB de test.
Antes de cada test: crear un tenant + user autenticado (helper de auth reutilizable).

Casos:
```typescript
describe('Sites API', () => {
  describe('GET /api/v1/sites', () => {
    it('200 — returns sites of authenticated tenant only')
    it('401 — unauthenticated request returns 401')
  })

  describe('POST /api/v1/sites', () => {
    it('201 — creates site with correct tenantId from JWT')
    it('400 — missing required fields returns 400')
    it('401 — unauthenticated returns 401')
  })

  describe('GET /api/v1/sites/:id', () => {
    it('200 — returns site that belongs to tenant')
    it('404 — returns 404 for non-existent site')
    it('403 or 404 — returns error for site of another tenant')  // tenant isolation
  })

  describe('PATCH /api/v1/sites/:id', () => {
    it('200 — updates site successfully')
    it('403 or 404 — cannot update site of another tenant')
  })

  describe('DELETE /api/v1/sites/:id', () => {
    it('200 — deletes own site')
    it('403 or 404 — cannot delete site of another tenant')
  })

  describe('POST /api/v1/sites/:id/publish', () => {
    it('200 — publishes site (isPublished becomes true)')
    it('403 or 404 — cannot publish site of another tenant')
  })
})
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Integration Tests: Endpoints de Pages
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/pages/pages.controller.ts y pages.service.ts.

Crear apps/api/test/pages.e2e-spec.ts:

Casos:
```typescript
describe('Pages API', () => {
  describe('GET /api/v1/sites/:siteId/pages', () => {
    it('200 — returns pages of own site')
    it('403 or 404 — cannot list pages of another tenant site')
  })

  describe('POST /api/v1/sites/:siteId/pages', () => {
    it('201 — creates page in own site')
    it('403 or 404 — cannot create page in another tenant site')
    it('409 — duplicate slug in same site returns conflict')
  })

  describe('POST /api/v1/pages/:pageId/publish', () => {
    it('200 — publishes page (status PUBLISHED)')
    it('creates a PageVersion before publishing')
  })
})
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — CI Pipeline con Tests
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee .github/workflows/ para ver qué existe actualmente.

Verificar que el job de tests en ci.yml está configurado con:
- Servicio de Postgres (postgres:16-alpine) con healthcheck
- Servicio de Redis (redis:7-alpine) con healthcheck
- Variables de entorno: DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET
- Pasos: pnpm install → pnpm db:generate → pnpm db:migrate → pnpm test

Si el CI no tiene estos servicios configurados: actualizar ci.yml.
Coordinar con Agente 09 (DevOps) si el archivo ci.yml ya tiene su estructura base.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Verificar Cobertura Actual
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Correr: cd apps/api && pnpm test --coverage

Revisar el reporte de cobertura y actualizar docs/agents/11-qa-testing.md con:
- % de cobertura actual por módulo (auth, sites, pages, billing, tenants)
- Módulos por debajo del 70% que necesitan tests adicionales
- Lista de casos edge no cubiertos

Si algún módulo está por debajo del 60%: agregar los tests unitarios faltantes antes
de pasar a las tareas de integración.

RESTRICCIONES:
- Tests deterministas: cada test limpia sus datos (beforeEach/afterEach)
- Tests de integración usan DB de test real (no mocks de Prisma)
- No mockear Redis en tests de integración — usar instancia real
- Al terminar: cd apps/api && pnpm test (todos deben pasar en verde)
```

---

## Orden de Ejecución

```
PARALELO (sin dependencias entre sí):
  → Agente 10 (Security)   — fixes de seguridad son independientes
  → Agente 07 (Builder)    — autosave/preview son independientes
  → Agente 08 (Renderer)   — SEO/next/image son independientes
  → Agente 09 (DevOps)     — .env.example + Dockerfiles son independientes

CON DEPENDENCIAS (esperar que Agente 05 termine primero):
  → Agente 05 (Backend)    — Redis + webhooks + Resend + password reset + admin
  → Agente 06 (Admin)      — después de 05 para: media, password reset pages, super-admin

ÚLTIMO:
  → Agente 11 (QA)         — integration tests sites/pages + CI
```
