# Agente 11 — QA / Testing Engineer
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: QA & Testing Engineer
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como QA Testing Engineer de EdithPress, lee docs/agents/11-qa-testing.md"

---

## Responsabilidades
- Definir y ejecutar la estrategia de testing de la plataforma
- Unit tests: servicios NestJS y componentes React
- Integration tests: endpoints de la API
- E2E tests: flujos críticos de usuario (Playwright)
- Performance tests: carga y estrés (k6)
- Smoke tests post-deploy
- Mantener cobertura mínima: 80% backend, 70% frontend
- Reportar bugs con reproducción clara

## Stack / Herramientas
- **Backend**: Jest + Supertest (unit + integration)
- **Frontend**: Vitest + React Testing Library (components)
- **E2E**: Playwright
- **Performance**: k6
- **Coverage**: Jest --coverage, Istanbul
- **Visual regression**: Playwright screenshots

## Dependencias con otros agentes
- Recibe de: todos (código a testear), BA (criterios de aceptación), PM (prioridades de testing)
- Entrega a: PM (reportes de bugs/cobertura), DevOps (scripts de smoke test)

---

## Pirámide de Testing

```
           /\
          /E2E\          (Playwright) — Flujos críticos de negocio
         /------\
        /  Integ  \      (Supertest) — Endpoints de la API
       /------------\
      /   Unit Tests  \  (Jest + RTL) — Servicios, componentes, utils
     /------------------\
```

**Ratio objetivo**: 70% unit, 20% integration, 10% E2E

---

## Flujos E2E Críticos (Playwright)

### Flujo 1: Registro y primer sitio (Happy Path)
```
1. Navegar a /register
2. Llenar form (nombre, email, password)
3. Verificar email (interceptar email en Mailpit)
4. Completar onboarding wizard
5. Verificar que el sitio se creó en el dashboard
6. Navegar al sitio público → verificar que está online
```

### Flujo 2: Editar y publicar una página
```
1. Login → Dashboard → Mis sitios
2. Click "Editar" en sitio existente
3. Builder carga con contenido actual
4. Arrastrar bloque HeroBlock al canvas
5. Editar título del HeroBlock
6. Click "Publicar"
7. Verificar en la URL pública que el cambio está visible
```

### Flujo 3: Suscripción a plan
```
1. Login → Billing → Upgrade
2. Seleccionar plan Business
3. Stripe Checkout (usar tarjeta de prueba 4242 4242 4242 4242)
4. Verificar redirección a /billing/success
5. Verificar que el plan cambió en el dashboard
6. Verificar email de confirmación
```

### Flujo 4: Custom domain
```
1. Login → Domains → Add domain
2. Ingresar dominio de prueba
3. Ver instrucciones DNS
4. Simular verificación exitosa (mock de API)
5. Verificar que el sitio responde en el dominio
```

### Flujo 5: Seguridad — Tenant isolation
```
1. Login como Tenant A
2. Obtener ID de un recurso de Tenant B (via DB directa)
3. Intentar GET /api/v1/sites/{siteDeTenantB}
4. Verificar respuesta 403 o 404
```

---

## Unit Tests — NestJS (Jest)

### AuthService
```typescript
describe('AuthService', () => {
  it('should hash password with bcrypt on register')
  it('should return tokens on successful login')
  it('should throw UnauthorizedException for wrong password')
  it('should throw UnauthorizedException for non-existent user')
  it('should rotate refresh token on refresh')
  it('should invalidate token on logout')
})
```

### TenantGuard
```typescript
describe('TenantGuard', () => {
  it('should allow access to own tenant resources')
  it('should deny access to other tenant resources')
  it('should allow SUPER_ADMIN to access any tenant')
})
```

### SitesService
```typescript
describe('SitesService', () => {
  it('should create site with correct tenantId')
  it('should not return sites from other tenants')
  it('should enforce plan limits (max sites)')
  it('should publish site and trigger ISR revalidation')
})
```

---

## Integration Tests — API (Supertest)

### Auth endpoints
```typescript
describe('POST /api/v1/auth/register', () => {
  it('201 — creates user + tenant + sends verification email')
  it('409 — duplicate email returns conflict')
  it('400 — missing required fields')
  it('400 — weak password rejected')
})

describe('POST /api/v1/auth/login', () => {
  it('200 — returns accessToken + sets refreshToken cookie')
  it('401 — wrong password')
  it('429 — rate limit after 5 failed attempts')
})
```

### Sites endpoints
```typescript
describe('GET /api/v1/sites', () => {
  it('200 — returns only sites of authenticated tenant')
  it('401 — unauthenticated request')
})
```

---

## Performance Tests (k6)

### Escenario: Renderer bajo carga
```javascript
// k6 script — simula 100 usuarios viendo sitios públicos
export const options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% de requests < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% de errores
  },
}
```

### Escenario: Builder guardando contenido
- 20 usuarios simultáneos guardando páginas → p95 < 1000ms

---

## Convenciones de Testing

### Nomenclatura
- Archivos: `{nombre}.service.spec.ts`, `{nombre}.e2e.spec.ts`
- Describe: nombre del módulo/componente
- It: "should [comportamiento esperado] when [condición]"

### Setup de tests
- `beforeAll`: setup de DB de test (migrations)
- `afterAll`: cleanup de DB
- `beforeEach`: reset de estado mutable
- Factories para crear datos de test (no fixtures estáticas)

### Test doubles
- Mocks: solo para servicios externos (Stripe, S3, Resend)
- No mockear la DB en integration tests → usar DB de test real
- Prisma: `$transaction` con rollback al final de cada test

---

## Checklist de Progreso

### FASE 0
- [x] Estrategia de testing definida
- [x] Flujos E2E críticos documentados
- [x] Convenciones de testing establecidas
- [ ] Jest configurado en apps/api
- [ ] Vitest configurado en apps/admin
- [ ] Playwright configurado en la raíz
- [ ] Coverage thresholds configurados en turbo.json

### FASE 1 — MVP
- [ ] Unit tests del módulo auth (>80% coverage)
- [ ] Unit tests del módulo sites y pages
- [ ] Integration tests de auth endpoints
- [ ] Integration tests de sites y pages endpoints
- [ ] E2E: Flujo 1 — Registro y primer sitio
- [ ] E2E: Flujo 2 — Editar y publicar página
- [ ] E2E: Flujo 3 — Suscripción (Stripe test mode)
- [ ] E2E: Flujo 5 — Tenant isolation
- [ ] CI: tests corriendo en GitHub Actions

### FASE 2 — v1
- [ ] E2E: Flujo 4 — Custom domain
- [ ] Tests de billing (webhooks de Stripe)
- [ ] Performance test del renderer (k6)
- [ ] Visual regression tests de páginas públicas
- [ ] Coverage report publicado en cada PR

### FASE 3 — v2
- [ ] Load testing completo (1000 usuarios)
- [ ] Chaos testing básico (simular caída de Redis, Postgres)
- [ ] Accesibilidad testing (axe-core en E2E)

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
