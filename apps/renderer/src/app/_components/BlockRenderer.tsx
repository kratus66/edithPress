import { HeroBlock, type HeroBlockProps } from './blocks/HeroBlock'
import { TextBlock, type TextBlockProps } from './blocks/TextBlock'
import { ImageBlock, type ImageBlockProps } from './blocks/ImageBlock'
import { ButtonBlock, type ButtonBlockProps } from './blocks/ButtonBlock'
import { SeparatorBlock, type SeparatorBlockProps } from './blocks/SeparatorBlock'
import { GalleryBlock, type GalleryBlockProps } from './blocks/GalleryBlock'
import { ContactFormBlock, type ContactFormBlockProps } from './blocks/ContactFormBlock'
import { CardGridBlock, type CardGridBlockProps } from './blocks/CardGridBlock'
import { VideoBlock, type VideoBlockProps } from './blocks/VideoBlock'
import { PricingBlock, type PricingBlockProps } from './blocks/PricingBlock'

// ── Tipos ──────────────────────────────────────────────────────────────────────

/**
 * Block representa un elemento del array `content` almacenado en la BD.
 * Su estructura la define Puck en el builder:
 *   { type: string, props: object }
 *
 * El campo `id` lo añade Puck automáticamente a cada bloque.
 */
export type Block =
  | { type: 'HeroBlock'; props: HeroBlockProps }
  | { type: 'TextBlock'; props: TextBlockProps }
  | { type: 'ImageBlock'; props: ImageBlockProps }
  | { type: 'ButtonBlock'; props: ButtonBlockProps }
  | { type: 'SeparatorBlock'; props: SeparatorBlockProps }
  | { type: 'GalleryBlock'; props: GalleryBlockProps }
  | { type: 'ContactFormBlock'; props: ContactFormBlockProps }
  | { type: 'CardGridBlock'; props: CardGridBlockProps }
  | { type: 'VideoBlock'; props: VideoBlockProps }
  | { type: 'PricingBlock'; props: PricingBlockProps }

// ── Switch tipado tipo → componente ───────────────────────────────────────────

/**
 * renderBlock usa un discriminated union para que TypeScript verifique en
 * tiempo de compilación que cada type recibe exactamente sus props correctas.
 * No hay `any` ni casts inseguros.
 */
function renderBlock(block: Block, index: number): React.ReactNode {
  switch (block.type) {
    case 'HeroBlock':
      return <HeroBlock key={index} {...block.props} />

    case 'TextBlock':
      return <TextBlock key={index} {...block.props} />

    case 'ImageBlock':
      return <ImageBlock key={index} {...block.props} />

    case 'ButtonBlock':
      return <ButtonBlock key={index} {...block.props} />

    case 'SeparatorBlock':
      return <SeparatorBlock key={index} {...block.props} />

    case 'GalleryBlock':
      return <GalleryBlock key={index} {...block.props} />

    case 'ContactFormBlock':
      return <ContactFormBlock key={index} {...block.props} />

    case 'CardGridBlock':
      return <CardGridBlock key={index} {...block.props} />

    case 'VideoBlock':
      return <VideoBlock key={index} {...block.props} />

    case 'PricingBlock':
      return <PricingBlock key={index} {...block.props} />

    default: {
      // TypeScript debería prevenir esta rama con exhaustive check,
      // pero si la API devuelve un tipo desconocido lo manejamos sin explotar.
      const unknownBlock = block as { type: string }
      if (process.env.NODE_ENV === 'development') {
        return (
          <div
            key={index}
            style={{
              margin: '24px 40px',
              padding: '16px',
              border: '2px dashed #ef4444',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              fontSize: '0.875rem',
            }}
          >
            Bloque desconocido: <code>{unknownBlock.type}</code>
          </div>
        )
      }
      return null
    }
  }
}

// ── Componente principal ───────────────────────────────────────────────────────

interface BlockRendererProps {
  blocks: Block[]
}

/**
 * BlockRenderer — Traduce el JSON de bloques almacenado en la API → React.
 *
 * Es un Server Component: se ejecuta en el servidor para máximo SEO y
 * performance (sin JS extra en el cliente salvo ContactFormBlock).
 *
 * Uso:
 *   <BlockRenderer blocks={page.content} />
 */
export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks?.length) {
    return (
      <main
        style={{
          display: 'flex',
          minHeight: '60vh',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: '1rem',
        }}
      >
        <p>Esta página no tiene contenido publicado.</p>
      </main>
    )
  }

  return (
    <main>
      {blocks.map((block, index) => renderBlock(block, index))}
    </main>
  )
}
