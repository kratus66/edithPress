# EdithPress — Prompts Sprint 03.2 (Bloques Avanzados: e-Commerce & Editorial)
**Generado**: 2026-04-25 | **PM**: Agente 01

> **Objetivo del sprint**: Completar la biblioteca de bloques para que EdithPress pueda
> replicar sitios tipo Artesanías del Vichada — e-commerce editorial con imagen de marca fuerte.
> Se crean 3 bloques nuevos y se mejoran 2 existentes, con foco en que **el usuario pueda
> editar cada detalle visual** desde el panel de Puck (colores, imágenes, overlay, tipografía).
>
> **Bloques nuevos (3):**
> 1. **CategoryGridBlock** — Cards de imagen con overlay de texto (categorías de producto)
> 2. **SplitContentBlock** — Layout 50/50: collage de imágenes | texto + stats + CTA
> 3. **FooterBlock** — Footer completo con logo, columnas de links, contacto, redes sociales
>
> **Mejoras a bloques existentes (2):**
> 4. **HeroBlock** (enhancement) — eyebrowText, segundo CTA con variante, overlayOpacity/Color
> 5. **ProductGridBlock** (enhancement) — eyebrowText, "Ver todo" link en header, categoría
>    como texto sobre el nombre, toggle del botón CTA por tarjeta
>
> **Estado al iniciar Sprint 03.2**:
> - ✅ Sprint 03.1 completado: NavbarBlock, ProductGridBlock, StatsBlock, NewsletterBlock
>   registrados en builder y renderer. 14 bloques en total en puck-config.tsx.
> - ✅ NewsletterSubscriber en DB, endpoint /newsletter/subscribe funcionando
> - ✅ Inline styles (NO Tailwind) en todos los bloques — patrón a continuar
> - ✅ ColorPickerField disponible en apps/builder/src/components/
> - ✅ MediaPicker disponible en apps/builder/src/components/
> - ❌ CategoryGridBlock — no existe
> - ❌ SplitContentBlock — no existe
> - ❌ FooterBlock — no existe
> - ⚠️ HeroBlock — falta eyebrowText, segundo CTA, overlayOpacity
> - ⚠️ ProductGridBlock — falta eyebrowText, viewAll link, categoryPosition
>
> **IMPORTANTE — Compatibilidad hacia atrás**:
> Al mejorar HeroBlock y ProductGridBlock, todos los props nuevos deben ser
> OPCIONALES con valores por defecto que no cambien el comportamiento actual.
> Los sitios ya publicados con estos bloques NO deben romperse.
>
> **Orden de ejecución**:
> ```
> CRÍTICO PRIMERO:
>   → Agente 03 (Architect)  — schemas de los 3 bloques nuevos + mejoras de los 2 existentes
>   → Agente 12 (UX)         — CategoryCard, SplitLayout, FooterColumn components (paralelo con 03)
>
> PARALELO (una vez 03 complete):
>   → Agente 07 (Builder)    — implementar 3 bloques nuevos + mejorar Hero y ProductGrid
>   → Agente 08 (Renderer)   — mismo trabajo para el renderer
>
> ÚLTIMO:
>   → Agente 10 (Security)   — XSS en footer links, overlay images, sanitizeUrl en CategoryGrid
>   → Agente 11 (QA)         — tests de los 5 bloques (3 nuevos + 2 mejorados)
>   → Agente 09 (DevOps)     — build completo del monorepo
> ```

---

## AGENTE 01 — Project Manager
**Abrir chat nuevo → "Actúa como Project Manager de EdithPress, lee docs/agents/01-project-manager.md"**

```
Eres el Project Manager (Agente 01) de EdithPress.
Lee docs/agents/01-project-manager.md para tu contexto completo.

CONTEXTO DEL SPRINT 03.2:
Continuación del Sprint 03.1. El objetivo es completar la biblioteca de bloques
con 3 bloques nuevos y mejorar 2 existentes, inspirados en el diseño de
"Artesanías del Vichada" — tienda de e-commerce con estética editorial.

El usuario quiere que CADA elemento del sitio sea editable desde el panel Puck:
colores, imágenes de fondo, opacidad del overlay, posición del texto, etc.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Criterios de Aceptación
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Definición de "done" para cada bloque:

CategoryGridBlock:
  ✅ Cards de categoría con imagen a full + texto overlay en la parte inferior
  ✅ El usuario puede configurar imagen, nombre, descripción y URL de cada categoría
  ✅ El usuario puede configurar color y opacidad del overlay
  ✅ El usuario puede elegir 2, 3 o 4 columnas
  ✅ Eyebrow text editable encima del título de sección

SplitContentBlock:
  ✅ Layout dos columnas: imágenes a la izquierda, texto a la derecha (o viceversa)
  ✅ Hasta 3 imágenes en layout collage con distintos tamaños
  ✅ Eyebrow text, título, 1-2 párrafos de cuerpo, CTA button
  ✅ Fila de stats inline (número + etiqueta) debajo del texto
  ✅ El usuario puede elegir imagen a la izquierda o derecha

FooterBlock:
  ✅ Columna izquierda: logo (texto o imagen), descripción, contacto, redes sociales
  ✅ Hasta 4 columnas de links con heading editable
  ✅ Barra inferior: texto de copyright + links legales
  ✅ Colores configurables: fondo oscuro por defecto

HeroBlock (enhancement):
  ✅ Campo eyebrowText: texto pequeño en caps sobre el título (ej: "HECHO A MANO EN COLOMBIA")
  ✅ Segundo botón CTA con variante (solid, outline, ghost)
  ✅ overlayOpacity y overlayColor para controlar el velo sobre la imagen de fondo
  ✅ Sitios existentes NO se rompen (props nuevos son opcionales con defaults)

ProductGridBlock (enhancement):
  ✅ Campo eyebrowText arriba del título de sección
  ✅ Header de sección: título a la izquierda, "Ver toda la colección" link a la derecha
  ✅ categoryPosition: 'badge' (badge sobre imagen) o 'above-name' (texto sobre el nombre)
  ✅ showCta: toggle para mostrar/ocultar el botón CTA en cada tarjeta
  ✅ Sitios existentes NO se rompen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Seguimiento de Dependencias Críticas
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dependencias clave:
1. Agente 03 define schemas ANTES de que Agente 07 y 08 empiecen a codificar
2. NO hay nuevos endpoints en la API para este sprint (FooterBlock es 100% front-end)
3. Las mejoras a HeroBlock y ProductGridBlock deben mantener retro-compatibilidad
   → Cualquier prop nuevo debe tener un defaultProps que reproduzca el comportamiento actual

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Registro al Cierre del Sprint
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Al cerrar el sprint, agregar al final de docs/prompts/sprint-03-prompts.md:

## Estado Sprint 03.2 — Bloques Avanzados
- [✅/❌] CategoryGridBlock — builder + renderer
- [✅/❌] SplitContentBlock — builder + renderer
- [✅/❌] FooterBlock — builder + renderer
- [✅/❌] HeroBlock enhanced — eyebrow + 2 CTAs + overlay
- [✅/❌] ProductGridBlock enhanced — eyebrow + viewAll + categoryPosition
- [✅/❌] Build completo sin errores TypeScript

RESTRICCIONES:
- Sitios publicados en Sprint 03.1 no deben romperse con las mejoras de este sprint
- No aprobar cierre del sprint si algún build falla
```

---

## AGENTE 02 — Business Analyst
**Abrir chat nuevo → "Actúa como Business Analyst de EdithPress, lee docs/agents/02-business-analyst.md"**

```
Eres el Business Analyst (Agente 02) de EdithPress.
Lee docs/agents/02-business-analyst.md para tu contexto completo.

CONTEXTO:
Sprint 03.2 agrega los bloques que faltaban para construir un site editorial de e-commerce
tipo "Artesanías del Vichada". El usuario quiere control total de cada detalle visual
desde el editor.

TAREAS DE ESTE SPRINT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Historias de Usuario
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CategoryGridBlock:
  Como dueño de una tienda online,
  quiero mostrar mis categorías de productos con imágenes impactantes,
  para que los visitantes puedan explorar mi catálogo de forma visual.
  Criterios:
  - Puedo subir una imagen para cada categoría
  - Puedo configurar el color y opacidad del overlay sobre las imágenes
  - Puedo decidir cuántas columnas mostrar
  - Puedo agregar un texto eyebrow encima del título de la sección

SplitContentBlock:
  Como dueño de una marca con historia,
  quiero una sección que combine imágenes de mis productos con texto sobre mi historia,
  para conectar emocionalmente con mis visitantes.
  Criterios:
  - Puedo subir hasta 3 imágenes en un collage
  - Puedo elegir si las imágenes van a la izquierda o derecha
  - Puedo agregar estadísticas clave de mi negocio en una fila
  - Puedo agregar un botón de llamada a la acción

FooterBlock:
  Como dueño de un sitio web,
  quiero un footer profesional al final de mi página,
  para que los visitantes puedan encontrar información de contacto y links importantes.
  Criterios:
  - Puedo configurar mi logo, descripción y datos de contacto
  - Puedo agregar hasta 4 columnas de links con sus headings
  - Puedo conectar mis redes sociales (Instagram, Facebook, Twitter, YouTube, TikTok)
  - Puedo personalizar el texto de copyright

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Tipos de Sitio Ahora Cubiertos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actualizar docs/block-catalog.md con el estado post-sprint 03.2:

Al finalizar sprint 03.2, los tipos de sitio completamente cubiertos son:
- ✅ Tienda online artesanal / editorial (caso Vichada: Navbar + Hero enhanced +
     CategoryGrid + ProductGrid enhanced + SplitContent + Stats + Newsletter + Footer)
- ✅ Agencia creativa (Navbar + Hero + Gallery + SplitContent + Stats + Footer)
- ✅ ONG / causa social (Navbar + Hero + SplitContent + Stats + Newsletter + Footer)
- ✅ Restaurante/gastronomía (Navbar + Hero + CategoryGrid + SplitContent + ContactForm + Footer)
- ✅ Portfolio personal (Navbar + Hero + Gallery + SplitContent + Footer)
- ⚠️ Blog completo — falta bloque de listado de artículos (sprint futuro)
- ⚠️ E-commerce con carrito — falta lógica de carrito/checkout (sprint futuro)

RESTRICCIONES:
- No inventar requisitos más allá de lo descrito
- Coordinar con Agente 03 para que los schemas reflejen los criterios de aceptación
```

---

## AGENTE 03 — Software Architect
**Abrir chat nuevo → "Actúa como Software Architect de EdithPress, lee docs/agents/03-software-architect.md"**

```
Eres el Software Architect (Agente 03) de EdithPress.
Lee docs/agents/03-software-architect.md para tu contexto completo.

ANTES DE EMPEZAR — Lee estos archivos:
  - apps/builder/src/blocks/HeroBlock.tsx         (a mejorar — leer props actuales)
  - apps/builder/src/blocks/ProductGridBlock.tsx  (a mejorar — leer props actuales)
  - apps/builder/src/lib/puck-config.tsx          (ver cómo están registrados los bloques)
  - docs/block-schemas.md                         (schemas existentes — NO romper)

OBJETIVO: Definir los schemas TypeScript de los 3 bloques nuevos y las
extensiones retrocompatibles de los 2 bloques existentes.

REGLA DE ORO: Cualquier nuevo prop en bloques existentes (Hero, ProductGrid)
DEBE tener un valor por defecto en defaultProps que reproduzca exactamente
el comportamiento actual. Los datos del JSON de las páginas publicadas NO tienen
los nuevos campos — el componente debe funcionar aunque falten.

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Schema: CategoryGridBlock (NUEVO)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este bloque muestra categorías como cards de imagen a full con texto overlay.
Ejemplo visual: 4 cards en fila, cada una con imagen de fondo, y en la parte
inferior un gradiente oscuro con el nombre y descripción de la categoría.

interface CategoryGridBlockProps {
  eyebrowText: string          // "NUESTRAS CATEGORÍAS" — small caps, color acento
  title: string                // "Explora por tipo de artesanía"
  columns: 2 | 3 | 4          // columnas en desktop
  categories: Array<{
    image: string              // URL de la imagen de fondo de la card
    imageAlt: string
    name: string               // "Cestería" — texto grande sobre el overlay
    description: string        // "Canastos y contenedores tejidos" — texto pequeño
    url: string                // link al hacer clic en la card
  }>
  cardAspectRatio: 'square' | 'portrait' | 'landscape'
  overlayColor: string         // color del gradiente en la parte inferior de la card
                               // (por defecto: negro semitransparente)
  overlayOpacity: number       // 0-100 (por defecto: 60)
  backgroundColor: string      // fondo de la sección (por defecto: crema #f5f0e8)
  textColor: string            // color del eyebrow y título de sección
  accentColor: string          // color del eyebrow text
}

DefaultProps:
  eyebrowText: "NUESTRAS CATEGORÍAS"
  title: "Explora por tipo de artesanía"
  columns: 4
  categories: [
    { image: "https://placehold.co/400x500/8B6914/ffffff?text=Categor%C3%ADa+1",
      imageAlt: "Categoría", name: "Cestería",
      description: "Canastos y contenedores tejidos", url: "#" },
    { image: "https://placehold.co/400x500/8B6914/ffffff?text=Categor%C3%ADa+2",
      imageAlt: "Categoría", name: "Tejidos",
      description: "Hamacas, mochilas y chinchorros", url: "#" },
    { image: "https://placehold.co/400x500/8B6914/ffffff?text=Categor%C3%ADa+3",
      imageAlt: "Categoría", name: "Tallas",
      description: "Esculturas y figuras en madera", url: "#" },
    { image: "https://placehold.co/400x500/8B6914/ffffff?text=Categor%C3%ADa+4",
      imageAlt: "Categoría", name: "Joyería",
      description: "Collares, pulseras y accesorios", url: "#" },
  ]
  cardAspectRatio: "portrait"
  overlayColor: "#000000"
  overlayOpacity: 60
  backgroundColor: "#f5f0e8"
  textColor: "#1a0f00"
  accentColor: "#7c3f00"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Schema: SplitContentBlock (NUEVO)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bloque de layout dos columnas: imágenes (collage o una sola) + texto con stats.
Ejemplo: "Preservando la tradición" — 3 imágenes apiladas a la izquierda,
texto con título, párrafos, estadísticas y CTA a la derecha.

interface SplitContentBlockProps {
  eyebrowText: string          // "NUESTRA HISTORIA" — small caps
  title: string                // Título principal de la sección
  body: string                 // Texto del cuerpo. Soportar saltos de línea con \n
  imagePosition: 'left' | 'right'
  imageLayout: 'single' | 'collage'
  images: Array<{
    src: string
    alt: string
  }>                           // 1 imagen si imageLayout='single', hasta 3 si 'collage'
  stats: Array<{
    value: string              // "50+"
    label: string              // "Artesanos"
  }>                           // Stats inline bajo el texto (máx 4). Array vacío = sin stats
  ctaText: string              // Texto del botón CTA
  ctaUrl: string               // URL del botón CTA
  ctaVariant: 'solid' | 'outline' | 'ghost' | 'none'  // 'none' oculta el botón
  backgroundColor: string
  textColor: string
  accentColor: string          // color del eyebrow, stats values, CTA button
  gap: 'sm' | 'md' | 'lg'     // espacio entre columna imagen y columna texto
}

DefaultProps:
  eyebrowText: "NUESTRA HISTORIA"
  title: "Preservando la tradición, impulsando comunidades"
  body: "Trabajamos de la mano con comunidades indígenas y artesanos locales.\nCada pieza que encuentras aquí es única, elaborada con técnicas ancestrales."
  imagePosition: "left"
  imageLayout: "collage"
  images: [
    { src: "https://placehold.co/400x400/c4a882/ffffff?text=Imagen+1", alt: "Imagen 1" },
    { src: "https://placehold.co/400x400/8B6914/ffffff?text=Imagen+2", alt: "Imagen 2" },
    { src: "https://placehold.co/400x400/5c4a2a/ffffff?text=Imagen+3", alt: "Imagen 3" },
  ]
  stats: [
    { value: "50+", label: "Artesanos" },
    { value: "500+", label: "Piezas únicas" },
    { value: "12", label: "Comunidades" },
    { value: "100%", label: "Hecho a mano" },
  ]
  ctaText: "Conoce más sobre nosotros"
  ctaUrl: "#"
  ctaVariant: "solid"
  backgroundColor: "#f5f0e8"
  textColor: "#1a0f00"
  accentColor: "#7c3f00"
  gap: "md"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Schema: FooterBlock (NUEVO)
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Footer completo con logo, contacto, redes sociales, columnas de links y barra inferior.

type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin'

interface FooterBlockProps {
  logoText: string             // nombre de la empresa (dos líneas: bold + small)
  logoSubtext: string          // subtítulo del logo (ej: "DEL VICHADA")
  logoImageUrl: string         // URL de imagen de logo (si vacío, usar texto)
  tagline: string              // descripción breve de la empresa
  contactEmail: string
  contactPhone: string
  contactAddress: string
  socialLinks: Array<{
    platform: SocialPlatform
    url: string
  }>
  columns: Array<{
    heading: string            // "TIENDA", "EMPRESA", "AYUDA"
    links: Array<{
      label: string
      url: string
    }>
  }>                           // máx 4 columnas
  copyright: string            // "© 2024 Mi Empresa. Todos los derechos reservados."
  legalLinks: Array<{
    label: string
    url: string
  }>                           // "Política de privacidad", "Términos y condiciones"
  backgroundColor: string      // fondo del footer (default: #1a0f00 marrón oscuro)
  textColor: string            // color del texto (default: #f5f0e8 crema)
  accentColor: string          // color de headings de columnas y links hover
  showNewsletter: boolean      // si true, mostrar mini-sección newsletter encima del footer
  newsletterTitle: string
  newsletterSubtitle: string
  newsletterPlaceholder: string
  newsletterButtonText: string
  newsletterBackgroundColor: string  // fondo de la sección newsletter (puede diferir del footer)
}

DefaultProps:
  logoText: "Mi Negocio"
  logoSubtext: ""
  logoImageUrl: ""
  tagline: "Conectando productos únicos con el mundo."
  contactEmail: "contacto@minegocio.com"
  contactPhone: ""
  contactAddress: ""
  socialLinks: [
    { platform: "instagram", url: "#" },
    { platform: "facebook", url: "#" },
  ]
  columns: [
    { heading: "TIENDA", links: [
      { label: "Toda la colección", url: "#" },
      { label: "Nuevos productos", url: "#" },
      { label: "Ofertas", url: "#" },
    ]},
    { heading: "EMPRESA", links: [
      { label: "Nuestra historia", url: "#" },
      { label: "Blog", url: "#" },
    ]},
    { heading: "AYUDA", links: [
      { label: "Contacto", url: "#" },
      { label: "Envíos", url: "#" },
      { label: "Devoluciones", url: "#" },
    ]},
  ]
  copyright: "© 2024 Mi Negocio. Todos los derechos reservados."
  legalLinks: [
    { label: "Política de privacidad", url: "#" },
    { label: "Términos y condiciones", url: "#" },
  ]
  backgroundColor: "#1a0f00"
  textColor: "#f5f0e8"
  accentColor: "#c4622d"
  showNewsletter: true
  newsletterTitle: "Únete a nuestra comunidad"
  newsletterSubtitle: "Recibe noticias, historias de artesanos y ofertas exclusivas."
  newsletterPlaceholder: "Tu correo electrónico"
  newsletterButtonText: "Suscribirse"
  newsletterBackgroundColor: "#2d1a0a"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Schema: HeroBlock (ENHANCEMENT)
Prioridad: CRÍTICA — retro-compatible
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leer apps/builder/src/blocks/HeroBlock.tsx COMPLETO.

Props NUEVOS a agregar (todos opcionales con defaults que no cambian el comportamiento):

  eyebrowText?: string         // texto pequeño sobre el título (default: "")
                               // estilo: uppercase, letter-spacing amplio, color acento
                               // si vacío, no renderizar nada
  cta2Text?: string            // texto del segundo botón (default: "")
                               // si vacío, no renderizar el segundo botón
  cta2Url?: string             // URL del segundo botón (default: "#")
  cta2Variant?: 'solid' | 'outline' | 'ghost'  // (default: 'outline')
  overlayColor?: string        // color del velo sobre la imagen de fondo (default: "#000000")
  overlayOpacity?: number      // 0-100 (default: 0 = sin overlay — retro-compatible)

Importante: overlayOpacity default es 0 para que los heroes existentes (que NO tienen
overlay configurado) no cambien. El usuario elige activarlo subiendo el número.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Schema: ProductGridBlock (ENHANCEMENT)
Prioridad: ALTA — retro-compatible
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leer apps/builder/src/blocks/ProductGridBlock.tsx COMPLETO.

Props NUEVOS a agregar (todos opcionales con defaults retro-compatibles):

  eyebrowText?: string         // texto small-caps encima del título (default: "")
  viewAllText?: string         // texto del link "Ver toda la colección" (default: "")
                               // si vacío, no mostrar el link
  viewAllUrl?: string          // URL del link ver todo (default: "#")
  categoryPosition?: 'badge' | 'above-name'
                               // 'badge' = badge sobre la imagen (comportamiento actual)
                               // 'above-name' = texto small-caps encima del nombre de producto
                               // (default: 'badge' — retro-compatible)
  showCta?: boolean            // mostrar/ocultar el botón CTA en cada tarjeta
                               // (default: true — retro-compatible)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 6 — Actualizar docs/block-schemas.md
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actualizar docs/block-schemas.md con:
  - Schemas completos de los 3 bloques nuevos (versión 1.0)
  - Schemas actualizados de HeroBlock y ProductGridBlock (versión 1.1)
  - Marcar los props nuevos con // NUEVO en Sprint 03.2 para trazabilidad

RESTRICCIONES:
- NO cambiar nombres de props existentes en HeroBlock ni ProductGridBlock
- Los 3 nuevos bloques van en puck-config.tsx al FINAL de la lista de components
  (después de SeparatorBlock) — el orden visual es: CategoryGrid, SplitContent, Footer
- TypeScript strict: todas las propiedades del array (categories, columns, stats, etc.)
  deben tener tipos explícitos
```

---

## AGENTE 07 — Frontend Builder
**Abrir chat nuevo → "Actúa como Frontend Builder Developer de EdithPress, lee docs/agents/07-frontend-builder.md"**

```
Eres el Frontend Builder Developer (Agente 07) de EdithPress.
Lee docs/agents/07-frontend-builder.md para tu contexto completo.

ANTES DE EMPEZAR — Lee estos archivos:
  - apps/builder/src/blocks/HeroBlock.tsx         (a mejorar)
  - apps/builder/src/blocks/ProductGridBlock.tsx  (a mejorar)
  - apps/builder/src/lib/puck-config.tsx          (registrar bloques nuevos)
  - docs/block-schemas.md                         (schemas definidos por Agente 03)

PATRÓN OBLIGATORIO: Todos los bloques usan INLINE STYLES (no Tailwind, no CSS modules).
Referencia: ver cómo está implementado NavbarBlock.tsx.

REGLA DE ORO: Cualquier prop nuevo en HeroBlock y ProductGridBlock debe ser opcional
con valores por defecto que reproduzcan el comportamiento actual. Usar optional chaining
y nullish coalescing: `props.overlayOpacity ?? 0`, `props.eyebrowText || ''`.

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Crear CategoryGridBlock
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/CategoryGridBlock.tsx

Props: ver schema en docs/block-schemas.md (Agente 03)

Implementación del componente:

Sección principal:
- backgroundColor de la sección
- paddingY: 80px arriba y abajo
- maxWidth 1200px, centrado

Header de sección:
- eyebrowText: si no está vacío, mostrar encima del título
  Estilo: font-size 0.75rem, text-transform: uppercase, letter-spacing: 0.15em,
  color: accentColor, font-weight: 600, marginBottom: 12
- title: font-size clamp(1.75rem, 3vw, 2.5rem), font-weight: 700, color: textColor
  text-align: center, marginBottom: 40

Grid de categorías:
- display: grid, gridTemplateColumns: repeat(columns, 1fr), gap: 16px

Cada CategoryCard:
- Position relative, overflow: hidden, border-radius: 12px, cursor: pointer
- aspect-ratio según cardAspectRatio:
    square: '1/1', portrait: '3/4', landscape: '4/3'
- Imagen de fondo: position absolute, inset: 0, width: 100%, height: 100%,
  object-fit: cover, display: block
  (usar <img> — en el builder no usamos next/image)
- Overlay: position absolute, bottom: 0, left: 0, right: 0,
  background: `linear-gradient(to top, ${overlayColor}${Math.round(overlayOpacity * 2.55).toString(16).padStart(2,'0')} 0%, transparent 60%)`
  height: 60% (el gradiente cubre la mitad inferior)
- Texto superpuesto: position absolute, bottom: 0, left: 0, right: 0,
  padding: 20px 16px
  - name: font-size: 1.1rem, font-weight: 600, color: #fff, marginBottom: 4,
    text-shadow: 0 1px 3px rgba(0,0,0,0.5)
  - description: font-size: 0.8rem, color: rgba(255,255,255,0.85),
    text-shadow: 0 1px 3px rgba(0,0,0,0.4)
- Hover effect en la card completa (en el builder solo visual):
  transform: scale(1.02) en transition 0.3s ease
  Aplicar onMouseEnter/onMouseLeave en el wrapper <a>

Wrap cada card en <a href={category.url} style={{ textDecoration: 'none', display: 'block' }}>

Exportar: CategoryGridBlock, categoryGridBlockFields, categoryGridBlockDefaultProps

En puck-config.tsx:
- backgroundColor, textColor, accentColor, overlayColor: usar colorField()
- overlayOpacity: { type: 'number', label: 'Opacidad del overlay (0-100)' }
- categories[*].image: usar MediaPicker como custom field
- Registrar DESPUÉS de ProductGridBlock en la lista

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Crear SplitContentBlock
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/SplitContentBlock.tsx

Props: ver schema en docs/block-schemas.md

Implementación:

Layout principal:
- maxWidth 1200px, margin 0 auto, padding 80px 24px
- display: flex, flexDirection según imagePosition:
    imagePosition = 'left'  → row
    imagePosition = 'right' → row-reverse
- gap según prop gap: sm=32px, md=64px, lg=96px
- alignItems: center
- flexWrap: wrap (para mobile)

Columna de imágenes (flex: 1, minWidth: 280px):
- Si imageLayout = 'single': mostrar solo images[0], border-radius: 16px, overflow: hidden
- Si imageLayout = 'collage': layout de 3 imágenes estilo editorial
  Estructura CSS Grid:
    grid-template-columns: 1fr 1fr
    grid-template-rows: auto auto
    gap: 12px
  Imagen 0: grid-column: 1 / span 1, grid-row: 1 / span 1 (grande, parte superior izquierda)
  Imagen 1: grid-column: 2 / span 1, grid-row: 1 / span 1 (superior derecha, más pequeña)
  Imagen 2: grid-column: 1 / span 1, grid-row: 2 / span 1 (inferior izquierda, cuadrada)
  Cada imagen: width: 100%, height: 100%, object-fit: cover, border-radius: 12px
  Imagen 0 tiene height: 280px, imágenes 1 y 2 tienen height: 180px

Columna de texto (flex: 1, minWidth: 280px):
- eyebrowText: uppercase, letter-spacing: 0.15em, font-size: 0.75rem,
  color: accentColor, font-weight: 600, marginBottom: 12
  (no renderizar si vacío)
- title: font-size: clamp(1.75rem, 3vw, 2.5rem), font-weight: 700,
  color: textColor, lineHeight: 1.2, marginBottom: 20
- body: renderizar párrafos separando por '\n'
  Cada párrafo: font-size: 1rem, color: textColor, opacity: 0.8,
  lineHeight: 1.7, marginBottom: 12
- Stats row (si stats.length > 0): display flex, gap: 32px, flexWrap: wrap,
  marginTop: 24, marginBottom: 28
  Cada stat:
    value: font-size: 2rem, font-weight: 700, color: accentColor, display: block
    label: font-size: 0.85rem, color: textColor, opacity: 0.65, display: block
- CTA button (si ctaVariant !== 'none'):
  solid:   background accentColor, color #fff, border: none
  outline: background transparent, color accentColor, border: `2px solid ${accentColor}`
  ghost:   background transparent, color accentColor, border: none, underline on hover
  Padding: 12px 28px, border-radius: 8px, font-weight: 600, font-size: 1rem

Exportar: SplitContentBlock, splitContentBlockFields, splitContentBlockDefaultProps

En puck-config.tsx:
- backgroundColor, textColor, accentColor: usar colorField()
- images[*].src: usar MediaPicker como custom field
- ctaVariant: radio con opciones solid, outline, ghost, none
- imageLayout: radio con opciones single, collage
- imagePosition: radio con opciones left, right
- gap: radio con opciones sm (Pequeño), md (Mediano), lg (Grande)
- stats: array field con value (text) y label (text)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Crear FooterBlock
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/FooterBlock.tsx

Props: ver schema en docs/block-schemas.md

Implementación:

ICONOS DE REDES SOCIALES — implementar como SVG inline, sin dependencias externas:
  Instagram: path del logo de IG (círculo con cámara)
  Facebook: la "f" de Facebook en círculo
  Twitter/X: el pájaro o la X
  YouTube: el triángulo play en rectángulo redondeado
  TikTok: el logo de TikTok
  LinkedIn: "in" en cuadrado
  Para cada uno crear una función getSocialIcon(platform: SocialPlatform): JSX.Element
  Los iconos deben ser 20x20px y usar fill="currentColor"

SECCIÓN NEWSLETTER (si showNewsletter = true):
- Fondo: newsletterBackgroundColor
- Padding: 40px 24px
- Layout: display flex, align center, justify space-between, flexWrap wrap, gap: 32px
- Izquierda: newsletterTitle (h3, font-size: 1.5rem, color textColor)
             newsletterSubtitle (p, opacity 0.7, color textColor)
- Derecha: input de email + botón en fila
  El input es decorativo en el builder (readOnly)
  Input style: padding 12px 16px, border-radius 8px, background rgba(255,255,255,0.1),
               border: 1px solid rgba(255,255,255,0.2), color textColor, flex: 1
  Botón: background accentColor, color #fff, padding 12px 24px, border-radius 8px,
         font-weight 600, border: none

FOOTER PRINCIPAL:
- Fondo: backgroundColor
- Padding: 60px 24px 0
- Layout: display grid,
          gridTemplateColumns: '1fr repeat(columns.length, 1fr)'
          gap: 48px, maxWidth: 1200px, margin: 0 auto

Columna 1 (logo y contacto):
- Logo: si logoImageUrl → <img height="40" />, si no → texto con dos líneas:
    logoText (font-weight: 700, font-size: 1.2rem, color: accentColor)
    logoSubtext (font-size: 0.75rem, letter-spacing: 0.1em, color: textColor, opacity: 0.6)
- tagline: font-size: 0.9rem, color: textColor, opacity: 0.7, marginTop: 12, lineHeight: 1.5
- Contacto: renderizar SOLO si no están vacíos, cada uno con su ícono SVG:
    📧 email, 📞 teléfono, 📍 dirección
    font-size: 0.85rem, color: textColor, opacity: 0.7, marginTop: 8
    Íconos de email/teléfono/dirección como SVG inline 16x16
- Social links: display flex, gap: 8px, marginTop: 16px
    Cada ícono: 36x36px botón circular, background rgba(255,255,255,0.1),
    border-radius: 50%, display flex, align center, justify center
    color: textColor, hover: backgroundColor accentColor

Columnas de links (1 columna por cada item en columns[]):
- heading: font-size: 0.75rem, font-weight: 700, letter-spacing: 0.1em,
           color: accentColor, marginBottom: 16
- links: lista sin estilo de <a> tags
    font-size: 0.9rem, color: textColor, opacity: 0.7, textDecoration: none,
    display: block, marginBottom: 8
    hover: opacity: 1, color: accentColor

BARRA INFERIOR:
- borderTop: `1px solid rgba(255,255,255,0.1)`, marginTop: 48px, padding: 20px 0
- maxWidth: 1200px, margin: 0 auto, display flex, justify space-between,
  align center, flexWrap wrap, gap: 12px
- copyright: font-size: 0.8rem, color: textColor, opacity: 0.5
- legalLinks: display flex, gap: 16px
    Cada link: font-size: 0.8rem, color: textColor, opacity: 0.5, textDecoration: none
    hover: opacity 0.8

NOTA IMPORTANTE sobre el grid de columnas:
  El builder de Puck renderiza el footer en un contenedor de ancho fijo.
  El gridTemplateColumns debe adaptarse al número de columnas en props.columns:
  Si columns.length = 2 → '1fr 1fr 1fr'  (logo + 2 columnas)
  Si columns.length = 3 → '1fr 1fr 1fr 1fr'  (logo + 3 columnas)
  Si columns.length = 4 → '1fr 1fr 1fr 1fr 1fr'  (logo + 4 columnas)
  Usar: `1fr ${props.columns.map(() => '1fr').join(' ')}`

Exportar: FooterBlock, footerBlockFields, footerBlockDefaultProps

En puck-config.tsx:
- backgroundColor, textColor, accentColor, newsletterBackgroundColor: usar colorField()
- logoImageUrl: usar MediaPicker
- socialLinks: array con platform (select) y url (text)
- columns: array con heading (text) y links sub-array
- legalLinks: array con label (text) y url (text)
- showNewsletter: radio Sí/No

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Mejorar HeroBlock
Prioridad: ALTA — retro-compatible
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Editar apps/builder/src/blocks/HeroBlock.tsx

LEER EL ARCHIVO COMPLETO antes de editar.
NO eliminar ni renombrar ningún prop existente.

Agregar a la interface HeroBlockProps (al final, como props opcionales):
  eyebrowText?: string
  cta2Text?: string
  cta2Url?: string
  cta2Variant?: 'solid' | 'outline' | 'ghost'
  overlayColor?: string
  overlayOpacity?: number

Agregar a heroBlockDefaultProps:
  eyebrowText: ''
  cta2Text: ''
  cta2Url: '#'
  cta2Variant: 'outline'
  overlayColor: '#000000'
  overlayOpacity: 0

Agregar a heroBlockFields:
  eyebrowText: { type: 'text', label: 'Texto eyebrow (encima del título, en caps)' }
  cta2Text: { type: 'text', label: 'Texto del 2do botón (dejar vacío para ocultar)' }
  cta2Url: { type: 'text', label: 'URL del 2do botón' }
  cta2Variant: {
    type: 'radio', label: 'Estilo del 2do botón',
    options: [
      { label: 'Sólido', value: 'solid' },
      { label: 'Outline', value: 'outline' },
      { label: 'Ghost', value: 'ghost' },
    ],
  }
  overlayColor: colorField('Color del overlay')  (o usar type: 'text' si colorField no aplica)
  overlayOpacity: { type: 'number', label: 'Opacidad del overlay (0-100, 0=sin overlay)' }

Modificar la función HeroBlock para:
1. Agregar el overlay sobre la imagen de fondo (en bgStyle o como div superpuesto):
   Si overlayOpacity > 0 y backgroundImage está definido:
   <div style={{
     position: 'absolute', inset: 0,
     backgroundColor: overlayColor,
     opacity: (overlayOpacity ?? 0) / 100,
   }} />
   El contenido del hero debe estar encima del overlay (position: relative, zIndex: 1)

2. Renderizar eyebrowText antes del h1:
   Si (eyebrowText):
   <p style={{
     fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
     letterSpacing: '0.15em', color: accentColor ?? textColor,
     marginBottom: 12, opacity: 0.9,
   }}>
     {eyebrowText}
   </p>

   NOTA: el HeroBlock actual no tiene accentColor. Para el eyebrowText usar textColor
   con una opacidad diferente, o agregar prop accentColor (también opcional, default: textColor).
   Opcional: agregar eyebrowColor?: string con default igual a textColor.

3. Renderizar segundo CTA si cta2Text no está vacío:
   Crear función getCtaStyle(variant, textColor, backgroundColor):
     solid:   { background: textColor, color: backgroundColor, border: 'none' }
     outline: { background: 'transparent', color: textColor, border: `2px solid ${textColor}` }
     ghost:   { background: 'transparent', color: textColor, border: 'none', textDecoration: 'underline' }

   Renderizar ambos botones en un div flex con gap: 12px:
   <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap',
     justifyContent: textAlign === 'center' ? 'center' : 'flex-start' }}>
     {/* CTA 1 existente */}
     {ctaText && <a href={ctaUrl} style={...existing style...}>{ctaText}</a>}
     {/* CTA 2 nuevo */}
     {cta2Text && <a href={cta2Url ?? '#'} style={{
       ...buttonBaseStyle,
       ...getCtaStyle(cta2Variant ?? 'outline', textColor, backgroundColor),
     }}>{cta2Text}</a>}
   </div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Mejorar ProductGridBlock
Prioridad: ALTA — retro-compatible
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Editar apps/builder/src/blocks/ProductGridBlock.tsx

LEER EL ARCHIVO COMPLETO antes de editar.
NO eliminar ni renombrar ningún prop existente.

Agregar a la interface (al final, opcionales):
  eyebrowText?: string
  viewAllText?: string
  viewAllUrl?: string
  categoryPosition?: 'badge' | 'above-name'
  showCta?: boolean

Agregar a productGridBlockDefaultProps:
  eyebrowText: ''
  viewAllText: ''
  viewAllUrl: '#'
  categoryPosition: 'badge'  // mantiene comportamiento actual
  showCta: true               // mantiene comportamiento actual

Agregar a productGridBlockFields:
  eyebrowText: { type: 'text', label: 'Texto eyebrow (encima del título)' }
  viewAllText: { type: 'text', label: 'Texto del link "Ver todo" (dejar vacío para ocultar)' }
  viewAllUrl: { type: 'text', label: 'URL del link "Ver todo"' }
  categoryPosition: {
    type: 'radio', label: 'Posición de la categoría',
    options: [
      { label: 'Badge sobre imagen', value: 'badge' },
      { label: 'Texto sobre nombre', value: 'above-name' },
    ],
  }
  showCta: {
    type: 'radio', label: 'Mostrar botón en tarjetas',
    options: [
      { label: 'Sí', value: true as unknown as string },
      { label: 'No', value: false as unknown as string },
    ],
  }

Modificar la función ProductGridBlock para:

1. Renderizar eyebrowText encima del título:
   if (eyebrowText):
   <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
     letterSpacing: '0.15em', color: accentColor, textAlign: 'center', marginBottom: 8 }}>
     {eyebrowText}
   </p>

2. Header de sección: si viewAllText no está vacío, cambiar el título centrado a:
   Un div flex con justify-content: space-between, align-items: flex-end, marginBottom: 32:
   - Izquierda: eyebrowText (si existe) + title apilados
   - Derecha: link "Ver toda la colección" como <a> con estilo outline button pequeño
   Si viewAllText está vacío: mantener el comportamiento actual (título centrado)

3. Renderizar categoría según categoryPosition:
   Si categoryPosition === 'above-name' (y showCategory es true):
   - NO mostrar el badge sobre la imagen
   - Mostrar encima del product.name:
     <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
       letterSpacing: '0.08em', color: accentColor, margin: '0 0 4px' }}>
       {product.category}
     </p>
   Si categoryPosition === 'badge' (default): mantener comportamiento actual

4. Ocultar el CTA si showCta === false:
   Envolver la sección del botón CTA con: {(showCta ?? true) && (...)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 6 — Registrar Bloques en puck-config.tsx y Verificar Orden
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En apps/builder/src/lib/puck-config.tsx, agregar los 3 bloques nuevos:
  import { CategoryGridBlock, categoryGridBlockFields, categoryGridBlockDefaultProps } from '@/blocks/CategoryGridBlock'
  import { SplitContentBlock, splitContentBlockFields, splitContentBlockDefaultProps } from '@/blocks/SplitContentBlock'
  import { FooterBlock, footerBlockFields, footerBlockDefaultProps } from '@/blocks/FooterBlock'

Orden final en la lista de components (17 bloques total):
  1. NavbarBlock       — "Navbar / Menú"
  2. HeroBlock         — "Hero"
  3. TextBlock         — "Texto"
  4. ImageBlock        — "Imagen"
  5. ButtonBlock       — "Botón"
  6. ProductGridBlock  — "Grilla de Productos"
  7. CategoryGridBlock — "Grilla de Categorías"  ← NUEVO
  8. CardGridBlock     — "Grilla de Tarjetas"
  9. SplitContentBlock — "Contenido Dividido"    ← NUEVO
  10. GalleryBlock     — "Galería"
  11. StatsBlock       — "Estadísticas"
  12. VideoBlock       — "Video"
  13. PricingBlock     — "Precios"
  14. ContactFormBlock — "Formulario de contacto"
  15. NewsletterBlock  — "Suscripción / Newsletter"
  16. FooterBlock      — "Footer"               ← NUEVO
  17. SeparatorBlock   — "Separador"

RESTRICCIONES:
- Inline styles en todos los bloques — SIN Tailwind
- NO modificar props existentes de ningún bloque (solo agregar opcionales)
- Al terminar: cd apps/builder && pnpm build — verificar que NO hay errores TypeScript
- Si hay errores TypeScript, corregirlos antes de reportar como completado
```

---

## AGENTE 08 — Frontend Renderer
**Abrir chat nuevo → "Actúa como Frontend Renderer Developer de EdithPress, lee docs/agents/08-frontend-renderer.md"**

```
Eres el Frontend Renderer Developer (Agente 08) de EdithPress.
Lee docs/agents/08-frontend-renderer.md para tu contexto completo.

ANTES DE EMPEZAR — Lee estos archivos:
  - apps/builder/src/blocks/CategoryGridBlock.tsx  (creado por Agente 07)
  - apps/builder/src/blocks/SplitContentBlock.tsx  (creado por Agente 07)
  - apps/builder/src/blocks/FooterBlock.tsx         (creado por Agente 07)
  - apps/builder/src/blocks/HeroBlock.tsx           (mejorado por Agente 07)
  - apps/builder/src/blocks/ProductGridBlock.tsx    (mejorado por Agente 07)
  - La ubicación de los bloques actuales en el renderer (BlockRenderer)

NOTA: Esperar a que Agente 07 complete TODAS las tareas antes de comenzar.
Los props del renderer deben ser IDÉNTICOS a los del builder.

DIFERENCIAS CLAVE builder vs renderer:
- Usar next/image (con el wrapper apropiado) en lugar de <img> para imágenes de usuario
- Los <a href> de links de usuario deben pasar por sanitizeUrl() (función que filtra javascript: y data: URIs)
- El FooterBlock NO necesita lógica de newsletter funcional en el renderer:
  el mini-newsletter del footer es decorativo / se puede hacer funcional con un form simple
  apuntando al mismo endpoint del NewsletterBlock ya implementado

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — CategoryGridBlock en el Renderer
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear la versión del renderer de CategoryGridBlock.
Props IDÉNTICOS a los del builder.

Diferencias con el builder:
- Las imágenes de categorías usan next/image:
  <Image src={category.image} alt={category.imageAlt} fill style={{ objectFit: 'cover' }} />
  El contenedor debe tener position: 'relative' para que fill funcione.
- Los links <a href={category.url}> deben pasar por sanitizeUrl()
- El hover effect (transform: scale) se puede implementar con CSS module o inline
  usando onMouseEnter/onMouseLeave si el componente es 'use client', o simplemente omitirlo
  (la escala es una mejora visual no crítica para SEO)

Registrar CategoryGridBlock en el BlockRenderer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — SplitContentBlock en el Renderer
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear la versión del renderer de SplitContentBlock.
Props IDÉNTICOS.

Diferencias:
- Imágenes del collage con next/image:
  Para el collage, los contenedores de imagen deben tener width/height explícitos
  para que next/image pueda calcular las dimensiones. Usar el layout 'responsive'
  o especificar width y height en los props de next/image y usar objectFit: 'cover'.
- CTA button: <a href={sanitizeUrl(ctaUrl)}>
- body: renderizar párrafos con body.split('\n').map((line, i) => <p key={i}>{line}</p>)

Registrar SplitContentBlock en el BlockRenderer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — FooterBlock en el Renderer
Prioridad: CRÍTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear la versión del renderer de FooterBlock.
Props IDÉNTICOS.

Diferencias:
- Logo image con next/image si logoImageUrl está definido
- Todos los <a href> de links (navLinks, legalLinks, socialLinks) pasan por sanitizeUrl()
- El mini-newsletter del footer (si showNewsletter = true):
  Implementar como 'use client' con estado local para el submit.
  El endpoint es el mismo que el NewsletterBlock:
  POST ${NEXT_PUBLIC_API_URL}/api/v1/sites/${siteId}/newsletter/subscribe
  El siteId se inyecta desde el BlockRenderer (igual que en NewsletterBlock).
  Si el siteId no está disponible: deshabilitar el formulario silenciosamente.
  El footer completo puede ser Server Component excepto la parte del newsletter.
  Solución: crear un sub-componente FooterNewsletter que sea 'use client' y llamarlo
  desde el FooterBlock Server Component.

Registrar FooterBlock en el BlockRenderer con inyección de siteId.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Actualizar HeroBlock y ProductGridBlock en el Renderer
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee la versión actual de HeroBlock y ProductGridBlock en el renderer.
Actualizar para soportar los nuevos props opcionales:

HeroBlock:
- Agregar el div overlay (con overlayColor y overlayOpacity) entre la imagen y el contenido
- Agregar eyebrowText encima del h1 (si no vacío)
- Agregar el segundo botón CTA (si cta2Text no vacío), todos los <a href> con sanitizeUrl()
- El overlay no afecta el SEO (es puramente visual)

ProductGridBlock:
- Renderizar eyebrowText encima del título (si no vacío)
- Si viewAllText no vacío: header izquierda/derecha con link sanitizado
- categoryPosition === 'above-name': mover la categoría sobre el nombre, sin badge en imagen
- showCta === false: ocultar el botón CTA por tarjeta
- Usar next/image para las imágenes de productos

REGLA: Usar optional chaining en todos los props nuevos:
  props.overlayOpacity ?? 0, props.eyebrowText || '', props.showCta ?? true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Actualizar next.config.js
Prioridad: ALTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Los 3 nuevos bloques usan imágenes externas de cualquier URL.
Verificar que next.config.js del renderer ya tiene configurado:
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] }
Si no está: agregarlo.

RESTRICCIONES:
- NO usar Tailwind en el renderer (inline styles como en el builder)
- Props IDÉNTICOS entre builder y renderer — sin agregar props extra en el renderer
  (excepto siteId que se inyecta del BlockRenderer, no del usuario)
- Todos los <a href> que vienen de contenido del usuario → sanitizeUrl()
- Al terminar: cd apps/renderer && pnpm build — sin errores TypeScript
```

---

## AGENTE 03 — Software Architect (segunda pasada — validación)
**Abrir chat nuevo (después de que 07 y 08 terminen)**

```
Eres el Software Architect (Agente 03) de EdithPress.
Lee docs/agents/03-software-architect.md para tu contexto completo.

TAREA: Revisión de alineación builder ↔ renderer

Leer los archivos de cada bloque en AMBAS aplicaciones:
  - apps/builder/src/blocks/CategoryGridBlock.tsx
  - apps/builder/src/blocks/SplitContentBlock.tsx
  - apps/builder/src/blocks/FooterBlock.tsx
  - La versión del renderer de cada uno (buscar en apps/renderer/src/)

Verificar para CADA bloque:
  ✅ Los tipos/interfaces de props son IDÉNTICOS (mismo nombre, mismo tipo)
  ✅ Los defaultProps son IDÉNTICOS
  ✅ No hay props en el renderer que no existan en el builder (y viceversa)
     Excepción permitida: 'siteId' inyectado por el renderer en Footer y Newsletter

Si hay discrepancias: documentarlas en un comentario en este chat y notificar
a Agente 07 u 08 para corregir.

No es necesario crear archivos nuevos — solo reportar.
```

---

## AGENTE 10 — Security Engineer
**Abrir chat nuevo (después de que 07 y 08 terminen)**

```
Eres el Security Engineer (Agente 10) de EdithPress.
Lee docs/agents/10-security-engineer.md para tu contexto completo.

ESTADO: Sprint 03.1 completado con sanitizeUrl() en NavbarBlock del renderer.
Sprint 03.2 agrega CategoryGridBlock, SplitContentBlock y FooterBlock — todos con links configurados por el usuario (tenant) y cargados en el renderer por visitantes finales.

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Auditoría CategoryGridBlock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lee apps/renderer/src/.../CategoryGridBlock (buscar el archivo en el renderer).

Verificar:
1. Todos los <a href={category.url}> pasan por sanitizeUrl() (bloquea javascript:, data:)
2. Los imageAlt de las imágenes están correctamente escapados (React lo hace automáticamente)
3. name y description de las categorías — React escapa el JSX por defecto, OK

Si sanitizeUrl() no está aplicada: agregar la función y aplicarla.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Auditoría SplitContentBlock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ctaUrl: verificar que pasa por sanitizeUrl()
2. body: renderizado como texto plano (p tags), no como HTML — OK por defecto
   Verificar que NO se usa dangerouslySetInnerHTML en ningún campo de body/texto
3. Images srcs: solo se pasan a next/image — no hay riesgo de XSS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Auditoría FooterBlock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El footer tiene la mayor superficie de ataque porque tiene muchos links.

1. Todos los links de columns[].links[].url → sanitizeUrl()
2. Todos los links de legalLinks[].url → sanitizeUrl()
3. Todos los links de socialLinks[].url → sanitizeUrl()
4. contactEmail: se renderiza como texto, no como mailto link en v1 — OK
   Si se usa mailto:${contactEmail} → sanitizeUrl() o validación de email format
5. Mini-newsletter del footer:
   Si el footer tiene el formulario de newsletter integrado:
   - Verificar que la validación de email está presente antes del fetch
   - Verificar que el endpoint es NEXT_PUBLIC_API_URL (variable de entorno, no hardcodeado)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Auditoría HeroBlock y ProductGridBlock (nuevos props)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. HeroBlock: cta2Url → sanitizeUrl() en el renderer
2. HeroBlock: overlayOpacity — clampear el valor entre 0 y 100 en el renderer
   para prevenir valores extremos: Math.min(100, Math.max(0, overlayOpacity ?? 0))
3. ProductGridBlock: viewAllUrl → sanitizeUrl()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Actualizar Documento de Auditoría
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actualizar o crear docs/security-audit-sprint03.2.md:
  - Resumen de los 5 bloques auditados
  - Hallazgos por bloque: severidad + estado (mitigado/aceptado/pendiente)
  - Decisiones de seguridad tomadas
  - sanitizeUrl() confirmada en todos los bloques con links de usuario

RESTRICCIONES:
- sanitizeUrl() es OBLIGATORIA en TODOS los <a href> que vienen de contenido del usuario
- No degradar la UX para añadir seguridad
- Al terminar: cd apps/renderer && pnpm build
```

---

## AGENTE 11 — QA Testing Engineer
**Abrir chat nuevo (después de que 07, 08 y 10 terminen)**

```
Eres el QA Testing Engineer (Agente 11) de EdithPress.
Lee docs/agents/11-qa-testing.md para tu contexto completo.

ESTADO:
- ✅ Tests del Sprint 03.1 en verde (verificar con pnpm test antes de empezar)
- ✅ apps/builder/src/blocks/__tests__/ existe con tests de NavbarBlock, StatsBlock,
     NewsletterBlock, ProductGridBlock
- ❌ Tests para CategoryGridBlock — no existen
- ❌ Tests para SplitContentBlock — no existen
- ❌ Tests para FooterBlock — no existen
- ❌ Tests para mejoras de HeroBlock — no existen (o son insuficientes)

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Tests: CategoryGridBlock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/__tests__/CategoryGridBlock.test.tsx:

  ✅ Renderiza con defaultProps sin errores
  ✅ Renderiza el número correcto de category cards según props.categories.length
  ✅ Renderiza el eyebrowText cuando no está vacío
  ✅ NO renderiza el eyebrowText cuando está vacío
  ✅ Aplica el número de columnas correcto en el grid (verificar gridTemplateColumns)
  ✅ Cada card renderiza el name y description de la categoría

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Tests: SplitContentBlock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/__tests__/SplitContentBlock.test.tsx:

  ✅ Renderiza con defaultProps sin errores
  ✅ Renderiza el eyebrowText cuando no está vacío
  ✅ Renderiza el título y body
  ✅ Renderiza las stats cuando stats.length > 0
  ✅ NO renderiza stats section cuando stats es array vacío
  ✅ Renderiza el CTA button cuando ctaVariant !== 'none'
  ✅ NO renderiza el CTA button cuando ctaVariant === 'none'
  ✅ Las imágenes del collage se renderizan (imageLayout === 'collage')
  ✅ Solo renderiza images[0] cuando imageLayout === 'single'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Tests: FooterBlock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crear apps/builder/src/blocks/__tests__/FooterBlock.test.tsx:

  ✅ Renderiza con defaultProps sin errores
  ✅ Renderiza el logoText cuando logoImageUrl está vacío
  ✅ Renderiza el logo img cuando logoImageUrl está definido
  ✅ Renderiza el número correcto de columnas de links
  ✅ Renderiza la sección newsletter cuando showNewsletter = true
  ✅ NO renderiza la sección newsletter cuando showNewsletter = false
  ✅ Renderiza el copyright text
  ✅ Renderiza los legalLinks
  ✅ Renderiza los socialLinks con sus íconos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 4 — Tests: HeroBlock (nuevas funcionalidades)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buscar si ya existe un test para HeroBlock. Si existe: agregar casos.
Si no existe: crear apps/builder/src/blocks/__tests__/HeroBlock.test.tsx.

  ✅ Renderiza con defaultProps sin errores (retro-compatibilidad)
  ✅ NO renderiza eyebrowText cuando eyebrowText está vacío (default: '')
  ✅ Renderiza eyebrowText cuando se provee
  ✅ NO renderiza el segundo CTA cuando cta2Text está vacío (default: '')
  ✅ Renderiza el segundo CTA cuando cta2Text tiene valor
  ✅ overlayOpacity = 0 (default): el overlay div no se renderiza o tiene opacity 0
  ✅ overlayOpacity = 50: el overlay div se renderiza con opacity 0.5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 5 — Tests: ProductGridBlock (nuevas funcionalidades)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agregar casos al test existente de ProductGridBlock, o crear uno nuevo:

  ✅ showCta = true (default): botón CTA visible en cada tarjeta
  ✅ showCta = false: botón CTA NO visible
  ✅ categoryPosition = 'badge' (default): categoría como badge sobre imagen
  ✅ categoryPosition = 'above-name': categoría como texto sobre el nombre
  ✅ viewAllText no vacío: link "Ver todo" visible en el header
  ✅ viewAllText vacío (default): link "Ver todo" NO visible
  ✅ eyebrowText no vacío: texto eyebrow visible encima del título

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 6 — Regresión
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. cd apps/builder && pnpm test — todos en verde (incluyendo tests de Sprint 03.1)
2. cd apps/api && pnpm test — todos en verde (no debe haber regresión en el backend)
3. cd apps/builder && pnpm build — sin errores TypeScript
4. cd apps/renderer && pnpm build — sin errores TypeScript

RESTRICCIONES:
- No tocar tests existentes que estén en verde — solo agregar nuevos casos
- Usar @testing-library/react y vitest (ver vitest.config.ts del builder)
- Mocks de MediaPicker si es necesario para los tests del builder
- Al terminar: todos los tests en verde, reportar cobertura de cada bloque nuevo
```

---

## AGENTE 09 — DevOps Engineer
**Abrir chat nuevo (último — después de que todos terminen)**

```
Eres el DevOps Engineer (Agente 09) de EdithPress.
Lee docs/agents/09-devops-engineer.md para tu contexto completo.

CONTEXTO: Sprint 03.2 añade 3 bloques nuevos y mejora 2 existentes.
No hay cambios de infraestructura — solo verificar que el monorepo sigue buildando.

TAREAS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 1 — Build Completo del Monorepo
Prioridad: CRÍTICA (gate de merge)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ejecutar en orden:
  1. pnpm --filter @edithpress/database build (o prisma generate)
  2. pnpm --filter @edithpress/ui build
  3. pnpm --filter builder build
  4. pnpm --filter renderer build
  5. pnpm --filter api build
  6. pnpm --filter admin build

Si alguno falla: reportar el error exacto (primeras 50 líneas del stderr).
No intentar arreglar los errores — notificar al agente responsable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 2 — Verificar Variables de Entorno
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FooterBlock incluye un mini-newsletter que necesita NEXT_PUBLIC_API_URL.
Ya debería estar configurado desde Sprint 03.1 (NewsletterBlock).

Verificar que NEXT_PUBLIC_API_URL está en:
  - apps/renderer/.env.example
  - docker-compose.yml (variable del servicio renderer)
Si no: agregar en ambos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAREA 3 — Verificar que el seed sigue funcionando
Prioridad: MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd packages/database && pnpm prisma db seed
Verificar que el seed no falla con los nuevos bloques.
Si alguno de los templates del seed usa HeroBlock o ProductGridBlock y los nuevos
props opcionales rompen la validación de Zod o TypeScript: notificar a Agente 04.

RESTRICCIONES:
- No modificar infraestructura de producción
- Solo verificar y reportar — no deployar
```

---

## Orden de Ejecución Recomendado

```
DÍA 1:
  → Agente 01 (PM)         — criterios de aceptación + tracking del sprint
  → Agente 02 (BA)         — historias de usuario + actualizar block-catalog.md
  → Agente 03 (Architect)  — schemas de los 5 bloques (3 nuevos + 2 enhancements)
  → Agente 12 (UX)         — componentes UI si son necesarios (CategoryCard, SplitLayout)
                             NOTA: los bloques de este sprint son bastante autocontenidos,
                             verificar si se necesitan nuevos componentes en packages/ui

DÍA 1-2 (una vez 03 complete):
  → Agente 07 (Builder)    — 3 bloques nuevos + mejoras Hero y ProductGrid (paralelo con 08)
  → Agente 08 (Renderer)   — mismos bloques en el renderer (puede empezar en paralelo
                             con 07 si lee los schemas de Agente 03 directamente)

DÍA 2-3:
  → Agente 03 (Arch, 2da)  — validación de alineación builder ↔ renderer

DÍA 3:
  → Agente 10 (Security)   — auditoría de XSS en links de los 3 bloques nuevos
  → Agente 11 (QA)         — tests de los 5 bloques + regresión

DÍA 3-4 (ÚLTIMO):
  → Agente 09 (DevOps)     — build completo del monorepo + seed verification
```

---

## Referencia Rápida: Props nuevos por bloque

| Bloque | Props nuevos | Retro-compatible |
|---|---|---|
| `CategoryGridBlock` | `eyebrowText`, `columns`, `categories[]`, `cardAspectRatio`, `overlayColor`, `overlayOpacity` | N/A (bloque nuevo) |
| `SplitContentBlock` | `eyebrowText`, `title`, `body`, `imagePosition`, `imageLayout`, `images[]`, `stats[]`, `ctaText`, `ctaUrl`, `ctaVariant`, `gap` | N/A (bloque nuevo) |
| `FooterBlock` | `logoText`, `logoSubtext`, `columns[]`, `socialLinks[]`, `legalLinks[]`, `showNewsletter`, etc. | N/A (bloque nuevo) |
| `HeroBlock` ⚠️ | `eyebrowText?`, `cta2Text?`, `cta2Url?`, `cta2Variant?`, `overlayColor?`, `overlayOpacity?` | ✅ Todos opcionales, defaults neutros |
| `ProductGridBlock` ⚠️ | `eyebrowText?`, `viewAllText?`, `viewAllUrl?`, `categoryPosition?`, `showCta?` | ✅ Todos opcionales, defaults = comportamiento actual |
