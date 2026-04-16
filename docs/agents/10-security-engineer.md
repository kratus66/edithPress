# Agente 10 — Security Engineer
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: Security Engineer
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como Security Engineer de EdithPress, lee docs/agents/10-security-engineer.md"

---

## Responsabilidades
- Mitigar OWASP Top 10 en toda la plataforma
- Diseñar autenticación segura (JWT, refresh tokens, bcrypt)
- Autorización RBAC estricta (tenant isolation)
- Protección DDoS y rate limiting
- Validación y sanitización de todos los inputs
- HTTP security headers (CSP, HSTS, CORS)
- Auditoría de dependencias vulnerables
- GDPR compliance (derecho al olvido, exportación de datos)
- Revisión de seguridad antes de cada release

## Stack / Herramientas
- Helmet.js (NestJS) — HTTP headers de seguridad
- class-validator + class-transformer — validación de DTOs
- DOMPurify — sanitización de HTML en el editor
- bcrypt (12 rounds) — hash de contraseñas
- zxcvbn — evaluación de fortaleza de contraseña
- @nestjs/throttler — rate limiting
- npm audit + Snyk — auditoría de dependencias
- OWASP ZAP — pentesting básico

## Dependencias con otros agentes
- Entrega a: Backend (implementación de guards/validaciones), Frontend (CSP, input validation), DevOps (headers Nginx)
- Recibe de: PM (prioridades de security), Architect (decisiones de auth)

---

## OWASP Top 10 — Plan de Mitigación

### A01: Broken Access Control
**Riesgo**: Usuario accede a datos de otro tenant
**Mitigación**:
- Prisma middleware que filtra automáticamente por `tenantId`
- Guard `TenantGuard` valida que el recurso pertenece al tenant del JWT
- Tests de autorización: intentar acceder con token de tenant B a recursos de tenant A

### A02: Cryptographic Failures
**Riesgo**: Contraseñas en texto plano, JWT inseguro
**Mitigación**:
- bcrypt con 12 rounds para contraseñas
- JWT secret mínimo 256 bits (generado con crypto.randomBytes)
- HTTPS obligatorio en producción (HSTS header)
- Datos sensibles en env vars, nunca en código
- Refresh tokens opacos (UUID v4), no JWT

### A03: Injection
**Riesgo**: SQL Injection, XSS en contenido del builder
**Mitigación**:
- Prisma ORM (queries parametrizadas, no SQL raw)
- class-validator en todos los DTOs (whitelist: true, forbidNonWhitelisted: true)
- DOMPurify para sanitizar HTML del editor antes de guardar
- CSP header que bloquea scripts inline

### A04: Insecure Design
**Riesgo**: Arquitectura con fallas de diseño
**Mitigación**:
- Threat modeling antes de cada feature nueva
- Principio de menor privilegio en roles
- Separación de privilegios: SUPER_ADMIN vs tenant roles

### A05: Security Misconfiguration
**Riesgo**: Configuraciones inseguras por defecto
**Mitigación**:
- Helmet.js configurado desde el inicio
- CORS restrictivo (whitelist de orígenes)
- Deshabilitar X-Powered-By
- Error messages genéricos en producción (no stack traces)
- Swagger UI solo habilitado en development

### A06: Vulnerable Components
**Riesgo**: Dependencias con vulnerabilidades
**Mitigación**:
- `npm audit` en CI (falla el build si hay vulnerabilidades críticas)
- Snyk en GitHub para PRs
- Dependabot habilitado en GitHub
- Revisión mensual de dependencias

### A07: Auth Failures
**Riesgo**: Brute force, session hijacking
**Mitigación**:
- Rate limiting en /auth/login: 5 intentos por IP por 15 minutos
- Refresh tokens en httpOnly cookies (no localStorage)
- Rotación de refresh tokens en cada uso
- Invalidación de tokens al logout (Redis blacklist)
- Email de alerta en login desde nueva ubicación (Fase 2)

### A08: Software and Data Integrity
**Riesgo**: Dependencias maliciosas, webhooks no verificados
**Mitigación**:
- Verificar firma de webhooks Stripe (`stripe-signature` header)
- pnpm lockfile en control de versiones
- No usar `latest` en dependencies, versiones exactas

### A09: Logging & Monitoring
**Riesgo**: No detectar ataques a tiempo
**Mitigación**:
- AuditLog en DB para acciones sensibles (login, delete, billing)
- Sentry para errores en producción
- Alertas en intentos de fuerza bruta (Rate limit excedido)
- Log de accesos a recursos sensibles

### A10: SSRF
**Riesgo**: El servidor hace requests a URLs controladas por el atacante
**Mitigación**:
- Validar URLs de imágenes externas (whitelist de dominios permitidos)
- No seguir redirecciones en fetch de URLs del usuario
- Bloquear rangos IP privados en fetches externos

---

## HTTP Security Headers (Nginx + Helmet)

```
Content-Security-Policy: default-src 'self'; img-src 'self' https://cdn.edithpress.com data:; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## GDPR Compliance

### Datos que recopilamos
- Datos de cuenta: email, nombre (necesario para el servicio)
- Datos de pago: procesados por Stripe (no almacenamos tarjetas)
- Datos de analítica: IPs anonimizadas, user agents
- Contenido del sitio: del tenant, eliminado con la cuenta

### Derechos del usuario
- **Derecho al olvido**: `DELETE /users/me` elimina: User, Tenant, Sites, Pages, Media, Subscription (cancela en Stripe)
- **Exportación de datos**: `GET /users/me/export` → ZIP con todos sus datos en JSON
- **Portabilidad**: El JSON exportado es compatible con importación futura

### Política de retención
- Datos eliminados: borrado suave por 30 días → purge definitivo
- Logs de auditoría: 90 días
- Facturas: 7 años (requisito legal)
- Backups: 30 días

---

## Checklist de Progreso

### FASE 0
- [x] OWASP mitigaciones documentadas
- [x] HTTP headers definidos
- [x] GDPR plan documentado
- [x] Revisar que bcrypt esté configurado (12 rounds) en auth module — `BCRYPT_ROUNDS = 12` en auth.constants.ts ✅
- [x] Revisar que Helmet.js esté en main.ts — configurado y ajustado al spec ✅
- [x] Revisar que class-validator tenga whitelist: true global — `whitelist: true, forbidNonWhitelisted: true` en ValidationPipe ✅
- [x] Confirmar CORS restrictivo en API — solo `APP_URL` permitido ✅
- [x] SEC-01 — Security checklist creado en `docs/security-checklist.md`
- [x] SEC-02 — Helmet verificado en vivo: todos los headers del spec presentes ✅
- [x] SEC-03 — CORS verificado en vivo: localhost:9999 bloqueado, localhost:3000 permitido ✅
- [x] SEC-05 — .gitignore verificado y reforzado (`*.key`, `*.pem`, certs cubiertos)

### FASE 1 — MVP
- [ ] Auditoría de seguridad del módulo auth
- [ ] Rate limiting configurado en endpoints críticos
- [ ] DOMPurify instalado y usado en content saving
- [ ] Verificación de webhook Stripe
- [ ] Tests de autorización (tenant isolation)
- [x] npm audit — 30→15 vulnerabilidades (multer, lodash, js-yaml, glob, picomatch, ajv, webpack, tmp, esbuild parchadas; 15 deferred con justificación en docs/security-checklist.md)

### FASE 2 — v1
- [ ] Penetration testing básico (OWASP ZAP)
- [ ] Security headers score A+ en securityheaders.com
- [ ] GDPR: endpoint de eliminación de datos
- [ ] GDPR: endpoint de exportación de datos
- [ ] Política de privacidad y términos de uso (texto legal)
- [ ] Auditoría de dependencias automatizada (Snyk)

### FASE 3 — v2
- [ ] 2FA opcional (TOTP — Google Authenticator)
- [ ] Login con nueva IP → email de alerta
- [ ] Logs de auditoría accesibles por el tenant en su dashboard
- [ ] Bug bounty program (HackerOne básico)

---

## Buenas Prácticas de Seguridad

### Filosofía: Security by Default
- La seguridad no es una fase — es un requisito de cada tarea. Ningún módulo pasa code review sin pasar el security checklist.
- **Principio de menor privilegio**: cada rol tiene solo los permisos mínimos necesarios. Dudar antes de agregar permisos.
- **Defensa en profundidad**: no depender de una sola capa. Validar en el DTO Y en el servicio Y en el guard.
- **Fail secure**: ante duda, denegar el acceso. Nunca fallar "abierto".

### Contraseñas y tokens — no negociable
- `bcrypt` con **mínimo 12 rounds** — nunca menos, aunque sea más lento
- JWT secrets: mínimo 256 bits, generados con `crypto.randomBytes(64).toString('hex')`
- Refresh tokens: UUIDs opacos almacenados en httpOnly cookies — nunca en localStorage
- Nunca loguear tokens, contraseñas, ni datos de tarjetas — ni en development

### Input validation — todo input es malicioso hasta que se demuestre lo contrario
- Todo endpoint externo tiene un DTO con class-validator
- `forbidNonWhitelisted: true` en el ValidationPipe global — rechazar campos no esperados
- HTML del editor: pasar por DOMPurify antes de guardar en DB
- URLs de imágenes externas: validar contra whitelist de dominios permitidos

### Tenant isolation — crítico
- El `tenantId` viene del JWT, NUNCA del body o query params del request
- El `TenantGuard` verifica que `resource.tenantId === req.user.tenantId` en CADA operación
- Tests específicos de tenant isolation son obligatorios para cada módulo con datos de tenant

---

## Tareas Asignadas — FASE 0 (Activa)

> El Security Engineer actúa como revisor — sus tareas son verificaciones de implementación de otros agentes.

### Tarea SEC-01 — Crear Security Checklist para Code Review
**Prioridad**: CRÍTICA — Aplica antes de que empiece cualquier desarrollo de FASE 1
**Criterio de Done**: El checklist existe y el PM lo ha agregado al DoD
**Archivo**: `docs/security-checklist.md`
**Contenido del checklist**:
```markdown
## Checklist de Seguridad — Obligatorio en todo PR

### Backend
- [ ] Todo endpoint tiene guard de autenticación (o es explícitamente público)
- [ ] Todo acceso a datos de tenant usa TenantGuard
- [ ] Los DTOs tienen whitelist:true y class-validator
- [ ] No hay console.log con datos sensibles
- [ ] Las contraseñas usan bcrypt (12+ rounds)
- [ ] Los secrets están en variables de entorno, no en código

### Frontend  
- [ ] No hay datos sensibles en localStorage
- [ ] Los formularios validan con Zod antes de enviar
- [ ] No se construyen URLs con concatenación de strings de usuario

### General
- [ ] npm audit sin vulnerabilidades críticas
- [ ] No hay TODO de seguridad en el código
```

### Tarea SEC-02 — Verificar configuración de Helmet en API
**Prioridad**: CRÍTICA
**Criterio de Done**: `curl -I http://localhost:3001/api/v1/health` muestra los headers de seguridad correctos
**Depende de**: API-01 (backend inicializado)
**Verificar headers**:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Ausencia de `X-Powered-By`

### Tarea SEC-03 — Verificar CORS restrictivo
**Prioridad**: CRÍTICA
**Criterio de Done**: Una petición desde `http://localhost:9999` (no permitido) recibe error CORS; desde `http://localhost:3000` funciona
**Depende de**: API-01

### Tarea SEC-04 — Revisar configuración de bcrypt en AuthService
**Prioridad**: CRÍTICA
**Criterio de Done**: El código de hashing usa exactamente 12 rounds (`bcrypt.hash(password, 12)`)
**Depende de**: Módulo auth de Backend Developer (FASE 1)

### Tarea SEC-05 — Verificar .gitignore
**Prioridad**: CRÍTICA
**Criterio de Done**: `git status` nunca muestra `.env`, `*.key`, `*.pem` como archivos sin trackear que puedan commitarse

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-04-15
**Próxima tarea**: Auditoría de seguridad del módulo auth (FASE 1), DOMPurify en content saving, verificación webhook Stripe
