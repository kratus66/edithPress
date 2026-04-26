# Security Audit — Sprint 03.2
**Fecha**: 2026-04-25
**Auditor**: Security Engineer (Agente 10)
**Alcance**: 5 bloques nuevos/actualizados en apps/renderer/src/app/_components/blocks/

---

## Bloques auditados

1. CategoryGridBlock
2. SplitContentBlock
3. FooterBlock + FooterNewsletter (sub-componente client)
4. HeroBlock (actualizado Sprint 03.2)
5. ProductGridBlock (actualizado Sprint 03.2)

---

## Tabla de hallazgos

| Bloque | Campo | Tipo de riesgo | Severidad | Estado |
|---|---|---|---|---|
| CategoryGridBlock | `category.url` → `<a href>` | XSS via javascript: URI | ALTA | Mitigado — sanitizeUrl() aplicado |
| CategoryGridBlock | `overlayOpacity` | Valor fuera de rango / CSS injection | BAJA | Mitigado — Math.min/max(0,100) |
| CategoryGridBlock | `name`, `description`, `imageAlt` | XSS | BAJA | Aceptado — React escapa automáticamente texto plano |
| SplitContentBlock | `ctaUrl` → `<a href>` | XSS via javascript: URI | ALTA | Mitigado — sanitizeUrl() en CtaButton |
| SplitContentBlock | `body` | XSS via HTML injection | ALTA | Mitigado — split('\n') + JSX texto plano, sin dangerouslySetInnerHTML |
| SplitContentBlock | `stat.value`, `stat.label` | XSS | BAJA | Aceptado — texto plano en JSX |
| FooterBlock | `socialLinks[].url` | XSS via javascript: URI | ALTA | Mitigado — sanitizeUrl() aplicado |
| FooterBlock | `columns[].links[].url` | XSS via javascript: URI | ALTA | Mitigado — sanitizeUrl() aplicado |
| FooterBlock | `legalLinks[].url` | XSS via javascript: URI | ALTA | Mitigado — sanitizeUrl() aplicado |
| FooterBlock | `contactEmail` | XSS via mailto: injection | MEDIA | Aceptado — renderizado como texto plano, sin href |
| FooterNewsletter | email del formulario | Formato inválido / fuzzing del endpoint | BAJA | Mejorado — regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (era solo `includes('@')`) |
| FooterNewsletter | endpoint URL | SSRF / URL injection | ALTA | Mitigado — URL construida solo con `NEXT_PUBLIC_API_URL` + `siteId` de server props |
| HeroBlock | `ctaUrl` → `<a href>` | XSS via javascript: URI | ALTA | Mitigado — sanitizeUrl() aplicado |
| HeroBlock | `cta2Url` → `<a href>` | XSS via javascript: URI | ALTA | Mitigado — sanitizeUrl(cta2Url ?? '#') aplicado |
| HeroBlock | `overlayOpacity` | Valor fuera de rango / CSS injection | BAJA | Mitigado — Math.min/max(0,100) |
| HeroBlock | `title`, `subtitle`, `eyebrowText` | XSS | BAJA | Aceptado — texto plano en JSX |
| ProductGridBlock | `viewAllUrl` → `<a href>` | XSS via javascript: URI | ALTA | Mitigado — sanitizeUrl() aplicado (dos referencias: con título y sin título) |
| ProductGridBlock | `product.ctaUrl` → `<a href>` | XSS via javascript: URI | ALTA | Mitigado — sanitizeUrl() aplicado por producto |
| ProductGridBlock | `product.name`, `product.description`, `product.price` | XSS | BAJA | Aceptado — texto plano en JSX |

---

## sanitizeUrl() — Cobertura verificada

Función en: `apps/renderer/src/lib/sanitize-url.ts`

| Caso | Comportamiento esperado | Verificado |
|---|---|---|
| `javascript:alert(1)` | devuelve `'#'` | SI — regex `/^(javascript|data|vbscript):/i` |
| `JAVASCRIPT:alert(1)` | devuelve `'#'` | SI — flag `/i` en regex |
| `data:text/html,...` | devuelve `'#'` | SI — incluido en regex |
| `vbscript:...` | devuelve `'#'` | SI — incluido en regex |
| `''` (string vacío) | devuelve `'#'` | SI — `if (!safe) return '#'` |
| `undefined` (runtime) | devuelve `'#'` | SI — `url?.trim() ?? '#'` |
| `null` (runtime) | devuelve `'#'` | SI — optional chaining + nullish coalescing |
| `/productos` (relativa) | devuelve `/productos` | SI — pasa el regex |
| `#seccion` (hash) | devuelve `#seccion` | SI — pasa el regex |
| `https://example.com` (absoluta) | devuelve la URL | SI — pasa el regex |

Todos los bloques con hrefs configurables por el usuario aplican sanitizeUrl() en cada href. No se encontró ningún href sin sanitizar.

---

## Corrección aplicada en esta auditoría

### FooterNewsletter — email regex reforzado

**Archivo**: `apps/renderer/src/app/_components/blocks/FooterNewsletter.tsx`

**Antes**: `!email.includes('@')` — acepta strings como `@`, `x@`, `@x` como válidos.

**Después**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — requiere al menos un carácter antes del @, un dominio con al menos un punto, y ningún espacio.

**Justificación**: La validación client-side es una primera línea de defensa para UX y reducción de ruido; la validación definitiva ocurre en el backend con class-validator (`@IsEmail()`). El regex no es RFC 5321 completo (eso es responsabilidad del backend), pero descarta los casos de bypass más triviales.

---

## Decisiones de seguridad tomadas

### overlayOpacity clamp (CategoryGridBlock y HeroBlock)
`Math.min(100, Math.max(0, overlayOpacity ?? 0))` — valores fuera del rango 0–100 no tienen riesgo de XSS en sí, pero valores extremos (por ejemplo, negativos o NaN) podrían producir cadenas CSS malformadas al construir el color hex. El clamp garantiza que la conversión `(value / 100) * 255` siempre produce un entero en [0, 255].

### contactEmail como texto plano
`contactEmail` se renderiza como `<p>{contactEmail}</p>` sin ser envolto en un `mailto:` href. React escapa automáticamente el contenido. Si en el futuro se agrega soporte `mailto:`, ese href deberá pasar por `sanitizeUrl()` ya que los URIs `mailto:` son legítimos pero su combinación con headers adicionales puede facilitar email injection.

### newsletterEndpoint construido desde env var
`${process.env.NEXT_PUBLIC_API_URL}/api/v1/sites/${siteId}/newsletter/subscribe` — `siteId` viene de props del servidor (no del usuario), y `NEXT_PUBLIC_API_URL` es variable de entorno. No hay interpolación de valores del formulario en la URL. El único dato del usuario (email) va en el body JSON.

### next/image como proxy de imágenes
Todos los bloques usan `<Image>` de next/image en lugar de `<img>` directo. Next.js recodifica las imágenes a través de su propio pipeline, mitigando SVGs maliciosos con JavaScript embebido y contenido mixto HTTP/HTTPS.

---

## Superficie de ataque aceptada

Los siguientes campos de texto libre son controlados por el tenant (no por visitantes anónimos) y se renderizan como texto plano en JSX. React escapa automáticamente caracteres HTML especiales (`<`, `>`, `&`, `"`, `'`). No se requiere sanitización adicional para estos campos.

- `title`, `subtitle`, `eyebrowText`, `body` en todos los bloques
- `stat.value`, `stat.label` en SplitContentBlock
- `product.name`, `product.description`, `product.price`, `product.artisan`, `product.category`
- `category.name`, `category.description`
- `logoText`, `logoSubtext`, `tagline`, `copyright`, `contactEmail`, `contactPhone`, `contactAddress`
- `col.heading`, `link.label`, `legalLinks[].label`, `socialLinks[].platform` (abbrev)

---

## Estado post-auditoría

- Todos los bloques auditados: sin `dangerouslySetInnerHTML`
- Todos los hrefs configurables por usuario: `sanitizeUrl()` aplicado
- Imágenes: `next/image` en todos los casos (no `<img>` directo)
- sanitizeUrl() cubre los 5 esquemas peligrosos: javascript, data, vbscript, + empty/undefined
- FooterNewsletter: email validation mejorado de `includes('@')` a regex con dominio requerido
- Build del renderer: limpio post-correcciones (verificado 2026-04-25)
