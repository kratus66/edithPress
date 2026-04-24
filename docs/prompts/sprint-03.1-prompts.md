# EdithPress — Prompts Sprint 03.1 (Expansión de Bloques)
**Generado**: 2026-04-24 | **PM**: Agente 01

> **Objetivo del sprint**: Expandir la biblioteca de bloques de EdithPress para que pueda
> construir cualquier tipo de sitio web — e-commerce, portafolio, landing, negocio local.
> Inspirado en el análisis del diseño Artesanías del Vichada (v0-artesanias-del-vichada-design.vercel.app).
>
> **Bloques a implementar**:
> 1. **NavbarBlock** — Navegación principal con logo, links, buscador/carrito, sticky
> 2. **ProductGridBlock** — Grilla de productos para e-commerce con imagen, precio, artesano
> 3. **StatsBlock** — Fila de estadísticas/contadores (ej: "50+ Artesanos", "200+ Productos")
> 4. **NewsletterBlock** — Sección de suscripción por email con CTA
>
> **Estado al iniciar Sprint 03.1**:
> - ✅ Sprint 03 en ejecución: builder con 10 bloques, renderer funcionando, admin completo
> - ✅ NavbarBlock.tsx EXISTE en apps/builder/src/blocks/ — solo falta registrar y agregar al renderer
> - ✅ ColorPickerField y FontFamilyField disponibles en apps/builder/src/components/
> - ✅ MediaPicker disponible en apps/builder/src/components/
> - ✅ puck-config.tsx con 10 bloques registrados (HeroBlock, TextBlock, ImageBlock, ButtonBlock,
>       SeparatorBlock, GalleryBlock, ContactFormBlock, CardGridBlock, VideoBlock, PricingBlock)
> - ❌ NavbarBlock NO está registrado en puck-config.tsx
> - ❌ ProductGridBlock — no existe en builder ni renderer
> - ❌ StatsBlock — no existe en builder ni renderer
> - ❌ NewsletterBlock — no existe en builder ni renderer
> - ❌ Newsletter subscription — no hay endpoint en la API
>
> **Orden de ejecución**:
> ```
> CRÍTICO PRIMERO (define contratos que todos los demás usan):
>   → Agente 03 (Architect)  — definir schemas y props de los 4 bloques
>   → Agente 12 (UX)         — componentes UI compartidos (paralelo con 03)
>
> PARALELO (una vez 03 complete):
>   → Agente 07 (Builder)    — crear/registrar los 4 bloques en el builder
>   → Agente 05 (Backend)    — endpoint de suscripción al newsletter
>
> PARALELO (una vez 07 y 05 completen):
>   → Agente 08 (Renderer)   — renderizar los 4 bloques en producción
>
> ÚLTIMO:
>   → Agente 10 (Security)   — revisar XSS en links del navbar, CSRF en newsletter
>   → Agente 11 (QA)         — tests de los 4 bloques nuevos
> ```
>
> **Agentes sin tareas de código en este sprint** (roles informativos):
> - Agente 01 (PM): coordinar y definir criterios de aceptación
> - Agente 02 (BA): escribir historias de usuario y criterios de aceptación
> - Agente 04 (DB): revisar si NewsletterSubscriber necesita modelo en BD
> - Agente 06 (Admin): sin cambios en este sprint (bloques solo afectan builder/renderer)
> - Agente 09 (DevOps): verificar que el build pasa después de los nuevos bloques

---

## AGENTE 01 — Project Manager
**Abrir chat nuevo → "Actúa como Project Manager de EdithPress, lee docs/agents/01-project-manager.md"**

```
Eres el Project Manager (Agente 01) de EdithPress.
Lee docs/agents/01-project-manager.md para tu contexto completo.

CONTEXTO DEL SPRINT 03.1:
Este es un sub-sprint del Sprint 03 con foco exclusivo en expandir la biblioteca
de bloques del builder. El objetivo es que EdithPress pueda construir cualquier
tipo de página web — no solo landing pages simples.

Bloques a implementar:
  1. NavbarBlock     — navegación/header
  2. ProductGridBlock — grilla e-commerce
  3. StatsBlock      — contadores estadísticos
  4. NewsletterBlock — suscripción por email

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Criterios de Aceptación del Sprint
Prioridad: CRÍTICA (primero antes de que los demás empiecen)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Definir y documentar los criterios de aceptación para cada bloque.

Para cada bloque, la definición de "done" es:
  ✅ Bloque registrado en puck-config.tsx (builder)
  ✅ Bloque renderizando correctamente en el renderer
  ✅ Todos los campos configurables funcionan en el panel de Puck
  ✅ Bloque se ve correctamente en preview desktop y mobile
  ✅ No hay errores TypeScript (pnpm build pasa)
  ✅ Revisado por Agente 10 (Security)

Criterio adicional para NewsletterBlock:
  ✅ El formulario envía datos al endpoint POST /api/v1/sites/:siteId/subscribe
  ✅ Muestra feedback visual (éxito/error) al usuario

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Seguimiento de Dependencias
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Las dependencias críticas del sprint son:

1. Agente 03 debe definir los schemas ANTES de que Agente 07 y 08 empiecen
   → Sin schema: los props de los bloques pueden ser inconsistentes

2. Agente 05 debe crear el endpoint ANTES de que Agente 08 integre el form del newsletter
   → Sin endpoint: el NewsletterBlock del renderer no puede enviar suscripciones

3. Agente 07 debe terminar ANTES de que Agente 08 empiece
   → El renderer replica exactamente los mismos props que define el builder

Si algún agente no puede completar su tarea, documentar el bloqueante y notificar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Registro de Estado del Sprint
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Al cierre del sprint, actualizar docs/prompts/sprint-03-prompts.md con el estado
final de sprint 03.1 (añadir una sección al final del documento):

## Estado Sprint 03.1 — Expansión de Bloques
- [✅/❌] NavbarBlock registrado y renderizando
- [✅/❌] ProductGridBlock creado y renderizando
- [✅/❌] StatsBlock creado y renderizando
- [✅/❌] NewsletterBlock creado y renderizando
- [✅/❌] Endpoint newsletter subscription implementado
- [✅/❌] Todos los builds pasan sin errores TypeScript

RESTRICCIONES:
- No microgestionar los detalles técnicos — confiar en el criterio de cada agente
- Si hay conflictos entre agentes (ej: props inconsistentes), mediar con el schema del Agente 03
```

---

## AGENTE 02 — Business Analyst
**Abrir chat nuevo → "Actúa como Business Analyst de EdithPress, lee docs/agents/02-business-analyst.md"**

```
Eres el Business Analyst (Agente 02) de EdithPress.
Lee docs/agents/02-business-analyst.md para tu contexto completo.

CONTEXTO:
EdithPress necesita 4 nuevos bloques para poder construir sitios web más completos.
El caso de uso inspirador es el sitio Artesanías del Vichada: una tienda de artesanías
colombianas que necesita navbar, productos, estadísticas y newsletter.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Historias de Usuario
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Documentar las historias de usuario para cada bloque:

NavbarBlock:
  Como dueño de un sitio web,
  quiero agregar una barra de navegación configurable,
  para que mis visitantes puedan navegar fácilmente entre las secciones de mi sitio.
  Criterios de aceptación:
  - Puedo configurar el logo (texto o imagen)
  - Puedo agregar/editar/eliminar links de navegación
  - Puedo elegir si la barra queda fija (sticky) al hacer scroll
  - Puedo mostrar u ocultar íconos de búsqueda y carrito
  - Puedo cambiar colores de fondo, texto y acento

ProductGridBlock:
  Como dueño de una tienda,
  quiero mostrar mis productos en una grilla visual,
  para que los visitantes puedan explorar el catálogo fácilmente.
  Criterios de aceptación:
  - Puedo agregar productos con imagen, nombre, precio, categoría y descripción
  - Puedo configurar cuántas columnas mostrar (2, 3 o 4)
  - Puedo agregar un botón de acción por producto ("Ver", "Comprar", "Agregar al carrito")
  - Puedo personalizar el título de la sección

StatsBlock:
  Como dueño de un negocio,
  quiero mostrar estadísticas clave de mi negocio,
  para generar confianza en los visitantes.
  Criterios de aceptación:
  - Puedo agregar entre 2 y 6 estadísticas
  - Cada estadística tiene un número y una etiqueta (ej: "50+" y "Artesanos")
  - Puedo elegir el color de fondo y de los números
  - La sección se ve bien en mobile (columnas apiladas)

NewsletterBlock:
  Como dueño de un negocio,
  quiero tener un formulario de suscripción por email,
  para construir mi lista de contactos y comunicarme con mis clientes.
  Criterios de aceptación:
  - Puedo personalizar el título, subtítulo y texto del botón
  - El formulario valida que el email tenga formato correcto
  - Al enviar, el email queda registrado en la BD asociado al sitio
  - El formulario muestra mensaje de éxito o error según el resultado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Análisis de Casos de Uso por Industria
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Con estos 4 bloques nuevos + los 10 existentes, documentar qué tipos de sitios
ya se pueden construir completamente con EdithPress:

Tipos de sitio cubiertos (al finalizar sprint 03.1):
- ✅ Landing page de producto/servicio (Hero + Text + Stats + Newsletter + Footer-ish)
- ✅ Tienda online básica (Navbar + Hero + ProductGrid + Stats + Newsletter)
- ✅ Portafolio (Navbar + Hero + Gallery + CardGrid)
- ✅ Restaurante (Navbar + Hero + Text + Image + ContactForm)
- ✅ Organización/ONG (Navbar + Hero + Stats + CardGrid + Newsletter)
- ⚠️ Blog (falta bloque de artículos/posts dinámicos — sprint futuro)
- ⚠️ E-commerce completo (falta carrito, checkout — sprint futuro)

Documentar esto en docs/block-catalog.md (nuevo archivo).
Incluir para cada bloque: nombre, descripción, casos de uso, screenshot placeholder.

RESTRICCIONES:
- No inventar requisitos no solicitados
- Coordinar con Agente 03 para que los schemas reflejen los criterios de aceptación
```

---

## AGENTE 03 — Software Architect
**Abrir chat nuevo → "Actúa como Software Architect de EdithPress, lee docs/agents/03-software-architect.md"**

```
Eres el Software Architect (Agente 03) de EdithPress.
Lee docs/agents/03-software-architect.md para tu contexto completo.

ESTADO ACTUAL:
Lee los siguientes archivos antes de empezar:
  - apps/builder/src/lib/puck-config.tsx (10 bloques registrados)
  - apps/builder/src/blocks/NavbarBlock.tsx (YA EXISTE — revisar props actuales)
  - apps/builder/src/blocks/HeroBlock.tsx (patrón de referencia)
  - apps/builder/src/blocks/CardGridBlock.tsx (patrón de referencia para grillas)

NavbarBlock.tsx ya existe con los siguientes props:
  logoText, logoImageUrl, navLinks[], backgroundColor, textColor, accentColor,
  sticky, showSearch, showCart, layout ('logo-left' | 'logo-center')

Los 3 bloques faltantes (ProductGridBlock, StatsBlock, NewsletterBlock)
necesitan ser diseñados desde cero.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Revisar y Validar Schema de NavbarBlock
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/builder/src/blocks/NavbarBlock.tsx completo.

Verificar que el schema es completo para un navbar de uso general.
Considerar si faltan props importantes para compatibilidad con distintos tipos de sitios.

Campos a verificar:
- ¿Tiene soporte para sub-menús? (si no, documentar como limitación conocida)
- ¿El campo navLinks soporta links externos (target="_blank")? Añadir si falta.
- ¿Hay un prop para mostrar/ocultar en mobile (hamburger menu)? Notar como v2.

Resultado: documentar el schema final de NavbarBlock en docs/block-schemas.md (nuevo).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Diseñar Schema de ProductGridBlock
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diseñar y documentar el contrato de props para ProductGridBlock.
Este bloque es para mostrar un catálogo de productos/servicios en una grilla.

Schema propuesto (validar y ajustar si es necesario):

interface ProductGridBlockProps {
  title: string               // "Nuestros Productos" | "" para sin título
  subtitle: string            // Subtítulo opcional de la sección
  columns: 2 | 3 | 4         // Columnas en desktop (en mobile siempre 1 o 2)
  products: Array<{
    image: string             // URL de la imagen del producto
    imageAlt: string
    category: string          // "Mochilas", "Cerámica", "Joyería"
    name: string              // "Mochila Wayuu Premium"
    description: string       // Descripción breve (máx ~100 chars)
    price: string             // "$85.000" — string para soportar cualquier moneda/formato
    artisan?: string          // "Artesana: María López" — opcional, específico e-commerce
    ctaText: string           // "Ver producto", "Comprar", "Saber más"
    ctaUrl: string
  }>
  backgroundColor: string
  textColor: string
  accentColor: string         // color del precio y del botón
  showCategory: boolean       // mostrar/ocultar la categoría
  showArtisan: boolean        // mostrar/ocultar el campo artesano
  cardStyle: 'shadow' | 'border' | 'minimal'
}

DefaultProps:
  title: "Nuestros Productos"
  subtitle: ""
  columns: 3
  products: [
    { image: "https://placehold.co/400x300/e2e8f0/64748b?text=Producto",
      imageAlt: "Producto 1", category: "Categoría",
      name: "Nombre del producto", description: "Descripción breve del producto.",
      price: "$0.000", artisan: "", ctaText: "Ver producto", ctaUrl: "#" },
    (repetir 2 veces más)
  ]
  backgroundColor: "#ffffff"
  textColor: "#1e293b"
  accentColor: "#b45309"
  showCategory: true
  showArtisan: false
  cardStyle: "shadow"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Diseñar Schema de StatsBlock
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diseñar el contrato de props para StatsBlock.
Este bloque muestra una fila horizontal de estadísticas numéricas para generar confianza.

Schema propuesto:

interface StatsBlockProps {
  stats: Array<{
    value: string     // "50+", "200+", "15 años", "$1M+"
    label: string     // "Artesanos", "Productos", "Experiencia", "En ventas"
    icon?: string     // Emoji o carácter especial (opcional): "🎨", "📦", "⭐"
  }>
  backgroundColor: string
  textColor: string
  accentColor: string   // color del value (número)
  layout: 'row' | 'row-with-dividers'
  padding: 'sm' | 'md' | 'lg'
}

DefaultProps:
  stats: [
    { value: "50+", label: "Artesanos", icon: "🎨" },
    { value: "200+", label: "Productos", icon: "📦" },
    { value: "15", label: "Años de experiencia", icon: "⭐" },
    { value: "100%", label: "Hecho a mano", icon: "✋" },
  ]
  backgroundColor: "#f8f4ef"
  textColor: "#1e293b"
  accentColor: "#b45309"
  layout: "row-with-dividers"
  padding: "md"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Diseñar Schema de NewsletterBlock
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diseñar el contrato de props para NewsletterBlock.
Este bloque muestra un formulario de suscripción a newsletter.

Schema propuesto:

interface NewsletterBlockProps {
  title: string             // "¿Quieres estar al día?"
  subtitle: string          // "Suscríbete y recibe novedades, descuentos exclusivos"
  placeholder: string       // "tu@email.com"
  buttonText: string        // "Suscribirme"
  successMessage: string    // "¡Listo! Te avisaremos de las novedades."
  backgroundColor: string
  textColor: string
  accentColor: string       // color del botón
  layout: 'centered' | 'side-by-side'
  // El endpoint al que enviar es derivado del siteId (manejado por el renderer,
  // no es un prop configurable por el usuario)
}

DefaultProps:
  title: "Únete a nuestra comunidad"
  subtitle: "Recibe noticias sobre nuevos productos y artesanos."
  placeholder: "tu@email.com"
  buttonText: "Suscribirme"
  successMessage: "¡Gracias! Te contactaremos pronto."
  backgroundColor: "#1e293b"
  textColor: "#ffffff"
  accentColor: "#b45309"
  layout: "centered"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Documentar Schemas en docs/block-schemas.md
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear docs/block-schemas.md con:
  - El schema final de los 4 bloques (incluyendo NavbarBlock revisado)
  - IMPORTANTE: Este documento es el contrato inmutable entre builder y renderer.
    Cambios a los schemas de bloques en producción requieren migración de datos.
  - Convención de nombres: camelCase para props, PascalCase para tipos de unión
  - Versión: v1.0 — Sprint 03.1

RESTRICCIONES:
- No cambiar nombres de props de bloques YA EXISTENTES (rompe sitios publicados)
- Los schemas deben ser TypeScript-first (interfaces, no Zod en esta fase)
- Priorizar claridad sobre flexibilidad — menos props es mejor que más props
- El campo 'icon' de StatsBlock es opcional y debe aceptar string (emoji/texto)
```

---

## AGENTE 04 — Database Engineer
**Abrir chat nuevo → "Actúa como Database Engineer de EdithPress, lee docs/agents/04-database-engineer.md"**

```
Eres el Database Engineer (Agente 04) de EdithPress.
Lee docs/agents/04-database-engineer.md para tu contexto completo.

CONTEXTO DEL SPRINT 03.1:
Este sprint agrega 4 nuevos bloques al builder. La mayoría son puramente frontend,
pero el NewsletterBlock requiere persistir los emails suscritos.

Lee packages/database/prisma/schema.prisma completo antes de empezar.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Modelo NewsletterSubscriber
Prioridad: ALTA (NewsletterBlock no puede funcionar sin este modelo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agregar modelo para almacenar suscriptores al newsletter de cada sitio:

model NewsletterSubscriber {
  id          String   @id @default(cuid())
  siteId      String
  email       String
  subscribedAt DateTime @default(now())
  isActive    Boolean  @default(true)
  source      String?  // "newsletter-block", "footer", etc.
  site        Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@unique([siteId, email])   // un email no puede suscribirse 2 veces al mismo sitio
  @@index([siteId])
  @@index([email])
}

Agregar relación inversa en Site:
  newsletterSubscribers NewsletterSubscriber[]

Migración:
  cd packages/database && pnpm prisma migrate dev --name add_newsletter_subscriber

Regenerar el client:
  pnpm prisma generate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Actualizar Seed con Datos de Demo
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agregar al seed (packages/database/prisma/seed.ts) el template para tienda artesanal:

Template "tienda-artesanal" (category: "ecommerce"):
  Contenido: NavbarBlock + HeroBlock + StatsBlock + ProductGridBlock + NewsletterBlock
  Datos de ejemplo con temática de artesanías colombianas.

Estructura del contenido JSON (formato Puck):
{
  "content": [
    { "type": "NavbarBlock", "props": { ...navbarBlockDefaultProps } },
    { "type": "HeroBlock", "props": { ...heroBlockDefaultProps para artesanías } },
    { "type": "StatsBlock", "props": { ...statsBlockDefaultProps } },
    { "type": "ProductGridBlock", "props": { ...productGridBlockDefaultProps } },
    { "type": "NewsletterBlock", "props": { ...newsletterBlockDefaultProps } }
  ],
  "zones": {}
}

RESTRICCIONES:
- El @@unique([siteId, email]) es CRÍTICO — previene suscripciones duplicadas
- No guardar contraseñas ni datos sensibles en NewsletterSubscriber
- Al terminar: cd packages/database && pnpm prisma db seed (verificar que no falla)
```

---

## AGENTE 05 — Backend Developer
**Abrir chat nuevo → "Actúa como Backend Developer de EdithPress, lee docs/agents/05-backend-developer.md"**

```
Eres el Backend Developer (Agente 05) de EdithPress.
Lee docs/agents/05-backend-developer.md para tu contexto completo.

ESTADO ACTUAL:
- ✅ auth, sites, pages, media, analytics, custom-domains funcionando
- ✅ ThrottlerModule configurado (para rate limiting)
- ❌ Newsletter subscription — NO EXISTE

NOTA: Esperar a que Agente 04 complete la migración de NewsletterSubscriber antes
de implementar el módulo.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Módulo Newsletter
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/api/src/modules/newsletter/ con:

newsletter.module.ts
newsletter.controller.ts  (prefijo: /sites/:siteId/newsletter)
newsletter.service.ts

Endpoints:

POST /sites/:siteId/newsletter/subscribe  (PÚBLICO — llamado desde el renderer)
  Body: { email: string, source?: string }
  Validación:
  1. Validar formato de email (class-validator @IsEmail())
  2. Verificar que el siteId existe
  3. Upsert en NewsletterSubscriber:
     - Si ya existe: actualizar isActive = true (re-suscripción)
     - Si no existe: crear nuevo suscriptor
  4. Retornar 201 { success: true }
  Rate limit: 3 suscripciones por IP por hora (evitar spam)

GET /sites/:siteId/newsletter/subscribers (requiere JwtAuthGuard + TenantGuard)
  Query params: ?page=1&limit=50&active=true
  Response: { data: [{ email, subscribedAt, isActive, source }], total, page }
  Para que el dueño del sitio vea su lista de suscriptores.

DELETE /sites/:siteId/newsletter/unsubscribe  (PÚBLICO)
  Body: { email: string, token: string }
  El token es un hash del email (para validar que es el propietario del email).
  Nota: implementación simple — el token puede ser btoa(email) en v1.
  Lógica: actualizar isActive = false (soft delete, conservar datos históricos)

Registrar NewsletterModule en AppModule.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Agregar CORS para el renderer en newsletter
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/main.ts — la configuración de CORS actual.

El endpoint POST /newsletter/subscribe es llamado desde el renderer (dominio diferente).
Verificar que RENDERER_URL está en la lista de origins permitidos en CORS.
Si no está: agregarlo.

También agregar CORS para custom domains (para sitios con dominio propio que también
llaman al newsletter desde su dominio personalizado).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Endpoint de Lista de Suscriptores en Admin (opcional)
Prioridad: BAJA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /sites/:siteId/newsletter/export
  Requiere JwtAuthGuard + TenantGuard
  Response: texto plano CSV con columnas: email, subscribedAt, isActive
  Content-Type: text/csv
  Content-Disposition: attachment; filename="subscribers-{siteId}.csv"

Esto permite al usuario descargar su lista para importar a Mailchimp/etc.

RESTRICCIONES:
- Nunca exponer la lista de suscriptores públicamente
- Rate limiting en POST /subscribe (3/hora/IP) para evitar spam
- El email debe ser lowercase antes de guardar (evitar duplicados por capitalización)
- Al terminar: cd apps/api && pnpm build
```

---

## AGENTE 07 — Frontend Builder
**Abrir chat nuevo → "Actúa como Frontend Builder Developer de EdithPress, lee docs/agents/07-frontend-builder.md"**

```
Eres el Frontend Builder Developer (Agente 07) de EdithPress.
Lee docs/agents/07-frontend-builder.md para tu contexto completo.

ESTADO ACTUAL:
- ✅ Editor Puck con 10 bloques: Hero, Text, Image, Button, Separator, Gallery,
     ContactForm, CardGrid, Video, Pricing
- ✅ ColorPickerField disponible en apps/builder/src/components/ColorPickerField.tsx
- ✅ FontFamilyField disponible en apps/builder/src/components/FontFamilyField.tsx
- ✅ MediaPicker disponible en apps/builder/src/components/MediaPicker.tsx
- ✅ NavbarBlock.tsx YA EXISTE en apps/builder/src/blocks/NavbarBlock.tsx
     PERO no está registrado en puck-config.tsx
- ❌ ProductGridBlock — no existe
- ❌ StatsBlock — no existe
- ❌ NewsletterBlock — no existe

Lee apps/builder/src/blocks/NavbarBlock.tsx COMPLETO antes de empezar.
Lee apps/builder/src/lib/puck-config.tsx COMPLETO antes de empezar.
Lee docs/block-schemas.md (lo crea Agente 03) para los schemas acordados.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Registrar NavbarBlock en puck-config.tsx
Prioridad: CRÍTICA (ya existe, solo falta registrar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/builder/src/blocks/NavbarBlock.tsx completo.

En apps/builder/src/lib/puck-config.tsx:

1. Agregar el import al inicio:
   import { NavbarBlock, navbarBlockFields, navbarBlockDefaultProps } from '@/blocks/NavbarBlock'

2. Agregar el bloque en la sección components de puckConfig:

   NavbarBlock: {
     label: 'Navbar / Menú',
     fields: {
       ...navbarBlockFields,
       // Reemplazar los campos de color con el ColorPickerField
       backgroundColor: colorField('Color de fondo'),
       textColor: colorField('Color del texto'),
       accentColor: colorField('Color de acento'),
       // Reemplazar logoImageUrl con MediaPicker
       logoImageUrl: {
         type: 'custom',
         label: 'Logo (imagen, opcional)',
         render: ({ value, onChange }) => (
           <MediaPicker value={value as string} onChange={onChange} label="Logo" />
         ),
       },
     },
     defaultProps: navbarBlockDefaultProps,
     render: NavbarBlock,
   },

IMPORTANTE: Agregar NavbarBlock como el PRIMER bloque en la lista de components
(para que aparezca primero en el panel del editor — los navbars van arriba).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Crear ProductGridBlock
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/ProductGridBlock.tsx.

Lee docs/block-schemas.md (schema definido por Agente 03) para los props exactos.
Si el archivo no existe aún, usar este schema mínimo:

interface ProductGridBlockProps {
  title: string
  subtitle: string
  columns: 2 | 3 | 4
  products: Array<{
    image: string
    imageAlt: string
    category: string
    name: string
    description: string
    price: string
    artisan: string
    ctaText: string
    ctaUrl: string
  }>
  backgroundColor: string
  textColor: string
  accentColor: string
  showCategory: boolean
  showArtisan: boolean
  cardStyle: 'shadow' | 'border' | 'minimal'
}

Implementar la función de renderizado:
- Título de sección centrado (si title no está vacío)
- Grid CSS con el número de columnas configurado
  En mobile (max-width: 640px): siempre 1 columna
  En tablet (max-width: 1024px): máximo 2 columnas
  (usar media queries inline o clases condicionales)
- Cada tarjeta de producto:
  * Imagen (con aspect-ratio 4/3, object-fit: cover)
  * Badge de categoría (si showCategory = true)
  * Nombre del producto (font-weight: 600)
  * Descripción breve (color: gris, font-size: 0.875rem)
  * Nombre del artesano (si showArtisan = true y artisan no está vacío)
  * Precio en color accentColor (font-size: 1.1rem, font-weight: 700)
  * Botón CTA (color primario = accentColor)
- Estilos de card según cardStyle:
  * 'shadow': box-shadow suave
  * 'border': border 1px solid #e2e8f0
  * 'minimal': sin borde ni sombra, solo separación por gap

Exportar: ProductGridBlock, productGridBlockFields, productGridBlockDefaultProps

En puck-config.tsx, registrar ProductGridBlock con:
  - backgroundColor, textColor, accentColor: usar colorField()
  - products[*].image: usar MediaPicker como custom field

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Crear StatsBlock
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/StatsBlock.tsx.

Lee docs/block-schemas.md para los props exactos.

interface StatsBlockProps {
  stats: Array<{
    value: string   // "50+", "200+", "15 años"
    label: string   // "Artesanos", "Productos"
    icon: string    // emoji o vacío: "🎨", "📦", ""
  }>
  backgroundColor: string
  textColor: string
  accentColor: string
  layout: 'row' | 'row-with-dividers'
  padding: 'sm' | 'md' | 'lg'
}

Implementar renderizado:
- Fila de estadísticas distribuidas uniformemente (display: flex, justify: space-around)
- Cada stat:
  * Icono/emoji (grande, si no está vacío)
  * Número/valor (font-size: clamp(2rem, 4vw, 3rem), font-weight: 700, color: accentColor)
  * Etiqueta (font-size: 0.9rem, color: textColor con opacidad 0.7)
- Si layout = 'row-with-dividers': separador vertical entre cada stat
- En mobile: apilar en 2 columnas (grid 2x2 o 1 columna según la cantidad)
- Padding según el mapa: sm=24px, md=48px, lg=80px

Exportar: StatsBlock, statsBlockFields, statsBlockDefaultProps
Registrar en puck-config.tsx con colorField() para backgroundColor, textColor, accentColor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Crear NewsletterBlock
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/NewsletterBlock.tsx.

Lee docs/block-schemas.md para los props exactos.

interface NewsletterBlockProps {
  title: string
  subtitle: string
  placeholder: string
  buttonText: string
  successMessage: string
  backgroundColor: string
  textColor: string
  accentColor: string
  layout: 'centered' | 'side-by-side'
}

Implementar renderizado:
- En el builder (editor mode): mostrar el formulario estático sin lógica de submit
  (el builder no necesita que el form funcione — solo que se vea bien)
- Layout 'centered': título + subtítulo centrados, input + botón en fila centrada
- Layout 'side-by-side': título/subtítulo a la izquierda, form a la derecha

IMPORTANTE: El NewsletterBlock en el builder es SOLO visual (no funcional).
La funcionalidad real (submit → API) se implementa en el renderer (Agente 08).
En el builder, el botón puede simplemente tener onClick que no hace nada.

Exportar: NewsletterBlock, newsletterBlockFields, newsletterBlockDefaultProps
Registrar en puck-config.tsx con colorField() para backgroundColor, textColor, accentColor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Verificar Orden Visual de Bloques en el Panel
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En puck-config.tsx, asegurarse de que el orden de los components sigue
una lógica útil para el usuario:

Orden sugerido (de más a menos frecuente):
  1. NavbarBlock     — "Navbar / Menú"
  2. HeroBlock       — "Hero"
  3. TextBlock       — "Texto"
  4. ImageBlock      — "Imagen"
  5. ButtonBlock     — "Botón"
  6. ProductGridBlock — "Grilla de Productos"
  7. CardGridBlock   — "Grilla de Tarjetas"
  8. GalleryBlock    — "Galería"
  9. StatsBlock      — "Estadísticas"
  10. VideoBlock     — "Video"
  11. PricingBlock   — "Precios"
  12. ContactFormBlock — "Formulario de contacto"
  13. NewsletterBlock — "Suscripción / Newsletter"
  14. SeparatorBlock — "Separador"

RESTRICCIONES:
- Seguir exactamente los props definidos en docs/block-schemas.md (Agente 03)
- No cambiar nombres de props de bloques existentes
- Usar inline styles consistentes con el patrón de HeroBlock.tsx
- NO usar Tailwind en los bloques del builder (el renderer puede no tenerlo)
- Al terminar: cd apps/builder && pnpm build — sin errores TypeScript
```

---

## AGENTE 08 — Frontend Renderer
**Abrir chat nuevo → "Actúa como Frontend Renderer Developer de EdithPress, lee docs/agents/08-frontend-renderer.md"**

```
Eres el Frontend Renderer Developer (Agente 08) de EdithPress.
Lee docs/agents/08-frontend-renderer.md para tu contexto completo.

ESTADO ACTUAL:
- ✅ Renderer con 10 bloques: Hero, Text, Image, Button, Separator, Gallery,
     ContactForm, CardGrid, Video, Pricing
- ✅ Routing dinámico, ISR, Draft Mode, sitemap, OG tags
- ❌ NavbarBlock — no está en el renderer
- ❌ ProductGridBlock — no está en el renderer
- ❌ StatsBlock — no está en el renderer
- ❌ NewsletterBlock — no está en el renderer (y necesita lógica de submit)

NOTA: Esperar a que Agente 07 entregue los bloques del builder antes de empezar,
para garantizar que los props del renderer son idénticos a los del builder.

Lee la ubicación de los bloques existentes en el renderer antes de empezar.
Probablemente en: apps/renderer/src/app/_components/blocks/ o similar.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Agregar NavbarBlock al Renderer
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee el bloque NavbarBlock.tsx del builder (apps/builder/src/blocks/NavbarBlock.tsx).
Lee el BlockRenderer existente para entender cómo se registran bloques.

Crear la versión del renderer de NavbarBlock.
Los props son IDÉNTICOS a los del builder (mismo contrato).

Diferencias con la versión del builder:
- En el renderer, los links de navegación deben usar <a> estándar (NO next/link)
  porque los links pueden apuntar a sitios externos o a páginas del mismo sitio
  con rutas dinámicas que no conocemos en build time.
- El NavbarBlock debe tener position: sticky en el top de la página si sticky = true.

Registrar NavbarBlock en el BlockRenderer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Agregar ProductGridBlock al Renderer
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear la versión del renderer de ProductGridBlock.
Props idénticos a los del builder.

Diferencias con la versión del builder:
- Usar next/image para las imágenes de los productos (mejor rendimiento).
  Si las imágenes son externas, agregar los dominios a next.config.js en el renderer.
- El botón CTA debe usar <a href={ctaUrl}> (puede ser link externo).
- Responsive: en mobile mostrar 1 columna, en tablet 2, en desktop el valor de columns.
  Implementar con CSS Grid y media queries.

Registrar ProductGridBlock en el BlockRenderer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Agregar StatsBlock al Renderer
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear la versión del renderer de StatsBlock.
Props idénticos a los del builder.

No hay diferencias funcionales con la versión del builder.
Es un bloque puramente visual sin interacción.

Registrar StatsBlock en el BlockRenderer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Agregar NewsletterBlock al Renderer (con funcionalidad real)
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear la versión del renderer de NewsletterBlock.
Props idénticos a los del builder, MÁS un prop adicional:
  siteId: string  — inyectado por el renderer (NO es un campo del usuario)

IMPORTANTE: El NewsletterBlock en el renderer es un Client Component ('use client')
porque necesita manejar el estado del formulario.

Implementar la lógica de submit:

'use client'
import { useState } from 'react'

export function NewsletterBlock({ title, subtitle, placeholder, buttonText,
  successMessage, backgroundColor, textColor, accentColor, layout, siteId }) {

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Por favor ingresa un email válido.')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sites/${siteId}/newsletter/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase(), source: 'newsletter-block' }),
        }
      )
      if (res.ok) {
        setStatus('success')
        setMessage(successMessage)
        setEmail('')
      } else {
        throw new Error()
      }
    } catch {
      setStatus('error')
      setMessage('Ocurrió un error. Intenta de nuevo más tarde.')
    }
  }

  // Renderizar el formulario con los estados idle/loading/success/error
  // ...
}

El siteId debe ser inyectado desde el BlockRenderer al renderizar NewsletterBlock:
En el BlockRenderer, al encontrar type === 'NewsletterBlock', pasar siteId como prop adicional.

Registrar NewsletterBlock en el BlockRenderer con inyección de siteId.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Actualizar next.config.js para Imágenes Externas
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El ProductGridBlock usa imágenes de productos subidas por los usuarios.
Estas imágenes pueden venir de:
- El CDN de EdithPress (MinIO/S3)
- URLs externas de cualquier dominio

Lee apps/renderer/next.config.js actual.

Verificar que la configuración de images.remotePatterns incluye un patrón amplio
para permitir imágenes de cualquier fuente. Si no está configurado para aceptar
URLs externas arbitrarias, agregar:

images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**' },  // Cualquier dominio HTTPS
  ],
},

NOTA: Esto es apropiado para un builder de páginas donde el contenido
es controlado por tenants de confianza (no por usuarios finales anónimos).

RESTRICCIONES:
- Los props de cada bloque en el renderer deben ser IDÉNTICOS a los del builder
- El NewsletterBlock DEBE ser 'use client' (estado local del formulario)
- El siteId para el newsletter se inyecta desde el BlockRenderer, no desde los props del usuario
- No romper los 10 bloques existentes
- Al terminar: cd apps/renderer && pnpm build — sin errores TypeScript
```

---

## AGENTE 06 — Frontend Admin
**Abrir chat nuevo → "Actúa como Frontend Admin Developer de EdithPress, lee docs/agents/06-frontend-admin.md"**

```
Eres el Frontend Admin Developer (Agente 06) de EdithPress.
Lee docs/agents/06-frontend-admin.md para tu contexto completo.

CONTEXTO:
El Sprint 03.1 agrega 4 nuevos bloques al builder. El admin no necesita
cambios mayores, pero hay dos mejoras opcionales de bajo impacto.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Vista de Suscriptores del Newsletter
Prioridad: MEDIA (depende de que Agente 05 entregue el endpoint primero)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/admin/src/app/(tenant)/sites/[siteId]/ para entender la estructura actual.

Agregar sección "Newsletter" en la configuración del sitio
(apps/admin/src/app/(tenant)/sites/[siteId]/settings/ o como nueva página):

Contenido:
- Contador de suscriptores activos: GET /api/v1/sites/:siteId/newsletter/subscribers?active=true
  Mostrar: "X suscriptores activos"
- Tabla simple con los últimos 10 suscriptores (email + fecha de suscripción)
- Botón "Exportar CSV" → GET /api/v1/sites/:siteId/newsletter/export
  (descargar el archivo CSV directamente)

Si el endpoint aún no existe (Agente 05 no ha terminado), mostrar un placeholder:
  "La funcionalidad de newsletter estará disponible próximamente."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Actualizar Template "tienda-artesanal" en el Marketplace
Prioridad: BAJA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Si el template marketplace del Sprint 03 está implementado:
Verificar que el template "tienda-artesanal" (creado por Agente 04 en el seed)
aparece correctamente en la grilla de selección de templates al crear un nuevo sitio.

Si la categoría "ecommerce" no existe en los filtros, agregarla.

RESTRICCIONES:
- Server Components por defecto, 'use client' solo donde sea necesario
- Si los endpoints no están disponibles, usar datos mock con comentario // TODO
- Al terminar: cd apps/admin && pnpm build — sin errores TypeScript
```

---

## AGENTE 09 — DevOps Engineer
**Abrir chat nuevo → "Actúa como DevOps Engineer de EdithPress, lee docs/agents/09-devops-engineer.md"**

```
Eres el DevOps Engineer (Agente 09) de EdithPress.
Lee docs/agents/09-devops-engineer.md para tu contexto completo.

CONTEXTO:
El Sprint 03.1 no requiere cambios de infraestructura. Sin embargo, los nuevos
bloques agregan componentes y dependencias que pueden afectar el tiempo de build.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Verificar Build Completo Post-Sprint
Prioridad: ALTA (bloquea el merge a main si falla)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Una vez que todos los agentes de código (07, 08, 05) hayan terminado:

Ejecutar el build completo del monorepo:
  pnpm --filter builder build
  pnpm --filter renderer build
  pnpm --filter api build
  pnpm --filter admin build

Si algún build falla: notificar al agente responsable con el error exacto.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Verificar Variables de Entorno para Newsletter
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El NewsletterBlock del renderer necesita NEXT_PUBLIC_API_URL.

Verificar que:
1. NEXT_PUBLIC_API_URL está en apps/renderer/.env.example
2. NEXT_PUBLIC_API_URL está en el docker-compose.yml del renderer
3. Si no está: agregarlo en ambos archivos

También verificar en apps/api/src/main.ts que el origin del renderer
está en la lista de CORS permitidos (lo debe configurar Agente 05,
pero verificar que no se rompió nada con el merge).

RESTRICCIONES:
- No modificar infraestructura de producción sin autorización explícita del PM
- Solo verificar y reportar — no deployar en staging para este sprint
```

---

## AGENTE 12 — UX Designer
**Abrir chat nuevo → "Actúa como UX Designer de EdithPress, lee docs/agents/12-ux-designer.md"**

```
Eres el UX Designer (Agente 12) de EdithPress.
Lee docs/agents/12-ux-designer.md para tu contexto completo.

ESTADO ACTUAL — packages/ui/src/:
Lee TODOS los archivos en packages/ui/src/ antes de empezar para no duplicar trabajo.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Componente ProductCard (para ProductGridBlock)
Prioridad: CRÍTICA (Agente 07 y 08 lo necesitan)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear packages/ui/src/ProductCard.tsx:

interface ProductCardProps {
  image: string
  imageAlt?: string
  category?: string
  name: string
  description?: string
  price: string
  artisan?: string
  ctaText: string
  ctaUrl: string
  accentColor?: string      // color del precio y el botón (default: #b45309)
  style?: 'shadow' | 'border' | 'minimal'
  showCategory?: boolean
  showArtisan?: boolean
}

Visual:
- Imagen con aspect-ratio 4/3, object-fit: cover, esquinas redondeadas arriba
- Badge de categoría (esquina superior izquierda sobre la imagen) — si showCategory
- Área de contenido con padding:
  * Nombre del producto (font-weight: 600, truncar a 2 líneas con line-clamp)
  * Descripción breve (color gris, truncar a 2 líneas)
  * Artesano en italic si showArtisan y artisan no vacío: "Por María López"
  * Fila inferior: precio (accentColor, bold) + botón CTA a la derecha
- Hover: ligero elevación de sombra (transform: translateY(-2px))
- Estilos de card:
  * shadow: box-shadow: 0 2px 12px rgba(0,0,0,.08)
  * border: border: 1px solid #e2e8f0
  * minimal: sin borde ni sombra

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Componente NewsletterForm (para NewsletterBlock)
Prioridad: ALTA (Agente 08 lo necesita para el renderer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear packages/ui/src/NewsletterForm.tsx:
(Este es el componente visual — sin lógica de fetch. El Agente 08 lo envuelve con la lógica.)

interface NewsletterFormProps {
  placeholder?: string        // "tu@email.com"
  buttonText?: string         // "Suscribirme"
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  status: 'idle' | 'loading' | 'success' | 'error'
  statusMessage?: string
  accentColor?: string
  textColor?: string
}

Visual:
- Input de email + botón en una fila (flex row)
- En mobile: stacked (columna)
- Status 'loading': botón deshabilitado con spinner
- Status 'success': reemplazar el form con un mensaje de éxito verde
- Status 'error': mostrar mensaje de error en rojo debajo del input
- Input con focus ring del color accentColor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Componente StatItem (para StatsBlock)
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear packages/ui/src/StatItem.tsx:

interface StatItemProps {
  value: string        // "50+", "200+", "15 años"
  label: string        // "Artesanos", "Productos"
  icon?: string        // emoji: "🎨", "📦" — opcional
  accentColor?: string // color del value
  textColor?: string
}

Visual:
- Icono/emoji centrado (font-size: 2rem) — si icon existe
- Valor: font-size: clamp(2rem, 4vw, 3rem), font-weight: 700, color: accentColor
- Etiqueta: font-size: 0.9rem, color: textColor con opacity 0.7, text-align: center
- Padding vertical de 8px
- Sin border por defecto (el separador lo agrega StatsBlock si layout = 'row-with-dividers')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Componente NavBadge (para NavbarBlock)
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Revisar si el NavbarBlock actual tiene un badge de conteo para el carrito.
Si no tiene un componente reutilizable para el badge numérico (ej: "3" sobre el ícono del carrito):

Crear packages/ui/src/CartBadge.tsx:

interface CartBadgeProps {
  count: number         // número a mostrar (0 = oculto)
  color?: string        // color de fondo del badge (default: accentColor)
}

Visual:
- Círculo pequeño (16px x 16px) superpuesto en la esquina superior del ícono
- Número centrado (font-size: 10px, color: white)
- Si count = 0: no renderizar nada (null)
- Si count > 99: mostrar "99+"

REQUISITOS DE ENTREGA:
1. Cada componente en su propio archivo en packages/ui/src/
2. Exportar TODO desde packages/ui/src/index.ts
3. TypeScript strict — interfaces explícitas para todas las props
4. Solo inline styles — SIN Tailwind (los componentes de blocks usan inline styles)
5. Al terminar: cd packages/ui && pnpm build — sin errores TypeScript

NOTA IMPORTANTE: Los bloques del builder y renderer usan inline styles (NO Tailwind).
Los nuevos componentes UI deben seguir el mismo patrón para ser consistentes.
```

---

## AGENTE 10 — Security Engineer
**Abrir chat nuevo → "Actúa como Security Engineer de EdithPress, lee docs/agents/10-security-engineer.md"**

```
Eres el Security Engineer (Agente 10) de EdithPress.
Lee docs/agents/10-security-engineer.md para tu contexto completo.

ESTADO ACTUAL:
- ✅ XSS sanitization en content.service.ts
- ✅ Rate limiting global y en endpoints sensibles
- ✅ Headers de seguridad en todas las apps
- ❌ NavbarBlock — links configurables por el usuario (posible open redirect / javascript: URI)
- ❌ NewsletterBlock — endpoint público que puede recibir spam
- ❌ ProductGridBlock — imágenes externas (posible contenido malicioso via URLs)

NOTA: Esperar a que Agentes 07, 08 y 05 terminen antes de la auditoría.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Auditoría NavbarBlock: Links de Navegación
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/builder/src/blocks/NavbarBlock.tsx y su versión en el renderer.

Riesgos a mitigar:

1. URLs javascript: en los links de navegación
   Los navLinks son configurados por el dueño del sitio (tenant) — NO por usuarios finales.
   Sin embargo, si un tenant malicioso configura href="javascript:alert(1)", el visitante
   del sitio podría ser afectado.

   Implementar una función de sanitización en el renderer para los hrefs:
   function sanitizeUrl(url: string): string {
     if (!url) return '#'
     const trimmed = url.trim().toLowerCase()
     if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) return '#'
     return url
   }

   Aplicar esta función a TODOS los <a href> del NavbarBlock en el renderer.

2. Verificar que el logoImageUrl no permite HTML/scripts inyectados:
   La etiqueta <img src={logoImageUrl}> en el renderer está bien — no puede ejecutar JS.
   Verificar que no se usa dangerouslySetInnerHTML en el NavbarBlock.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Auditoría NewsletterBlock: Endpoint Público
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/newsletter/newsletter.controller.ts (creado por Agente 05).

Verificar:

1. Rate limiting en POST /subscribe:
   El decorador @Throttle debe limitar a 3 requests por IP por hora.
   Si usa el ThrottlerModule de NestJS, verificar la configuración.
   Si no está configurado: agregar el decorador o el guard correspondiente.

2. Validación del email:
   Verificar que class-validator @IsEmail() está aplicado en el DTO.
   El email debe ser sanitizado (lowercase, trim) antes de guardarse.

3. Protección contra email harvesting:
   El endpoint GET /subscribers requiere auth. Verificar que no existe
   ninguna ruta pública que liste emails de suscriptores.

4. Re-suscripción segura:
   El upsert que hace el servicio no debe revelar si el email ya estaba suscrito.
   La respuesta debe ser siempre 201 { success: true } — nunca revelar si ya existía.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Auditoría ProductGridBlock: Imágenes Externas
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El ProductGridBlock permite imágenes de cualquier URL externa en el renderer.

Riesgos:
1. Tracking via pixel: imágenes de terceros pueden trackear visitantes del sitio.
   → Esto es aceptable en un builder CMS. Documentarlo como comportamiento conocido.

2. Mixed content (HTTP image en HTTPS page):
   Si el dueño del sitio pega una URL HTTP, el browser puede bloquearla.
   → Verificar en la documentación del renderer que next/image normaliza a HTTPS.
   → Si la URL es HTTP, next/image con 'unoptimized' puede fallar. Documentar.

3. Imágenes SVG potencialmente maliciosas:
   Las SVG pueden contener scripts. Con next/image, esto no es un problema
   porque next/image sirve las imágenes a través del proxy de Next.js, no inline.
   → Verificar que el renderer usa next/image (no <img> directo) en ProductGridBlock.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Documento de Auditoría
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear/actualizar docs/security-audit-sprint03.1.md con:
  - Resumen de los 4 nuevos bloques auditados
  - Hallazgos: severidad (crítica/alta/media/baja) + estado (mitigado/aceptado/pendiente)
  - Decisiones de seguridad tomadas con su justificación
  - Recomendaciones para sprint futuro (ej: honeypot en newsletter, CSP para imágenes)

RESTRICCIONES:
- La sanitizeUrl() es OBLIGATORIA en el renderer — no es opcional
- No degradar funcionalidad para añadir seguridad
- Al terminar: cd apps/api && pnpm build — sin errores TypeScript
```

---

## AGENTE 11 — QA Testing Engineer
**Abrir chat nuevo → "Actúa como QA Testing Engineer de EdithPress, lee docs/agents/11-qa-testing.md"**

```
Eres el QA Testing Engineer (Agente 11) de EdithPress.
Lee docs/agents/11-qa-testing.md para tu contexto completo.

ESTADO ACTUAL:
- ✅ Tests del Sprint 03 en verde (verificar con pnpm test antes de empezar)
- ❌ Tests para NewsletterModule — no existen
- ❌ Tests para los 4 nuevos bloques — no existen

NOTA: Esperar a que Agentes 07, 08 y 05 terminen antes de escribir los tests.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Tests Unitarios: NewsletterService
Prioridad: CRÍTICA (módulo nuevo con endpoint público)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/src/modules/newsletter/newsletter.service.ts (creado por Agente 05).

Crear apps/api/src/modules/newsletter/newsletter.service.spec.ts:

Casos a testear:
1. subscribe(siteId, email, source):
   - ✅ Email válido + siteId existente → crea NewsletterSubscriber, retorna { success: true }
   - ✅ Email ya suscrito → reactiva (isActive = true), no crea duplicado, retorna { success: true }
   - ✅ Email inválido (sin @) → lanza BadRequestException
   - ✅ siteId inexistente → lanza NotFoundException

2. getSubscribers(siteId, { page, limit, active }):
   - ✅ Retorna lista paginada con total
   - ✅ Filtro active=true solo retorna suscriptores activos

3. unsubscribe(siteId, email):
   - ✅ Marca isActive = false (soft delete)
   - ✅ Email no encontrado → no lanza error (idempotente)

Mock strategy:
- Mockear PrismaService con jest.fn() para findUnique, upsert, findMany, count
- No tocar la BD real en tests unitarios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Tests E2E: Newsletter Endpoint
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/api/test/sites.e2e-spec.ts para entender el patrón de tests e2e.

Crear apps/api/test/newsletter.e2e-spec.ts:

describe('Newsletter — /sites/:siteId/newsletter', () => {
  it('POST /subscribe con email válido → 201 { success: true }')
  it('POST /subscribe con email inválido → 400')
  it('POST /subscribe dos veces con el mismo email → 201 (idempotente, no duplicado)')
  it('GET /subscribers sin auth → 401')
  it('GET /subscribers con auth del owner → 200 + lista de suscriptores')
  it('GET /subscribers de otro tenant → 403')
})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Tests de Renderizado de Bloques (Snapshot/Visual)
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Para los 4 nuevos bloques del builder, crear tests básicos de renderizado:

Crear apps/builder/src/blocks/__tests__/NavbarBlock.test.tsx:
  - ✅ Renderiza con defaultProps sin errores
  - ✅ Renderiza logoText cuando logoImageUrl está vacío
  - ✅ Renderiza img cuando logoImageUrl está definido
  - ✅ Aplica position: sticky cuando sticky = true
  - ✅ Muestra ícono de búsqueda cuando showSearch = true
  - ✅ Oculta ícono de carrito cuando showCart = false

Crear apps/builder/src/blocks/__tests__/StatsBlock.test.tsx:
  - ✅ Renderiza con defaultProps sin errores
  - ✅ Renderiza el número correcto de StatItems
  - ✅ Aplica accentColor al valor numérico

Crear apps/builder/src/blocks/__tests__/NewsletterBlock.test.tsx:
  - ✅ Renderiza con defaultProps sin errores
  - ✅ Muestra el título y subtítulo configurados
  - ✅ El formulario tiene el placeholder correcto

Crear apps/builder/src/blocks/__tests__/ProductGridBlock.test.tsx:
  - ✅ Renderiza con defaultProps sin errores
  - ✅ Renderiza el número correcto de tarjetas de producto
  - ✅ No muestra artesano cuando showArtisan = false
  - ✅ Muestra artesano cuando showArtisan = true y artisan no está vacío

Setup para tests de React:
  Si no existe jest.config.js para el builder con soporte JSX/TSX, configurarlo.
  Instalar @testing-library/react si no está en apps/builder/package.json.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Regresión: Verificar Bloques Existentes
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Después de los cambios del sprint (nuevos bloques registrados en puck-config),
verificar que los 10 bloques existentes siguen funcionando:

1. Ejecutar: cd apps/api && pnpm test — todos los tests en verde
2. Ejecutar: cd apps/builder && pnpm build — sin errores TypeScript
3. Ejecutar: cd apps/renderer && pnpm build — sin errores TypeScript
4. Verificar manualmente (o con un test e2e) que una página que usa
   HeroBlock + TextBlock sigue renderizando en el renderer

Si algún test falla o algún build tiene errores: notificar al agente responsable.

RESTRICCIONES:
- Tests deterministas: usar beforeEach/afterEach para limpiar datos en e2e
- No llamar APIs externas reales en tests unitarios
- Objetivo de cobertura: newsletter.service.ts ≥ 80%
- Al terminar: cd apps/api && pnpm test — todos en verde
```

---

## Orden de Ejecución Recomendado

```
DÍA 1:
  → Agente 01 (PM)         — criterios de aceptación + tracking
  → Agente 02 (BA)         — historias de usuario + análisis de casos de uso
  → Agente 03 (Architect)  — schemas de los 4 bloques + docs/block-schemas.md
  → Agente 12 (UX)         — ProductCard, NewsletterForm, StatItem, CartBadge (paralelo con 03)

DÍA 1-2 (una vez 03 y 04 completen):
  → Agente 04 (DB)         — modelo NewsletterSubscriber + seed tienda-artesanal
  → Agente 07 (Builder)    — registrar NavbarBlock + crear ProductGrid/Stats/Newsletter blocks

DÍA 2-3 (una vez 07 y 05 completen):
  → Agente 05 (Backend)    — módulo newsletter (subscribe, list, export)
  → Agente 08 (Renderer)   — 4 bloques en renderer + NewsletterBlock funcional

DÍA 3-4:
  → Agente 06 (Admin)      — vista de suscriptores (opcional)
  → Agente 09 (DevOps)     — verificar build completo + variables de entorno

DÍA 4-5 (ÚLTIMO):
  → Agente 10 (Security)   — sanitizeUrl en navbar + auditoría newsletter
  → Agente 11 (QA)         — tests newsletter + tests de bloques + regresión
```
