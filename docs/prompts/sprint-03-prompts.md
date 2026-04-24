# EdithPress — Prompts Sprint 03 (FASE 2 Cierre + Staging)
**Generado**: 2026-04-19 | **PM**: Agente 01

> **Objetivo del sprint**: Cerrar FASE 2 (v1) — deploy en staging, template marketplace,
> custom domains, analytics dashboard, cobertura de tests y documentación básica.
>
> **Estado al iniciar Sprint 03**:
> - ✅ Sprint 02 cerrado: 126 tests passing (78 unit + 48 e2e)
> - ✅ Backend completo: auth, sites, pages, media, billing, mailer, redis, admin
> - ✅ Todos los frontends operativos: admin, builder, renderer
> - ✅ CI configurado con Postgres + Redis
> - ✅ Dockerfiles de producción listos
> - ❌ Deploy en staging — pendiente desde FASE 1 (BLOQUEANTE)
> - ❌ Template marketplace — sin implementar
> - ❌ Custom domains verificados — sin implementar
> - ❌ Analytics dashboard — sin implementar
> - ❌ Cobertura: mailer (16%), redis (33%), billing (66%) — bajo umbral
>
> **Orden de ejecución**:
> ```
> CRÍTICO PRIMERO (desbloquea todo lo demás):
>   → Agente 09 (DevOps)    — staging deploy
>   → Agente 04 (DB)        — schema custom domains + templates
>
> PARALELO (una vez 04 complete):
>   → Agente 05 (Backend)   — template API + custom domains API + analytics
>   → Agente 12 (UX)        — componentes UI faltantes + diseño templates
>
> PARALELO (una vez 05 complete):
>   → Agente 06 (Admin)     — template marketplace UI + custom domains UI + analytics UI
>   → Agente 07 (Builder)   — template selector en builder
>   → Agente 08 (Renderer)  — soporte custom domains + analytics script
>
> ÚLTIMO:
>   → Agente 10 (Security)  — revisión custom domains security + rate limiting
>   → Agente 11 (QA)        — cobertura mailer/redis/billing + E2E flujo completo
> ```

---

## AGENTE 09 — DevOps Engineer
**Abrir chat nuevo → "Actúa como DevOps Engineer de EdithPress, lee docs/agents/09-devops-engineer.md"**

```
Eres el DevOps Engineer (Agente 09) de EdithPress.
Lee docs/agents/09-devops-engineer.md para tu contexto completo.

ESTADO ACTUAL — Sprint 03:
- ✅ docker-compose.yml local (Postgres + Redis + MinIO + Mailpit)
- ✅ Dockerfiles multi-stage para las 4 apps (api, admin, builder, renderer)
- ✅ docker-compose.prod.yml con Nginx reverse proxy
- ✅ infrastructure/nginx/nginx.prod.conf con virtual hosts + wildcard *.edithpress.com
- ✅ GitHub Actions CI: lint + typecheck + unit tests + e2e tests con Postgres/Redis
- ✅ .env.example completo con todas las variables
- ❌ Deploy en staging — NUNCA se ha hecho (bloqueante desde FASE 1)
- ❌ SSL/HTTPS en staging
- ❌ Wildcard DNS *.edithpress.com apuntando al servidor
- ❌ Monitoreo y health checks externos
- ❌ Pipeline de CD (Continuous Deployment) al staging

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Script de Deploy a Staging
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee docker-compose.prod.yml y infrastructure/nginx/nginx.prod.conf completos.

Crear scripts/deploy-staging.sh en la raíz del monorepo:

#!/bin/bash
set -e

echo "==> Building images..."
docker compose -f docker-compose.prod.yml build

echo "==> Running database migrations..."
docker compose -f docker-compose.prod.yml run --rm api \
  node -e "require('./apps/api/dist/main')" \
  || npx prisma migrate deploy

echo "==> Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "==> Health check..."
sleep 10
curl -f http://localhost:3011/api/v1/health || (echo "API health check failed" && exit 1)

echo "==> Deploy complete."

El script debe:
- Hacer pull de la imagen base o build local según un flag --build
- Correr migraciones de Prisma ANTES de levantar la API
- Verificar que los servicios están healthy con un curl básico
- Imprimir el estado final de los contenedores (docker compose ps)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Configuración SSL con Certbot
Prioridad: CRÍTICA (HTTPS obligatorio para Stripe y cookies)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear infrastructure/nginx/nginx.staging.conf:

Configuración con:
- server_name admin.edithpress.com → proxy a admin:3010
- server_name api.edithpress.com → proxy a api:3011
- server_name builder.edithpress.com → proxy a builder:3002
- server_name *.edithpress.com → proxy a renderer:3003
  con proxy_set_header X-Tenant-Slug extraído del subdominio:
  set $tenant $host;
  if ($host ~ ^([^.]+)\.edithpress\.com$) { set $tenant $1; }
  proxy_set_header X-Tenant-Slug $tenant;

- Redirect HTTP → HTTPS en todos los virtual hosts
- Certificados en /etc/letsencrypt/live/ (Certbot)

Crear infrastructure/certbot/init-letsencrypt.sh:
Script que obtiene el certificado wildcard de *.edithpress.com vía DNS challenge.
Documentar los pasos manuales de DNS challenge ya que requiere acceso al registrador.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Job de CD en GitHub Actions
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee .github/workflows/ci.yml completo.

Agregar un job deploy-staging al final del ci.yml:

deploy-staging:
  needs: [lint-typecheck, test, build]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  environment: staging
  steps:
    - uses: actions/checkout@v4
    - name: Deploy to staging via SSH
      uses: appleboy/ssh-action@v1
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          cd /opt/edithpress
          git pull origin main
          bash scripts/deploy-staging.sh

Secrets requeridos (documentar en docs/):
- STAGING_HOST: IP del servidor
- STAGING_USER: usuario SSH (ej: ubuntu)
- STAGING_SSH_KEY: clave privada SSH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Monitoreo Básico
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear infrastructure/monitoring/docker-compose.monitoring.yml con:
- Servicio uptime-kuma (louislam/uptime-kuma:1) en puerto 3100
- Volumen persistente para su base de datos

Documentar en docs/monitoring-setup.md:
- URL del panel de Uptime Kuma en staging
- Los 5 monitores a configurar manualmente:
  1. GET https://api.edithpress.com/api/v1/health → 200
  2. GET https://admin.edithpress.com → 200
  3. GET https://builder.edithpress.com → 200
  4. GET https://demo-agency.edithpress.com → 200 (sitio de demo)
  5. TCP check al puerto 5432 (Postgres) internamente

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Backups de Base de Datos
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear scripts/backup-db.sh:
- pg_dump a un archivo .sql.gz con timestamp
- Subir a MinIO/S3 bucket de backups (bucket: edithpress-backups)
- Conservar solo los últimos 7 días (borrar los más viejos)

Agregar al docker-compose.prod.yml un servicio cron:
  image: alpine + cron job que corra backup-db.sh diario a las 2am UTC

RESTRICCIONES:
- No hardcodear credenciales — todo desde variables de entorno
- El script de deploy debe ser idempotente (puede correr N veces sin romper)
- Documentar en docs/deployment-guide.md el proceso completo de primer deploy
```

---

## AGENTE 04 — Database Engineer
**Abrir chat nuevo → "Actúa como Database Engineer de EdithPress, lee docs/agents/04-database-engineer.md"**

```
Eres el Database Engineer (Agente 04) de EdithPress.
Lee docs/agents/04-database-engineer.md para tu contexto completo.

ESTADO ACTUAL — Schema Prisma (packages/database/prisma/schema.prisma):
- ✅ User, Tenant, TenantUser, Site, Page, PageVersion
- ✅ MediaFile, Subscription, Invoice, Plan
- ✅ PasswordResetToken (añadido Sprint 02)
- ✅ Template (GET list + GET by id implementados en API)
- ✅ Índices de performance básicos añadidos Sprint 02
- ❌ CustomDomain model — NO EXISTE (bloqueante para custom domains)
- ❌ Analytics model — NO EXISTE (bloqueante para dashboard de analítica)
- ❌ Template model puede no tener todos los campos necesarios para el marketplace
- ❌ Seed de demo sin datos reales de templates

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Modelo CustomDomain
Prioridad: CRÍTICA (desbloquea Agentes 05, 08, 09)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee schema.prisma completo antes de modificarlo.

Agregar modelo CustomDomain:

model CustomDomain {
  id           String            @id @default(cuid())
  tenantId     String
  siteId       String            @unique
  domain       String            @unique  // ej: "www.miempresa.com"
  status       CustomDomainStatus @default(PENDING)
  verifiedAt   DateTime?
  txtRecord    String            // token de verificación DNS (_edithpress-verify.{domain})
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  tenant       Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  site         Site              @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([domain])
}

enum CustomDomainStatus {
  PENDING      // creado, esperando que el usuario configure DNS
  VERIFYING    // verificación en progreso
  ACTIVE       // DNS verificado, dominio activo
  FAILED       // falló verificación
}

Agregar relación inversa en Site:
  customDomain CustomDomain?

Agregar relación inversa en Tenant:
  customDomains CustomDomain[]

Migración:
  cd packages/database && pnpm prisma migrate dev --name add_custom_domain

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Modelo Analytics (PageView)
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agregar modelo para tracking de vistas de página:

model PageView {
  id        String   @id @default(cuid())
  siteId    String
  pageId    String?  // null si la página fue eliminada
  path      String   // "/about", "/" etc.
  referrer  String?
  userAgent String?
  country   String?  // GeoIP (opcional, puede ser null)
  createdAt DateTime @default(now())
  site      Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@index([siteId, createdAt])
  @@index([siteId, path])
}

Agregar relación inversa en Site:
  pageViews PageView[]

Migración:
  cd packages/database && pnpm prisma migrate dev --name add_page_view_analytics

NOTA: Este modelo es intencionalmentesimple. No almacenar IPs completas (GDPR).
Solo almacenar país (de GeoIP) y user agent.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Enriquecer Modelo Template
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee cómo está el modelo Template en schema.prisma.

Si el modelo existe pero le faltan campos para el marketplace, agregar:
- previewImageUrl: String?     // screenshot del template
- category: String             // "landing", "portfolio", "restaurante", etc.
- isPremium: Boolean @default(false)
- sortOrder: Int @default(0)   // orden de aparición en el marketplace
- usageCount: Int @default(0)  // cuántas veces fue usado

Si el modelo NO existe, crearlo completo.

Migración:
  cd packages/database && pnpm prisma migrate dev --name enrich_template_model

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Seed con 10 Templates + Datos de Demo
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actualizar packages/database/prisma/seed.ts:

1. Crear 10 templates con contenido real (estructura JSON de bloques Puck):
   - "landing-startup" (category: landing) — HeroBlock + TextBlock + CardGridBlock + ButtonBlock
   - "landing-agencia" (category: landing) — HeroBlock + GalleryBlock + ContactFormBlock
   - "portfolio-creativo" (category: portfolio) — HeroBlock + GalleryBlock + TextBlock
   - "portfolio-fotografo" (category: portfolio) — HeroBlock + GalleryBlock + ButtonBlock
   - "restaurante" (category: restaurante) — HeroBlock + TextBlock + ImageBlock + ContactFormBlock
   - "tienda-local" (category: negocio) — HeroBlock + CardGridBlock + ContactFormBlock
   - "blog-personal" (category: blog) — HeroBlock + TextBlock + CardGridBlock
   - "consultoria" (category: negocio) — HeroBlock + TextBlock + CardGridBlock + ButtonBlock
   - "educacion" (category: educacion) — HeroBlock + CardGridBlock + TextBlock + ButtonBlock
   - "pagina-en-blanco" (category: basico) — sin bloques, para empezar desde cero

2. Tenant de demo completo:
   - Tenant: { name: 'Demo Agency', slug: 'demo', plan: starter }
   - User: { email: 'demo@edithpress.com', password: 'Demo123!' }
   - 1 Site publicado usando el template "landing-agencia"
   - 3 páginas: homepage, about, contact — con contenido real en cada una

Ejecutar:
  cd packages/database && pnpm prisma db seed

RESTRICCIONES:
- No cambiar modelos existentes de forma breaking
- Las migraciones deben poder aplicarse en orden (sin dependencias circulares)
- Regenerar el client después de cada migración: pnpm prisma generate
```

---

## AGENTE 05 — Backend Developer
**Abrir chat nuevo → "Actúa como Backend Developer de EdithPress, lee docs/agents/05-backend-developer.md"**

```
Eres el Backend Developer (Agente 05) de EdithPress.
Lee docs/agents/05-backend-developer.md para tu contexto completo.

ESTADO ACTUAL — Sprint 03:
- ✅ auth: completo (Redis + Mailer + PasswordReset)
- ✅ sites, pages, media, tenants, users: CRUD completo
- ✅ billing: webhooks Stripe completos (5 handlers)
- ✅ admin: endpoints super-admin (/admin/stats, /admin/tenants, /admin/plans)
- ✅ redis: módulo global con set/get/del
- ✅ mailer: Resend con 3 métodos (verify, reset, contact)
- ❌ templates: solo GET list + GET by id — sin "usar template" al crear sitio
- ❌ custom-domains: módulo NO EXISTE
- ❌ analytics: tracking de PageView NO EXISTE
- ❌ Stripe: solo plan Starter activo — otros planes sin configurar

NOTA: Esperar a que el Agente 04 complete las migraciones de CustomDomain,
PageView y Template antes de implementar los módulos que los usan.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Módulo Custom Domains
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/api/src/modules/custom-domains/ con:

custom-domains.module.ts
custom-domains.controller.ts  (prefijo: /sites/:siteId/domain)
custom-domains.service.ts

Endpoints (todos requieren JwtAuthGuard + TenantGuard):

POST /sites/:siteId/domain
  Body: { domain: string }  // ej: "www.miempresa.com"
  Lógica:
  1. Validar formato de dominio (regex básico, sin http://, sin path)
  2. Verificar que el dominio no está ya en uso por otro tenant (unique constraint)
  3. Generar txtRecord: crypto.randomBytes(16).toString('hex')
  4. Crear CustomDomain con status PENDING
  5. Retornar: { domain, txtRecord, instructions }
  instructions debe incluir:
    "Agrega un registro TXT en tu DNS: _edithpress-verify.{domain} = {txtRecord}"

GET /sites/:siteId/domain
  Retornar el CustomDomain del sitio con su status actual

POST /sites/:siteId/domain/verify
  Lógica de verificación DNS:
  1. Obtener el CustomDomain del sitio
  2. Consultar el registro TXT: _edithpress-verify.{domain}
     Usar el módulo dns de Node.js: dns.promises.resolveTxt(...)
  3. Si el valor coincide con txtRecord:
     - Actualizar status = ACTIVE, verifiedAt = new Date()
     - Retornar { success: true, status: 'ACTIVE' }
  4. Si no coincide o falla:
     - Actualizar status = FAILED
     - Retornar { success: false, message: 'Registro TXT no encontrado o incorrecto' }

DELETE /sites/:siteId/domain
  Eliminar el CustomDomain del sitio (vuelve a subdominio .edithpress.com)

Registrar CustomDomainsModule en AppModule.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Módulo Analytics
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/api/src/modules/analytics/ con:

analytics.module.ts
analytics.controller.ts
analytics.service.ts

Endpoints:

POST /analytics/pageview (PÚBLICO — sin auth, llamado desde el renderer)
  Body: { siteId: string, path: string, referrer?: string, userAgent?: string }
  Lógica:
  1. Verificar que el siteId existe (simple prisma.site.findUnique)
  2. Crear PageView: { siteId, path, referrer, userAgent, country: null }
  3. Retornar 204 No Content (sin cuerpo)
  Rate limit: 10 por IP por minuto (para evitar spam)
  NO guardar la IP completa — cumplimiento GDPR

GET /sites/:siteId/analytics (requiere auth + ownership)
  Query params: ?period=7d|30d|90d (default: 30d)
  Response:
  {
    totalViews: number,
    uniquePaths: number,
    topPages: [{ path, views, percentage }],  // top 10
    viewsByDay: [{ date: "2026-04-19", views: number }],  // array de days en el período
    referrers: [{ referrer, count }]  // top 10 referrers
  }

  Lógica:
  - Calcular startDate según period (30d = new Date() - 30 días)
  - Usar prisma.$queryRaw o agrupaciones de Prisma para los agregados
  - Caché de 5 minutos en Redis: analytics:{siteId}:{period}

Registrar AnalyticsModule en AppModule.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Template Marketplace: "Usar Template" al Crear Sitio
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/sites/sites.service.ts y sites.controller.ts completos.
Lee cómo funciona el modelo Template en el schema (después de que Agente 04 lo actualice).

Modificar POST /sites (crear sitio) para aceptar un templateId opcional:
  Body: { name: string, slug: string, description?: string, templateId?: string }

Si templateId está presente:
  1. Buscar el template: prisma.template.findUnique({ where: { id: templateId } })
  2. Si no existe: ignorar (crear sitio en blanco)
  3. Si existe: al crear el sitio, crear también la homepage con el contenido del template:
     prisma.page.create({
       data: {
         siteId: newSite.id,
         title: 'Inicio',
         slug: '/',
         isHomepage: true,
         status: 'DRAFT',
         content: template.content,  // el JSON de bloques Puck
       }
     })
  4. Incrementar template.usageCount en +1

También agregar endpoint:
GET /templates (ya existe) — agregar query params:
  ?category=landing&limit=12&page=1
  Response debe incluir: id, name, description, previewImageUrl, category, isPremium, usageCount

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Activar Todos los Planes de Stripe
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/billing/billing.service.ts y billing.controller.ts completos.

El plan actual solo tiene Stripe Starter configurado.
Verificar qué planes hay en la BD (4 en seed: free, starter, business, agency).

1. Agregar en .env.example las variables de Price ID de Stripe para cada plan:
   STRIPE_PRICE_STARTER_MONTHLY=price_xxx
   STRIPE_PRICE_STARTER_YEARLY=price_xxx
   STRIPE_PRICE_BUSINESS_MONTHLY=price_xxx
   STRIPE_PRICE_BUSINESS_YEARLY=price_xxx
   STRIPE_PRICE_AGENCY_MONTHLY=price_xxx
   STRIPE_PRICE_AGENCY_YEARLY=price_xxx

2. En billing.service.ts, el método createCheckoutSession debe aceptar:
   { planId: string, interval: 'monthly' | 'yearly' }
   Y mapear planId + interval al Price ID correcto de Stripe.

3. En billing.controller.ts, el endpoint POST /billing/checkout debe aceptar
   el campo interval en el body.

4. Agregar endpoint GET /billing/plans:
   Retorna todos los planes con sus precios: { id, name, priceMonthly, priceYearly, features }
   Esta lista la consumen el admin y la landing page de precios.

RESTRICCIONES:
- No romper el endpoint de checkout existente
- Usar prisma.$transaction cuando se modifiquen múltiples tablas
- Rate limiting en POST /analytics/pageview (proteger contra spam)
- Al terminar: cd apps/api && pnpm build
```

---

## AGENTE 06 — Frontend Admin
**Abrir chat nuevo → "Actúa como Frontend Admin Developer de EdithPress, lee docs/agents/06-frontend-admin.md"**

```
Eres el Frontend Admin Developer (Agente 06) de EdithPress.
Lee docs/agents/06-frontend-admin.md para tu contexto completo.

ESTADO ACTUAL — Sprint 03:
- ✅ Auth completo: login, register, verify-email, forgot-password, reset-password, middleware
- ✅ Dashboard: KPIs + listado de sitios
- ✅ Sites: CRUD + settings + pages list
- ✅ Billing: plan actual + upgrade + portal Stripe
- ✅ Media Library: upload + filtros + paginación + clipboard + delete
- ✅ Super Admin: dashboard + tenants + plans (con datos reales)
- ❌ Template marketplace — NO existe (solo "crear sitio en blanco")
- ❌ Custom domains UI — NO existe
- ❌ Analytics dashboard — NO existe
- ❌ Selector de plan con intervalos monthly/yearly — NO existe

NOTA: Las tareas dependen de que Agente 05 entregue los endpoints primero.
Si no están listos, implementar UI con datos mock y comentario // TODO: conectar a API.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Template Marketplace en el flujo de creación de sitios
Prioridad: CRÍTICA (mejora la activación de usuarios nuevos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/admin/src/app/(tenant)/sites/ completo — todos los archivos.

Actualmente al crear un sitio se va directo a un formulario básico.
Cambiar el flujo a:

Paso 1 — Template selector (nueva página o modal grande):
  - GET /api/v1/templates?limit=12
  - Grid de cards de templates (3 columnas): imagen de preview + nombre + categoría
  - Filtros por categoría: Todos / Landing / Portfolio / Negocio / Restaurante / Educación
  - Card especial "Página en blanco" siempre visible primera
  - Al seleccionar: highlight de la card seleccionada + botón "Continuar"

Paso 2 — Formulario de datos del sitio (modal o página siguiente):
  - Nombre del sitio (required)
  - Subdominio (required, validar formato: solo letras, números, guiones)
  - El templateId seleccionado va oculto en el body del POST /api/v1/sites

Implementar en apps/admin/src/app/(tenant)/sites/new/ o como un Dialog multi-paso.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Custom Domains UI
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agregar sección "Dominio personalizado" en apps/admin/src/app/(tenant)/sites/[siteId]/settings/:

Estado: Sin dominio configurado
  - Input: "tu-dominio.com" + botón "Conectar dominio"
  - POST /api/v1/sites/:siteId/domain con { domain }

Estado: Pendiente (PENDING/VERIFYING)
  - Mostrar el registro DNS a agregar:
    "Agrega este registro TXT a tu DNS:"
    Tipo: TXT
    Nombre: _edithpress-verify.tu-dominio.com
    Valor: {txtRecord}
  - Botón "Verificar" → POST /api/v1/sites/:siteId/domain/verify
  - Botón "Copiar" para el valor del registro

Estado: Activo (ACTIVE)
  - Badge verde "Dominio activo" + fecha de verificación
  - El dominio linkeable en nueva pestaña
  - Botón "Eliminar dominio" con modal de confirmación → DELETE

Estado: Fallido (FAILED)
  - Alert rojo "No se encontró el registro DNS"
  - Instrucciones de resolución + botón "Intentar de nuevo"

Polling automático cada 30s cuando está en PENDING/VERIFYING.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Analytics Dashboard por Sitio
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/admin/src/app/(tenant)/sites/[siteId]/analytics/page.tsx:

Layout:
- Selector de período (tabs): Últimos 7 días / 30 días / 90 días
- GET /api/v1/sites/:siteId/analytics?period=30d

KPI cards (fila superior):
  - Total de vistas
  - Páginas únicas visitadas
  - Página más visitada

Gráfico de vistas por día:
  - Usar recharts (instalar si no está: pnpm add recharts)
  - LineChart o BarChart con los datos de viewsByDay
  - Eje X: fechas, Eje Y: número de vistas

Tabla de páginas más visitadas:
  - Columnas: Página (path), Vistas, % del total
  - Top 10

Tabla de referrers:
  - Columnas: Referrer, Visitas
  - "Directo" para referrer null/vacío

Agregar link "Analítica" en la navegación del sitio (sidebar o tabs de settings).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Selector de Plan Monthly/Yearly en Billing
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/admin/src/app/(tenant)/billing/page.tsx completo.

Agregar toggle Monthly/Yearly en la página de billing:
- Toggle visual (Switch) entre mensual y anual
- Mostrar descuento anual: "Ahorra 20%" junto al toggle
- Los precios de cada plan cambian según el toggle
- GET /api/v1/billing/plans para obtener los precios reales
- Al hacer click en "Upgrade": pasar interval: 'monthly' | 'yearly' al checkout

RESTRICCIONES:
- Server Components por defecto, 'use client' solo cuando sea necesario
- React Query para data fetching + polling del estado del dominio
- next/image para todas las imágenes de templates
- Al terminar: cd apps/admin && pnpm build
```

---

## AGENTE 07 — Frontend Builder
**Abrir chat nuevo → "Actúa como Frontend Builder Developer de EdithPress, lee docs/agents/07-frontend-builder.md"**

```
Eres el Frontend Builder Developer (Agente 07) de EdithPress.
Lee docs/agents/07-frontend-builder.md para tu contexto completo.

ESTADO ACTUAL — Sprint 03:
- ✅ Editor Puck con 8 bloques funcionando
- ✅ Autosave con indicador de estado (useAutosave hook)
- ✅ Toolbar mejorada con 3 zonas: indicador estado / nombre página / acciones
- ✅ Preview en iframe con toggle desktop/mobile (PreviewDrawer)
- ✅ Campos de bloques completos y verificados
- ❌ No hay selector de bloques mejorado (solo el panel default de Puck)
- ❌ No hay bloque Pricing/Precios
- ❌ No hay bloque Video
- ❌ No hay integración con Media Library del admin (picker de imágenes)

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Bloque de Video
Prioridad: ALTA (muy solicitado por usuarios de landing pages)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee HeroBlock.tsx para entender el patrón de bloques existente.

Crear apps/builder/src/blocks/VideoBlock.tsx:

Props (fields de Puck):
- videoUrl: { type: 'text', label: 'URL del video' }
  Aceptar: YouTube (youtube.com/watch?v=, youtu.be/), Vimeo (vimeo.com/)
- title: { type: 'text', label: 'Título (opcional)' }
- aspectRatio: { type: 'select', label: 'Proporción', options: [
    { label: '16:9 (YouTube)', value: '16/9' },
    { label: '4:3', value: '4/3' },
    { label: '1:1 (Square)', value: '1/1' },
  ]}
- autoplay: { type: 'radio', label: 'Autoplay', options: [
    { label: 'No', value: 'false' },
    { label: 'Sí (muted)', value: 'true' },  // autoplay solo funciona muted
  ]}

Renderizado:
1. Detectar si es YouTube o Vimeo y extraer el video ID de la URL
2. Renderizar un <iframe> con la URL de embed correspondiente
   YouTube: https://www.youtube.com/embed/{videoId}?autoplay={0|1}&mute={0|1}
   Vimeo: https://player.vimeo.com/video/{videoId}?autoplay={0|1}&muted={0|1}
3. Contenedor con aspect-ratio CSS según el prop
4. Si la URL no es válida: mostrar placeholder "URL de video inválida"

Registrar VideoBlock en el puck config.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Bloque de Precios (PricingBlock)
Prioridad: ALTA (crítico para landing pages de SaaS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/PricingBlock.tsx:

Props:
- title: { type: 'text', label: 'Título de la sección' }
- plans: { type: 'array', label: 'Planes', arrayFields: {
    name: { type: 'text', label: 'Nombre del plan' },
    price: { type: 'text', label: 'Precio (ej: $29/mes)' },
    description: { type: 'text', label: 'Descripción breve' },
    features: { type: 'textarea', label: 'Características (una por línea)' },
    ctaText: { type: 'text', label: 'Texto del botón' },
    ctaUrl: { type: 'text', label: 'URL del botón' },
    isHighlighted: { type: 'radio', label: 'Destacar plan', options: [
      { label: 'No', value: 'false' },
      { label: 'Sí', value: 'true' }
    ]}
  }}

Renderizado:
- Grid de 1, 2 o 3 columnas según la cantidad de planes
- Card por plan: nombre + precio grande + descripción + lista de features + botón CTA
- Plan destacado: borde de color primario + badge "Más popular"
- features: hacer split por \n para mostrar como lista con checkmarks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Media Picker para campos de imagen
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actualmente los campos de imagen en los bloques son inputs de texto libre (pegar URL).
Mejorar con un picker que abra la Media Library.

Crear apps/builder/src/components/MediaPicker.tsx:

Comportamiento:
- Muestra el input de URL actual + botón "Seleccionar de biblioteca"
- Al clicar el botón: abre un Modal con un grid de imágenes del tenant
  GET /api/v1/media?type=image&limit=24 (llamada al API)
- Al seleccionar una imagen: cierra el modal y rellena el campo URL
- El input sigue siendo editable para pegar URLs externas

Integrar como custom field en los bloques que tienen campos de imagen:
- HeroBlock: backgroundImage
- ImageBlock: src
- CardGridBlock: cards[*].imageUrl
- GalleryBlock: images[*].src

Para custom fields en Puck, revisar la documentación de Puck sobre 'custom' field type.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Sincronización del Renderer tras Publicar
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee cómo funciona el botón "Publicar" en BuilderToolbar.tsx.

Después del POST /api/v1/sites/{siteId}/pages/{pageId}/publish exitoso,
llamar al endpoint de revalidación del renderer para forzar ISR inmediato:

POST /api/revalidate del renderer (o usar la API interna del renderer si existe)
  Body: { siteId, pageSlug, secret: RENDERER_SECRET }

Verificar si existe este endpoint en apps/renderer/src/app/api/.
Si no existe: crearlo (Next.js On-demand Revalidation):
  import { revalidatePath } from 'next/cache'
  En el handler: revalidatePath(`/${pageSlug}`)

Esto elimina el delay de 1 hora (ISR revalidate=3600) cuando el usuario publica.

RESTRICCIONES:
- Los nuevos bloques (Video, Pricing) deben también estar implementados en el renderer
  (ver tarea del Agente 08)
- No cambiar los nombres de props de bloques existentes (rompe sitios publicados)
- Al terminar: cd apps/builder && pnpm build
```

---

## AGENTE 08 — Frontend Renderer
**Abrir chat nuevo → "Actúa como Frontend Renderer Developer de EdithPress, lee docs/agents/08-frontend-renderer.md"**

```
Eres el Frontend Renderer Developer (Agente 08) de EdithPress.
Lee docs/agents/08-frontend-renderer.md para tu contexto completo.

ESTADO ACTUAL — Sprint 03:
- ✅ Routing dinámico, ISR (revalidate=3600), Draft Mode
- ✅ 8 bloques renderizando (Hero, Text, Image, Button, Separator, Gallery, ContactForm, CardGrid)
- ✅ next/image en todos los bloques
- ✅ sitemap.ts + robots.ts dinámicos
- ✅ OG tags completos (og:image, og:type, twitter:card, canonical)
- ✅ Páginas de error (error.tsx) y not-found.tsx por tenant
- ❌ Soporte de custom domains — solo funciona con subdominios .edithpress.com
- ❌ VideoBlock y PricingBlock NO existen en el renderer (los crea Agente 07 en el builder)
- ❌ Tracking de analítica (PageView) NO implementado
- ❌ Endpoint de revalidación On-demand NO existe

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Soporte de Custom Domains
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/renderer/src/middleware.ts completo.

El middleware actual detecta el tenant por subdominio:
  host = "demo-agency.edithpress.com" → tenantSlug = "demo-agency"

Actualizar para soportar custom domains:

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const isSubdomain = host.endsWith('.edithpress.com')

  if (isSubdomain) {
    // lógica actual: extraer slug del subdominio
    const slug = host.replace('.edithpress.com', '')
    request.headers.set('X-Tenant-Slug', slug)
  } else {
    // custom domain: consultar la API para encontrar el tenant
    const response = await fetch(
      `${process.env.API_URL}/api/v1/renderer/domain/${host}`,
      { headers: { 'X-Renderer-Secret': process.env.RENDERER_SECRET! } }
    )
    if (response.ok) {
      const { tenantSlug } = await response.json()
      request.headers.set('X-Tenant-Slug', tenantSlug)
      request.headers.set('X-Custom-Domain', host)
    } else {
      // dominio no encontrado: mostrar página de error genérica
      return NextResponse.rewrite(new URL('/domain-not-found', request.url))
    }
  }
  return NextResponse.next({ request })
}

Verificar con Agente 05 que el endpoint GET /renderer/domain/:domain existe.
Si no existe: crear en el renderer module de la API:
  GET /renderer/domain/:domain → { tenantSlug, siteId }
  Busca en CustomDomain donde domain = :domain y status = ACTIVE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Renderizar VideoBlock y PricingBlock
Prioridad: ALTA (sincronizado con Agente 07)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee cómo están implementados los bloques existentes en apps/renderer/src/app/_components/blocks/.

Crear apps/renderer/src/app/_components/blocks/VideoBlock.tsx:
- Misma lógica de embed que en el builder (YouTube/Vimeo)
- Usar los mismos props: videoUrl, title, aspectRatio, autoplay
- Contenedor responsive con aspect-ratio CSS

Crear apps/renderer/src/app/_components/blocks/PricingBlock.tsx:
- Mismos props que en el builder: title, plans[]
- Renderizado idéntico al builder (grid de cards con features y CTA)
- Usar next/link para los botones de CTA

Registrar ambos en el BlockRenderer (el switch/map que mapea type → componente).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Tracking de PageView
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/renderer/src/app/[[...slug]]/page.tsx completo.

Agregar tracking de vistas en el server component principal:

En la función que renderiza la página (server component), después de obtener los datos:
// Fire-and-forget — no esperar respuesta para no afectar el tiempo de carga
fetch(`${process.env.API_URL}/api/v1/analytics/pageview`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    siteId: site.id,
    path: `/${slug?.join('/') || ''}`,
    referrer: undefined,  // en server component no hay acceso al referrer del browser
    userAgent: undefined,
  }),
  cache: 'no-store',
}).catch(() => {})  // silenciar errores — el tracking nunca debe romper el render

IMPORTANTE: No usar await. Fire-and-forget para no añadir latencia.
IMPORTANTE: No incluir este fetch en el tiempo de renderizado (no afecta LCP).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Endpoint de Revalidación On-demand
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/renderer/src/app/api/revalidate/route.ts:

import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('X-Revalidate-Secret')
  if (secret !== process.env.RENDERER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { pageSlug } = await request.json()
  revalidatePath(`/${pageSlug === '/' ? '' : pageSlug}`)

  return NextResponse.json({ revalidated: true, path: pageSlug })
}

Esto permite que el builder fuerce la actualización del ISR inmediatamente tras publicar.

RESTRICCIONES:
- No cambiar el formato JSON de bloques existentes
- El tracking de PageView nunca debe bloquear el render (siempre fire-and-forget)
- Mantener Draft Mode funcionando
- Al terminar: cd apps/renderer && pnpm build
```

---

## AGENTE 12 — UX Designer
**Abrir chat nuevo → "Actúa como UX Designer de EdithPress, lee docs/agents/12-ux-designer.md"**

```
Eres el UX Designer (Agente 12) de EdithPress.
Lee docs/agents/12-ux-designer.md para tu contexto completo.

ESTADO ACTUAL — packages/ui/src/:
- ✅ Button, Input, Card, Badge, Alert, Dialog
- ✅ (Componentes añadidos Sprint 02 — verificar cuáles existen en el repo)

Lee TODOS los archivos en packages/ui/src/ antes de empezar para no duplicar trabajo.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Verificar y completar componentes del Sprint 02
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verificar que existen y funcionan estos componentes (del sprint anterior):
- Toast / ToastProvider / useToast
- Modal (con sub-componentes Body y Footer)
- DataTable
- Pagination
- FormField
- Select
- Textarea
- Skeleton
- DropdownMenu
- Switch

Si alguno NO existe o está incompleto: implementarlo según la spec del Sprint 02.
Si todos existen: pasar a las nuevas tareas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Componente TemplateCard
Prioridad: ALTA (Agente 06 lo necesita para el marketplace)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear packages/ui/src/TemplateCard.tsx:

interface TemplateCardProps {
  id: string
  name: string
  description?: string
  category: string
  previewImageUrl?: string
  isPremium?: boolean
  usageCount?: number
  isSelected?: boolean
  onClick: (id: string) => void
}

Visual:
- Imagen de preview (aspect-ratio 16/9) con next/image, fallback a placeholder gris
- Hover: overlay semitransparente con ícono de "Seleccionar"
- isSelected = true: borde de 2px color primary + checkmark en la esquina superior derecha
- Badge de categoría (bottom-left de la imagen)
- Si isPremium: Badge "Premium" (top-right, color gold/amber)
- Footer de la card: nombre del template + "Usado X veces" (si usageCount > 0)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Componente StatCard (para dashboards)
Prioridad: ALTA (Agente 06 lo necesita para Analytics)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear packages/ui/src/StatCard.tsx:

interface StatCardProps {
  title: string
  value: string | number
  change?: number           // porcentaje de cambio vs período anterior (puede ser negativo)
  changeLabel?: string      // ej: "vs mes anterior"
  icon?: React.ReactNode
  isLoading?: boolean
}

Visual:
- Card con icono en la esquina superior derecha (en un círculo coloreado)
- Título pequeño en gris
- Valor grande y bold
- Si change existe:
  - change > 0: texto verde con flecha ↑ "▲ 12%"
  - change < 0: texto rojo con flecha ↓ "▼ 8%"
  - change = 0: texto gris "— sin cambio"
- isLoading: Skeleton en lugar del valor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Componente StepIndicator (para flujos multi-paso)
Prioridad: MEDIA (Agente 06 lo necesita para el flujo de crear sitio)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear packages/ui/src/StepIndicator.tsx:

interface StepIndicatorProps {
  steps: string[]           // ["Elegir template", "Datos del sitio", "Listo"]
  currentStep: number       // 0-indexed
}

Visual:
- Steps numerados conectados por una línea
- Step completado: círculo con checkmark + texto en negro
- Step actual: círculo con número + texto en primary color
- Step pendiente: círculo vacío + texto en gris
- Responsive: en mobile mostrar solo "Paso 1 de 3"

REQUISITOS DE ENTREGA:
1. Cada componente en su propio archivo en packages/ui/src/
2. Exportar TODO desde packages/ui/src/index.ts
3. TypeScript strict — interfaces explícitas para todas las props
4. Solo Tailwind — sin CSS inline
5. Al terminar: cd packages/ui && pnpm build — sin errores TypeScript
```

---

## AGENTE 10 — Security Engineer
**Abrir chat nuevo → "Actúa como Security Engineer de EdithPress, lee docs/agents/10-security-engineer.md"**

```
Eres el Security Engineer (Agente 10) de EdithPress.
Lee docs/agents/10-security-engineer.md para tu contexto completo.

ESTADO ACTUAL — Sprint 03:
- ✅ XSS sanitization (DOMPurify en content.service.ts)
- ✅ User enumeration protection en auth
- ✅ CSP en Helmet (main.ts)
- ✅ Rate limiting: 100/min global, 5/min login
- ✅ Security headers en todas las apps Next.js
- ✅ Auditoría documentada en docs/security-audit-sprint02.md
- ❌ Custom domains — superficie de ataque nueva (DNS takeover, open redirect)
- ❌ Analytics endpoint público — sin protección de abuso
- ❌ Rate limiting en /analytics/pageview — NO configurado aún

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Seguridad en Custom Domains
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/custom-domains/ (lo creó Agente 05) completo.

Riesgos a mitigar:

1. Subdomain takeover / DNS hijacking:
   El mecanismo de verificación TXT ya protege contra esto.
   Verificar que el txtRecord es suficientemente aleatorio (≥32 chars hex).
   Si crypto.randomBytes(16) → 32 chars hex: OK.
   Si es menos: aumentar a randomBytes(32).

2. Validación del dominio en POST /sites/:siteId/domain:
   Verificar que el dominio ingresado:
   - No es un subdominio de edithpress.com (previene conflictos internos)
   - No es localhost, 127.0.0.1, o rangos IP privadas
   - Tiene formato válido (regex)
   Si el dominio no pasa la validación: BadRequestException con mensaje claro.

3. SSRF en la verificación DNS:
   El endpoint POST /domain/verify consulta DNS.
   Esto es aceptable (dns.promises.resolveTxt es una librería del sistema, no una request HTTP).
   Verificar que NO se hace ningún fetch() a la URL del dominio durante la verificación.

4. Rate limiting en /domain/verify:
   Agregar throttle: 5 intentos de verificación por siteId por hora.
   Usar el ThrottlerModule existente o implementar con Redis:
   SET domain-verify:{siteId} counter EX 3600

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Protección del Endpoint de Analytics
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/analytics/analytics.controller.ts (lo creó Agente 05).

El endpoint POST /analytics/pageview es público (sin auth) y podría ser abusado.

Implementar:
1. Rate limiting estricto: 10 requests por IP por minuto
   Usar el decorador @Throttle del ThrottlerModule de NestJS.

2. Validación del siteId:
   Verificar que el siteId existe en la BD antes de crear el PageView.
   Si no existe: retornar 404 (no crear registros huérfanos).

3. Sanitización del path:
   - Truncar a máximo 500 caracteres
   - No aceptar paths que parezcan XSS (aunque se guarda en BD y no se renderiza directamente)

4. No loguear IPs completas:
   Verificar que el controlador NO guarda req.ip en la BD.
   Solo guardar los campos del body (path, referrer, userAgent).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Auditoría de Seguridad Pre-Staging
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Antes del deploy en staging, hacer un pass de seguridad en todos los módulos nuevos:

1. Correr pnpm audit — documentar nuevas vulnerabilidades si aparecen
2. Verificar que los endpoints nuevos del Sprint 03 tienen los guards correctos:
   - /sites/:siteId/domain/* → JwtAuthGuard + TenantGuard (verificar que siteId pertenece al tenant)
   - /sites/:siteId/analytics → JwtAuthGuard + TenantGuard
   - /analytics/pageview → público pero throttled
   - /api/revalidate del renderer → protegido por RENDERER_SECRET header
3. Verificar que las migraciones del Sprint 03 no exponen datos de otros tenants
4. Verificar CORS: el endpoint POST /analytics/pageview necesita aceptar requests del renderer
   (origin diferente al admin). Agregar el RENDERER_URL a la lista de origins permitidos en CORS.

Actualizar docs/security-audit-sprint02.md → renombrar a docs/security-audit-sprint03.md
con los hallazgos de este sprint.

RESTRICCIONES:
- No degradar funcionalidad para añadir seguridad
- Documentar cada decisión con su justificación
- Al terminar: cd apps/api && pnpm build
```

---

## AGENTE 11 — QA Testing Engineer
**Abrir chat nuevo → "Actúa como QA Testing Engineer de EdithPress, lee docs/agents/11-qa-testing.md"**

```
Eres el QA Testing Engineer (Agente 11) de EdithPress.
Lee docs/agents/11-qa-testing.md para tu contexto completo.

ESTADO ACTUAL — Sprint 03:
- ✅ 126 tests passing (78 unit + 48 e2e) — 100% green
- ✅ CI con Postgres + Redis ejecutando todos los tests
- ✅ sites.e2e-spec.ts + pages.e2e-spec.ts (integration tests)
- ⚠️  mailer.service.ts: 16.79% cobertura (❌ bajo umbral)
- ⚠️  redis.service.ts: 33.92% cobertura (❌ bajo umbral)
- ⚠️  billing.service.ts: 66.58% cobertura (⚠️ ligeramente bajo)
- ❌ E2E flujo completo: registro → crear sitio → publicar → ver en renderer

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Tests Unitarios: MailerService
Prioridad: CRÍTICA (cobertura 16% → mínimo 80%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/mailer/mailer.service.ts completo.

Crear apps/api/src/modules/mailer/mailer.service.spec.ts:

Casos a testear:
1. sendVerificationEmail(to, token):
   - ✅ Llama a resend.emails.send con el subject correcto
   - ✅ El body incluye el token en el link
   - ✅ Si RESEND_API_KEY no está configurado: loguea en consola (no lanza error)
   - ✅ Si Resend falla: loguea el error y continúa (no propaga el error)

2. sendPasswordResetEmail(to, token):
   - ✅ Llama a resend.emails.send con subject "Restablecer contraseña"
   - ✅ El link de reset tiene el token correcto
   - ✅ El link incluye "reset-password" en la URL

3. sendContactFormEmail(opts):
   - ✅ El subject incluye "Nuevo mensaje"
   - ✅ El body incluye fromName, fromEmail y message

Mock strategy:
- Mockear el Resend SDK: jest.mock('@resend/node')
- No llamar a la API real de Resend en ningún test

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Tests Unitarios: RedisService
Prioridad: CRÍTICA (cobertura 33% → mínimo 80%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/redis/redis.service.ts completo.

Crear apps/api/src/modules/redis/redis.service.spec.ts:

Casos a testear:
1. set(key, value, ttlSeconds):
   - ✅ Llama al cliente ioredis con los parámetros correctos (SET key value EX ttl)
   - ✅ Con ttl 0 o negativo: llama sin EX (sin expiración)

2. get(key):
   - ✅ Retorna el valor si existe
   - ✅ Retorna null si no existe

3. del(key):
   - ✅ Llama DEL al cliente ioredis
   - ✅ No lanza error si la key no existe

Mock strategy:
- Crear un mock del cliente ioredis (jest.fn() para set, get, del)
- Inyectar vía 'REDIS_CLIENT' token de NestJS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Tests Unitarios: BillingService (aumentar a 80%)
Prioridad: ALTA (cobertura 66% → mínimo 80%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/billing/billing.service.spec.ts completo.
Lee apps/api/src/modules/billing/billing.service.ts completo.

Identificar qué ramas/métodos no están cubiertos actualmente.
Agregar casos faltantes:

1. handleWebhook():
   - ✅ customer.subscription.created → crea Subscription en BD
   - ✅ customer.subscription.deleted → actualiza status a CANCELED
   - ✅ invoice.payment_failed → crea Invoice FAILED + actualiza Subscription PAST_DUE
   - ✅ evento desconocido → no lanza error (graceful ignore)

2. createCheckoutSession() con interval monthly/yearly:
   - ✅ 'monthly' → selecciona el Price ID mensual correcto
   - ✅ 'yearly' → selecciona el Price ID anual correcto

3. cancelSubscription() si existe:
   - ✅ Llama a Stripe para cancelar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — E2E: Flujo Completo de Usuario
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/test/auth.e2e-spec.ts y sites.e2e-spec.ts para entender el patrón.

Crear apps/api/test/user-journey.e2e-spec.ts:

describe('User Journey — Registro completo hasta publicar', () => {
  it('1. Register → retorna user + tenant')
  it('2. Login → retorna tokens válidos')
  it('3. Create site with template → retorna site con homepage pre-poblada')
  it('4. Get pages of site → retorna la homepage')
  it('5. Update page content → guarda el contenido JSON')
  it('6. Publish page → status cambia a PUBLISHED')
  it('7. Get public renderer data → retorna el sitio y su página publicada')
  it('8. Logout → el refresh token queda inválido')
})

Este test verifica el happy path completo de extremo a extremo.
No es necesario testear cada edge case aquí (eso lo cubren los tests de cada módulo).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Tests de los módulos nuevos (Custom Domains + Analytics)
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Una vez que Agente 05 entregue los módulos:

Crear apps/api/test/custom-domains.e2e-spec.ts con:
- POST /domain con dominio válido → 201 + txtRecord generado
- POST /domain con dominio inválido → 400
- POST /domain/verify cuando el DNS no tiene el registro → retorna { success: false }
- DELETE /domain → 200

Crear apps/api/src/modules/analytics/analytics.service.spec.ts con:
- createPageView() → crea registro en BD
- getAnalytics(siteId, '30d') → retorna estructura correcta con totales

RESTRICCIONES:
- Tests deterministas: usar beforeEach/afterEach para limpiar datos
- No llamar APIs externas reales (Resend, Stripe, DNS) en tests unitarios
- Objetivo de cobertura al cerrar Sprint 03: todos los módulos ≥ 70%
- Al terminar: cd apps/api && pnpm test (todos en verde)
```

---

## Orden de Ejecución Recomendado

```
DÍA 1-2:
  → Agente 04 (DB)     — migraciones + seed (desbloquea al resto)
  → Agente 09 (DevOps) — staging deploy + SSL (paralelo con 04)

DÍA 2-4 (una vez DB listo):
  → Agente 05 (Backend) — custom-domains + analytics + templates + billing plans
  → Agente 12 (UX)      — componentes nuevos (paralelo con 05)

DÍA 4-6 (una vez 05 y 12 listos):
  → Agente 06 (Admin)   — marketplace UI + custom domains UI + analytics dashboard
  → Agente 07 (Builder) — VideoBlock + PricingBlock + MediaPicker + revalidation
  → Agente 08 (Renderer)— custom domains + nuevos bloques + analytics tracking

DÍA 6-7:
  → Agente 10 (Security)— auditoría pre-staging + custom domains security
  → Agente 11 (QA)      — cobertura mailer/redis/billing + E2E journey
```

---

## Estado Sprint 03.1 — Expansión de Bloques
**Fecha de cierre**: 2026-04-24

- [✅] NavbarBlock registrado y renderizando (con sanitizeUrl en renderer)
- [✅] ProductGridBlock creado y renderizando
- [✅] StatsBlock creado y renderizando
- [✅] NewsletterBlock creado y renderizando (con lógica real de submit en renderer)
- [✅] Endpoint newsletter subscription implementado (POST/GET/DELETE + export CSV)
- [✅] NewsletterSubscriber modelo creado en Prisma + migración aplicada
- [✅] Módulo NewsletterModule registrado en AppModule
- [✅] Todos los builds pasan sin errores TypeScript (builder, renderer, api, ui)
- [✅] docs/block-schemas.md creado (contrato inmutable builder ↔ renderer)
- [✅] docs/block-catalog.md creado (catálogo + historias de usuario + tipos de sitio)
- [✅] docs/security-audit-sprint03.1.md creado (sanitizeUrl, rate limiting, auditoría)
- [✅] newsletter.service.spec.ts — 10 tests, 100% cobertura del servicio
- [✅] packages/ui: ProductCard, NewsletterForm, StatItem, CartBadge creados
- [⚠️] 2 tests pre-existentes fallando (pages.service y auth.service — no relacionados con Sprint 03.1)
