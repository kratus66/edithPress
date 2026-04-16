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

- [ ] `npm audit` / `pnpm audit` sin vulnerabilidades **críticas** ni **altas**
- [ ] No hay archivos `.env`, `*.key`, `*.pem`, `*.p12` ni credenciales commitados (verificar con `git status`)
- [ ] No hay comentarios `TODO`, `FIXME` o `HACK` relacionados con seguridad sin issue abierto
- [ ] El PR no expone stack traces ni mensajes de error detallados en respuestas de producción

---

## Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [docs/agents/10-security-engineer.md](agents/10-security-engineer.md) — Plan de mitigación completo
- [.env.example](../.env.example) — Variables de entorno requeridas (sin valores reales)

---

*Última actualización: 2026-04-13 — Security Engineer*
