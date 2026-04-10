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
- [ ] apps/api inicializado (NestJS CLI)
- [ ] Dependencias instaladas (nest, prisma, passport, stripe, etc.)
- [ ] AppModule configurado (ConfigModule, ThrottlerModule, etc.)
- [ ] main.ts con Helmet, CORS, ValidationPipe global
- [ ] Health check endpoint: GET /api/health

### FASE 1 — MVP
- [ ] Módulo auth completo (register, login, refresh, logout, verify-email)
- [ ] Módulo users (me, update, delete)
- [ ] Módulo tenants (create, get, update)
- [ ] Multi-tenancy middleware
- [ ] Módulo sites (CRUD + publish)
- [ ] Módulo pages (CRUD + publish + versioning)
- [ ] Módulo content (get + save page builder content)
- [ ] Módulo media (upload S3 + CRUD)
- [ ] Módulo templates (list + get)
- [ ] Módulo billing (checkout + webhook + portal)
- [ ] Tests unitarios de servicios (>80% coverage)
- [ ] Tests de integración de endpoints críticos

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

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
