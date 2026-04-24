# EdithPress — Block Schemas
**Versión**: v1.0 — Sprint 03.1  
**Fecha**: 2026-04-24

> Este documento es el contrato inmutable entre el builder y el renderer.  
> Los nombres de props NO deben cambiar en producción. Si cambian, requieren migración de datos.  
> Convención: camelCase para props, PascalCase para tipos de unión.

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
}
```

**Notas:**
- `price` es string para soportar formatos de cualquier moneda y locale.
- En el renderer se usa `next/image` para las imágenes (mejor rendimiento).
- Responsive: 1 col en mobile, 2 en tablet, `columns` en desktop (via CSS Grid + media queries).

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

## Compatibilidad y Migración

| Bloque | Introducido en | Props que NO cambian |
|--------|----------------|----------------------|
| NavbarBlock | Sprint 03.1 | logoText, logoImageUrl, navLinks, backgroundColor, textColor, accentColor, sticky, showSearch, showCart, layout |
| ProductGridBlock | Sprint 03.1 | title, subtitle, columns, products, backgroundColor, textColor, accentColor, showCategory, showArtisan, cardStyle |
| StatsBlock | Sprint 03.1 | stats, backgroundColor, textColor, accentColor, layout, padding |
| NewsletterBlock | Sprint 03.1 | title, subtitle, placeholder, buttonText, successMessage, backgroundColor, textColor, accentColor, layout |

> **IMPORTANTE**: Cambios a nombres de props de bloques ya en producción requieren una migración de datos en la tabla `Page.content` (JSON). Coordinar con el Database Engineer antes de cualquier cambio.
