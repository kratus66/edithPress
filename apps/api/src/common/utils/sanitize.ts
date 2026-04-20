/**
 * SEC-SPRINT02-01 — Sanitización XSS de contenido del builder
 *
 * Usa DOMPurify con jsdom para ejecutar sanitización HTML en el servidor.
 * Se aplica ANTES de persistir contenido de páginas en la base de datos.
 *
 * Política:
 * - campo `content` (TextBlock): permite tags HTML seguros (lista blanca)
 * - todos los demás campos string: texto plano (strip all tags)
 * - objetos y arrays: se recorren recursivamente
 * - valores no-string: se preservan sin cambios
 */
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const { window } = new JSDOM('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// DOMPurify v3 espera WindowLike; jsdom satisface la interfaz en runtime
// aunque los tipos no coincidan exactamente — cast explícito necesario.
const DOMPurify = createDOMPurify(window as any)

/**
 * Tags HTML permitidos en TextBlock.content.
 * No se permiten <script>, <iframe>, <object>, <embed>, ni event handlers.
 */
const ALLOWED_TAGS = ['p', 'br', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h2', 'h3']

/**
 * Sanitiza HTML con lista blanca de tags.
 * Úsalo para el campo `content` de TextBlock.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ['href', 'target', 'rel'] })
}

/**
 * Elimina todos los tags HTML y devuelve texto plano.
 * Úsalo para títulos, descripciones, labels y cualquier campo que no sea HTML.
 */
export function stripTags(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

/**
 * Recorre recursivamente el contenido de bloques del page builder y sanitiza
 * todos los campos string:
 * - key === 'content': sanitizeHtml (TextBlock HTML)
 * - otros strings: stripTags (texto plano)
 *
 * Los campos `type` (nombre del bloque), IDs y booleans no se modifican.
 */
export function sanitizeBlockContent(blocks: unknown): unknown {
  if (blocks === null || blocks === undefined) return blocks
  if (typeof blocks === 'boolean' || typeof blocks === 'number') return blocks

  if (typeof blocks === 'string') {
    // En el contexto raíz no debería haber un string suelto,
    // pero lo manejamos como texto plano por defecto.
    return stripTags(blocks)
  }

  if (Array.isArray(blocks)) {
    return blocks.map((item) => sanitizeBlockContent(item))
  }

  if (typeof blocks === 'object') {
    const obj = blocks as Record<string, unknown>
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // `content` es el campo HTML de TextBlock — se sanitiza con lista blanca
        // `type` es el nombre del bloque (ej. "TextBlock") — no tiene HTML, stripTags es seguro
        result[key] = key === 'content' ? sanitizeHtml(value) : stripTags(value)
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeBlockContent(value)
      } else {
        // boolean, number, null → preservar sin cambios
        result[key] = value
      }
    }

    return result
  }

  return blocks
}
