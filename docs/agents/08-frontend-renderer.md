# Agente 08 — Frontend Developer (Site Renderer)
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: Frontend Developer — Public Site Renderer
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como Frontend Renderer Developer de EdithPress, lee docs/agents/08-frontend-renderer.md"

---

## Responsabilidades
- Renderizar sitios públicos de cada tenant (apps/renderer)
- Routing dinámico: por tenant (subdominio/dominio) y por página (slug)
- Soporte de custom domains (proxy headers de Nginx/Cloudflare)
- SEO completo (meta tags, OG, JSON-LD, sitemap.xml, robots.txt)
- Performance: Core Web Vitals (LCP < 2.5s, CLS < 0.1)
- Modo preview para el builder (sin caché, con draft content)
- Compartir los mismos componentes de bloques que el builder (read-only)

## Stack
- Next.js 14 App Router, TypeScript strict
- ISR (Incremental Static Regeneration) — revalidación en publicación
- Tailwind CSS (para estilos de los bloques)
- next/image (optimización automática de imágenes)
- next-sitemap (generación de sitemaps)

## Dependencias con otros agentes
- Recibe de: Backend API (contenido del site/pages), Builder (JSON schema de bloques), DevOps (configuración DNS/proxy)
- Entrega a: Usuario final (el sitio público), Builder (preview URL)

---

## Arquitectura de Routing

### Caso 1: Subdominio de EdithPress
- URL: `https://miempresa.edithpress.com/sobre-nosotros`
- Nginx extrae el subdominio → header `X-Tenant-Slug: miempresa`
- Next.js lee el header → fetch del tenant → render de la página

### Caso 2: Custom Domain
- URL: `https://miempresa.com/sobre-nosotros`
- Cloudflare/Nginx redirige al renderer → header `X-Tenant-Domain: miempresa.com`
- Next.js busca el Domain en DB → obtiene tenantId → render

### Estructura de rutas
```
apps/renderer/src/app/
├── layout.tsx                    # Root layout global
├── not-found.tsx                 # 404 global
│
├── _components/                  # Bloques de renderizado (read-only)
│   ├── blocks/
│   │   ├── HeroBlock.tsx
│   │   ├── TextBlock.tsx
│   │   ├── ImageBlock.tsx
│   │   ├── GalleryBlock.tsx
│   │   ├── ContactFormBlock.tsx
│   │   ├── ButtonBlock.tsx
│   │   ├── SeparatorBlock.tsx
│   │   └── CardGridBlock.tsx
│   └── BlockRenderer.tsx         # Switch: type → componente
│
├── [[...slug]]/                  # Catch-all para páginas del tenant
│   └── page.tsx
│
├── sitemap.ts                    # Generación dinámica de sitemap
├── robots.ts                     # robots.txt dinámico
└── api/
    ├── preview/
    │   └── route.ts              # Activa modo preview
    └── contact/
        └── route.ts              # Envío de formulario de contacto
```

### page.tsx — Lógica de renderizado
```typescript
// 1. Leer tenant desde header (X-Tenant-Slug o X-Tenant-Domain)
// 2. GET /api/v1/renderer/tenant/{slug} → info del sitio + nav
// 3. GET /api/v1/renderer/tenant/{slug}/page/{slug} → contenido de la página
// 4. Generar metadata (title, description, OG image)
// 5. Renderizar <BlockRenderer blocks={page.content} />
// 6. ISR: revalidate en publicación vía on-demand revalidation
```

---

## SEO — Implementación

### Metadata dinámica (Next.js generateMetadata)
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const page = await getPage(tenantSlug, params.slug)
  return {
    title: page.metaTitle || `${page.title} | ${site.name}`,
    description: page.metaDesc,
    openGraph: {
      title: page.metaTitle,
      description: page.metaDesc,
      images: [page.ogImage || site.defaultOgImage],
      url: `https://${tenantSlug}.edithpress.com/${page.slug}`,
    },
    alternates: {
      canonical: page.canonicalUrl,
    },
  }
}
```

### JSON-LD (Schema.org)
- `LocalBusiness` para sitios de negocios
- `WebPage` para páginas genéricas
- `ContactPage` para páginas de contacto

### Sitemap dinámico
- `/sitemap.xml` → lista todas las páginas publicadas del tenant
- Regenerado automáticamente cuando se publica una página

---

## Performance — Estrategia ISR

### Cuándo revalidar
- Al publicar una página → API llama `revalidatePath('/[slug]')` vía on-demand revalidation
- Al cambiar configuración del sitio → `revalidatePath('/')`
- TTL de respaldo: `revalidate: 3600` (1 hora máximo)

### Optimizaciones
- `next/image` para todas las imágenes (WebP automático, lazy load)
- Prefetch de páginas en la navegación del sitio
- Fonts locales (no Google Fonts externos)
- CSS crítico inline, resto diferido

### Core Web Vitals targets
- LCP (Largest Contentful Paint): < 2.5s
- FID / INP (Interaction to Next Paint): < 200ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Modo Preview

Cuando el builder quiere mostrar la preview:
1. Builder llama `GET /api/preview?secret={token}&siteId={id}&pageSlug={slug}`
2. Renderer activa Next.js Draft Mode (cookies)
3. Fetch del contenido en estado DRAFT (sin ISR)
4. URL: `https://renderer.localhost:3003/preview/{tenant}/{slug}`

---

## Componente BlockRenderer
```typescript
// El corazón del renderer — traduce JSON → React
const BLOCK_COMPONENTS = {
  HeroBlock,
  TextBlock,
  ImageBlock,
  GalleryBlock,
  ContactFormBlock,
  ButtonBlock,
  SeparatorBlock,
  CardGridBlock,
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <main>
      {blocks.map((block, i) => {
        const Component = BLOCK_COMPONENTS[block.type]
        if (!Component) return null
        return <Component key={i} {...block.props} />
      })}
    </main>
  )
}
```

---

## Checklist de Progreso

### FASE 0
- [x] Arquitectura del renderer definida
- [x] Estrategia ISR documentada
- [x] SEO strategy definida
- [ ] apps/renderer inicializado (Next.js)
- [ ] Middleware de extracción de tenant (slug/domain headers)
- [ ] BlockRenderer básico funcional
- [ ] Página 404 personalizada

### FASE 1 — MVP
- [ ] Routing dinámico por tenant + slug funcional
- [ ] 8 bloques básicos renderizando correctamente
- [ ] Metadata SEO dinámica (title, description, OG)
- [ ] ISR configurado con on-demand revalidation
- [ ] Modo preview funcional
- [ ] Nav de sitio (menú de navegación entre páginas)
- [ ] Formulario de contacto funcional
- [ ] robots.txt dinámico

### FASE 2 — v1
- [ ] Custom domains funcionando via proxy headers
- [ ] Sitemap.xml dinámico y completo
- [ ] JSON-LD / Schema.org
- [ ] Optimización de imágenes (next/image en todos los bloques)
- [ ] Core Web Vitals auditoría y fixes
- [ ] Fonts locales configurados

### FASE 3 — v2
- [ ] Bloques de e-commerce renderizados
- [ ] Blog renderer (lista de posts, post individual)
- [ ] Multi-idioma (i18n routing)
- [ ] PWA básico (manifest, service worker para offline)

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
