# EdithPress — Block Schemas
**Versión**: v1.1 — Sprint 03.2  
**Fecha**: 2026-04-25

> Este documento es el contrato inmutable entre el builder y el renderer.  
> Los nombres de props NO deben cambiar en producción. Si cambian, requieren migración de datos.  
> Convención: camelCase para props, PascalCase para tipos de unión.

---

---

## HeroBlock
**Versión actual**: v1.1 (Sprint 03.2) — retro-compatible con v1.0

```typescript
interface HeroBlockProps {
  // Props v1.0 — NO cambiar nombres
  title: string
  subtitle: string
  backgroundColor: string
  backgroundImage: string
  textColor: string
  ctaText: string
  ctaUrl: string
  textAlign: 'left' | 'center' | 'right'
  paddingY: 'sm' | 'md' | 'lg' | 'xl'
  fontFamily: string
  titleFontSize: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  subtitleFontSize: 'sm' | 'md' | 'lg' | 'xl'
  // NUEVO Sprint 03.2 — props opcionales
  eyebrowText?: string               // Texto sobre el título en uppercase (default: '')
  cta2Text?: string                  // Texto del segundo botón CTA (default: '')
  cta2Url?: string                   // URL del segundo botón CTA (default: '#')
  cta2Variant?: 'solid' | 'outline' | 'ghost'  // Estilo del segundo CTA (default: 'outline')
  overlayColor?: string              // Color del overlay sobre imagen (default: '#000000')
  overlayOpacity?: number            // Opacidad del overlay 0–100 (default: 0 — CRÍTICO: 0 para no romper heroes existentes)
}
```

**DefaultProps:**
```typescript
{
  title: 'Bienvenido a mi negocio',
  subtitle: 'Ofrecemos los mejores servicios de la región',
  backgroundColor: '#1a1a2e',
  backgroundImage: '',
  textColor: '#ffffff',
  ctaText: 'Contáctanos',
  ctaUrl: '/contacto',
  textAlign: 'center',
  paddingY: 'lg',
  fontFamily: 'inherit',
  titleFontSize: 'lg',
  subtitleFontSize: 'lg',
  // NUEVO Sprint 03.2
  eyebrowText: '',
  cta2Text: '',
  cta2Url: '#',
  cta2Variant: 'outline',
  overlayColor: '#000000',
  overlayOpacity: 0,
}
```

**Notas:**
- `overlayOpacity: 0` es el default por diseño: heroes existentes sin `backgroundImage` no se ven afectados.
- El overlay solo se renderiza cuando `backgroundImage` está presente y `overlayOpacity > 0`.
- v1.1 es retro-compatible: todos los nuevos props son opcionales con defaults neutros.

---

## NavbarBlock

```typescript
interface NavbarBlockProps {
  logoText: string              // Nombre/texto del logo
  logoImageUrl: string          // URL de imagen del logo (vacío = usar texto)
  navLinks: Array<{
    label: string               // Texto del enlace
    url: string                 // URL (se sanitiza en renderer: bloquea javascript: y data:)
  }>
  backgroundColor: string       // Color de fondo del navbar
  textColor: string             // Color del texto y enlaces
  accentColor: string           // Color del logo, hover y badge de carrito
  sticky: boolean               // true = position: sticky top: 0
  showSearch: boolean           // Mostrar ícono de búsqueda
  showCart: boolean             // Mostrar ícono de carrito con badge
  layout: 'logo-left' | 'logo-center'
}
```

**DefaultProps:**
```typescript
{
  logoText: 'Mi Negocio',
  logoImageUrl: '',
  navLinks: [
    { label: 'Inicio', url: '/' },
    { label: 'Productos', url: '/productos' },
    { label: 'Nosotros', url: '/nosotros' },
    { label: 'Contacto', url: '/contacto' },
  ],
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  accentColor: '#b45309',
  sticky: true,
  showSearch: true,
  showCart: false,
  layout: 'logo-left',
}
```

**Notas:**
- Sub-menús: limitación conocida — no soportados en v1. Planificado para v2.
- Links externos (target="_blank"): limitación conocida en v1 — todos los links abren en la misma pestaña.
- Hamburger menu mobile: limitación conocida en v1 — planificado para v2.
- **Seguridad**: en el renderer, todos los `href` de navLinks pasan por `sanitizeUrl()` que bloquea `javascript:` y `data:` URIs.

---

## ProductGridBlock
**Versión actual**: v1.1 (Sprint 03.2) — retro-compatible con v1.0

```typescript
interface ProductGridBlockProps {
  title: string               // Título de la sección (vacío = sin título)
  subtitle: string            // Subtítulo opcional
  columns: 2 | 3 | 4         // Columnas en desktop (mobile: 1 col, tablet: 2 col)
  products: Array<{
    image: string             // URL de la imagen del producto
    imageAlt: string          // Texto alternativo de la imagen
    category: string          // Ej: "Mochilas", "Cerámica", "Joyería"
    name: string              // Nombre del producto
    description: string       // Descripción breve (~100 chars)
    price: string             // String para soportar cualquier moneda: "$85.000", "€29.99"
    artisan: string           // "María López" (vacío si no aplica)
    ctaText: string           // "Ver producto", "Comprar", "Saber más"
    ctaUrl: string            // URL de destino del botón
  }>
  backgroundColor: string
  textColor: string
  accentColor: string         // Color del precio y del botón CTA
  showCategory: boolean       // Mostrar/ocultar badge de categoría
  showArtisan: boolean        // Mostrar/ocultar nombre del artesano
  cardStyle: 'shadow' | 'border' | 'minimal'
  // NUEVO Sprint 03.2 — props opcionales
  eyebrowText?: string              // Texto sobre el título en uppercase (default: '')
  viewAllText?: string              // Texto del enlace "Ver todos" (default: '')
  viewAllUrl?: string               // URL del enlace "Ver todos" (default: '#')
  categoryPosition?: 'badge' | 'above-name'  // Posición de la categoría (default: 'badge')
  showCta?: boolean                 // Mostrar/ocultar botón CTA por producto (default: true)
}
```

**DefaultProps:**
```typescript
{
  title: 'Nuestros Productos',
  subtitle: '',
  columns: 3,
  products: [
    {
      image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+1',
      imageAlt: 'Producto 1',
      category: 'Mochilas',
      name: 'Mochila Wayuu Premium',
      description: 'Tejida a mano con hilos de colores vibrantes y diseños únicos.',
      price: '$85.000',
      artisan: 'María López',
      ctaText: 'Ver producto',
      ctaUrl: '#',
    },
    // ... 2 productos más
  ],
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  accentColor: '#b45309',
  showCategory: true,
  showArtisan: false,
  cardStyle: 'shadow',
  // NUEVO Sprint 03.2
  eyebrowText: '',
  viewAllText: '',
  viewAllUrl: '#',
  categoryPosition: 'badge',
  showCta: true,
}
```

**Notas:**
- `price` es string para soportar formatos de cualquier moneda y locale.
- En el renderer se usa `next/image` para las imágenes (mejor rendimiento).
- Responsive: 1 col en mobile, 2 en tablet, `columns` en desktop (via CSS Grid + media queries).
- v1.1 es retro-compatible: todos los nuevos props son opcionales con defaults que preservan comportamiento v1.0.

---

## StatsBlock

```typescript
interface StatsBlockProps {
  stats: Array<{
    value: string     // "50+", "200+", "15 años", "$1M+"
    label: string     // "Artesanos", "Productos", "Experiencia"
    icon: string      // Emoji o carácter especial (vacío = no mostrar): "🎨", "📦"
  }>
  backgroundColor: string
  textColor: string
  accentColor: string   // Color del valor numérico
  layout: 'row' | 'row-with-dividers'
  padding: 'sm' | 'md' | 'lg'
}
```

**DefaultProps:**
```typescript
{
  stats: [
    { value: '50+', label: 'Artesanos', icon: '🎨' },
    { value: '200+', label: 'Productos', icon: '📦' },
    { value: '15', label: 'Años de experiencia', icon: '⭐' },
    { value: '100%', label: 'Hecho a mano', icon: '✋' },
  ],
  backgroundColor: '#f8f4ef',
  textColor: '#1e293b',
  accentColor: '#b45309',
  layout: 'row-with-dividers',
  padding: 'md',
}
```

**Padding map:** `sm` = 24px, `md` = 48px, `lg` = 80px  
**Notas:** Bloque puramente visual sin interacción. `icon` es opcional (string vacío = no se renderiza).

---

## NewsletterBlock

```typescript
interface NewsletterBlockProps {
  title: string             // "¿Quieres estar al día?"
  subtitle: string          // "Suscríbete y recibe novedades, descuentos exclusivos"
  placeholder: string       // "tu@email.com"
  buttonText: string        // "Suscribirme"
  successMessage: string    // "¡Listo! Te avisaremos de las novedades."
  backgroundColor: string
  textColor: string
  accentColor: string       // Color del botón de suscripción
  layout: 'centered' | 'side-by-side'
  // El endpoint al que enviar es derivado del siteId (inyectado por el renderer,
  // NO es un prop configurable por el usuario en el builder)
}
```

**DefaultProps:**
```typescript
{
  title: 'Únete a nuestra comunidad',
  subtitle: 'Recibe noticias sobre nuevos productos y artesanos.',
  placeholder: 'tu@email.com',
  buttonText: 'Suscribirme',
  successMessage: '¡Gracias! Te contactaremos pronto.',
  backgroundColor: '#1e293b',
  textColor: '#ffffff',
  accentColor: '#b45309',
  layout: 'centered',
}
```

**Notas:**
- En el **builder**: bloque puramente visual (sin lógica de submit).
- En el **renderer**: `'use client'` component con estado `idle | loading | success | error`.
- El `siteId` es inyectado por `BlockRenderer` al renderizar, no es un campo del usuario.
- Endpoint: `POST /api/v1/sites/:siteId/newsletter/subscribe`
- El email se convierte a lowercase antes de enviarse.

---

## CategoryGridBlock
**Versión**: v1.0 — Sprint 03.2

```typescript
interface CategoryGridBlockProps {
  eyebrowText: string          // "NUESTRAS CATEGORÍAS"
  title: string                // "Explora por tipo de artesanía"
  columns: 2 | 3 | 4
  categories: Array<{
    image: string              // URL de la imagen (full-bleed con overlay)
    imageAlt: string
    name: string
    description: string
    url: string
  }>
  cardAspectRatio: 'square' | 'portrait' | 'landscape'
  overlayColor: string         // Color base del gradiente (default: "#000000")
  overlayOpacity: number       // 0–100 (default: 60)
  backgroundColor: string      // Fondo de la sección (default: "#f5f0e8")
  textColor: string            // (default: "#1a0f00")
  accentColor: string          // Color del eyebrow y título (default: "#7c3f00")
}
```

**DefaultProps:**
```typescript
{
  eyebrowText: 'NUESTRAS CATEGORÍAS',
  title: 'Explora por tipo de artesanía',
  columns: 4,
  categories: [
    { image: 'https://placehold.co/400x500/8B6914/ffffff?text=Mochilas', imageAlt: 'Mochilas artesanales', name: 'Mochilas', description: 'Tejidas a mano con hilos naturales', url: '#' },
    { image: 'https://placehold.co/400x500/8B6914/ffffff?text=Cerámica', imageAlt: 'Cerámica artesanal', name: 'Cerámica', description: 'Técnicas ancestrales del Vichada', url: '#' },
    { image: 'https://placehold.co/400x500/8B6914/ffffff?text=Joyería', imageAlt: 'Joyería artesanal', name: 'Joyería', description: 'Semillas y materiales naturales', url: '#' },
    { image: 'https://placehold.co/400x500/8B6914/ffffff?text=Textiles', imageAlt: 'Textiles artesanales', name: 'Textiles', description: 'Bordados y tejidos únicos', url: '#' },
  ],
  cardAspectRatio: 'portrait',
  overlayColor: '#000000',
  overlayOpacity: 60,
  backgroundColor: '#f5f0e8',
  textColor: '#1a0f00',
  accentColor: '#7c3f00',
}
```

**Notas:**
- El overlay se implementa como `linear-gradient(to top, overlayColor+opacity 0%, transparent 60%)` para legibilidad del texto.
- El texto (nombre + descripción) siempre es blanco (`#ffffff`) porque se renderiza sobre el overlay oscuro.
- `cardAspectRatio: 'portrait'` (4/5) es el default por ser el más adecuado para imágenes de categoría editorial.

---

## SplitContentBlock
**Versión**: v1.0 — Sprint 03.2

```typescript
interface SplitContentBlockProps {
  eyebrowText: string
  title: string
  body: string                 // Soporta \n para separar en párrafos
  imagePosition: 'left' | 'right'
  imageLayout: 'single' | 'collage'
  images: Array<{ src: string; alt: string }>
  stats: Array<{ value: string; label: string }>
  ctaText: string
  ctaUrl: string
  ctaVariant: 'solid' | 'outline' | 'ghost' | 'none'
  backgroundColor: string
  textColor: string
  accentColor: string
  gap: 'sm' | 'md' | 'lg'     // Espacio entre columna imagen y columna texto
}
```

**DefaultProps:**
```typescript
{
  eyebrowText: 'NUESTRA HISTORIA',
  title: 'Preservando la tradición, impulsando comunidades',
  body: 'Trabajamos de la mano con comunidades indígenas y artesanos locales.\nCada pieza que encuentras aquí es única, elaborada con técnicas ancestrales.',
  imagePosition: 'left',
  imageLayout: 'collage',
  images: [
    { src: 'https://placehold.co/400x400/8B6914/ffffff?text=Artesanos+1', alt: 'Artesanos trabajando' },
    { src: 'https://placehold.co/400x400/7c3f00/ffffff?text=Artesanos+2', alt: 'Artesanía tradicional' },
    { src: 'https://placehold.co/400x400/a0522d/ffffff?text=Artesanos+3', alt: 'Comunidad artesanal' },
  ],
  stats: [
    { value: '50+', label: 'Artesanos' },
    { value: '500+', label: 'Piezas únicas' },
    { value: '12', label: 'Comunidades' },
    { value: '100%', label: 'Hecho a mano' },
  ],
  ctaText: 'Conoce más sobre nosotros',
  ctaUrl: '#',
  ctaVariant: 'solid',
  backgroundColor: '#f5f0e8',
  textColor: '#1a0f00',
  accentColor: '#7c3f00',
  gap: 'md',
}
```

**Notas:**
- `imageLayout: 'collage'`: la primera imagen ocupa el ancho completo (16/9), las siguientes 2 forman una fila cuadrada (1/1).
- `imageLayout: 'single'`: solo se usa la primera imagen de `images[]`.
- `body` se divide en párrafos por `\n` — el renderer hace `split('\n').filter(Boolean)`.
- `gap` map: `sm` = 32px, `md` = 64px, `lg` = 96px.
- `ctaVariant: 'none'` no renderiza el botón.

---

## FooterBlock
**Versión**: v1.0 — Sprint 03.2

```typescript
type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin'

interface FooterBlockProps {
  logoText: string
  logoSubtext: string
  logoImageUrl: string         // URL de imagen de logo (vacío = usar logoText)
  tagline: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  socialLinks: Array<{ platform: SocialPlatform; url: string }>
  columns: Array<{
    heading: string
    links: Array<{ label: string; url: string }>
  }>
  copyright: string
  legalLinks: Array<{ label: string; url: string }>
  backgroundColor: string      // (default: "#1a0f00")
  textColor: string            // (default: "#f5f0e8")
  accentColor: string          // (default: "#c4622d")
  showNewsletter: boolean
  newsletterTitle: string
  newsletterSubtitle: string
  newsletterPlaceholder: string
  newsletterButtonText: string
  newsletterBackgroundColor: string  // (default: "#2d1a0a")
}
```

**DefaultProps:**
```typescript
{
  logoText: 'Mi Negocio',
  logoSubtext: '',
  logoImageUrl: '',
  tagline: 'Conectando productos únicos con el mundo.',
  contactEmail: 'contacto@minegocio.com',
  contactPhone: '',
  contactAddress: '',
  socialLinks: [
    { platform: 'instagram', url: '#' },
    { platform: 'facebook', url: '#' },
  ],
  columns: [
    { heading: 'TIENDA', links: [{ label: 'Todos los productos', url: '#' }, { label: 'Novedades', url: '#' }, { label: 'Ofertas', url: '#' }] },
    { heading: 'EMPRESA', links: [{ label: 'Sobre nosotros', url: '#' }, { label: 'Artesanos', url: '#' }, { label: 'Blog', url: '#' }] },
    { heading: 'AYUDA', links: [{ label: 'Preguntas frecuentes', url: '#' }, { label: 'Envíos y devoluciones', url: '#' }, { label: 'Contacto', url: '#' }] },
  ],
  copyright: '© 2024 Mi Negocio. Todos los derechos reservados.',
  legalLinks: [
    { label: 'Política de privacidad', url: '#' },
    { label: 'Términos y condiciones', url: '#' },
  ],
  backgroundColor: '#1a0f00',
  textColor: '#f5f0e8',
  accentColor: '#c4622d',
  showNewsletter: true,
  newsletterTitle: 'Únete a nuestra comunidad',
  newsletterSubtitle: 'Recibe noticias, historias de artesanos y ofertas exclusivas.',
  newsletterPlaceholder: 'Tu correo electrónico',
  newsletterButtonText: 'Suscribirse',
  newsletterBackgroundColor: '#2d1a0a',
}
```

**Notas:**
- En el **builder**: el formulario de newsletter está deshabilitado (`disabled`) — puramente visual.
- En el **renderer**: `'use client'` con lógica de submit idéntica a NewsletterBlock.
- Los íconos de redes sociales usan abreviaciones de texto (IG, FB, TW…) para no depender de librerías externas.
- El grid principal es `minmax(200px, 1fr) repeat(N, 1fr)` donde N = `columns.length`.
- `showNewsletter: false` oculta completamente la banda de newsletter (incluido su fondo).

---

## Compatibilidad y Migración

| Bloque | Introducido en | Versión actual | Props que NO cambian |
|--------|----------------|----------------|----------------------|
| HeroBlock | FASE 0 | v1.1 (Sprint 03.2) | title, subtitle, backgroundColor, backgroundImage, textColor, ctaText, ctaUrl, textAlign, paddingY, fontFamily, titleFontSize, subtitleFontSize |
| NavbarBlock | Sprint 03.1 | v1.0 | logoText, logoImageUrl, navLinks, backgroundColor, textColor, accentColor, sticky, showSearch, showCart, layout |
| ProductGridBlock | Sprint 03.1 | v1.1 (Sprint 03.2) | title, subtitle, columns, products, backgroundColor, textColor, accentColor, showCategory, showArtisan, cardStyle |
| StatsBlock | Sprint 03.1 | v1.0 | stats, backgroundColor, textColor, accentColor, layout, padding |
| NewsletterBlock | Sprint 03.1 | v1.0 | title, subtitle, placeholder, buttonText, successMessage, backgroundColor, textColor, accentColor, layout |
| CategoryGridBlock | Sprint 03.2 | v1.0 | eyebrowText, title, columns, categories, cardAspectRatio, overlayColor, overlayOpacity, backgroundColor, textColor, accentColor |
| SplitContentBlock | Sprint 03.2 | v1.0 | eyebrowText, title, body, imagePosition, imageLayout, images, stats, ctaText, ctaUrl, ctaVariant, backgroundColor, textColor, accentColor, gap |
| FooterBlock | Sprint 03.2 | v1.0 | logoText, logoSubtext, logoImageUrl, tagline, contactEmail, contactPhone, contactAddress, socialLinks, columns, copyright, legalLinks, backgroundColor, textColor, accentColor, showNewsletter, newsletterTitle, newsletterSubtitle, newsletterPlaceholder, newsletterButtonText, newsletterBackgroundColor |

> **IMPORTANTE**: Cambios a nombres de props de bloques ya en producción requieren una migración de datos en la tabla `Page.content` (JSON). Coordinar con el Database Engineer antes de cualquier cambio.
