# Security Audit — Sprint 04
**Fecha**: 2026-04-30
**Auditor**: Security Engineer (Agente 10)
**Módulos auditados**: Analytics endpoint, Custom Domains, Templates

---

## Resumen ejecutivo

Sprint 04 introdujo tres superficies de ataque nuevas. Dos requirieron correcciones de código;
la tercera (Analytics) estaba correctamente implementada con un único gap de configuración
mitigado con una advertencia en startup. El build de TypeScript pasa sin errores tras los cambios.

---

## Módulo 1 — Analytics Endpoint (`POST /analytics/pageview`)

### Descripción
Endpoint público consumido por el renderer para registrar visitas de página.
No requiere autenticación — cualquier cliente puede enviar datos.

### Hallazgos

| # | Verificación | Resultado | Severidad |
|---|-------------|-----------|-----------|
| 1 | Rate limiting (@Throttle) | 10 req/min por IP — presente en controller | PASS |
| 2 | Respuesta 204 sin body | `@HttpCode(HttpStatus.NO_CONTENT)` — no expone info del servidor | PASS |
| 3 | Fire-and-forget real | `this.analyticsService.trackPageView(...).catch(() => {})` — sin await | PASS |
| 4 | userAgent truncado a 500 chars | `ua.slice(0, 500)` en servicio antes de guardar | PASS |
| 5 | path truncado a 500 chars | `.slice(0, 500)` en servicio + validación @MaxLength(500) en DTO | PASS |
| 6 | referrer truncado a 500 chars | `dto.referrer?.slice(0, 500)` en servicio + @MaxLength(500) en DTO | PASS |
| 7 | ipHash usa IP_SALT | SHA-256 con `process.env['IP_SALT'] ?? ''` | GAP — ver abajo |
| 8 | path valida formato | @Matches regex `^\/[^\x00-\x1f\x7f]*$` en DTO — bloquea chars de control | PASS |

### GAP: IP_SALT vacío o ausente

**Severidad**: MEDIA

**Descripción**: Cuando `IP_SALT` no está configurado, `sha256(ip + '')` produce un hash
determinístico. Un atacante con acceso a los hashes podría hacer lookup inverso de IPs comunes
usando un diccionario de rangos IPv4 (rainbow table).

**Mitigación aplicada**: Se agregó un `logger.warn()` en el constructor de `AnalyticsService`
que advierte en startup si `IP_SALT` no está configurado. Esto hace visible el problema en logs
sin romper el funcionamiento.

**Estado**: ACEPTADO con advertencia. La corrección real es agregar `IP_SALT` al `.env` de
producción — tarea para DevOps/infra.

**Archivo**: `apps/api/src/modules/analytics/analytics.service.ts`

---

## Módulo 2 — Custom Domains (`POST /domains/:id/verify`)

### Descripción
Permite a tenants registrar dominios externos y verificar que su DNS apunta al renderer
via CNAME. El servidor hace un lookup DNS al dominio del usuario.

### Hallazgos

| # | Verificación | Resultado | Severidad |
|---|-------------|-----------|-----------|
| 1 | Validación @IsFQDN en DTO antes de cualquier lookup | Presente en `create-domain.dto.ts` | PASS |
| 2 | No usa fetch() al dominio del usuario | Solo `dns.resolveCname()` — sin HTTP al dominio | PASS |
| 3 | Mensajes de error al cliente son genéricos | Tres strings hardcodeados, sin `err.message` en respuesta | PASS |
| 4 | Detalles internos solo van a logs | `this.logger.warn(...)` en el catch genérico, nunca al cliente | PASS |
| 5 | Verificación de IP privada post-CNAME | No existía | FIX APLICADO |
| 6 | Truncado del mensaje en DomainVerification | Mensajes son strings cortos hardcodeados — no hay user data | PASS |

### FIX: isPrivateIP + dns.resolve4 post-CNAME

**Severidad**: ALTA (SSRF via DNS rebinding)

**Vector de ataque**: Un atacante podría registrar un dominio `evil.com` con un CNAME que
apunte a `renderer.edithpress.com` (pasando el check), pero con TTL=0 y rebinding posterior
a `127.0.0.1` o `192.168.1.1`. Aunque domains.service.ts no hace `fetch()`, la mitigación
defensiva es rechazar dominios cuya resolución A apunte a rangos privados.

**Corrección aplicada**:

1. Se agregó la función helper `isPrivateIP(ip: string): boolean` que cubre los rangos:
   - `10.0.0.0/8` (RFC-1918)
   - `172.16.0.0/12` (RFC-1918)
   - `192.168.0.0/16` (RFC-1918)
   - `127.0.0.0/8` (loopback)
   - `169.254.0.0/16` (link-local)
   - `::1` (IPv6 loopback)

2. Después de confirmar que el CNAME apunta al target correcto, se hace `dns.resolve4(domain)`
   y se verifica cada IP retornada. Si alguna es privada, el estado es `FAILED` con mensaje
   genérico al cliente y `logger.warn()` con el domainId.

3. Si `resolve4` falla (dominio solo tiene IPv6 o no tiene registros A), se acepta — el
   vector SSRF por IPv6 está fuera del scope actual (aceptado).

**Estado**: MITIGADO

**Archivo**: `apps/api/src/modules/domains/domains.service.ts`

---

## Módulo 3 — Templates (`POST /sites` con templateId)

### Descripción
Al crear un sitio con un templateId, el servicio carga el contenido del template desde la DB
y lo asigna como contenido de la homepage del sitio nuevo.

### Hallazgos

| # | Verificación | Resultado | Severidad |
|---|-------------|-----------|-----------|
| 1 | template.content.pages es array — validado antes de usar | No existía validación | FIX APLICADO |
| 2 | try/catch alrededor del parseo de template.content | No existía | FIX APLICADO |
| 3 | BlockRenderer tiene whitelist de tipos (switch exhaustivo) | `default: return null` en producción | PASS |
| 4 | BlockRenderer — desarrollo muestra error visual, producción retorna null | Correcto — no lanza excepciones | PASS |
| 5 | Seed data — URLs/hrefs con javascript: URIs | Todos los campos url/href usan `'#'` — ningún javascript: URI | PASS |

### FIX: Normalización de template.content y try/catch

**Severidad**: MEDIA (Template Injection / aplicación crashea silenciosamente)

**Descripción**: Los templates de Sprint 04 tienen la estructura `{ pages: [{ content: [...] }] }`,
mientras que los templates legacy son directamente un array de bloques `[...]`. Sin normalización,
al crear un sitio con un template Sprint 04, el campo `content` de la página se guardaba como
el objeto `{ pages: [...] }` completo. El renderer esperaba un array y el sitio se renderizaba
vacío o con errores.

Adicionalmente, no había `try/catch` alrededor del parseo: cualquier `template.content` corrupto
en la DB podría propagar una excepción no manejada y abortar la creación del sitio con un 500.

**Corrección aplicada** en `SitesService.create()`:

- Se agrega normalización explícita antes de la transacción:
  - Si `template.content` es array → se usa directamente (legacy)
  - Si es `{ pages: [...] }` → se extrae `pages[0].content` (Sprint 04)
  - Cualquier otra estructura → `logger.warn()` + array vacío (fail secure)
- Todo el bloque de normalización está dentro de `try/catch` → si falla, se usa array vacío
  y se registra el error con `logger.error()`.

**Estado**: MITIGADO

**Archivo**: `apps/api/src/modules/sites/sites.service.ts`

### Decisión de seguridad: BlockRenderer default case

El `renderBlock()` en `BlockRenderer.tsx` implementa un switch exhaustivo sobre el discriminated
union `Block`. El caso `default` retorna `null` en producción y un div de error visual en
development. Esta es la implementación correcta: bloques desconocidos no explotan el renderer
y no exponen información en producción. No se requieren cambios.

---

## Superficie de ataque residual aceptada

| Riesgo | Módulo | Justificación de aceptación |
|--------|--------|-----------------------------|
| IP rainbow table si IP_SALT está vacío | Analytics | Resuelto con advertencia en startup. La variable debe configurarse en infra (DevOps). |
| DNS rebinding IPv6 (AAAA records) | Domains | El servidor no hace fetch() HTTP al dominio, solo CNAME lookup. El vector real de SSRF no aplica. Se acepta hasta implementar resolución AAAA. |
| Templates con múltiples páginas (Sprint 04) solo cargan `pages[0]` | Sites | El builder actualmente trabaja con una sola página por creación. Multi-página es una feature futura. Comportamiento documentado en el código. |
| `target="_blank"` sin `rel="noopener noreferrer"` en NavbarBlock | Renderer | Riesgo bajo (tab hijacking). Documentado en sprint 03.1, planificado para v2. |

---

## Archivos modificados

- `apps/api/src/modules/analytics/analytics.service.ts` — constructor warning para IP_SALT
- `apps/api/src/modules/domains/domains.service.ts` — helper isPrivateIP + dns.resolve4 check
- `apps/api/src/modules/sites/sites.service.ts` — normalización template.content + try/catch
- `docs/security-checklist.md` — tabla Sprint 04 agregada

---

*Security Engineer — EdithPress Sprint 04*
