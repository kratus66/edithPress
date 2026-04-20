/**
 * VideoBlock — Renderer (read-only)
 *
 * Props idénticas al builder (apps/builder/src/blocks/VideoBlock.tsx).
 * El builder es la fuente de verdad del schema.
 *
 * NOTA SEO/UX: autoplay está desactivado en el renderer incluso si el JSON
 * lo tiene en 'true'. El usuario decide cuándo reproducir el vídeo.
 * Activar autoplay en producción perjudicaría el LCP y causaría problemas
 * de accesibilidad (WCAG 2.1 § 1.4.2).
 */

export interface VideoBlockProps {
  videoUrl: string
  title?: string
  aspectRatio: '16/9' | '4/3' | '1/1'
  /** Ignorado en el renderer — ver NOTA SEO/UX arriba */
  autoplay?: 'true' | 'false'
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Extrae el ID de YouTube o Vimeo de una URL y devuelve la URL de embed.
 * Devuelve null si la URL no es reconocida.
 *
 * YouTube: https://www.youtube.com/watch?v=ID
 *          https://youtu.be/ID
 *          https://www.youtube.com/embed/ID
 * Vimeo:   https://vimeo.com/ID
 *          https://player.vimeo.com/video/ID
 */
function getEmbedUrl(rawUrl: string): string | null {
  if (!rawUrl) return null

  try {
    const url = new URL(rawUrl)

    // YouTube — ya embed
    if (url.hostname === 'www.youtube.com' && url.pathname.startsWith('/embed/')) {
      return rawUrl
    }

    // YouTube — watch?v=ID
    if (
      (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') &&
      url.pathname === '/watch'
    ) {
      const id = url.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    // YouTube — youtu.be/ID
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1)
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    // Vimeo — ya embed
    if (
      url.hostname === 'player.vimeo.com' &&
      url.pathname.startsWith('/video/')
    ) {
      return rawUrl
    }

    // Vimeo — vimeo.com/ID
    if (url.hostname === 'vimeo.com' || url.hostname === 'www.vimeo.com') {
      const id = url.pathname.slice(1)
      if (id) return `https://player.vimeo.com/video/${id}`
    }
  } catch {
    // URL malformada — devolver null
  }

  return null
}

// paddingBottom (% del ancho) para aspect-ratio como padding-top trick
const PADDING_MAP: Record<VideoBlockProps['aspectRatio'], string> = {
  '16/9': '56.25%',
  '4/3': '75%',
  '1/1': '100%',
}

// ── Componente ─────────────────────────────────────────────────────────────────

export function VideoBlock({
  videoUrl,
  title,
  aspectRatio = '16/9',
  // autoplay ignorado intencionadamente — ver NOTA arriba
}: VideoBlockProps) {
  const embedUrl = getEmbedUrl(videoUrl)
  const paddingBottom = PADDING_MAP[aspectRatio] ?? PADDING_MAP['16/9']

  if (!embedUrl) {
    // En dev mostramos el error; en producción silenciamos
    if (process.env.NODE_ENV === 'development') {
      return (
        <section className="px-6 py-8 max-w-4xl mx-auto">
          <div
            style={{
              padding: '16px',
              border: '2px dashed #ef4444',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              fontSize: '0.875rem',
            }}
          >
            VideoBlock: URL no reconocida — <code>{videoUrl}</code>
          </div>
        </section>
      )
    }
    return null
  }

  return (
    <section className="px-6 py-8 max-w-4xl mx-auto">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      )}
      {/* Contenedor responsive con el padding-top trick */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom,
          height: 0,
          overflow: 'hidden',
          borderRadius: '8px',
          backgroundColor: '#000',
        }}
      >
        <iframe
          src={embedUrl}
          title={title ?? 'Vídeo embebido'}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </div>
    </section>
  )
}
