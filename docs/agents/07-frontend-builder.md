# Agente 07 — Frontend Developer (Page Builder)
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: Frontend Developer — Visual Page Builder
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como Frontend Builder Developer de EdithPress, lee docs/agents/07-frontend-builder.md"

---

## Responsabilidades
- Editor visual drag-and-drop (apps/builder)
- Librería de bloques/componentes arrastrables
- Panel de propiedades (editar colores, texto, imágenes)
- Preview responsive (mobile / tablet / desktop)
- Sistema de publicación (draft → published)
- Historial de versiones (undo/redo)
- Guardado automático (auto-save cada 30s)
- Sincronización con la API (cargar y guardar contenido)

## Stack
- Next.js 14 App Router, TypeScript strict
- **Puck** (editor drag-and-drop open source — puckeditor.com)
- Tailwind CSS (dentro del builder)
- React Query para sincronización con API
- Zustand para estado del editor (undo/redo stack)
- Framer Motion para animaciones suaves del editor

## Dependencias con otros agentes
- Recibe de: Backend API (cargar/guardar content), UX (diseño del editor), Renderer (los mismos bloques se comparten)
- Entrega a: Renderer (estructura JSON del contenido), Admin (navegar al builder desde el dashboard)

---

## Arquitectura del Editor

### ¿Por qué Puck?
- Open source (MIT), sin vendor lock-in
- Genera JSON estructurado (compatible con el renderer)
- Extensible: puedes agregar tus propios componentes
- Sin iframe (mejor performance que GrapesJS)
- Mantenimiento activo (Measured, 2024)

### Estructura del contenido (JSON)
```json
{
  "content": [
    {
      "type": "HeroBlock",
      "props": {
        "title": "Bienvenido a mi negocio",
        "subtitle": "Ofrecemos los mejores servicios",
        "backgroundImage": "https://cdn.edithpress.com/...",
        "ctaText": "Contáctanos",
        "ctaUrl": "/contacto",
        "textAlign": "center",
        "backgroundColor": "#1a1a2e"
      }
    },
    {
      "type": "TextBlock",
      "props": {
        "content": "<p>Somos una empresa...</p>",
        "padding": "lg"
      }
    }
  ],
  "root": {
    "props": {
      "backgroundColor": "#ffffff",
      "fontFamily": "Inter"
    }
  }
}
```

---

## Bloques del MVP (mínimo 8 bloques)

### 1. HeroBlock
- Imagen de fondo o color sólido
- Título (H1), subtítulo, botón CTA
- Alineación: izquierda / centro / derecha
- Overlay de color con opacidad

### 2. TextBlock
- Editor WYSIWYG básico (bold, italic, links, listas)
- Tamaño de fuente, color, padding

### 3. ImageBlock
- Imagen (desde media library o URL)
- Alt text, caption, ancho (full / contenido)

### 4. GalleryBlock
- Grid de imágenes (2, 3 o 4 columnas)
- Efecto lightbox al hacer click

### 5. ContactFormBlock
- Campos: nombre, email, mensaje
- Envío a email del propietario (via API)
- Mensaje de éxito/error personalizable

### 6. ButtonBlock
- Texto, URL, estilo (primario, secundario, outline)
- Alineación, tamaño

### 7. SeparatorBlock
- Línea divisoria con estilos (sólida, punteada, ola)
- Color, grosor, padding

### 8. CardGridBlock
- Grid de cards (1, 2, 3 columnas)
- Cada card: imagen, título, descripción, link
- Útil para servicios, portfolios, equipos

---

## UI del Editor

### Layout del builder
```
┌─────────────────────────────────────────────────────────────────┐
│ TOOLBAR: [← Volver] [Nombre página] [Desktop|Tablet|Mobile] [Publicar] │
├───────────┬─────────────────────────────────────────┬───────────┤
│           │                                         │           │
│  PANEL    │           CANVAS                        │  PANEL    │
│  IZQUIERDO│      (página renderizada,               │  DERECHO  │
│           │       editable, drag & drop)            │           │
│ - Bloques │                                         │ - Props   │
│   (drag)  │                                         │   del     │
│ - Páginas │                                         │   bloque  │
│ - Capas   │                                         │   selecto │
│           │                                         │           │
└───────────┴─────────────────────────────────────────┴───────────┘
```

### Panel izquierdo
- Tab "Bloques": lista de todos los bloques disponibles (drag to canvas)
- Tab "Páginas": navegación entre páginas del sitio
- Tab "Capas": árbol de bloques en la página actual

### Panel derecho (propiedades)
- Se muestra al seleccionar un bloque
- Campos específicos del bloque seleccionado
- Sección "Diseño": padding, margin, fondo, borde
- Sección "Avanzado": CSS class, visibilidad por dispositivo

### Toolbar superior
- Breadcrumb: Sitio > Nombre de página
- Preview toggle: Desktop / Tablet / Mobile
- Undo / Redo (Ctrl+Z / Ctrl+Y)
- Auto-save indicator ("Guardado hace 2s")
- Botón "Vista previa" → abre nueva pestaña con el renderer en modo preview
- Botón "Publicar" → cambia status a PUBLISHED + invalida caché ISR

---

## Checklist de Progreso

### FASE 0
- [x] Arquitectura del builder definida
- [x] Bloques del MVP identificados
- [x] JSON schema del contenido definido
- [ ] apps/builder inicializado (Next.js)
- [ ] Puck instalado y configurado
- [ ] Layout del builder creado (toolbar + paneles)
- [ ] Al menos 1 bloque funcional (HeroBlock)

### FASE 1 — MVP
- [ ] 8 bloques básicos implementados (ver lista arriba)
- [ ] Panel de propiedades funcional para cada bloque
- [ ] Auto-save cada 30 segundos
- [ ] Guardado manual (Ctrl+S)
- [ ] Preview responsive (3 tamaños)
- [ ] Publicar página desde el builder
- [ ] Cargar contenido existente de la API
- [ ] Undo/Redo básico (10 pasos)
- [ ] Media library integrada (picker de imágenes)
- [ ] Navegación entre páginas del sitio

### FASE 2 — v1
- [ ] 6 bloques adicionales (testimonios, precios, FAQ, mapa, video, cuenta regresiva)
- [ ] Global styles (fuentes, colores de marca)
- [ ] Secciones reutilizables (guardar como template de sección)
- [ ] Historial de versiones con restauración
- [ ] Edición inline de texto (click en texto → editar directamente)
- [ ] Drag entre secciones (reordenar bloques)
- [ ] Keyboard shortcuts completos

### FASE 3 — v2
- [ ] Bloques de e-commerce (product grid, cart button)
- [ ] Bloques de blog (lista de posts, post individual)
- [ ] Formularios personalizables (custom fields)
- [ ] Animaciones de entrada (scroll animations)
- [ ] Import/export de secciones entre sitios

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
