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

---

## AGENTE 12 — UX Designer (Auditoría y Propuestas de Mejora)
**Abrir chat nuevo → "Actúa como UX Designer de EdithPress, lee docs/agents/12-ux-designer.md"**

```
Eres el UX Designer (Agente 12) de EdithPress.
Lee docs/agents/12-ux-designer.md para tu contexto completo.

CONTEXTO:
EdithPress es un SaaS CMS con 4 apps: API (NestJS), Admin panel (Next.js 14,
puerto 3010), Builder visual drag-and-drop (Next.js 14, puerto 3002) y
Renderer público de sitios (Next.js 14, puerto 3003).

El producto tiene funcionalidad completa — auth, builder con 17 bloques,
analytics, dominios custom, templates, onboarding wizard y billing — pero
el diseño ha evolucionado de forma incremental por múltiples agentes sin
una revisión UX integral. Tu misión es hacer ese recorrido y proponer
mejoras concretas.

ANTES DE EMPEZAR — Lee los archivos clave:
  apps/admin/src/app/             (estructura del panel admin)
  apps/admin/src/components/      (componentes del admin)
  apps/builder/src/blocks/        (17 bloques del editor visual)
  apps/builder/src/components/    (componentes del builder: ColorPickerField, MediaPicker, etc.)
  apps/renderer/src/app/          (renderer público)
  packages/ui/src/                (design system compartido)

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Auditoría del Admin Panel
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recorre apps/admin/src/app/ completo y evalúa:

1. Consistencia visual:
   - ¿Los botones primarios usan siempre --color-primary-600?
   - ¿Las cards tienen border-radius y sombras consistentes con el design system?
   - ¿Los formularios (login, register, onboarding, dominios) tienen el mismo estilo?
   - ¿Los estados de error/éxito usan los colores del design system o hay colores sueltos?

2. Jerarquía de información:
   - ¿El dashboard principal muestra lo más importante primero?
   - ¿Hay páginas con demasiada información sin agrupación visual clara?
   - ¿Los títulos de sección tienen peso tipográfico adecuado?

3. Feedback visual:
   - ¿Las acciones destructivas (eliminar sitio, eliminar dominio) tienen confirmación?
   - ¿Los estados de carga (loading) están implementados o hay pantallas en blanco?
   - ¿Los formularios muestran errores inline junto al campo o solo al final?

4. Navegación:
   - ¿El sidebar tiene indicador de página activa?
   - ¿Hay breadcrumbs donde se necesitan (páginas anidadas)?
   - ¿El flujo del onboarding wizard tiene indicador de progreso (paso X de 5)?

Para cada problema encontrado: indicar el archivo, línea aproximada,
qué está mal y qué debería ser según el design system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Auditoría del Builder Visual
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recorre apps/builder/src/ completo y evalúa:

1. Panel de propiedades (sidebar del editor):
   - ¿Los campos tienen labels legibles y con buen contraste?
   - ¿Los campos de tipo 'radio' tienen opciones suficientemente grandes para hacer clic?
   - ¿Hay demasiados campos visibles a la vez sin agrupación por secciones?
   - ¿El ColorPickerField tiene un tamaño de hit area adecuado (mínimo 44x44px WCAG)?

2. Bloques arrastrables:
   - ¿Los bloques en el panel izquierdo tienen preview o solo texto?
   - ¿El drag handle es visible y tiene cursor: grab?
   - ¿Hay feedback visual cuando un bloque está siendo arrastrado (opacidad, borde)?

3. Consistencia entre los 17 bloques:
   - ¿Todos los bloques usan el mismo estilo para sus fields en el panel de propiedades?
   - ¿Hay bloques que tienen campos con nombres inconsistentes entre sí?
     Ejemplo: un bloque usa "backgroundColor" y otro usa "bgColor".

4. Experiencia de autosave:
   - ¿Hay indicador visible de que el contenido se guardó?
   - ¿El botón "Publicar" comunica claramente la diferencia entre guardar borrador y publicar?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Auditoría del Renderer Público
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recorre apps/renderer/src/ y evalúa:

1. ¿Hay alguna marca de "Powered by EdithPress" visible en los sitios de los tenants?
   Si no existe: proponer dónde y cómo agregarlo (pequeño badge discreto en el footer,
   desactivable con plan Business+).

2. ¿La página 404 tiene un diseño básico o es la página por defecto del framework?
   Proponer un 404 con el tema del sitio del tenant.

3. Responsividad:
   - ¿Los 17 bloques tienen estilos responsive o se ven mal en mobile?
   - ¿El HeroBlock tiene padding adecuado en móvil (no pegar texto a los bordes)?
   - ¿El NavbarBlock colapsa correctamente en mobile (hamburger menu)?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Propuestas de Mejora Priorizadas
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Con base en las 3 auditorías anteriores, generar un listado de mejoras
ordenado por impacto / esfuerzo:

Formato para cada mejora:
  📍 Ubicación: archivo o sección
  🔴/🟡/🟢 Impacto: Alto / Medio / Bajo
  ⚡ Esfuerzo: 30min / 2h / medio día
  🛠️  Qué hacer: descripción concreta de la mejora
  ✅ Criterio de aceptación: cómo saber que está bien

Categorías:
  - CRÍTICO (rompe la usabilidad o accesibilidad WCAG AA): implementar YA
  - MEJORA (afecta la percepción de calidad del producto): implementar este sprint
  - BACKLOG (nice-to-have): agregar al backlog para sprint siguiente

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Implementar las mejoras CRÍTICAS
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Implementa directamente en el código las mejoras clasificadas como CRÍTICO
y las de categoría MEJORA que tengan esfuerzo ≤ 2h.

Para cada cambio implementado:
  - Hacer el cambio mínimo necesario (no refactorizar código que no toca la mejora)
  - Verificar que el TypeScript sigue compilando (pnpm typecheck)
  - Anotar en tu reporte qué cambios hiciste y en qué archivos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 6 — Documentar en docs/ux-audit-sprint04.md
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear docs/ux-audit-sprint04.md con:
  - Resumen ejecutivo (3-5 líneas): estado general de la UX
  - Hallazgos por app (Admin, Builder, Renderer)
  - Tabla de mejoras: ubicación, impacto, esfuerzo, estado (implementado/backlog)
  - Decisiones de diseño (qué se cambió y por qué)
  - Backlog UX para el siguiente sprint

RESTRICCIONES:
- NO modificar el schema de la DB ni los contratos de API
- NO cambiar nombres de props de los bloques (rompe los sitios existentes en DB)
- NO tocar los tests existentes — si un cambio requiere actualizar un test, mencionarlo
  pero no hacerlo (notificar al Agente 11)
- Priorizar cambios que no requieran modificar la lógica de negocio,
  solo el markup/estilos/estructura visual
- Si encuentras una mejora importante pero de alto esfuerzo (más de medio día):
  documentarla en el backlog, NO implementarla
```

---

## AGENTE 08 — Frontend Renderer (Backlog UX Sprint 04)
**Abrir chat nuevo → "Actúa como Frontend Renderer Developer de EdithPress, lee docs/agents/08-frontend-renderer.md"**

```
Eres el Frontend Renderer Developer (Agente 08) de EdithPress.
Lee docs/agents/08-frontend-renderer.md para tu contexto completo.

CONTEXTO:
El Agente 12 (UX Designer) hizo una auditoría completa y detectó 4 mejoras
pendientes en el renderer que no pudieron implementarse en la primera pasada
por requerir más esfuerzo. Lee docs/ux-audit-sprint04.md para el detalle
completo. Tu tarea es implementar las 4 mejoras del backlog que corresponden
al renderer.

ANTES DE EMPEZAR — Lee:
  docs/ux-audit-sprint04.md                            (auditoría completa)
  apps/renderer/src/app/[[...slug]]/page.tsx            (SiteNav y layout actual)
  apps/renderer/src/app/_components/blocks/NavbarBlock.tsx  (bloque Navbar actual)
  apps/renderer/src/app/_components/blocks/FooterBlock.tsx  (bloque Footer actual)
  apps/renderer/src/app/not-found.tsx                   (página 404 actual)

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — NavbarBlock: Menú hamburger en mobile
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El NavbarBlock del renderer no tiene menú colapsable en mobile. En pantallas
< 640px los links de navegación están ocultos con `hidden sm:flex` pero no
hay alternativa para acceder a ellos.

Crear apps/renderer/src/app/_components/NavbarMobile.tsx:
  - Componente 'use client'
  - Props: links: { label: string; url: string }[], accentColor: string
  - Botón hamburger (3 líneas) visible solo en mobile (`sm:hidden`)
    con aria-label="Abrir menú" / aria-label="Cerrar menú" según estado
  - Al hacer clic: drawer deslizable desde arriba (o menú desplegable)
    mostrando los links en columna con separadores
  - Cerrar al hacer clic en un link o al hacer clic fuera del drawer
  - Color de fondo del drawer: mismo backgroundColor del NavbarBlock
  - Color del texto: textColor del NavbarBlock

Editar apps/renderer/src/app/_components/blocks/NavbarBlock.tsx:
  - Importar NavbarMobile
  - En la zona donde antes estaban los links (ahora `hidden sm:flex`):
    agregar <NavbarMobile links={navLinks} accentColor={accentColor} />
    visible solo con `sm:hidden`
  - El contenedor principal del Navbar mantiene su padding fijo en desktop;
    en mobile: padding horizontal `clamp(16px, 4vw, 32px)`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — FooterBlock: Layout responsive en mobile
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El FooterBlock usa `gridTemplateColumns: minmax(200px, 1fr) repeat(N, 1fr)`
que no colapsa bien en viewports < 640px generando columnas muy estrechas
o scroll horizontal.

Editar apps/renderer/src/app/_components/blocks/FooterBlock.tsx:
  - Cambiar el contenedor del grid a usar CSS Grid con auto-fill:
    En lugar de calcular columnas estáticamente, usar:
    gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`
  - Esto permite que las columnas se reorganicen solas en mobile:
    1 columna en 320px, 2 en 480px, todas en 640px+
  - El padding del footer: cambiar de padding fijo a
    `clamp(24px, 5vw, 48px)` horizontal y `clamp(32px, 6vw, 64px)` vertical
  - Verificar que el copyright al fondo queda centrado en mobile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Página 404: Tema del tenant
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La página 404 actual es genérica y neutra (correcto para cuando no se sabe
el tenant). Mejorarla para que cuando SÍ se conoce el tenant (el request
llega al subdominio de un tenant pero la página específica no existe),
se muestre con los colores del sitio del tenant.

Editar apps/renderer/src/app/[[...slug]]/page.tsx:
  - Cuando el site existe pero la page no se encuentra (page === null),
    en lugar de llamar notFound() directamente, renderizar un componente
    TenantNotFound pasándole backgroundColor, textColor y navLinks del site
  - Crear apps/renderer/src/app/_components/TenantNotFound.tsx:
    - Props: backgroundColor, textColor, siteName, siteSlug
    - Layout: fondo con backgroundColor, texto en textColor
    - Mensaje: "Página no encontrada" + "Esta página no existe en [siteName]"
    - Botón "Volver al inicio" → href="/" con el mismo estilo del HeroBlock CTA
  - Cuando el site NO existe (dominio/subdominio desconocido), mantener
    el not-found.tsx genérico (no cambiar)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — "Powered by EdithPress" desactivable por plan
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actualmente el badge "Sitio creado con EdithPress" se muestra siempre.
Para el plan Business+ debería poder ocultarse.

Verificar si el endpoint que devuelve los datos del site/tenant ya incluye
el plan del tenant. Leer apps/renderer/src/app/[[...slug]]/page.tsx para
ver qué datos devuelve la API al resolver un subdominio.

Si los datos del site incluyen tenant.subscription.plan (o similar):
  - Condicionar el badge: mostrar solo si plan === 'STARTER' o si no hay plan
  - El badge ya está en el footer genérico — solo agregar la condición

Si los datos NO incluyen el plan:
  - Documentarlo como comentario TODO en el código
    // TODO: ocultar cuando plan === 'BUSINESS' o superior
    // Requiere que el endpoint /renderer/tenant/:slug incluya tenant.plan
  - Mantener el badge visible por ahora (mejor que nada)
  - NO hacer una llamada API adicional solo para esto

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Verificación final
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Al terminar:
  1. pnpm --filter @edithpress/renderer exec tsc --noEmit — sin errores
  2. Verificar que no rompiste el renderizado de páginas existentes
     (el page.tsx principal no debe tener errores de TypeScript)
  3. Reportar qué cambios implementaste y en qué archivos

RESTRICCIONES:
- NavbarMobile debe ser 'use client' — es el único Client Component nuevo
- NO convertir NavbarBlock.tsx a 'use client' — debe seguir siendo Server Component
- NO modificar los props del NavbarBlock (breaking change en sitios existentes)
- El TenantNotFound no debe hacer fetch adicional — usa datos ya disponibles en page.tsx
```

---

## AGENTE 07 — Frontend Builder (Backlog UX Sprint 04)
**Abrir chat nuevo → "Actúa como Frontend Builder Developer de EdithPress, lee docs/agents/07-frontend-builder.md"**

```
Eres el Frontend Builder Developer (Agente 07) de EdithPress.
Lee docs/agents/07-frontend-builder.md para tu contexto completo.

CONTEXTO:
El Agente 12 (UX Designer) hizo una auditoría UX y detectó 2 mejoras
pendientes en el builder. Lee docs/ux-audit-sprint04.md para el detalle.
Tu tarea es implementar ambas mejoras del backlog que corresponden al builder.

ANTES DE EMPEZAR — Lee:
  docs/ux-audit-sprint04.md                                (auditoría completa)
  apps/builder/src/components/ColorPickerField.tsx         (estado actual)
  apps/builder/src/puck-config.tsx                         (registro de bloques)
  apps/builder/src/blocks/                                 (los 17 bloques)

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — ColorPickerField: Swatches touch-friendly
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El ColorPickerField tiene un dropdown con ~50 swatches de 18×18px.
En dispositivos touch son demasiado pequeños para seleccionar con precisión.

Editar apps/builder/src/components/ColorPickerField.tsx:
  - Los swatches dentro del panel de presets deben ser 28×28px (de 18×18px)
    mantienen el gap actual entre ellos (4px) — el grid ajustará las columnas
  - El botón de cada swatch: width y height a 28px, border-radius a 6px
  - En desktop (hover) mostrar un tooltip con el nombre o valor hex del color
    Implementarlo con el atributo `title` del botón (sin librería adicional)
  - Al hacer foco con teclado: outline visible (2px solid #2563eb offset 2px)
  - Agregar aria-label al botón de cada swatch: `aria-label="Color ${value}"`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Panel del builder: Preview de bloques
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El panel izquierdo de Puck (lista de bloques para arrastrar) muestra solo
el nombre de cada bloque como texto, sin ninguna representación visual.
El usuario no sabe cómo se verá un bloque hasta arrastrarlo al canvas.

Crear apps/builder/src/components/BlockThumbnail.tsx:
  Componente que recibe `blockType: string` y devuelve un SVG inline
  de 80×50px representando visualmente cada tipo de bloque.
  Solo necesita ser esquemático (wireframe), no una vista real.

  Thumbnails a implementar (SVG simples, formas geométricas):
  - HeroBlock: rectángulo grande con líneas de texto centradas + botón
  - NavbarBlock: barra horizontal con logo izq. y puntos a la derecha
  - FooterBlock: barra horizontal al fondo con grid de columnas
  - ProductGridBlock: grid 3×2 de rectángulos (tarjetas de producto)
  - CategoryGridBlock: grid 2×2 de rectángulos con texto
  - StatsBlock: fila de 3-4 números grandes y etiquetas
  - NewsletterBlock: rectángulo con campo de input y botón
  - SplitContentBlock: dos columnas iguales (texto | imagen)
  - Para los bloques restantes: un rectángulo genérico con el label

Editar apps/builder/src/puck-config.tsx (o el archivo donde se registran
los bloques para el panel de Puck):
  - Verificar si Puck permite un render personalizado en el panel de bloques.
  - Si la API de Puck lo soporta (vía `render` o `icon` en la config del bloque):
    usar BlockThumbnail como preview.
  - Si Puck NO lo soporta nativamente:
    documentarlo como comentario TODO y NO hacer workaround forzado
    // TODO: Puck no expone API de preview en panel — pendiente upgrade de Puck

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Verificación final
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Al terminar:
  1. pnpm --filter @edithpress/builder exec tsc --noEmit — sin errores TypeScript
  2. pnpm --filter @edithpress/builder exec vitest run — todos los tests en verde
  3. Reportar qué cambios implementaste y en qué archivos

RESTRICCIONES:
- NO cambiar la API pública de ColorPickerField (sus props no cambian)
- NO usar librerías externas para los SVG (inline SVG puro en React)
- Los thumbnails son decorativos — añadir aria-hidden="true" al SVG
- Si la API de Puck no soporta preview en panel: documentar y NO implementar workaround
```

---

## AGENTE 06 — Frontend Admin (Backlog UX Sprint 04)
**Abrir chat nuevo → "Actúa como Frontend Admin Developer de EdithPress, lee docs/agents/06-frontend-admin.md"**

```
Eres el Frontend Admin Developer (Agente 06) de EdithPress.
Lee docs/agents/06-frontend-admin.md para tu contexto completo.

CONTEXTO:
El Agente 12 (UX Designer) hizo una auditoría UX y detectó 3 mejoras
pendientes en el admin. Lee docs/ux-audit-sprint04.md para el detalle.
Tu tarea es implementar las mejoras del backlog que corresponden al admin.

ANTES DE EMPEZAR — Lee:
  docs/ux-audit-sprint04.md                                    (auditoría completa)
  apps/admin/src/components/layout/Sidebar.tsx                 (navegación actual)
  apps/admin/src/app/(tenant)/layout.tsx                       (layout con Header)
  apps/admin/src/app/(tenant)/sites/[siteId]/pages/page.tsx    (ejemplo de página anidada)
  apps/admin/src/app/(tenant)/onboarding/page.tsx              (wizard actual)

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Breadcrumbs en páginas anidadas
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Las páginas dentro de un sitio (sites/[siteId], sites/[siteId]/pages,
sites/[siteId]/settings) solo tienen un "botón de volver" sin mostrar
la jerarquía completa de navegación.

Crear apps/admin/src/components/ui/Breadcrumbs.tsx:
  Props:
    items: { label: string; href?: string }[]
    (el último item es la página actual — sin href)

  Render: items separados por "/" con el último en texto normal (no link)
  Estilo: text-sm, color gray-500 para separadores y items anteriores,
          gray-900 font-medium para el item actual
  Ejemplo visual: Sitios / Mi Tienda / Páginas / Nueva Página

Agregar breadcrumbs en las siguientes páginas:
  - apps/admin/src/app/(tenant)/sites/[siteId]/page.tsx
    Breadcrumb: [{ label: 'Sitios', href: '/sites' }, { label: site.name }]
  - apps/admin/src/app/(tenant)/sites/[siteId]/pages/page.tsx
    Breadcrumb: [{ label: 'Sitios', href: '/sites' }, { label: site.name, href: `/sites/${siteId}` }, { label: 'Páginas' }]
  - apps/admin/src/app/(tenant)/sites/[siteId]/settings/page.tsx
    Breadcrumb: [{ label: 'Sitios', href: '/sites' }, { label: site.name, href: `/sites/${siteId}` }, { label: 'Configuración' }]

  El nombre del sitio (site.name) ya está disponible en cada página
  porque se fetchea para mostrar el título. Reutilizarlo.

  Ubicación en el layout: arriba del título H1 de la página, debajo del Header.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Onboarding: Etiquetas en el StepIndicator
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El wizard tiene un indicador de progreso (barras o círculos numerados)
pero sin etiquetas que digan qué hace cada paso.

Leer apps/admin/src/app/(tenant)/onboarding/page.tsx para entender
la implementación actual del StepIndicator.

Agregar etiquetas debajo de cada indicador de paso:
  - Paso 1: "Tu negocio"
  - Paso 2: "Tipo de sitio"
  - Paso 3: "Template"
  - Paso 4: "Detalles"
  - Paso 5: "¡Listo!"
  (si el wizard tiene 3 pasos en lugar de 5, ajustar las etiquetas al número real)

  Estilo: text-xs, gray-500 para pasos no activos, primary-600 para el activo
  El texto debe quedar centrado debajo de cada indicador
  En mobile (< 480px): ocultar las etiquetas con `hidden sm:block`
  para no saturar la pantalla en pantallas pequeñas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Admin Header: Overflow en tablet 768px
Prioridad: BAJA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El Header del admin usa `md:ml-60` para dar espacio al sidebar de 240px
en breakpoint md (768px exacto). En 768px exacto puede haber overflow si
el sidebar y el contenido compiten por el espacio.

Leer apps/admin/src/app/(tenant)/layout.tsx y
apps/admin/src/components/layout/Header.tsx (o como se llame).

Verificar si el problema existe:
  - Buscar si hay un `w-60` o `w-[240px]` en el Sidebar junto a `md:ml-60` en el main
  - Si el sidebar tiene `fixed` o `sticky`, el `ml-60` en el main es correcto
  - Si el sidebar está en el flujo normal (no fixed), puede causar scroll horizontal

Si se confirma el problema: cambiar `md:ml-60` a `md:ml-[240px]` para
alineación exacta, o agregar `overflow-x-hidden` al contenedor principal.

Si NO hay problema (el layout ya es correcto): documentarlo como "verificado OK"
y no hacer cambios.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Billing: Claridad en selector mensual/anual
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La auditoría detectó que en billing/page.tsx el toggle mensual/anual
no tiene un affordance claro sobre qué precio se muestra por defecto.

Leer apps/admin/src/app/(tenant)/billing/page.tsx.

Mejoras a implementar:
  - El toggle debe tener un label visible: "Facturación mensual" / "Facturación anual"
    no solo el switch sin contexto
  - Cuando está en "anual": mostrar un badge verde "Ahorra 20%" junto al toggle
    (o el descuento real si está en los datos)
  - El precio que se muestra en las cards debe cambiar visualmente al cambiar
    el toggle — si ya lo hace, verificar que hay una transición o cambio claro
  - Si el precio por defecto es mensual: añadir texto small debajo del precio
    "por mes · facturado mensualmente" o "por mes · facturado anualmente"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Verificación final
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Al terminar:
  1. pnpm --filter @edithpress/admin exec tsc --noEmit — sin errores TypeScript
  2. Reportar qué cambios implementaste y en qué archivos
  3. Si algún cambio requiere actualizar un test: notificarlo sin tocar el test

RESTRICCIONES:
- El componente Breadcrumbs va en apps/admin/src/components/ui/ (no en packages/ui)
  porque solo lo usa el admin por ahora
- NO agregar dependencias nuevas — todo con Tailwind + React puro
- Los cambios en layout.tsx no deben afectar páginas que no sean de tenant
  (las páginas de auth no usan el mismo layout)
```

---

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
