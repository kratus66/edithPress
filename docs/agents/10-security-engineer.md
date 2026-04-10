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
- [ ] Revisar que bcrypt esté configurado (12 rounds) en auth module
- [ ] Revisar que Helmet.js esté en main.ts
- [ ] Revisar que class-validator tenga whitelist: true global
- [ ] Confirmar CORS restrictivo en API

### FASE 1 — MVP
- [ ] Auditoría de seguridad del módulo auth
- [ ] Rate limiting configurado en endpoints críticos
- [ ] DOMPurify instalado y usado en content saving
- [ ] Verificación de webhook Stripe
- [ ] Tests de autorización (tenant isolation)
- [ ] npm audit sin vulnerabilidades críticas

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

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
