# EdithPress — Prompts Sprint 04 (Analytics + Custom Domains + Templates + Onboarding + Staging)
**Generado**: 2026-04-26 | **PM**: Agente 01

> **Objetivo del sprint**: Completar los pendientes críticos de FASE 2 que bloquean que EdithPress
> sea un producto **v1 vendible**. Cuatro ejes paralelos:
>
> 1. **Analytics** — Módulo backend de ingestión de eventos + dashboard frontend con gráficas
> 2. **Custom Domains** — Backend de verificación DNS + UI de gestión de dominios
> 3. **Template Marketplace** — 5 templates seed + UI de exploración y aplicación
> 4. **Onboarding Wizard** — Completar los 5 pasos del wizard (pendiente desde FASE 1)
>
> Secundario (paralelo):
> - **Test Coverage** — Llevar mailer, redis, billing a ≥ 70% de cobertura
> - **Staging Deploy** — Deploy completo en Railway con wildcard DNS
>
> **Estado al iniciar Sprint 04**:
> - ✅ Sprint 03.2 completado: 17 bloques totales en builder + renderer
> - ✅ 167 tests pasando (100%)
> - ✅ NewsletterSubscriber en DB, endpoint /newsletter/subscribe funcionando
> - ✅ Media library completa (upload, filtros, paginación)
> - ✅ Auth completo (login, register, forgot/reset password, JWT + refresh + Redis)
> - ✅ Stripe checkout básico integrado
> - ✅ Dockerfiles multi-stage + docker-compose.prod.yml + nginx.prod.conf
> - ❌ Módulo Analytics — no existe
> - ❌ Módulo Domains (verificación) — no existe
> - ❌ Templates seed en DB — solo el esquema existe en Prisma
> - ❌ Onboarding wizard — pantalla placeholder sin implementar
> - ⚠️ `mailer.service.ts` — cobertura 16.79%
> - ⚠️ `redis.service.ts` — cobertura 33.92%
> - ⚠️ `billing.service.ts` — cobertura 66.58%
> - ❌ Deploy en staging (Railway) — pendiente
>
> **Orden de ejecución**:
> ```
> CRÍTICO PRIMERO (paralelo):
>   → Agente 04 (DB)       — modelos PageView, DomainVerification, migrations
>   → Agente 03 (Architect) — contratos API de analytics, domains y templates
>
> EJE BACKEND (una vez 04 y 03 completen):
>   → Agente 05 (Backend)  — módulos analytics + domains + templates (seed)
>
> EJE FRONTEND (paralelo con backend):
>   → Agente 06 (Admin)    — onboarding wizard + analytics UI + domains UI + templates UI
>
> CIERRE:
>   → Agente 11 (QA)       — cobertura mailer/redis/billing + tests de analytics + domains
>   → Agente 09 (DevOps)   — staging deploy en Railway
>   → Agente 10 (Security) — auditoría domains (SSRF, open redirect) + analytics (tenant isolation)
> ```

---

## AGENTE 01 — Project Manager
**Abrir chat nuevo → "Actúa como Project Manager de EdithPress, lee docs/agents/01-project-manager.md"**

```
Eres el Project Manager (Agente 01) de EdithPress.
Lee docs/agents/01-project-manager.md para tu contexto completo.

CONTEXTO DEL SPRINT 04:
Sprint 04 es el sprint de cierre de FASE 2. El objetivo es que EdithPress sea
un producto v1 vendible: analytics para que los tenants vean sus visitas,
dominios custom para marcas serias, templates para un onboarding rápido,
y el wizard que guía al usuario en sus primeros pasos.

ESTADO ACTUAL (2026-04-26):
- Sprint 03.2 ✅ cerrado: 17 bloques en builder + renderer
- Pendientes FASE 2: Analytics, Custom Domains, Template Marketplace, Onboarding Wizard
- Deuda de cobertura: mailer (16%), redis (33%), billing (66%)
- Deploy staging: no realizado

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Criterios de Aceptación
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analytics Dashboard:
  ✅ Cada visita a una página del renderer registra un PageView (tenant, siteId, pageId, path, ip anónima, userAgent)
  ✅ Dashboard muestra gráfica de visitas por día (últimos 30 días)
  ✅ Cards con totales: visitas totales, páginas únicas visitadas, visitantes únicos (por IP hash)
  ✅ Solo accesible para el tenant dueño del sitio (tenant isolation)
  ✅ Feature flag: solo disponible en plan Business+

Custom Domains:
  ✅ El tenant puede agregar un dominio custom (ej: mitienda.com)
  ✅ El sistema muestra las instrucciones DNS (CNAME a renderer.edithpress.com)
  ✅ El tenant puede disparar una verificación manual ("Verificar ahora")
  ✅ El backend verifica que el DNS CNAME apunte a renderer.edithpress.com
  ✅ Estado visible: PENDING → VERIFIED | FAILED
  ✅ Solo plan Business+ puede tener dominios custom

Template Marketplace:
  ✅ Al menos 5 templates seed en la DB con nombre, descripción, categoría y thumbnail
  ✅ Lista de templates en admin con filtro por categoría
  ✅ Al crear un sitio nuevo, el usuario puede elegir un template
  ✅ El sitio se crea con el contenido JSON del template pre-cargado

Onboarding Wizard (5 pasos):
  ✅ Paso 1: Bienvenida + nombre del negocio
  ✅ Paso 2: Tipo de sitio (portfolio, restaurante, tienda, servicios, blog)
  ✅ Paso 3: Elegir template (filtrado por tipo de sitio)
  ✅ Paso 4: Nombre del sitio + slug (subdominio) con validación de disponibilidad
  ✅ Paso 5: ¡Listo! — CTA "Empezar a editar" que abre el builder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Dependencias Críticas
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Orden de desbloqueo:
1. Agente 04 (DB) + Agente 03 (Architect) — pueden ir EN PARALELO
2. Agente 05 (Backend) — depende de 04 y 03
3. Agente 06 (Admin) — puede empezar onboarding y templates UI en paralelo con 05.
   La analytics UI y domains UI requieren los endpoints de 05.
4. Agente 11 (QA) y Agente 09 (DevOps) — al final
5. Agente 10 (Security) — al final, después de 05 completado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Registro al Cierre del Sprint
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Al cerrar el sprint, actualizar docs/agents/01-project-manager.md sección
"Checklist FASE 2" con los ítems completados y el estado de staging.

RESTRICCIONES:
- El plan "Starter" NO tiene acceso a Analytics ni Custom Domains
- No aprobar cierre si el build de staging falla
- Cobertura de los 3 servicios debe llegar a ≥ 70% antes del cierre
```

---

## AGENTE 04 — Database Engineer
**Abrir chat nuevo → "Actúa como Database Engineer de EdithPress, lee docs/agents/04-database-engineer.md"**

```
Eres el Database Engineer (Agente 04) de EdithPress.
Lee docs/agents/04-database-engineer.md para tu contexto completo.

ESTADO ACTUAL:
- ✅ Sprint 03.1: modelo NewsletterSubscriber agregado y migrado
- DB está en FASE 3.1 — ahora avanzamos a FASE 2 (sprint 04)

ANTES DE EMPEZAR — Lee:
  - packages/database/prisma/schema.prisma  (schema actual completo)

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Modelo PageView (Analytics)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agregar al schema.prisma:

model PageView {
  id          String   @id @default(cuid())
  tenantId    String
  siteId      String
  pageId      String?  // nullable: puede ser una visita a la home que no tenga pageId explícito
  path        String   // slug de la página visitada (ej: "/sobre-nosotros")
  ipHash      String   // SHA-256 del IP del visitante — NUNCA guardar IP real (GDPR)
  userAgent   String?
  referrer    String?
  country     String?  // opcional, de Cloudflare header CF-IPCountry
  createdAt   DateTime @default(now())

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  site        Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([siteId])
  @@index([siteId, createdAt])   // <- índice compuesto para queries de dashboard (últimos 30 días)
  @@index([createdAt])
}

Agregar relaciones inversas en los modelos existentes:
  - En Site:   pageViews  PageView[]
  - En Tenant: pageViews  PageView[]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Modelo DomainVerification (Custom Domains)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El modelo Domain ya existe. Agregar un modelo de log de intentos de verificación:

model DomainVerification {
  id        String   @id @default(cuid())
  domainId  String
  status    DomainStatus
  message   String?  // detalles del resultado (ej: "CNAME correcto", "DNS timeout")
  checkedAt DateTime @default(now())

  domain    Domain   @relation(fields: [domainId], references: [id], onDelete: Cascade)

  @@index([domainId])
}

Agregar relación inversa en Domain:
  verifications  DomainVerification[]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Agregar sites a relaciones inversas en Site
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verificar que el modelo Site tiene la relación correcta con Domain:
Si no existe una relación Site ↔ Domain, NO agregarla — los dominios
pertenecen al Tenant, no al Site.

Verificar que Template tiene el campo `content` como Json con la estructura:
{
  "pages": [
    {
      "title": string,
      "slug": string,
      "isHomepage": boolean,
      "content": [...bloques del page builder]
    }
  ]
}
Si no tiene este formato documentado, agregar un comentario en el schema.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Migration
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generar y aplicar la migration:
  cd packages/database
  npx prisma migrate dev --name add_analytics_and_domain_verification

Verificar que la migración aplica sin errores.
Regenerar el Prisma Client: npx prisma generate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Seed: Templates
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actualizar packages/database/prisma/seed.ts para incluir 5 templates:

Template 1 — "Tienda Artesanal" (category: "ecommerce")
  - Una página home con: Navbar + Hero + CategoryGrid + ProductGrid + SplitContent + Stats + Newsletter + Footer
  - isPremium: false
  - thumbnailUrl: "https://placehold.co/400x300/8B6914/ffffff?text=Tienda+Artesanal"

Template 2 — "Portfolio Creativo" (category: "portfolio")
  - Una página home con: Navbar + Hero + Gallery + SplitContent + Stats + Footer
  - isPremium: false
  - thumbnailUrl: "https://placehold.co/400x300/1a1a2e/ffffff?text=Portfolio"

Template 3 — "Restaurante" (category: "restaurant")
  - Una página home con: Navbar + Hero + CategoryGrid + SplitContent + ContactForm + Footer
  - isPremium: false
  - thumbnailUrl: "https://placehold.co/400x300/c0392b/ffffff?text=Restaurante"

Template 4 — "Agencia de Servicios" (category: "services")
  - Una página home con: Navbar + Hero + CardGrid + Stats + Newsletter + Footer
  - isPremium: false
  - thumbnailUrl: "https://placehold.co/400x300/2c3e50/ffffff?text=Agencia"

Template 5 — "ONG / Causa Social" (category: "nonprofit")
  - Una página home con: Navbar + Hero + SplitContent + Stats + Newsletter + Footer
  - isPremium: false
  - thumbnailUrl: "https://placehold.co/400x300/27ae60/ffffff?text=ONG"

Para el content de cada template, usa defaultProps de los bloques ya implementados.
Ejemplo de estructura para el bloque Navbar en un template:
{
  "type": "NavbarBlock",
  "props": { ...heroBlockDefaultProps con valores del template }
}

NOTA: Los content son JSON, no necesitan ser 100% perfectos visualmente —
solo que sean válidos y que cada bloque tenga los props mínimos para renderizar
sin errores. Los usuarios los van a personalizar.

RESTRICCIONES:
- NO modificar el seed de planes (Starter, Business, Pro, Enterprise) — solo agregar templates
- El seed debe ser idempotente (usar upsert o verificar si ya existen los templates)
- Al terminar: pnpm db:seed — debe correr sin errores
```

---

## AGENTE 03 — Software Architect
**Abrir chat nuevo → "Actúa como Software Architect de EdithPress, lee docs/agents/03-software-architect.md"**

```
Eres el Software Architect (Agente 03) de EdithPress.
Lee docs/agents/03-software-architect.md para tu contexto completo.

CONTEXTO DEL SPRINT 04:
Necesitamos definir los contratos de API para 3 nuevos módulos:
1. Analytics (ingestión de PageViews + dashboard data)
2. Domains (agregar dominio, verificar DNS, listar dominios)
3. Templates (listar, obtener por id — ya existe el modelo, solo exponer la API)

ANTES DE EMPEZAR — Lee:
  - apps/api/src/modules/sites/sites.controller.ts   (patron existente de controladores)
  - apps/api/src/modules/newsletter/newsletter.controller.ts  (patrón de endpoint público)
  - packages/database/prisma/schema.prisma           (modelos PageView, Domain, Template)

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Contrato API: Analytics
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Endpoint de ingestión (llamado por el renderer, público pero rate-limited):
  POST /api/v1/analytics/pageview
  Body: {
    tenantId: string,
    siteId: string,
    pageId?: string,
    path: string,
    referrer?: string,
    userAgent?: string
  }
  Headers usados por el backend: X-Real-IP (de nginx) para generar el ipHash
  Response: 204 No Content (sin body — performance)
  Rate limit: 100 requests/min por IP
  Auth: NO requiere JWT (el renderer lo llama sin autenticación)

Endpoint de dashboard (llamado por el admin, privado):
  GET /api/v1/sites/:siteId/analytics/summary
  Auth: JWT + TenantGuard
  Query params: days=30 (default), days=7, days=90
  Response: {
    data: {
      totalViews: number,
      uniqueVisitors: number,        // count distinct ipHash
      topPages: [{ path, views }],   // top 5 páginas más visitadas
      chartData: [{ date: string (YYYY-MM-DD), views: number }]  // un punto por día
    }
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Contrato API: Custom Domains
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  POST /api/v1/tenants/:tenantId/domains
  Auth: JWT + TenantGuard (solo OWNER)
  Body: { domain: string }
  Validación: dominio válido (no puede ser *.edithpress.com), formato FQDN
  Response: { data: Domain }
  Error 409 si el dominio ya está registrado (por otro tenant)

  GET /api/v1/tenants/:tenantId/domains
  Auth: JWT + TenantGuard
  Response: { data: Domain[] }

  DELETE /api/v1/tenants/:tenantId/domains/:domainId
  Auth: JWT + TenantGuard (solo OWNER)
  Response: 204

  POST /api/v1/tenants/:tenantId/domains/:domainId/verify
  Auth: JWT + TenantGuard (solo OWNER)
  Lógica: el backend hace un DNS lookup del CNAME del dominio.
    Si apunta a "renderer.edithpress.com" → status VERIFIED
    Si no apunta → status FAILED con mensaje explicativo
    Si hay timeout → status FAILED con "DNS timeout"
  Response: { data: { domain: Domain, verification: DomainVerification } }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Contrato API: Templates
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  GET /api/v1/templates
  Auth: JWT (cualquier usuario autenticado)
  Query: category? (filter), isPremium? (filter)
  Response: { data: Template[] }
  NOTA: el campo `content` del template NO se devuelve en el listado (es pesado).
  Solo devolver: id, name, description, thumbnailUrl, category, tags, isPremium, price

  GET /api/v1/templates/:templateId
  Auth: JWT
  Response: { data: Template }  (incluye el content completo para aplicar al sitio)

  POST /api/v1/sites (modificar el existente)
  AÑADIR: campo opcional templateId en el CreateSiteDto
  Si templateId está presente: cargar el template y crear las páginas del sitio
  con el contenido del template como punto de partida.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Documentar contratos
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear docs/api-contracts-sprint04.md con:
  - Los 3 contratos de API (analytics, domains, templates)
  - DTOs de request/response para cada endpoint
  - Errores posibles (4xx) con sus códigos
  - Decisiones de arquitectura (ej: por qué ipHash en lugar de IP completa)

RESTRICCIONES:
- El endpoint POST /analytics/pageview NO debe bloquear el renderer si falla
  (el renderer hace fire-and-forget, sin await del resultado)
- El DNS lookup de dominios usa el módulo 'node:dns/promises' de Node.js
  (sin dependencias externas para el lookup)
- Los contratos deben ser revisados por el Backend antes de implementar
  cualquier cambio al endpoint POST /sites existente
```

---

## AGENTE 05 — Backend Developer
**Abrir chat nuevo → "Actúa como Backend Developer de EdithPress, lee docs/agents/05-backend-developer.md"**

```
Eres el Backend Developer (Agente 05) de EdithPress.
Lee docs/agents/05-backend-developer.md para tu contexto completo.

ANTES DE EMPEZAR — Lee:
  - docs/api-contracts-sprint04.md     (contratos definidos por Agente 03)
  - apps/api/src/modules/newsletter/   (patrón de módulo para referencia)
  - apps/api/src/modules/sites/        (para modificar POST /sites con templateId)
  - packages/database/prisma/schema.prisma (modelos PageView, Domain, DomainVerification)

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Módulo Analytics
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/api/src/modules/analytics/:
  - analytics.module.ts
  - analytics.controller.ts
  - analytics.service.ts
  - dto/pageview.dto.ts

POST /api/v1/analytics/pageview:
  - Sin JWT guard (endpoint público)
  - Rate limit: @Throttle({ default: { limit: 100, ttl: 60000 } })
  - El IP real viene del header X-Real-IP (configurado en Nginx)
    En desarrollo: usar req.ip como fallback
  - Generar ipHash: crypto.createHash('sha256').update(ip + process.env.IP_SALT).digest('hex')
    El IP_SALT es una variable de entorno — previene rainbow tables
  - Agregar IP_SALT a .env.example
  - Ignorar bots: si userAgent contiene 'bot', 'crawler', 'spider' (case-insensitive): no guardar
  - La creación del PageView es async y NO bloquea la respuesta (usar .catch(err => logger.warn))
  - Return: res.status(204).send()

GET /api/v1/sites/:siteId/analytics/summary:
  - @UseGuards(JwtAuthGuard, TenantGuard)
  - Query: days: number (default 30, max 90)
  - Queries de Prisma (usar groupBy o raw si es necesario):
    1. totalViews: count de PageViews en el rango
    2. uniqueVisitors: count distinct de ipHash en el rango
    3. topPages: groupBy path, orderBy _count desc, take 5
    4. chartData: groupBy day (usar DATE_TRUNC('day', createdAt)), count por día
  - NOTA sobre chartData: Prisma no soporta DATE_TRUNC directamente.
    Usar prisma.$queryRaw`
      SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*) as views
      FROM "PageView"
      WHERE "siteId" = ${siteId}
        AND "createdAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY 1
      ORDER BY 1 ASC
    ` — SIEMPRE parametrizado con Prisma.sql template tag.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Módulo Domains
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/api/src/modules/domains/:
  - domains.module.ts
  - domains.controller.ts
  - domains.service.ts
  - dto/create-domain.dto.ts

DNS Verification (en domains.service.ts):
  import { promises as dns } from 'node:dns'

  async verifyDomain(domainId: string, tenantId: string): Promise<{ domain, verification }> {
    const domain = await this.prisma.domain.findFirst({
      where: { id: domainId, tenantId }
    })
    if (!domain) throw new NotFoundException()

    let status: DomainStatus
    let message: string

    try {
      const records = await dns.resolveCname(domain.domain)
      const target = 'renderer.edithpress.com'
      if (records.some(r => r.toLowerCase() === target)) {
        status = DomainStatus.VERIFIED
        message = `CNAME apunta correctamente a ${target}`
      } else {
        status = DomainStatus.FAILED
        message = `CNAME no apunta a ${target}. Encontrado: ${records.join(', ')}`
      }
    } catch (err) {
      status = DomainStatus.FAILED
      message = err.code === 'ENOTFOUND' ? 'No se encontró el dominio en DNS'
              : err.code === 'ETIMEOUT'  ? 'DNS timeout — intenta de nuevo en unos minutos'
              : `Error DNS: ${err.code}`
    }

    // Actualizar domain.status
    const [updatedDomain, verification] = await this.prisma.$transaction([
      this.prisma.domain.update({ where: { id: domainId }, data: { status, verifiedAt: status === 'VERIFIED' ? new Date() : null } }),
      this.prisma.domainVerification.create({ data: { domainId, status, message } }),
    ])

    return { domain: updatedDomain, verification }
  }

Validación del dominio al crear:
  - FQDN válido (usar @IsFQDN() de class-validator)
  - NO puede terminar en '.edithpress.com' (prevenir suplantación)
  - Plan check: solo Business+ pueden agregar dominios (leer plan del tenant, lanzar ForbiddenException si es Starter)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Módulo Templates
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/api/src/modules/templates/:
  - templates.module.ts
  - templates.controller.ts
  - templates.service.ts

GET /api/v1/templates:
  - @UseGuards(JwtAuthGuard)
  - Seleccionar todos los campos EXCEPTO content (para no enviar el JSON grande en el listado)
  - Filtros opcionales: category (string), isPremium (boolean)
  - Ordenar por: isPremium ASC (gratis primero), createdAt DESC

GET /api/v1/templates/:id:
  - @UseGuards(JwtAuthGuard)
  - Devolver todos los campos INCLUYENDO content

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Modificar POST /sites para soportar templateId
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Editar apps/api/src/modules/sites/dto/create-site.dto.ts:
  Agregar campo opcional: @IsOptional() @IsString() templateId?: string

Editar apps/api/src/modules/sites/sites.service.ts función create():
  Si templateId está presente:
    1. Buscar el template: prisma.template.findUnique({ where: { id: templateId } })
    2. Si no existe: throw new NotFoundException('Template no encontrado')
    3. Crear el Site con templateId en el campo correspondiente
    4. Crear las páginas definidas en template.content.pages:
       Para cada página en template.content.pages:
         prisma.page.create({
           data: {
             siteId: newSite.id,
             title: pageDef.title,
             slug: pageDef.slug,
             content: pageDef.content,
             isHomepage: pageDef.isHomepage ?? false,
             status: 'DRAFT',
           }
         })
    Usar prisma.$transaction([...]) para crear el site y todas las páginas atómicamente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Registrar módulos en AppModule
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Importar y registrar AnalyticsModule, DomainsModule y TemplatesModule
en apps/api/src/app.module.ts.

Al terminar: cd apps/api && pnpm build — sin errores TypeScript.

RESTRICCIONES:
- El endpoint /analytics/pageview NO debe exponer el IP real en ningún log o respuesta
- DNS lookup tiene timeout implícito del OS — no es necesario agregar timeout manual
- NO usar dns.lookup (resuelve con /etc/hosts) — usar dns.resolveCname específicamente
- Todos los DTOs con class-validator y whitelist: true (ya configurado globalmente)
```

---

## AGENTE 06 — Frontend Admin
**Abrir chat nuevo → "Actúa como Frontend Admin Developer de EdithPress, lee docs/agents/06-frontend-admin.md"**

```
Eres el Frontend Admin Developer (Agente 06) de EdithPress.
Lee docs/agents/06-frontend-admin.md para tu contexto completo.

ESTADO ACTUAL:
- ✅ Login, register, forgot/reset password funcionando
- ✅ Dashboard con datos reales
- ✅ Media library completa
- ✅ Billing básico (checkout Stripe)
- ✅ Super admin dashboard
- ❌ Onboarding wizard — página existe pero sin implementar
- ❌ Analytics dashboard — página existe pero sin datos
- ❌ Domains UI — página existe pero sin funcionalidad
- ❌ Templates UI — página existe pero sin datos

ANTES DE EMPEZAR — Lee:
  - apps/admin/src/app/(tenant)/onboarding/page.tsx     (estado actual)
  - apps/admin/src/app/(tenant)/analytics/page.tsx      (estado actual)
  - apps/admin/src/app/(tenant)/domains/page.tsx        (estado actual)
  - apps/admin/src/app/(tenant)/templates/page.tsx      (estado actual)
  - apps/admin/src/lib/api-client.ts                    (cliente HTTP)
  - docs/api-contracts-sprint04.md                      (contratos de API — Agente 03)

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Onboarding Wizard (5 pasos)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ruta: apps/admin/src/app/(tenant)/onboarding/page.tsx
Implementar como 'use client' con estado local para el paso actual.

Estado del wizard:
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    businessName: '',
    siteType: '',       // 'ecommerce' | 'portfolio' | 'restaurant' | 'services' | 'nonprofit'
    templateId: '',
    siteName: '',
    siteSlug: '',
  })

Paso 1 — Bienvenida:
  - Texto "¡Bienvenido a EdithPress! Vamos a crear tu sitio web."
  - Input: "¿Cuál es el nombre de tu negocio?" → data.businessName
  - Botón "Siguiente" (deshabilitado si businessName vacío)

Paso 2 — Tipo de sitio:
  - Grid de cards clicables (5 tipos):
    🛒 Tienda / E-commerce   → 'ecommerce'
    🖼️ Portfolio creativo    → 'portfolio'
    🍽️ Restaurante           → 'restaurant'
    💼 Agencia / Servicios   → 'services'
    💚 ONG / Causa social    → 'nonprofit'
  - Card seleccionada tiene borde del color primario
  - Botones "Atrás" / "Siguiente"

Paso 3 — Elegir template:
  - Fetch GET /api/v1/templates?category={data.siteType}
  - Mostrar grid de templates (TemplateCard: thumbnail + nombre + descripción)
  - Si no hay templates para esa categoría: mostrar todos los gratuitos
  - Template seleccionado tiene borde destacado + check
  - Permitir "Continuar sin template" (templateId = '')
  - Botones "Atrás" / "Siguiente"

Paso 4 — Nombre del sitio:
  - Input: "Nombre de tu sitio" → data.siteName
    On change: auto-generar data.siteSlug (lowercase, sin espacios, sin caracteres especiales)
    Ejemplo: "Mi Tienda Artesanal" → "mi-tienda-artesanal"
  - Input: "Subdominio" → data.siteSlug (editable, pre-llenado)
    Texto de ayuda: "Tu sitio quedará en: {siteSlug}.edithpress.com"
  - Validación: slug alfanumérico + guiones, min 3 chars, max 50
  - Botones "Atrás" / "Crear sitio"

Paso 5 — ¡Listo!:
  - On mount: llamar POST /api/v1/sites con {
      name: data.siteName,
      description: `Sitio de ${data.businessName}`,
      templateId: data.templateId || undefined
    }
  - Mostrar spinner mientras crea
  - Si éxito: mostrar mensaje de bienvenida con el slug del sitio + botón "Empezar a editar"
    El botón "Empezar a editar" navega a: /builder/${siteId}/${homepageId}
    donde siteId y homepageId vienen de la respuesta del POST /sites
  - Si error: mostrar mensaje de error con botón "Intentar de nuevo"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Analytics Dashboard
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ruta: apps/admin/src/app/(tenant)/analytics/page.tsx

Implementar como Server Component que pasa datos a componentes Client.
El siteId viene de la URL o del primer sitio del tenant (si solo tienen uno).

Layout:
  - Selector de rango: [7 días | 30 días | 90 días] — default 30
  - 3 cards de métricas:
    📊 Visitas totales: {totalViews}
    👤 Visitantes únicos: {uniqueVisitors}
    📄 Páginas más visitadas: (top 3 en la card)
  - Gráfica de línea (Recharts LineChart) mostrando visitas por día
    X-axis: fecha (DD/MM), Y-axis: cantidad de visitas
    Tooltip: "{fecha}: {n} visitas"

Si el tenant está en plan Starter:
  Mostrar un banner: "Las analíticas están disponibles en el plan Business o superior"
  con botón "Ver planes" que navega a /billing

Datos: fetch GET /api/v1/sites/:siteId/analytics/summary?days={range}
Manejar loading y error states (Skeleton + ErrorMessage)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Custom Domains UI
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ruta: apps/admin/src/app/(tenant)/domains/page.tsx

Layout:
  - Banner informativo: "Tu subdominio gratuito: {tenant.slug}.edithpress.com"
    Este siempre está activo, no se puede eliminar.
  - Sección "Dominio personalizado":
    Si el tenant está en plan Starter:
      Banner "Dominio custom disponible en Business+" con botón "Upgrade"
    Si está en Business+:
      Formulario para agregar dominio (input + botón "Agregar")
      Lista de dominios con:
        - Nombre del dominio
        - Estado: badge PENDING (amarillo) | VERIFIED (verde) | FAILED (rojo)
        - Botón "Verificar" (llama POST /domains/:id/verify)
        - Botón "Eliminar"

  - Sección "Instrucciones DNS" (visible siempre que haya un dominio PENDING o FAILED):
    Caja con instrucciones:
    "Para conectar tu dominio, agrega este registro CNAME en tu proveedor DNS:
     Tipo: CNAME
     Nombre: @ (o tu dominio raíz)
     Valor: renderer.edithpress.com
     TTL: Automático (o 3600)"
    Botón "Copiar valor" para el valor del CNAME.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Templates UI
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ruta: apps/admin/src/app/(tenant)/templates/page.tsx

Esta es la galería de templates — SEPARADA del onboarding (que también muestra templates).
Aquí el usuario puede APLICAR un template a un sitio existente.

Layout:
  - Filtros: categoría (chips clicables: Todos / E-commerce / Portfolio / Restaurante / Servicios / ONG)
  - Grid 3 columnas de TemplateCard:
    - Imagen thumbnail
    - Nombre
    - Descripción (truncada a 2 líneas)
    - Badge "GRATIS" o "PREMIUM"
    - Botón "Usar template" → Modal de confirmación:
      "¿Aplicar este template? Esto creará un nuevo sitio basado en este template."
      Botones: "Cancelar" / "Crear sitio con este template"
      Al confirmar: POST /api/v1/sites con { name: template.name, templateId: template.id }
      Luego redirigir al builder del nuevo sitio.

RESTRICCIONES:
- El wizard de onboarding debe hacer redirect a /dashboard si el tenant ya completó el onboarding
  (verificar si ya tienen al menos un sitio — si sí, redirigir)
- La gráfica de analytics usa Recharts (ya está en package.json del admin)
- Manejar siempre 3 estados: loading (Skeleton), error (ErrorMessage), data
- React Hook Form + Zod para el formulario de dominio y el paso 4 del onboarding
```

---

## AGENTE 08 — Frontend Renderer (Analytics Tracking)
**Abrir chat nuevo → "Actúa como Frontend Renderer Developer de EdithPress, lee docs/agents/08-frontend-renderer.md"**

```
Eres el Frontend Renderer Developer (Agente 08) de EdithPress.
Lee docs/agents/08-frontend-renderer.md para tu contexto completo.

CONTEXTO:
El módulo de analytics requiere que el renderer envíe un evento PageView
cada vez que un visitante carga una página de un tenant.

TAREA ÚNICA — Ingestión de PageView desde el Renderer
Prioridad: CRÍTICA

El renderer es Server Component (Next.js App Router). El tracking debe hacerse
server-side para evitar ser bloqueado por ad-blockers.

Editar apps/renderer/src/app/[[...slug]]/page.tsx:

Después de que la página se carga correctamente (sin errores 404/500):
  // Fire-and-forget — no bloquear la carga de la página
  fetch(`${process.env.API_URL}/api/v1/analytics/pageview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Real-IP': request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0',
    },
    body: JSON.stringify({
      tenantId: site.tenantId,
      siteId: site.id,
      pageId: page?.id,
      path: '/' + (params.slug?.join('/') || ''),
      referrer: request.headers.get('referer') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    }),
    // Sin await + .catch() para fire-and-forget
  }).catch(() => {}) // silenciar errores — no queremos que el tracker rompa el sitio

IMPORTANTE:
- Esta llamada es `fetch` sin await — no bloquea el render de la página
- Usar process.env.API_URL (variable interna, no pública) — es una llamada server-to-server
- Si el renderer y la API están en el mismo Docker network, usar el nombre del servicio:
  API_URL=http://api:3001 (en producción)
  API_URL=http://localhost:3001 (en desarrollo)
- Agregar API_URL a apps/renderer/.env.example si no está

Verificar que API_URL está en apps/renderer/.env.example y en docker-compose.yml
para el servicio renderer.

RESTRICCIONES:
- NUNCA hacer await del fetch de analytics — degradaría la performance del renderer
- NO trackear el modo preview (Draft Mode activo): añadir condición if (!isDraftMode)
- NO trackear si el path es /api/** o si la respuesta fue 404
```

---

## AGENTE 11 — QA Testing Engineer
**Abrir chat nuevo → "Actúa como QA Testing Engineer de EdithPress, lee docs/agents/11-qa-testing.md"**

```
Eres el QA Testing Engineer (Agente 11) de EdithPress.
Lee docs/agents/11-qa-testing.md para tu contexto completo.

ESTADO:
- ✅ 167 tests pasando (100%) al inicio del sprint
- ⚠️ mailer.service.ts: 16.79% cobertura → meta: ≥70%
- ⚠️ redis.service.ts: 33.92% cobertura → meta: ≥70%
- ⚠️ billing.service.ts: 66.58% cobertura → meta: ≥70%
- ❌ Tests para analytics, domains, templates: no existen

ANTES DE EMPEZAR:
  1. cd apps/api && pnpm test — verificar que los 167 tests siguen en verde
  2. cd apps/api && pnpm test:cov — ver cobertura actual de los 3 servicios

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Tests: mailer.service.ts (cobertura ≥ 70%)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leer apps/api/src/modules/mailer/mailer.service.ts completo.

Crear o ampliar apps/api/src/modules/mailer/mailer.service.spec.ts:
  ✅ sendPasswordResetEmail — mockear Resend SDK, verificar que llama con el email correcto
  ✅ sendWelcomeEmail — verificar subject y recipient
  ✅ Manejo de error cuando Resend SDK falla (lanza excepción o loguea?)
  ✅ Los templates de email contienen los campos esperados (token, nombre, etc.)
Mock: { provide: 'RESEND_CLIENT', useValue: { emails: { send: jest.fn() } } }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Tests: redis.service.ts (cobertura ≥ 70%)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leer apps/api/src/modules/redis/redis.service.ts completo.

Crear o ampliar apps/api/src/modules/redis/redis.service.spec.ts:
  ✅ set(key, value, ttl) — verificar que llama redis.setex correctamente
  ✅ get(key) — retorna el valor cuando existe, null cuando no existe
  ✅ del(key) — verifica que llama redis.del
  ✅ exists(key) — retorna true/false según redis.exists
  ✅ Manejo de error cuando Redis no está disponible
Mock: usar jest.fn() para los métodos de ioredis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Tests: billing.service.ts (cobertura ≥ 70%)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leer apps/api/src/modules/billing/billing.service.ts completo.

Ampliar los tests existentes. Identificar los branches no cubiertos con
pnpm test:cov y cubrir al menos los más importantes:
  ✅ createCheckoutSession — mockear Stripe, verificar params del checkout
  ✅ handleWebhook: customer.subscription.created — verificar que crea Subscription en DB
  ✅ handleWebhook: invoice.payment_succeeded — verificar que crea Invoice en DB
  ✅ handleWebhook: customer.subscription.deleted — verificar status CANCELED
  ✅ createPortalSession — mockear Stripe portal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Tests: Módulo Analytics
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/api/src/modules/analytics/analytics.service.spec.ts:
  ✅ trackPageView: guarda PageView con ipHash (no el IP real)
  ✅ trackPageView: ignora bots (userAgent con 'Googlebot')
  ✅ getSummary: retorna estructura correcta { totalViews, uniqueVisitors, topPages, chartData }
  ✅ getSummary: respeta el filtro de días

Crear apps/api/src/modules/analytics/analytics.e2e-spec.ts:
  ✅ POST /analytics/pageview devuelve 204
  ✅ POST /analytics/pageview con userAgent de bot: devuelve 204 pero NO crea PageView
  ✅ GET /sites/:siteId/analytics/summary sin JWT: 401
  ✅ GET /sites/:siteId/analytics/summary con JWT de otro tenant: 403

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Tests: Módulo Domains
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/api/src/modules/domains/domains.service.spec.ts:
  ✅ addDomain: crea Domain con status PENDING
  ✅ addDomain: rechaza si el dominio termina en '.edithpress.com'
  ✅ addDomain: rechaza en plan Starter (ForbiddenException)
  ✅ verifyDomain: status VERIFIED cuando DNS CNAME apunta correcto (mock dns.resolveCname)
  ✅ verifyDomain: status FAILED cuando CNAME no apunta a renderer.edithpress.com
  ✅ verifyDomain: status FAILED cuando DNS throws ENOTFOUND

Mock dns module:
  jest.mock('node:dns/promises', () => ({
    resolveCname: jest.fn()
  }))

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 6 — Regresión Completa
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. cd apps/api && pnpm test — TODOS en verde (incluyendo tests anteriores)
2. cd apps/api && pnpm test:cov — verificar:
   - mailer.service.ts ≥ 70%
   - redis.service.ts ≥ 70%
   - billing.service.ts ≥ 70%
3. cd apps/builder && pnpm test — todos en verde
4. cd apps/api && pnpm build — sin errores TypeScript
5. pnpm build (raíz) — monorepo completo sin errores

RESTRICCIONES:
- NO tocar tests existentes que estén en verde
- El mock de DNS debe ser específico por test (resetAllMocks entre tests)
- Al terminar: reportar el total de tests y la cobertura de los 3 servicios
```

---

## AGENTE 10 — Security Engineer
**Abrir chat nuevo → "Actúa como Security Engineer de EdithPress, lee docs/agents/10-security-engineer.md"**

```
Eres el Security Engineer (Agente 10) de EdithPress.
Lee docs/agents/10-security-engineer.md para tu contexto completo.

CONTEXTO:
Sprint 04 añade 3 nuevas superficies de ataque:
1. Analytics endpoint (público, recibe datos del renderer)
2. Domains module (registra dominios externos, hace DNS lookups)
3. Templates (carga JSON de templates en sitios de usuarios)

Esperar a que Agente 05 complete los módulos antes de auditar.

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Auditoría: Analytics Endpoint
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/analytics/analytics.service.ts

Verificar:
1. ¿El ipHash usa un salt (IP_SALT)? ¿Es imposible reconstruir el IP original?
2. ¿El endpoint tiene rate limiting? (Throttle decorator presente)
3. ¿El userAgent se sanitiza o trunca antes de guardarse? (max 500 chars)
4. ¿El path se sanitiza? No debe aceptar paths de más de 500 chars
5. ¿El referrer se sanitiza? Misma restricción de longitud
6. ¿El tenantId y siteId se validan como cuid válidos? (class-validator @IsCuid o @IsString + regex)
7. ¿La respuesta es 204 sin body? (no exponer información del servidor)

Si falta alguna validación: agregar en el DTO o en el servicio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Auditoría: Custom Domains (SSRF)
Prioridad: CRÍTICA — Riesgo SSRF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/domains/domains.service.ts

El endpoint de verificación hace un DNS lookup del dominio ingresado por el usuario.
Esto puede ser abusado para hacer SSRF (Server-Side Request Forgery) o DNS rebinding.

Verificar y aplicar:
1. El dominio input se valida como FQDN ANTES del DNS lookup (@IsFQDN en el DTO)
2. NO se hace ningún fetch HTTP al dominio — solo dns.resolveCname() (no hay riesgo de SSRF)
3. El resultado del DNS lookup (los CNAME records) se sanitizan antes de guardarse:
   - Truncar a max 500 chars
   - Solo guardar el mensaje de resultado, no los raw records del DNS
4. El dominio NO puede ser una IP privada (192.168., 10., 172.16-31., 127., ::1):
   Agregar validación: si el dominio resuelve a una IP privada → rechazar
   Implementación sugerida: después de resolveCname, hacer dns.resolve4() y verificar
   que las IPs no son privadas
5. Verificar que el error del DNS no expone información interna del servidor en la respuesta:
   El mensaje de error al cliente debe ser genérico ("Error al verificar el dominio")
   Los detalles técnicos solo en logs del servidor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Auditoría: Templates (Template Injection)
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/sites/sites.service.ts (función create con templateId)

Los templates se cargan de la DB y sus páginas se insertan directamente como
content del sitio del usuario. Verificar:

1. El template.content.pages es un array de objetos — ¿se valida la estructura?
   Si un template corrupto tiene content malformado, ¿qué pasa?
   Agregar try/catch alrededor del procesamiento del template.content:
   Si template.content.pages no es un array → lanzar InternalServerErrorException
   y logear el templateId para investigación.

2. ¿El content JSON de los templates pasa por alguna sanitización antes de
   insertarse en las páginas del sitio?
   El content es renderizado por el renderer. Los templates son datos
   internos (no del usuario), pero igual verificar que los templates seed
   no contienen javascript: URIs en ningún campo href/url.
   Revisar el seed data de Agente 04.

3. ¿El renderer tiene un BlockRenderer que solo renderiza tipos de bloque conocidos?
   Verificar que el BlockRenderer en apps/renderer tiene una whitelist de tipos
   y que un type desconocido retorna null (no lanza, no ejecuta código).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Actualizar docs/security-audit-sprint04.md
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear docs/security-audit-sprint04.md con:
  - Resumen de los 3 módulos auditados
  - Hallazgos por módulo: severidad + estado (mitigado/aceptado/pendiente)
  - Decisiones de seguridad (por qué ipHash, por qué solo dns.resolveCname)
  - Superficie de ataque residual (qué riesgos se aceptan y por qué)
```

---

## AGENTE 09 — DevOps Engineer
**Abrir chat nuevo (último — después de que todos terminen)**

```
Eres el DevOps Engineer (Agente 09) de EdithPress.
Lee docs/agents/09-devops-engineer.md para tu contexto completo.

ESTADO:
- ✅ Dockerfiles multi-stage para las 4 apps
- ✅ docker-compose.prod.yml creado
- ✅ nginx.prod.conf creado
- ✅ GitHub Actions CI con lint + test + build
- ❌ Deploy en staging (Railway) — pendiente
- ❌ Wildcard DNS en staging — pendiente

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Verificar Build Completo
Prioridad: CRÍTICA (gate antes de staging)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ejecutar en orden:
  1. pnpm --filter @edithpress/database exec prisma generate
  2. pnpm --filter @edithpress/ui build
  3. pnpm --filter api build
  4. pnpm --filter builder build
  5. pnpm --filter renderer build
  6. pnpm --filter admin build

Si alguno falla: reportar el error exacto. No intentar arreglar — notificar al agente responsable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Variables de entorno para Sprint 04
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sprint 04 agrega nuevas variables de entorno. Verificar que están en:
  - .env.example (raíz)
  - apps/renderer/.env.example
  - docker-compose.yml (servicios api y renderer)
  - docker-compose.prod.yml (mismo)

Variables nuevas a agregar si no están:
  IP_SALT=CHANGE_ME_random_salt_for_ip_hashing
  # En renderer:
  API_URL=http://api:3001  # (URL interna para server-to-server, NO pública)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Staging Deploy (Railway)
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: tener EdithPress corriendo en staging antes del cierre del sprint.

Pasos:
  1. Crear proyecto en Railway (o verificar que ya existe)
  2. Crear los servicios: postgres, redis, api, admin, builder, renderer
  3. Configurar variables de entorno en Railway para cada servicio
     (leer de .env.example — usar valores reales de staging, no los de desarrollo)
  4. Configurar el Nixpacks o Dockerfile de cada servicio en Railway
  5. Configurar los dominios en Railway:
     - api.staging.edithpress.com → servicio api
     - admin.staging.edithpress.com → servicio admin
     - builder.staging.edithpress.com → servicio builder
     - *.staging.edithpress.com → servicio renderer (wildcard)
  6. Correr las migrations en staging:
     Railway CLI: railway run pnpm db:migrate
  7. Correr el seed en staging:
     railway run pnpm db:seed
  8. Smoke test post-deploy:
     ✅ GET https://api.staging.edithpress.com/api/v1/health → { status: "ok" }
     ✅ https://admin.staging.edithpress.com → página de login
     ✅ https://builder.staging.edithpress.com → página de login/redirect

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Actualizar CI para deploy automático a staging
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agregar job de deploy a .github/workflows/ci.yml:
  - Solo se ejecuta en push a branch main (no en PRs)
  - Solo se ejecuta si el job build pasó
  - Usa Railway CLI: railway up --service {nombre}
  - Configura RAILWAY_TOKEN como GitHub Secret

RESTRICCIONES:
- NO hacer deploy de producción en este sprint — solo staging
- Si Railway no está disponible o el deploy falla: documentar los pasos manuales
  y reportar como "staging pendiente" — no bloquear el cierre del sprint
- Las migrations SIEMPRE antes del deploy de la API
```

---

## Orden de Ejecución Recomendado

```
DÍA 1 (paralelo):
  → Agente 01 (PM)         — criterios de aceptación + tracking
  → Agente 04 (DB)         — modelos PageView + DomainVerification + seed templates
  → Agente 03 (Architect)  — contratos API de los 3 módulos

DÍA 1-2 (una vez 04 y 03 completen):
  → Agente 05 (Backend)    — módulos analytics + domains + templates

DÍA 1-2 (paralelo con Backend):
  → Agente 06 (Admin)      — onboarding wizard + templates UI
                             (puede empezar onboarding con datos mock)
  → Agente 08 (Renderer)   — tracking de pageview (fire-and-forget)

DÍA 2-3:
  → Agente 06 (Admin)      — analytics UI + domains UI (necesita endpoints de 05)

DÍA 3 (paralelo):
  → Agente 11 (QA)         — cobertura mailer/redis/billing + tests nuevos módulos
  → Agente 10 (Security)   — auditoría analytics + SSRF en domains + templates

DÍA 4 (último):
  → Agente 09 (DevOps)     — build completo + staging deploy
```

---

## Referencia Rápida: Nuevos Endpoints Sprint 04

| Endpoint | Método | Auth | Módulo |
|---|---|---|---|
| `/analytics/pageview` | POST | Público | Analytics |
| `/sites/:siteId/analytics/summary` | GET | JWT+Tenant | Analytics |
| `/tenants/:tenantId/domains` | POST | JWT+Tenant(OWNER) | Domains |
| `/tenants/:tenantId/domains` | GET | JWT+Tenant | Domains |
| `/tenants/:tenantId/domains/:id` | DELETE | JWT+Tenant(OWNER) | Domains |
| `/tenants/:tenantId/domains/:id/verify` | POST | JWT+Tenant(OWNER) | Domains |
| `/templates` | GET | JWT | Templates |
| `/templates/:id` | GET | JWT | Templates |
| `/sites` | POST | JWT+Tenant | Sites (modificado) |

## Checklist de Cierre del Sprint 04

- [ ] Analytics: POST /analytics/pageview funciona desde renderer (fire-and-forget)
- [ ] Analytics: Dashboard en admin muestra gráfica + métricas
- [ ] Custom Domains: UI completa (agregar, verificar, eliminar)
- [ ] Custom Domains: Verificación DNS funcional (CNAME check)
- [ ] Template Marketplace: 5 templates en DB (seed)
- [ ] Template Marketplace: UI de selección funcional
- [ ] Onboarding Wizard: 5 pasos completos funcionando
- [ ] Cobertura mailer.service.ts ≥ 70%
- [ ] Cobertura redis.service.ts ≥ 70%
- [ ] Cobertura billing.service.ts ≥ 70%
- [ ] Tests nuevos módulos en verde
- [ ] Build completo del monorepo sin errores TypeScript
- [ ] Staging deploy operativo (al menos smoke test verde)
- [ ] docs/security-audit-sprint04.md actualizado
