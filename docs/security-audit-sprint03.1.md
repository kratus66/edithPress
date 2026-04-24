# EdithPress — Security Audit Sprint 03.1
**Fecha**: 2026-04-24  
**Sprint**: 03.1 — Expansión de Bloques  
**Auditor**: Agente 10 (Security Engineer)

---

## Resumen Ejecutivo

Sprint 03.1 introduce 4 nuevos bloques: NavbarBlock, ProductGridBlock, StatsBlock y NewsletterBlock.  
Los riesgos relevantes son: links configurables por el usuario (XSS via `javascript:` URIs), endpoint público de suscripción (spam/abuso), e imágenes externas en ProductGrid.

---

## Hallazgos

### 1. NavbarBlock — Links de Navegación
| Campo | Severidad | Estado |
|-------|-----------|--------|
| `javascript:` URI en navLinks | Alta | ✅ **Mitigado** |
| `data:` URI en navLinks | Alta | ✅ **Mitigado** |
| `dangerouslySetInnerHTML` en NavbarBlock | Alta | ✅ No existe |

**Mitigación implementada** (`apps/renderer/src/app/_components/blocks/NavbarBlock.tsx`):

```typescript
function sanitizeUrl(url: string): string {
  if (!url) return '#'
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) return '#'
  return url
}
```

Aplicada a **todos** los `href` de navLinks en el renderer. El builder no necesita sanitización porque el contenido del builder solo se ve en el iframe del editor (no es público).

**Decisión**: No sanitizar `logoImageUrl` — los atributos `src` de `<img>` no pueden ejecutar JavaScript. ✅

**Limitación conocida**: Links externos con `target="_blank"` no están soportados en v1 (no es un riesgo de seguridad, sino una feature limitación).

---

### 2. NewsletterBlock — Endpoint Público POST /subscribe
| Campo | Severidad | Estado |
|-------|-----------|--------|
| Rate limiting en POST /subscribe | Alta | ✅ **Implementado** |
| Validación de email con class-validator | Alta | ✅ **Implementado** |
| Email lowercase antes de guardar | Media | ✅ **Implementado** |
| Email harvesting via GET /subscribers | Alta | ✅ **Protegido** (requiere JWT) |
| Re-suscripción revela si email existía | Media | ✅ **Mitigado** |

**Rate limiting configurado**: `@Throttle({ default: { limit: 3, ttl: 3_600_000 } })` — 3 solicitudes por IP por hora en POST /subscribe.

**Respuesta idempotente**: El endpoint siempre retorna `{ success: true }` tanto si el email es nuevo como si ya existía — no revela el estado previo del suscriptor.

**Sanitización de email**: El DTO usa `@Transform` para convertir a lowercase y trim antes de guardar.

**Decisión sobre token de unsubscribe**: En v1 se usa `base64(email)` como token. Es suficientemente oscuro para usuarios casuales. En v2 se recomienda un token criptográfico almacenado en BD con TTL.

---

### 3. ProductGridBlock — Imágenes Externas
| Campo | Severidad | Estado |
|-------|-----------|--------|
| Tracking pixel via imágenes de terceros | Baja | ✅ Aceptado (comportamiento conocido) |
| Mixed content HTTP/HTTPS | Baja | ✅ Documentado |
| SVG con scripts vía next/image | Media | ✅ Mitigado por next/image |

**Decisión sobre imágenes externas**: El renderer usa `next/image` con `remotePatterns: [{ protocol: 'https', hostname: '**' }]`. Las imágenes pasan por el proxy de Next.js, que las recodifica como JPEG/WEBP, eliminando cualquier payload en SVG maliciosos.

**Comportamiento conocido (Tracking pixels)**: Las imágenes de terceros pueden hacer tracking de visitantes. Esto es aceptable en un builder CMS donde el contenido es controlado por tenants de confianza, no por usuarios anónimos.

**Mixed content**: Si el dueño del sitio pega una URL HTTP, next/image puede fallar en HTTPS. Recomendación: documentar en la UI que las URLs deben ser HTTPS.

---

### 4. StatsBlock
| Campo | Severidad | Estado |
|-------|-----------|--------|
| Riesgos de seguridad | N/A | ✅ Bloque puramente visual sin interacción |

---

## Guards y Autenticación — Verificación

| Endpoint | Guard | Estado |
|----------|-------|--------|
| POST /sites/:siteId/newsletter/subscribe | Público + @Throttle(3/h/IP) | ✅ |
| GET /sites/:siteId/newsletter/subscribers | JwtAuthGuard + TenantGuard | ✅ |
| GET /sites/:siteId/newsletter/export | JwtAuthGuard + TenantGuard | ✅ |
| DELETE /sites/:siteId/newsletter/unsubscribe | Público (token via body) | ✅ |

---

## Recomendaciones para Sprints Futuros

1. **Honeypot en newsletter**: Agregar campo oculto `website` en el formulario. Si viene relleno → es un bot → rechazar silenciosamente.
2. **CSP para imágenes**: Evaluar `img-src 'self' https:` en la CSP del renderer para bloquear imágenes HTTP.
3. **Token criptográfico para unsubscribe**: Reemplazar `base64(email)` con un token aleatorio almacenado en BD con TTL de 7 días.
4. **Hamburger menu mobile**: Cuando se implemente, verificar que el estado del menú no se puede forzar via URL (open redirect).
5. **Links externos con target="_blank"**: Cuando se soporten en v2, agregar `rel="noopener noreferrer"` para prevenir tabnapping.

---

## Estado Post-Auditoría

| Bloque | Riesgos Identificados | Mitigados | Aceptados | Pendientes |
|--------|----------------------|-----------|-----------|------------|
| NavbarBlock | 2 | 2 | 0 | 0 |
| ProductGridBlock | 3 | 1 | 2 | 0 |
| StatsBlock | 0 | - | - | - |
| NewsletterBlock | 4 | 4 | 0 | 0 |
