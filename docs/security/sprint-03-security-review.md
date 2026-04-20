# Sprint 03 — Security Review

## Custom Domains

- [x] Tenant isolation en endpoints CRUD — **PASS**
  `addDomain`, `getDomain`, `verifyDomain`, `removeDomain` realizan `db.site.findFirst({ where: { id: siteId, tenantId } })` antes de operar. El `tenantId` proviene del JWT via `@CurrentUser()`, nunca del body. Adicionalmente todos los endpoints están protegidos con `@UseGuards(JwtAuthGuard, TenantGuard)`.

- [x] DNS Takeover prevention — **PASS**
  El schema Prisma define `domain String @unique` (línea 274 de schema.prisma). El servicio hace `findUnique({ where: { domain } })` antes de crear y lanza `ConflictException` si ya existe. Un tenant no puede reclamar un dominio asignado a otro.

- [x] SSRF en `/renderer/domain/:domain` — **PASS**
  El endpoint `GET /renderer/domain/:domain` llama a `lookupByDomain(domain)`, que hace un `findFirst` en DB filtrando por el nombre de dominio. No realiza ningún fetch HTTP a la URL ni DNS lookup controlado por el usuario. No hay riesgo de SSRF.

- [x] Rate limit en `verifyDomain` — **PASS**
  El servicio implementa rate limiting propio via Redis: `domain-verify-count:{siteId}` con TTL de 3600 s, máximo 5 intentos por hora. Si se supera lanza `ForbiddenException` con código `VERIFY_RATE_LIMIT_EXCEEDED`. El guard `@nestjs/throttler` también aplica a nivel de controller.

- [x] X-Renderer-Secret timing-safe — **FIXED** (ALTA)
  **Issue**: `custom-domains.controller.ts` línea 159 comparaba con `secret !== expectedSecret`, vulnerable a timing attacks que permiten inferir el secreto por diferencias de tiempo.
  **Fix aplicado**: reemplazado por `crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(expectedSecret))` con validación previa de longitud iguales para evitar que `timingSafeEqual` lance excepción. Ver `apps/api/src/modules/custom-domains/custom-domains.controller.ts`.

## Analytics

- [x] Input validation en pageview DTO — **FIXED** (MEDIA)
  **Issue**: `pageview.dto.ts` validaba `@MaxLength(500)` en `path` pero no el formato. Cualquier string (incluyendo valores que no sean rutas URL) era aceptado. El servicio corregía el path faltante de `/` en runtime pero no rechazaba el input en el DTO.
  **Fix aplicado**: agregado `@Matches(/^\/[^\x00-\x1f\x7f]*$/)` en el campo `path` para exigir que comience con `/` y no contenga caracteres de control. Ver `apps/api/src/modules/analytics/dto/pageview.dto.ts`.

- [x] Sin IP almacenada (GDPR) — **PASS**
  `analytics.service.ts` línea 74 tiene el comentario explícito `// NO guardamos IP (GDPR)`. El modelo `PageView` no incluye campo de IP. El `CreatePageViewDto` tampoco lo acepta. Cumplimiento verificado.

- [x] Tenant isolation en GET analytics — **PASS**
  `getAnalytics(siteId, tenantId, period)` en `analytics.service.ts` línea 95 hace `db.site.findFirst({ where: { id: siteId, tenantId } })` antes de devolver datos. El `tenantId` proviene del JWT. El controller usa `@UseGuards(JwtAuthGuard, TenantGuard)`.

- [x] Rate limiting POST pageview — **PASS**
  El endpoint `POST /analytics/pageview` tiene `@Throttle({ default: { limit: 10, ttl: 60_000 } })` — 10 peticiones por minuto por IP. El decorador sobrescribe el throttle global para este endpoint específico.

## CORS

- [x] Renderer origin en CORS whitelist — **PASS**
  `apps/api/src/main.ts` líneas 73-76: el array `allowedOrigins` incluye tanto `process.env.APP_URL ?? 'http://localhost:3010'` como `process.env.RENDERER_URL ?? 'http://localhost:3003'`. Se usa `app.enableCors({ origin: allowedOrigins })` con un array, no un string único. El renderer puede hacer POST a `/api/v1/analytics/pageview` desde el browser del usuario.

## Issues encontrados y fixes aplicados

| Severidad | Módulo | Issue | Archivo | Estado |
|-----------|--------|-------|---------|--------|
| ALTA | Custom Domains | X-Renderer-Secret comparado con `!==` (timing attack) | `apps/api/src/modules/custom-domains/custom-domains.controller.ts` | **FIXED** — `crypto.timingSafeEqual` |
| MEDIA | Analytics | `path` en `CreatePageViewDto` sin validación de formato (acepta cualquier string) | `apps/api/src/modules/analytics/dto/pageview.dto.ts` | **FIXED** — `@Matches(/^\/[^\x00-\x1f\x7f]*$/)` |

## Pendientes para Sprint 04

- Migrar `X-Renderer-Secret` de string simple a HMAC firmado por request (mitiga replay attacks si el secret queda expuesto en logs intermedios).
- Agregar `@IsUUID()` en `siteId` del `CreatePageViewDto` para rechazar IDs malformados antes de llegar a la DB.
- Evaluar si el campo `userAgent` del pageview debe sanitizarse antes de persistir (actualmente se trunca a 500 chars pero no se filtra).
- Penetration testing básico con OWASP ZAP sobre los endpoints de custom domains y analytics.
- Configurar rate limit diferenciado por `siteId` en `POST /analytics/pageview` (actualmente es por IP, lo que puede afectar usuarios detrás de NAT).
