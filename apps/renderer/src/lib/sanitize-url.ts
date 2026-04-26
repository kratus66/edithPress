/**
 * sanitizeUrl — Filtra URIs maliciosas que podrían ejecutar código en el navegador.
 *
 * Bloquea esquemas: javascript:, data:, vbscript:
 * Retorna '#' cuando la URL es vacía o peligrosa.
 */
export function sanitizeUrl(url: string): string {
  const safe = url?.trim() ?? '#'
  if (!safe) return '#'
  if (/^(javascript|data|vbscript):/i.test(safe)) return '#'
  return safe
}
