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
- [x] apps/builder inicializado (Next.js)
- [x] Puck instalado y configurado
- [x] Layout del builder creado (toolbar + paneles)
- [x] Al menos 1 bloque funcional (HeroBlock)

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

## Buenas Prácticas del Page Builder

### Arquitectura del editor
- **Separar el estado del editor de la persistencia**: Puck maneja el estado interno del canvas; la API maneja la persistencia. Nunca acoplarlos directamente.
- **El JSON del contenido es el contrato**: la estructura `{ type, props }` definida en el schema es inmutable una vez en producción. Cambios al schema requieren migración de datos.
- **Cada bloque es independiente**: un bloque no conoce a los demás. No hay comunicación directa entre bloques.
- Los bloques del builder y del renderer comparten el mismo contrato de `props` — si cambia uno, cambia el otro.

### Estado y sincronización
- **Auto-save con debounce**: no guardar en cada keystroke. Guardar 3 segundos después del último cambio (`useDebounce`).
- **Optimistic updates**: mostrar el cambio inmediatamente, revertir si la API falla.
- **Indicador visual de estado**: el usuario siempre sabe si hay cambios sin guardar ("Modificado"), guardando ("Guardando..."), o guardado ("Guardado hace 2s").
- El stack de undo/redo se mantiene en memoria (Zustand) — máximo 50 pasos para no consumir memoria.

### Performance del editor
- Los bloques usan `React.memo` para evitar re-renders innecesarios al editar otro bloque
- El canvas no usa `overflow: hidden` — puede causar problemas con elementos posicionados del builder
- Las imágenes en el canvas se sirven a resolución reducida (preview) — la resolución completa va al renderer
- `dynamic(() => import('./HeavyBlock'))` para bloques que cargan librerías pesadas (mapas, video)

### UX del editor — reglas obligatorias
- El usuario nunca pierde trabajo: guardar antes de cerrar/salir (`beforeunload` event)
- Confirmación antes de publicar si hay cambios sin guardar
- Feedback inmediato en toda acción: drag start, drop, property change, save, publish
- Estados de error claros: "No se pudo guardar. Reintentando..." con botón de reintento manual

---

## Tareas Asignadas — FASE 0 (Activa)

> Depende de: ARCH-01/02 (monorepo), packages/ui (Agente 12)

### Tarea BUILDER-01 — Inicializar apps/builder con Next.js
**Prioridad**: CRÍTICA
**Criterio de Done**: `pnpm dev` en `apps/builder` levanta en puerto 3002 sin errores
**Pasos**:
1. Verificar dependencias en `package.json`
2. Crear `apps/builder/next.config.js`
3. Crear `apps/builder/src/app/layout.tsx`
4. Crear `apps/builder/src/app/page.tsx` — placeholder "Builder Coming Soon"

### Tarea BUILDER-02 — Instalar y configurar Puck
**Prioridad**: CRÍTICA
**Criterio de Done**: Un canvas de Puck se renderiza en la pantalla con al menos 1 bloque de prueba
**Pasos**:
1. Instalar `@measured/puck`
2. Crear `apps/builder/src/lib/puck-config.ts` con la configuración inicial:
```typescript
import type { Config } from '@measured/puck'

// Registro de todos los bloques disponibles
export const puckConfig: Config = {
  components: {
    HeroBlock: {
      label: 'Hero',
      fields: {
        title: { type: 'text', label: 'Título' },
        subtitle: { type: 'text', label: 'Subtítulo' },
        backgroundColor: { type: 'text', label: 'Color de fondo' },
      },
      defaultProps: {
        title: 'Título de la página',
        subtitle: 'Subtítulo aquí',
        backgroundColor: '#1a1a2e',
      },
      render: ({ title, subtitle, backgroundColor }) => (
        <div style={{ backgroundColor, padding: '80px 40px', textAlign: 'center' }}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      ),
    },
    // ... más bloques se agregan aquí
  },
}
```

### Tarea BUILDER-03 — Crear layout del editor
**Prioridad**: ALTA
**Criterio de Done**: El layout con toolbar + panel izquierdo + canvas + panel derecho se ve en pantalla (aunque vacío)
**Archivo**: `apps/builder/src/app/builder/[siteId]/[pageId]/page.tsx`
**Referencia visual**: Ver wireframe ASCII en sección "UI del Editor" de este archivo

### Tarea BUILDER-04 — Implementar HeroBlock completo
**Prioridad**: ALTA
**Criterio de Done**: Se puede arrastrar el HeroBlock al canvas, editar sus propiedades desde el panel derecho, y el canvas actualiza en tiempo real
**Depende de**: BUILDER-02

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-04-14
**Completadas**: BUILDER-01, BUILDER-02, BUILDER-03, BUILDER-04
**Próxima tarea**: BUILDER-05 (FASE 1) — Completar los 8 bloques del MVP (GalleryBlock, ContactFormBlock, CardGridBlock)
