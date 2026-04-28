import React from 'react'
import type { Fields } from '@measured/puck'
import { makeCollapsibleRadio } from '@/lib/fieldHelpers'

export interface VideoBlockProps {
  videoUrl: string
  title: string
  aspectRatio: '16/9' | '4/3' | '1/1'
  autoplay: 'true' | 'false'
}

interface VideoInfo {
  platform: 'youtube' | 'vimeo' | null
  id: string | null
}

function extractVideoId(url: string): VideoInfo {
  if (!url) return { platform: null, id: null }

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (youtubeMatch) {
    return { platform: 'youtube', id: youtubeMatch[1] }
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return { platform: 'vimeo', id: vimeoMatch[1] }
  }

  return { platform: null, id: null }
}

const aspectRatioPaddingMap: Record<VideoBlockProps['aspectRatio'], string> = {
  '16/9': '56.25%',
  '4/3': '75%',
  '1/1': '100%',
}

export const videoBlockFields: Fields<VideoBlockProps> = {
  videoUrl: { type: 'text', label: 'URL del video (YouTube o Vimeo)' },
  title: { type: 'text', label: 'Título (opcional)' },
  aspectRatio: {
    type: 'select',
    label: 'Proporción',
    options: [
      { label: '16:9 (YouTube)', value: '16/9' },
      { label: '4:3', value: '4/3' },
      { label: '1:1', value: '1/1' },
    ],
  },
  autoplay: makeCollapsibleRadio('Autoplay (muted)', [
    { label: 'No', value: 'false' },
    { label: 'Sí', value: 'true' },
  ]) as Fields<VideoBlockProps>['autoplay'],
}

export const videoBlockDefaultProps: VideoBlockProps = {
  videoUrl: '',
  title: '',
  aspectRatio: '16/9',
  autoplay: 'false',
}

export function VideoBlock({ videoUrl, title, aspectRatio, autoplay }: VideoBlockProps) {
  const { platform, id } = extractVideoId(videoUrl)
  const paddingBottom = aspectRatioPaddingMap[aspectRatio]
  const isAutoplay = autoplay === 'true'

  function buildSrc(): string {
    if (!id || !platform) return ''
    if (platform === 'youtube') {
      return `https://www.youtube.com/embed/${id}?autoplay=${isAutoplay ? 1 : 0}&mute=${isAutoplay ? 1 : 0}&rel=0`
    }
    // vimeo
    return `https://player.vimeo.com/video/${id}?autoplay=${isAutoplay ? 1 : 0}&muted=${isAutoplay ? 1 : 0}`
  }

  return (
    <section style={{ padding: '32px 40px' }}>
      {title && (
        <h2
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '20px',
          }}
        >
          {title}
        </h2>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {!platform || !id ? (
          /* URL inválida o vacía */
          <div
            style={{
              position: 'relative',
              paddingBottom,
              backgroundColor: '#d1d5db',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                URL de video inválida
              </span>
            </div>
          </div>
        ) : (
          /* Video embed */
          <div
            style={{
              position: 'relative',
              paddingBottom,
              height: 0,
              overflow: 'hidden',
              borderRadius: '8px',
            }}
          >
            <iframe
              src={buildSrc()}
              title={title || `Video de ${platform}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
