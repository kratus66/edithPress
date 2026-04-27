# API Contracts — Sprint 04

**Autor**: Software Architect (Agente 03)
**Fecha**: 2026-04-26
**Destinatario**: Backend Developer (Agente 05)
**Estado**: Definitivo — implementar exactamente como se documenta aquí

---

## Convenciones generales

- Prefijo global de la API: `/api/v1/`
- Todos los endpoints protegidos requieren header `Authorization: Bearer <jwt>`
- Respuesta estándar para datos: `{ data: T }`
- Respuesta estándar para listas: `{ data: T[] }`
- Respuesta estándar para listas paginadas: `{ data: T[], meta: { page, limit, total } }`
- Errores siguen el formato de NestJS por defecto: `{ statusCode, message, error }`
- Guards reutilizables existentes: `JwtAuthGuard`, `TenantGuard`, `RolesGuard`
- Decorator de rol: `@Roles('OWNER')` — igual al patrón en `sites.controller.ts`

---

## 1. Módulo Analytics

### Módulo NestJS

Crear en `apps/api/src/modules/analytics/`:
- `analytics.module.ts`
- `analytics.controller.ts`
- `analytics.service.ts`
- `dto/create-pageview.dto.ts`

Registrar el módulo en `app.module.ts`.

---

### POST /api/v1/analytics/pageview

**Propósito**: Registrar una visita a una página. Consumido por el renderer (fire-and-forget).

**Autenticación**: NINGUNA — endpoint completamente público.

**Rate limit**: `@Throttle({ default: { limit: 100, ttl: 60_000 } })` — 100 req/min por IP.

**DTO — `CreatePageViewDto`**:

```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreatePageViewDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string

  @IsString()
  @IsNotEmpty()
  siteId: string

  @IsOptional()
  @IsString()
  pageId?: string

  @IsString()
  @IsNotEmpty()
  path: string

  @IsOptional()
  @IsString()
  referrer?: string

  @IsOptional()
  @IsString()
  userAgent?: string
}
```

**Response**: `204 No Content` — siempre, incluso cuando el registro se descarta.

**Lógica de negocio en el servicio**:

1. Extraer la IP real:
   ```typescript
   const ip = req.headers['x-real-ip'] as string ?? req.ip ?? 'unknown'
   ```
   El controlador debe inyectar `@Req() req: Request` de Express.

2. Calcular el hash de la IP (GDPR — nunca guardar el IP real):
   ```typescript
   import { createHash } from 'node:crypto'
   const ipHash = createHash('sha256')
     .update(ip + process.env.IP_SALT)
     .digest('hex')
   ```
   La variable de entorno `IP_SALT` es obligatoria. Agregarla a `.env.example`.

3. Filtrar bots — si `dto.userAgent` contiene cualquiera de estas cadenas (case-insensitive):
   `'bot'`, `'crawler'`, `'spider'`
   No crear el registro y retornar sin error (204 igualmente).

4. Truncar campos largos antes de persistir:
   - `path`: máximo 500 caracteres
   - `userAgent`: máximo 500 caracteres
   - `referrer`: máximo 500 caracteres

5. Crear el registro en `prisma.pageView` con los campos:
   `tenantId`, `siteId`, `pageId`, `path`, `ipHash`, `userAgent`, `referrer`

6. La creación es **fire-and-forget**: el controlador no debe `await` la llamada al servicio.
   Patrón en el controlador:
   ```typescript
   @Post('pageview')
   @HttpCode(HttpStatus.NO_CONTENT)
   async trackPageView(@Body() dto: CreatePageViewDto, @Req() req: Request): Promise<void> {
     this.analyticsService.trackPageView(dto, req).catch(() => {})
     // retorna inmediatamente sin esperar
   }
   ```

**Nota de seguridad**: El `IP_SALT` evita ataques de rainbow table sobre los hashes. Sin él, un atacante con acceso a la DB podría reconstruir IPs calculando SHA-256 de rangos de IPs conocidos. El salt hace esto computacionalmente inviable.

---

### GET /api/v1/sites/:siteId/analytics/summary

**Propósito**: Resumen de analytics para el dashboard del tenant.

**Autenticación**: `JwtAuthGuard` + `TenantGuard`

**Query params**:

| Param | Tipo   | Default | Restricción                  |
|-------|--------|---------|------------------------------|
| days  | number | 30      | Valores permitidos: 7, 30, 90 |

Si `days` recibe un valor distinto a 7, 30 o 90, usar 30 como fallback (no lanzar error).

**Response body**:

```typescript
{
  data: {
    totalViews: number,
    uniqueVisitors: number,       // COUNT DISTINCT ipHash en el rango
    topPages: Array<{
      path: string,
      views: number
    }>,                           // top 5, ordenado descendente por views
    chartData: Array<{
      date: string,               // formato YYYY-MM-DD
      views: number
    }>                            // un punto por día, ordenado ascendente por fecha
  }
}
```

**Nota técnica crítica — `chartData`**:

`chartData` requiere una agrupación por día con `DATE_TRUNC`. Esto no es expresable con el query builder de Prisma. Usar `prisma.$queryRaw` con `Prisma.sql` para parametrización segura:

```typescript
import { Prisma } from '@prisma/client'

const rows = await this.prisma.$queryRaw<Array<{ date: Date; views: bigint }>>(
  Prisma.sql`
    SELECT DATE_TRUNC('day', "createdAt") AS date, COUNT(*) AS views
    FROM "PageView"
    WHERE "siteId" = ${siteId}
      AND "createdAt" >= ${since}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
  `
)
```

`COUNT(*)` retorna `bigint` en Prisma con `$queryRaw`. Convertir a `number` con `Number(row.views)` antes de enviar en la respuesta.

`since` se calcula como:
```typescript
const since = new Date()
since.setDate(since.getDate() - days)
```

**Lógica de `totalViews` y `uniqueVisitors`**: Estos sí pueden calcularse con el query builder de Prisma:
```typescript
const totalViews = await this.prisma.pageView.count({
  where: { siteId, createdAt: { gte: since } }
})

const uniqueResult = await this.prisma.pageView.groupBy({
  by: ['ipHash'],
  where: { siteId, createdAt: { gte: since } },
})
const uniqueVisitors = uniqueResult.length
```

**Lógica de `topPages`**: Usar `groupBy` de Prisma:
```typescript
const topPages = await this.prisma.pageView.groupBy({
  by: ['path'],
  where: { siteId, createdAt: { gte: since } },
  _count: { path: true },
  orderBy: { _count: { path: 'desc' } },
  take: 5,
})
```

---

## 2. Módulo Custom Domains

### Módulo NestJS

Crear en `apps/api/src/modules/domains/`:
- `domains.module.ts`
- `domains.controller.ts`
- `domains.service.ts`
- `dto/create-domain.dto.ts`

El controlador se monta bajo `tenants/:tenantId/domains`.

Registrar el módulo en `app.module.ts`.

---

### POST /api/v1/tenants/:tenantId/domains

**Propósito**: Registrar un dominio custom para un tenant.

**Autenticación**: `JwtAuthGuard` + `TenantGuard` + `RolesGuard`, solo rol `OWNER`.

**Plan check**: Antes de crear el dominio, verificar que el tenant no esté en el plan Starter:
```typescript
const tenant = await this.prisma.tenant.findUnique({
  where: { id: tenantId },
  include: { plan: true },
})
if (tenant.plan.slug === 'starter') {
  throw new ForbiddenException('El plan Starter no incluye dominios custom')
}
```

**DTO — `CreateDomainDto`**:

```typescript
import { IsFQDN } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateDomainDto {
  @ApiProperty({ example: 'www.miempresa.com' })
  @IsFQDN()
  domain: string
}
```

`@IsFQDN()` valida que sea un nombre de dominio totalmente cualificado (formato válido). La clase `IsFQDN` está en el paquete `class-validator`.

**Validaciones adicionales en el servicio** (lanzar antes de crear):

1. El dominio NO puede terminar en `.edithpress.com` — previene suplantación de la plataforma:
   ```typescript
   if (dto.domain.endsWith('.edithpress.com')) {
     throw new BadRequestException('No se pueden registrar subdominios de edithpress.com')
   }
   ```

2. El dominio no puede estar ya registrado en la tabla `CustomDomain`:
   ```typescript
   const existing = await this.prisma.customDomain.findUnique({
     where: { domain: dto.domain }
   })
   if (existing) {
     throw new ConflictException('El dominio ya está registrado')
   }
   ```

**Creación del registro**: Al crear, generar un `txtRecord` aleatorio para verificación DNS futura:
```typescript
import { randomBytes } from 'node:crypto'
const txtRecord = `edithpress-verify=${randomBytes(16).toString('hex')}`
```

El campo `siteId` es requerido por el schema. En v1, el tenant puede tener un sitio o se puede recibir como parte del body — revisar con PM si debe ser parte del `CreateDomainDto`. Por ahora incluirlo en el DTO con `@IsString() @IsNotEmpty() siteId: string`.

**Response**: `{ data: CustomDomain }` con status `201`.

---

### GET /api/v1/tenants/:tenantId/domains

**Propósito**: Listar dominios del tenant.

**Autenticación**: `JwtAuthGuard` + `TenantGuard`

**Implementación**:
```typescript
const domains = await this.prisma.customDomain.findMany({
  where: { tenantId },
  orderBy: { createdAt: 'desc' },
})
```

**Response**: `{ data: CustomDomain[] }`

---

### DELETE /api/v1/tenants/:tenantId/domains/:domainId

**Propósito**: Eliminar un dominio custom.

**Autenticación**: `JwtAuthGuard` + `TenantGuard` + `RolesGuard`, solo rol `OWNER`.

**Validación**: Verificar que el dominio pertenece al tenant antes de eliminar (evitar IDOR):
```typescript
const domain = await this.prisma.customDomain.findFirst({
  where: { id: domainId, tenantId }
})
if (!domain) throw new NotFoundException('Dominio no encontrado')
```

**Response**: `204 No Content`

---

### POST /api/v1/tenants/:tenantId/domains/:domainId/verify

**Propósito**: Verificar que el DNS del dominio apunta correctamente al renderer.

**Autenticación**: `JwtAuthGuard` + `TenantGuard` + `RolesGuard`, solo rol `OWNER`.

**Lógica de verificación DNS**:

```typescript
import { promises as dns } from 'node:dns'

const TARGET_CNAME = 'renderer.edithpress.com'

async verifyDomain(domainId: string, tenantId: string) {
  const domain = await this.prisma.customDomain.findFirst({
    where: { id: domainId, tenantId }
  })
  if (!domain) throw new NotFoundException('Dominio no encontrado')

  let verificationStatus: CustomDomainStatus
  let message: string | null = null

  try {
    const records = await dns.resolveCname(domain.domain)
    if (records.includes(TARGET_CNAME)) {
      verificationStatus = 'ACTIVE'
    } else {
      verificationStatus = 'FAILED'
      message = 'CNAME no apunta a renderer.edithpress.com'
    }
  } catch (err: unknown) {
    verificationStatus = 'FAILED'
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOTFOUND') {
      message = 'No se encontró el dominio en DNS'
    } else if (code === 'ETIMEOUT') {
      message = 'DNS timeout'
    } else {
      message = 'Error al verificar el dominio'
      // NO exponer err.message ni detalles internos
    }
  }

  // Siempre guardar el resultado de la verificación
  const verification = await this.prisma.domainVerification.create({
    data: {
      domainId: domain.id,
      status: verificationStatus,
      message,
    }
  })

  // Actualizar el estado del dominio
  const updatedDomain = await this.prisma.customDomain.update({
    where: { id: domain.id },
    data: {
      status: verificationStatus,
      verifiedAt: verificationStatus === 'ACTIVE' ? new Date() : null,
    }
  })

  return { domain: updatedDomain, verification }
}
```

**Seguridad — por qué DNS y no HTTP**: Usar `dns.resolveCname()` en lugar de hacer un `fetch()` al dominio del usuario elimina el riesgo de SSRF (Server-Side Request Forgery). Una llamada HTTP podría ser redirigida a recursos internos de la infraestructura (metadata de cloud, servicios internos). La consulta DNS es una operación de solo lectura que no genera tráfico HTTP.

**Response**: `{ data: { domain: CustomDomain, verification: DomainVerification } }`

---

## 3. Módulo Templates

### Módulo NestJS

Crear en `apps/api/src/modules/templates/`:
- `templates.module.ts`
- `templates.controller.ts`
- `templates.service.ts`
- `dto/template-list-item.dto.ts`

El módulo de templates ya puede existir parcialmente — verificar antes de crear desde cero.

Registrar el módulo en `app.module.ts` si no está registrado.

---

### GET /api/v1/templates

**Propósito**: Listar templates disponibles para seleccionar al crear un sitio.

**Autenticación**: `JwtAuthGuard` (cualquier usuario autenticado, sin restricción de tenant).

**Query params opcionales**:

| Param     | Tipo    | Descripción                        |
|-----------|---------|------------------------------------|
| category  | string  | Filtrar por categoría              |
| isPremium | boolean | Filtrar por tipo (true/false)      |

**DTO de respuesta — `TemplateListItemDto`**:

```typescript
export class TemplateListItemDto {
  id: string
  name: string
  description: string | null
  thumbnailUrl: string | null
  category: string
  tags: string[]
  isPremium: boolean
  price: string | null      // Decimal serializado como string
  isActive: boolean
  createdAt: Date
}
```

**Implementación en el servicio** — select explícito, sin el campo `content`:

```typescript
async findAll(filters: { category?: string; isPremium?: boolean }) {
  return this.prisma.template.findMany({
    where: {
      isActive: true,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.isPremium !== undefined ? { isPremium: filters.isPremium } : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      thumbnailUrl: true,
      category: true,
      tags: true,
      isPremium: true,
      price: true,
      isActive: true,
      createdAt: true,
      // content: excluido intencionalmente — puede pesar varios KB por template
    },
    orderBy: [
      { isPremium: 'asc' },   // gratuitos primero
      { name: 'asc' },
    ],
  })
}
```

**Response**: `{ data: TemplateListItemDto[] }`

---

### GET /api/v1/templates/:id

**Propósito**: Obtener un template completo, incluyendo el `content` para pre-poblar el sitio.

**Autenticación**: `JwtAuthGuard`

**Implementación en el servicio**:

```typescript
async findOne(id: string) {
  const template = await this.prisma.template.findUnique({ where: { id } })
  if (!template) throw new NotFoundException('Template no encontrado')
  return template
}
```

**Response**: `{ data: Template }` — incluye el campo `content` completo.

---

## 4. Modificación: POST /api/v1/sites — Soporte para templateId

**Contexto**: El campo `templateId` ya existe en `CreateSiteDto` y en el modelo `Site` del schema Prisma. Lo que se debe agregar es la lógica de negocio en `SitesService.create()` para aplicar el template al crear el sitio.

### Lógica adicional en `SitesService.create()`

Cuando `dto.templateId` está presente, ejecutar lo siguiente **después** de crear el Site:

```typescript
if (dto.templateId) {
  const template = await this.prisma.template.findUnique({
    where: { id: dto.templateId }
  })

  if (!template) {
    throw new NotFoundException('Template no encontrado')
  }

  try {
    const templateContent = template.content as { pages?: PageTemplate[] }
    const pagesData = templateContent.pages ?? []

    const pageCreates = pagesData.map((p: PageTemplate) =>
      this.prisma.page.create({
        data: {
          siteId: newSite.id,
          title: p.title ?? 'Inicio',
          slug: p.slug ?? '',
          content: p.content ?? [],
          isHomepage: p.isHomepage ?? false,
          status: 'DRAFT',
        }
      })
    )

    if (pageCreates.length > 0) {
      await this.prisma.$transaction(pageCreates)
    }
  } catch (err: unknown) {
    // Si el contenido del template es inválido, logear y continuar sin páginas
    // No relanzar — el sitio ya fue creado correctamente
    this.logger.error('Error al aplicar páginas del template', {
      templateId: dto.templateId,
      siteId: newSite.id,
      err,
    })
  }
}
```

**Tipo auxiliar** (puede definirse localmente en el servicio):

```typescript
interface PageTemplate {
  title?: string
  slug?: string
  content?: unknown[]
  isHomepage?: boolean
}
```

**Flujo de creación con template**:
1. Validar que el template existe — `NotFoundException` si no.
2. Crear el `Site` (comportamiento existente).
3. En `try/catch`, parsear `template.content` y crear las páginas en una `$transaction`.
4. Si el `try` falla (content malformado, páginas vacías, etc.), logear y retornar el sitio sin páginas — no lanzar error al cliente.

**Nota**: El `NotFoundException` del paso 1 se lanza **antes** de crear el sitio, por lo que no deja registros huérfanos.

---

## 5. Decisiones de Arquitectura

### ADR-007 — IP hashing con SHA-256 + salt (GDPR)

**Contexto**: El módulo de analytics necesita identificar visitantes únicos sin almacenar datos personales.

**Decisión**: Almacenar `SHA-256(ip + IP_SALT)` en lugar del IP real.

**Justificación**: Bajo GDPR Art. 4(1), una dirección IP es un dato personal identificable. Almacenar el IP real sin base legal explícita es una infracción. El hash con salt produce un identificador determinístico (el mismo IP + salt siempre produce el mismo hash, permitiendo contar visitantes únicos) pero hace computacionalmente imposible reconstruir el IP original. El salt en variable de entorno previene ataques de rainbow table: un atacante con acceso a la base de datos no puede hacer fuerza bruta sobre rangos de IPs porque necesitaría el salt para calcular los hashes.

**Consecuencia**: `IP_SALT` es un secreto de infraestructura. Si se rota, los hashes históricos dejan de ser comparables con los nuevos (los visitantes únicos históricos no se pueden fusionar con los nuevos). Documentar esto en el runbook operacional.

---

### ADR-008 — Verificación de dominios via DNS, no HTTP

**Contexto**: El módulo de custom domains necesita verificar que el dominio del tenant apunta al renderer de EdithPress.

**Decisión**: Usar `dns.resolveCname()` de Node.js en lugar de hacer un `fetch()` o `http.get()` al dominio verificado.

**Justificación**: Hacer una solicitud HTTP a una URL proporcionada por el usuario es el vector clásico de SSRF. Con SSRF, un atacante podría apuntar su dominio a `169.254.169.254` (metadata de AWS/GCP) o a servicios internos de la red (`http://internal-service/admin`). `dns.resolveCname()` realiza únicamente una consulta al servidor DNS configurado — no genera tráfico HTTP y no puede ser redirigido a recursos internos. El CNAME solo puede apuntar a un hostname, nunca a una IP directamente, lo que elimina el vector de ataque.

---

### ADR-009 — Analytics como fire-and-forget

**Contexto**: El renderer necesita registrar page views en cada request sin degradar la latencia percibida por el visitante.

**Decisión**: El renderer llama al endpoint `POST /api/v1/analytics/pageview` sin `await` y con `.catch(() => {})`. El controlador de la API retorna `204` inmediatamente sin esperar que la escritura en DB se complete.

**Justificación**: El tracking de analytics es un dato de soporte, no una función crítica del negocio. Si la escritura falla, el visitante no debe recibir un error ni percibir latencia adicional. Esta arquitectura garantiza que la caída o lentitud del módulo de analytics no afecta la disponibilidad de los sitios de los tenants. La contrapartida es que bajo alta carga podría haber pérdida de algunos page views — es un trade-off aceptable para un CMS.

---

### ADR-010 — Campo `content` excluido del listado de templates

**Contexto**: El endpoint `GET /api/v1/templates` devuelve todos los templates disponibles para que el tenant elija al crear un sitio.

**Decisión**: El campo `content` (tipo `Json`) se excluye del select en el listado. Solo se incluye en `GET /api/v1/templates/:id`.

**Justificación**: Un template puede contener la estructura completa de múltiples páginas con todos sus bloques — potencialmente varios KB de JSON por template. Si el listado tiene 20 templates, enviar el `content` de todos multiplica el payload por un factor de 10x-50x innecesariamente. El cliente solo necesita el `content` cuando el usuario selecciona un template específico para aplicarlo. Este patrón sigue el principio de "load on demand" estándar en APIs REST.

---

## Resumen de endpoints nuevos

| Método | Path                                                        | Auth                     | Status  |
|--------|-------------------------------------------------------------|--------------------------|---------|
| POST   | /api/v1/analytics/pageview                                  | Ninguna                  | 204     |
| GET    | /api/v1/sites/:siteId/analytics/summary                     | JWT + Tenant             | 200     |
| POST   | /api/v1/tenants/:tenantId/domains                           | JWT + Tenant + OWNER     | 201     |
| GET    | /api/v1/tenants/:tenantId/domains                           | JWT + Tenant             | 200     |
| DELETE | /api/v1/tenants/:tenantId/domains/:domainId                 | JWT + Tenant + OWNER     | 204     |
| POST   | /api/v1/tenants/:tenantId/domains/:domainId/verify          | JWT + Tenant + OWNER     | 200     |
| GET    | /api/v1/templates                                           | JWT                      | 200     |
| GET    | /api/v1/templates/:id                                       | JWT                      | 200     |

## Modificaciones a endpoints existentes

| Método | Path              | Cambio                                                                 |
|--------|-------------------|------------------------------------------------------------------------|
| POST   | /api/v1/sites     | Lógica adicional en servicio para aplicar template cuando `templateId` está presente |

---

## Variables de entorno nuevas

Agregar a `.env.example`:

```
# Analytics — IP hashing (GDPR)
IP_SALT=cambia-este-valor-por-uno-aleatorio-seguro
```

`IP_SALT` debe generarse con `openssl rand -hex 32` y tratarse como secreto de infraestructura (no committed al repositorio).
