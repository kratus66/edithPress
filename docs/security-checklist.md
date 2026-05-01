# Checklist de Seguridad — EdithPress

> **Obligatorio en todo PR antes de hacer merge.**
> Este checklist es parte del Definition of Done (DoD) de FASE 1 en adelante.
> El Security Engineer (o cualquier reviewer) debe marcar cada ítem antes de aprobar.

---

## Backend

- [ ] Todo endpoint tiene guard de autenticación (o está marcado explícitamente como público con `@Public()`)
- [ ] Todo acceso a datos de tenant usa `TenantGuard` — el `tenantId` viene del JWT, nunca del body/query
- [ ] Los DTOs tienen decoradores de `class-validator` con `whitelist: true` y `forbidNonWhitelisted: true`
- [ ] No hay `console.log` con datos sensibles (tokens, contraseñas, PII, datos de tarjeta)
- [ ] Las contraseñas se hashean con `bcrypt` usando exactamente 12 rounds (`bcrypt.hash(password, 12)`)
- [ ] Los secrets (JWT_SECRET, DB_URL, API keys) están en variables de entorno, no hardcodeados en código
- [ ] Los endpoints de auth tienen rate limiting configurado (`@Throttle`)
- [ ] Los refresh tokens se almacenan en `httpOnly` cookies, no en la respuesta JSON

## Frontend

- [ ] No hay datos sensibles en `localStorage` ni `sessionStorage` (tokens de sesión, PII)
- [ ] Los formularios validan los inputs con Zod antes de hacer el fetch al API
- [ ] No se construyen URLs con concatenación directa de strings provenientes del usuario
- [ ] El contenido HTML del editor pasa por DOMPurify antes de renderizarse o enviarse al backend

## General

- [ ] `pnpm audit` sin vulnerabilidades **críticas** ni **altas** no justificadas (ver tabla de excepciones abajo)
- [ ] No hay archivos `.env`, `*.key`, `*.pem`, `*.p12` ni credenciales commitados (verificar con `git status`)
- [ ] No hay comentarios `TODO`, `FIXME` o `HACK` relacionados con seguridad sin issue abierto
- [ ] El PR no expone stack traces ni mensajes de error detallados en respuestas de producción

---

## Vulnerabilidades conocidas y justificadas (2026-04-15)

Las siguientes vulnerabilidades están registradas, analizadas y aceptadas hasta que su fix esté disponible sin breaking changes.
Revisión obligatoria en cada release.

| Paquete | Sev | CVE / Advisory | Motivo de no fix | Acción |
|---------|-----|----------------|------------------|--------|
| `next@14.2.35` | HIGH×2 + MOD×3 | GHSA-h25m, GHSA-q4gf, GHSA-9g9p, GHSA-ggv3, GHSA-3x4c | Fix requiere Next.js 15 (breaking API) | Planificado en FASE 2 — migración Next 14→15 |
| `tar@6.2.1` | HIGH×6 | GHSA-34x7, GHSA-8qq5, GHSA-83g3, GHSA-qffp, GHSA-9ppj, GHSA-r6q2 | Dependencia transitiva de `bcrypt→@mapbox/node-pre-gyp`. Solo se usa en `npm install`, **no en runtime**. Override a tar@7 rompe la compilación nativa de bcrypt. | Aceptado. Mitigación: verificar integridad del package-lock; usar `--ignore-scripts` en builds CI cuando el binario ya está compilado. |
| `file-type@20.4.1` | MOD×2 | GHSA-5v7r, GHSA-j47w | Fix requiere file-type@21 (major). Override rompería `@nestjs/common@10` internamente. | Deferred hasta NestJS v11 upgrade (FASE 2). Mitigación: limitar tamaño de archivos en upload a 10 MB, validar extension en DTO. |
| `@nestjs/core@10.4.22` | MOD | GHSA-36xv | Fix requiere NestJS v11 (breaking). | Planificado con upgrade completo de NestJS en FASE 2. |
| `vite@5.4.21` | MOD | GHSA-4w7w | Dev server, no impacta producción. Fix requiere vite v6 (breaking). | Aceptado para entorno dev. No afecta build de producción. |

---

## Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [docs/agents/10-security-engineer.md](agents/10-security-engineer.md) — Plan de mitigación completo
- [.env.example](../.env.example) — Variables de entorno requeridas (sin valores reales)

---

## Sprint 04 — Superficies de ataque nuevas verificadas (2026-04-30)

| Módulo | Verificación | Estado |
|--------|-------------|--------|
| Analytics (`/analytics/pageview`) | Rate limit 10/min, 204 sin body, ip hash con IP_SALT, truncado de ua/path/referrer a 500 chars, fire-and-forget | OK |
| Domains (`/domains/verify`) | @IsFQDN en DTO, solo dns.resolveCname() (sin fetch), mensajes de error hardcodeados, isPrivateIP() en resolve4 post-CNAME | OK — fix aplicado |
| Templates (`sites.service.ts`) | Normalización de template.content: array legacy vs. `{pages:[]}` Sprint 04, try/catch alrededor del parse | OK — fix aplicado |
| BlockRenderer (renderer) | Switch exhaustivo con `default: return null` en producción | OK |

*Última actualización: 2026-04-30 — Security Engineer (Sprint 04 audit)*
