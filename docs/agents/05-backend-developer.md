# Agente 05 — Backend Developer
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: Backend Developer
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como Backend Developer de EdithPress, lee docs/agents/05-backend-developer.md"

---

## Responsabilidades
- Desarrollar la API REST con NestJS (apps/api)
- Implementar autenticación JWT + refresh tokens
- Middleware de multi-tenancy
- Integración con Stripe (checkout, webhooks, portal)
- Upload de media a S3/R2
- Email transaccional (Resend)
- Rate limiting, validación de inputs, manejo de errores

## Stack
- NestJS 10+, TypeScript strict
- Prisma (via @edithpress/database)
- Passport.js (estrategias local + jwt)
- class-validator + class-transformer (DTOs)
- @aws-sdk/client-s3 (uploads)
- stripe (SDK oficial)
- resend (emails)
- ioredis (caché)
- helmet, cors, throttler (seguridad)

## Dependencias con otros agentes
- Recibe de: Architect (estructura), DB (PrismaClient, schema), Security (reglas)
- Entrega a: Frontend Admin (API), Builder (API), Renderer (API)

---

## Módulos NestJS

### Estructura de cada módulo
```
modules/{nombre}/
├── {nombre}.module.ts
├── {nombre}.controller.ts
├── {nombre}.service.ts
├── dto/
│   ├── create-{nombre}.dto.ts
│   └── update-{nombre}.dto.ts
└── {nombre}.service.spec.ts
```

### Módulos del MVP
| Módulo | Endpoints principales |
|--------|----------------------|
| `auth` | POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout |
| `users` | GET /users/me, PATCH /users/me, DELETE /users/me |
| `tenants` | POST /tenants, GET /tenants/:id, PATCH /tenants/:id |
| `sites` | CRUD /sites, POST /sites/:id/publish |
| `pages` | CRUD /sites/:siteId/pages, POST /pages/:id/publish |
| `content` | GET /pages/:id/content, PUT /pages/:id/content |
| `media` | POST /media/upload, GET /media, DELETE /media/:id |
| `templates` | GET /templates, GET /templates/:id |
| `billing` | POST /billing/checkout, POST /billing/portal, POST /billing/webhook |

---

## Convenciones de API

### Respuesta estándar
```typescript
// Éxito
{
  "data": { ... },
  "meta": { "page": 1, "total": 50 }  // solo en listas
}

// Error
{
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "El tenant no existe",
    "statusCode": 404
  }
}
```

### Headers requeridos
- `Authorization: Bearer {accessToken}` — en rutas protegidas
- `X-Tenant-ID: {tenantId}` — alternativa al slug para APIs internas

### Guards y decoradores
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TenantRole.OWNER, TenantRole.EDITOR)
@TenantScoped()  // Middleware inyecta tenantId automáticamente
```

---

## Módulo Auth — Detalle

### Flujo de login
1. POST /auth/login → valida email+password → genera accessToken (15min) + refreshToken (7d)
2. refreshToken se guarda en httpOnly cookie + Redis
3. POST /auth/refresh → valida cookie → rota ambos tokens
4. POST /auth/logout → invalida refreshToken en Redis

### Flujo de registro
1. POST /auth/register → crea User + Tenant + TenantUser(OWNER)
2. Envía email de verificación (Resend)
3. GET /auth/verify-email?token=xxx → marca emailVerified = true

---

## Módulo Billing — Stripe

### Checkout flow
```typescript
// 1. Frontend llama: POST /billing/checkout
// 2. Backend crea Stripe Checkout Session
// 3. Redirige a Stripe Checkout
// 4. Stripe redirige a /billing/success o /billing/cancel
// 5. Webhook confirma payment → activa subscripción
```

### Webhook events manejados
- `customer.subscription.created` → crear Subscription en DB
- `customer.subscription.updated` → actualizar plan/status
- `customer.subscription.deleted` → marcar cancelada
- `invoice.payment_succeeded` → crear Invoice en DB
- `invoice.payment_failed` → notificar al usuario

---

## Módulo Media — S3

### Upload flow
```typescript
// 1. Frontend pide: POST /media/upload (multipart/form-data)
// 2. Backend valida: tipo, tamaño (max 10MB), cuota del tenant
// 3. Genera key única: {tenantId}/{uuid}.{ext}
// 4. Sube a S3/R2
// 5. Crea MediaFile en DB
// 6. Retorna URL pública
```

### Tipos permitidos
- Imágenes: jpg, png, webp, gif, svg (max 10MB)
- Documentos: pdf (max 25MB)
- Videos: mp4 (max 100MB, solo plan Pro+)

---

## Checklist de Progreso

### FASE 0
- [x] Módulos planificados y documentados
- [x] Convenciones de API definidas
- [x] apps/api inicializado (NestJS CLI)
- [x] Dependencias instaladas (nest, prisma, passport, stripe, etc.)
- [x] AppModule configurado (ConfigModule, ThrottlerModule, etc.)
- [x] main.ts con Helmet, CORS, ValidationPipe global
- [x] Health check endpoint: GET /api/v1/health

### FASE 1 — MVP

### FASE 2 — v1
- [ ] Módulo domains (add, verify, DNS instructions)
- [ ] Módulo analytics (ingest events, dashboard data)
- [ ] Email templates completos (bienvenida, facturas, verificación)
- [ ] API rate limiting por plan
- [ ] Swagger/OpenAPI documentation

### FASE 3 — v2
- [ ] Módulo ecommerce (products, orders, checkout)
- [ ] API pública documentada con API keys
- [ ] Webhooks outbound para integraciones
- [ ] GraphQL layer (opcional)

---

## Variables de Entorno Necesarias
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
AWS_REGION=...
RESEND_API_KEY=...
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
```

---

## Buenas Prácticas de Backend (NestJS)

### Estructura de código
- **Un módulo = una responsabilidad**: el módulo `auth` no hace queries de `sites`
- **Servicios, no controllers**: la lógica de negocio va en el Service, nunca en el Controller
- **DTOs con validación**: todo input externo pasa por un DTO con `class-validator`. Regla: `whitelist: true, forbidNonWhitelisted: true, transform: true` en el `ValidationPipe` global
- Nunca retornar la entidad de Prisma directamente — mapear a un DTO de respuesta para evitar exponer campos sensibles (`passwordHash`, tokens internos)

### Manejo de errores
- Usar las excepciones de NestJS: `NotFoundException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`
- Nunca hacer `catch(e) {}` vacío — siempre loguear o relanzar
- Un `GlobalExceptionFilter` centraliza el formato de error `{ error: { code, message, statusCode } }`
- En producción: mensajes genéricos al cliente, detalles técnicos solo en logs

### Seguridad — obligatorio en cada endpoint
- Todo endpoint autenticado lleva `@UseGuards(JwtAuthGuard)`
- Todo endpoint que accede a datos de un tenant lleva `@UseGuards(JwtAuthGuard, TenantGuard)`
- El `TenantGuard` verifica que el recurso pertenece al `tenantId` del JWT — NUNCA confiar en parámetros de URL sin verificar
- Rate limiting: aplicar `@Throttle()` en endpoints de auth y acciones destructivas

### Async / Promises
- Toda operación async usa `async/await` — nunca callbacks ni `.then()` encadenados
- Toda Promise debe ser awaited o manejada — el linter lo fuerza (`no-floating-promises`)
- Transacciones de DB para operaciones que modifican múltiples tablas (`prisma.$transaction`)

### Testing
- Cobertura mínima: 80% en servicios
- Mockear SOLO servicios externos (Stripe, S3, Resend) — la DB usa instancia real de test
- Nomenclatura: `describe('AuthService') > it('should throw when password is wrong')`

---

## Tareas Asignadas — FASE 0 (Activa)

> Depende de: ARCH-01/02 (monorepo), DB-01/02 (Prisma), DEVOPS-01/02 (Docker + .env)

### Tarea API-01 — Inicializar apps/api con NestJS
**Prioridad**: CRÍTICA
**Criterio de Done**: `pnpm dev` en `apps/api` levanta el servidor en puerto 3001 sin errores
**Pasos**:
1. Verificar que `apps/api/package.json` tiene todas las dependencias del stack
2. Crear `apps/api/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Seguridad
  app.use(helmet())
  app.enableCors({
    origin: process.env.APP_URL,
    credentials: true,
  })

  // Validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  // Prefijo global de API
  app.setGlobalPrefix('api/v1')

  await app.listen(3001)
  console.log(`API running on http://localhost:3001/api/v1`)
}
bootstrap()
```

### Tarea API-02 — Crear AppModule base
**Prioridad**: CRÍTICA
**Criterio de Done**: AppModule carga ConfigModule, ThrottlerModule y DatabaseModule sin errores
**Archivo**: `apps/api/src/app.module.ts`
**Incluir**:
- `ConfigModule.forRoot({ isGlobal: true })` — para acceder a env vars en toda la app
- `ThrottlerModule` — rate limiting global
- Import de `DatabaseModule` (wrapper del PrismaClient de `@edithpress/database`)

### Tarea API-03 — Health check endpoint
**Prioridad**: ALTA
**Criterio de Done**: `GET /api/v1/health` retorna `{ status: "ok", timestamp: "..." }` con HTTP 200
**Por qué**: Docker healthcheck, CI smoke test, monitoreo en producción lo necesitan

### Tarea API-04 — Configurar Swagger/OpenAPI en development
**Prioridad**: MEDIA
**Criterio de Done**: `GET /api/docs` muestra la UI de Swagger solo cuando `NODE_ENV=development`
**Nota**: Deshabilitar completamente en producción (leak de información)

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-04-13
**Próxima tarea**: API-05 — Módulo auth (register, login, refresh, logout, verify-email)

---

## Sprint 03.1 — Actividades Realizadas (2026-04-24)

### BACK-SPRINT03.1-01: Módulo Newsletter
- Creado `apps/api/src/modules/newsletter/` con:
  - `newsletter.module.ts` — registra el módulo en NestJS
  - `newsletter.controller.ts` — 4 endpoints bajo `/sites/:siteId/newsletter`
  - `newsletter.service.ts` — lógica de negocio
  - `dto/newsletter.dto.ts` — SubscribeDto con @IsEmail, @Transform (lowercase+trim)

### Endpoints Implementados
- `POST /sites/:siteId/newsletter/subscribe` — público, rate limit 3/h/IP, idempotente
- `GET /sites/:siteId/newsletter/subscribers` — privado, JWT + TenantGuard, paginado
- `GET /sites/:siteId/newsletter/export` — privado, descarga CSV
- `DELETE /sites/:siteId/newsletter/unsubscribe` — público, soft delete, token base64

### BACK-SPRINT03.1-02: Registro en AppModule
- `NewsletterModule` importado y registrado en `apps/api/src/app.module.ts`
- Build de API verificado sin errores TypeScript

**Estado**: BACK actualizado a FASE 3.1
