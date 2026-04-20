# Security Audit — Sprint 02
**Fecha**: 2026-04-16  
**Herramienta**: pnpm audit  
**Monorepo**: EdithPress  
**Vulnerabilidades totales**: 15 (7 moderate | 8 high)  
**Estado anterior (commit 7b2b43e)**: 15 vulnerabilidades pendientes

---

## Resumen de Vulnerabilidades

### 🔴 HIGH — 8 vulnerabilidades

#### 1. `next` — HTTP Request Deserialization DoS en RSC
| Campo | Valor |
|-------|-------|
| CVE / Advisory | GHSA-h25m-26qc-wcjf |
| Severidad | High |
| Versión actual | 14.2.35 |
| Versión parcheada | ≥ 15.0.8 |
| Apps afectadas | apps/admin, apps/builder, apps/renderer |
| Ruta | apps/admin > next@14.2.35, apps/admin > next-auth@4.24.13 > next@14.2.35 |

**Descripción**: Next.js puede sufrir DoS via deserialización de requests HTTP malformados cuando se usan React Server Components de forma insegura.

**Decisión**: **Deferred** — Upgrade de Next.js 14 → 15 implica cambios breaking en App Router API, next-auth y componentes existentes. La migración requiere una tarea dedicada de compatibilidad. El riesgo se mitiga porque:
1. No usamos RSC en rutas públicas con input de usuarios sin validar
2. El endpoint está protegido por rate limiting (100 req/min global)
3. La migración a Next.js 15 está planificada para FASE 2

**Workaround**: Monitorear tráfico anómalo en endpoints RSC. Actualizar en FASE 2.

---

#### 2. `next` — Authorization Bypass en Middleware
| Campo | Valor |
|-------|-------|
| CVE / Advisory | GHSA-ggv3-7p47-pfv8 |
| Severidad | High |
| Versión actual | 14.2.35 |
| Versión parcheada | ≥ 15.0.8 |
| Apps afectadas | apps/admin, apps/builder, apps/renderer |

**Descripción**: El middleware de Next.js puede bypassear verificaciones de autorización en ciertas rutas.

**Decisión**: **Deferred** — Misma razón que GHSA-h25m-26qc-wcjf. Mitigación adicional: EdithPress usa JWT validado en el backend (NestJS) como fuente de autoridad, no el middleware de Next.js. Si el middleware falla, la API rechaza la petición de todas formas.

---

#### 3–7. `tar` (5 CVEs) — Path Traversal y File Overwrite
| Campo | Valor |
|-------|-------|
| Advisories | GHSA-34x7-hfp2-rc4v, GHSA-8qq5-rm4j-mr97, GHSA-83g3-92jg-28cx, GHSA-r97q-ghv2-r8p6, GHSA-ggv3-7p47-pfv8 (parcial) |
| Severidad | High |
| Versión actual | 6.2.1 (transitiva) |
| Versión parcheada | ≥ 7.5.10 |
| Ruta | apps/api > bcrypt@5.1.1 > @mapbox/node-pre-gyp@1.0.11 > tar@6.2.1 |

**Descripción**: `tar` (node-tar) tiene múltiples vulnerabilidades de path traversal que permiten escribir archivos fuera del directorio de extracción.

**Decisión**: **Deferred** — La dependencia es transitiva: `bcrypt` → `@mapbox/node-pre-gyp` → `tar`. `node-pre-gyp` usa `tar` solo durante la **instalación de dependencias nativas** (build time), no en runtime de producción. Por lo tanto:
1. El riesgo en producción es **nulo** — `tar` no se ejecuta en runtime
2. Sería necesario actualizar `@mapbox/node-pre-gyp` a una versión que use `tar` ≥ 7.5.10, pero `bcrypt@5.x` no tiene esa actualización disponible aún
3. Alternativa evaluada: migrar a `bcryptjs` (puro JS, sin dependencias nativas) — se evaluará en FASE 2

**Workaround**: Solo ejecutar `pnpm install` en entornos de CI/CD de confianza (ya es el caso).

---

### 🟡 MODERATE — 7 vulnerabilidades

#### 8. `next` — Unbounded Disk Cache Growth (next/image)
| Campo | Valor |
|-------|-------|
| Advisory | GHSA-3x4c-7xq6-9pq8 |
| Severidad | Moderate |
| Versión actual | 14.2.35 |
| Versión parcheada | ≥ 15.5.14 |

**Descripción**: `next/image` puede crecer indefinidamente en el caché de disco.

**Decisión**: **Deferred** — Mismo bloqueo de versión que los otros CVEs de Next.js. En dev el impacto es nulo. En producción se mitiga con monitoreo de disco (DevOps).

---

#### 9. `@nestjs/core` — Injection via Downstream Component
| Campo | Valor |
|-------|-------|
| Advisory | GHSA-36xv-jgw5-4q75 |
| Severidad | Moderate |
| Versión actual | 10.4.22 |
| Versión parcheada | ≥ 11.1.18 |
| Apps afectadas | apps/api |

**Descripción**: `@nestjs/core` tiene una vulnerabilidad de inyección en componentes downstream.

**Decisión**: **Deferred** — Actualizar de NestJS 10 → 11 es un cambio de versión mayor con potenciales breaking changes en decoradores, módulos y configuración. Requiere tarea de migración dedicada.

**Mitigación aplicada**: Todo input externo pasa por `ValidationPipe` con `whitelist: true` y `forbidNonWhitelisted: true`. Los Guards de autenticación y tenant isolation también actúan como barrera adicional.

---

#### 10–15. `vite` — Path Traversal en `.map` Files
| Campo | Valor |
|-------|-------|
| Advisory | GHSA-4w7w-66w2-5vf9 |
| Severidad | Moderate |
| Versión actual | 5.4.21 (transitiva via vitest) |
| Versión parcheada | ≥ 6.4.2 |
| Apps afectadas | apps/admin (via vitest) |

**Descripción**: Vite puede exponer archivos `.map` fuera del directorio esperado via path traversal.

**Decisión**: **Deferred** — Vite es usado **solo en tests** (via `@vitejs/plugin-react` y `vitest`), no en el servidor de producción. En producción las apps admin/builder/renderer usan `next build` (Webpack/Turbopack). El riesgo en producción es **nulo**.

**Workaround**: Ejecutar tests en entornos aislados (CI). No exponer el servidor de dev de Vite externamente.

---

## Vulnerabilidades Parcheadas en Este Sprint

Ninguna nueva en este sprint — las 15 vulnerabilidades son las mismas que quedaron pendientes en el commit `7b2b43e` donde ya se parchearon 30→15.

---

## Cambios de Seguridad Implementados en Sprint 02

| Tarea | Estado | Descripción |
|-------|--------|-------------|
| SEC-SPRINT02-01 | ✅ | DOMPurify + jsdom para sanitización XSS en content.service.ts |
| SEC-SPRINT02-02 | ✅ | Protección de enumeración en /auth/forgot-password |
| SEC-SPRINT02-03 | ✅ | CSP explícita en Helmet + security headers en Next.js apps |
| SEC-SPRINT02-04 | ✅ | Audit documentado con clasificación y justificaciones |

---

## Próximos Pasos (FASE 2)

1. **Migrar Next.js 14 → 15** para resolver los 4 CVEs de next (requiere tarea de compatibilidad dedicada)
2. **Evaluar bcryptjs** como reemplazo de bcrypt para eliminar la cadena transitiva de tar
3. **Migrar NestJS 10 → 11** para resolver GHSA-36xv-jgw5-4q75
4. **Actualizar vitest/vite** en suite de tests de admin
5. **Configurar Dependabot** en GitHub para PRs automáticos de seguridad

---

## Notas Metodológicas

- **"Deferred" no significa "ignorado"** — cada entrada tiene una justificación técnica y un plan
- Las vulnerabilidades de dependencias build-time (tar vía node-pre-gyp) no representan riesgo en runtime de producción
- La defensa en profundidad (rate limiting + ValidationPipe + Guards) mitiga los CVEs de NestJS Core
- El modelo de autorización de EdithPress (JWT en backend, no middleware de Next.js) mitiga los CVEs de Next.js Middleware
