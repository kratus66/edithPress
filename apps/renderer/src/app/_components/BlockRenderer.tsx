import React from 'react'
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
import { NavbarBlock, type NavbarBlockProps } from './blocks/NavbarBlock'
import { ProductGridBlock, type ProductGridBlockProps } from './blocks/ProductGridBlock'
import { StatsBlock, type StatsBlockProps } from './blocks/StatsBlock'
import { NewsletterBlock, type NewsletterBlockProps } from './blocks/NewsletterBlock'

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
  | { type: 'NavbarBlock'; props: NavbarBlockProps }
  | { type: 'ProductGridBlock'; props: ProductGridBlockProps }
  | { type: 'StatsBlock'; props: StatsBlockProps }
  | { type: 'NewsletterBlock'; props: Omit<NewsletterBlockProps, 'siteId'> }

// ── Switch tipado tipo → componente ───────────────────────────────────────────

/**
 * renderBlock usa un discriminated union para que TypeScript verifique en
 * tiempo de compilación que cada type recibe exactamente sus props correctas.
 * No hay `any` ni casts inseguros.
 */
function renderBlock(block: Block, index: number, siteId?: string): React.ReactNode {
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

    case 'NavbarBlock':
      return <NavbarBlock key={index} {...block.props} />

    case 'ProductGridBlock':
      return <ProductGridBlock key={index} {...block.props} />

    case 'StatsBlock':
      return <StatsBlock key={index} {...block.props} />

    case 'NewsletterBlock':
      return <NewsletterBlock key={index} {...block.props} siteId={siteId} />

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
  siteId?: string
}

/**
 * BlockRenderer — Traduce el JSON de bloques almacenado en la API → React.
 *
 * Es un Server Component: se ejecuta en el servidor para máximo SEO y
 * performance (sin JS extra en el cliente salvo ContactFormBlock y NewsletterBlock).
 *
 * Uso:
 *   <BlockRenderer blocks={page.content} siteId={site.id} />
 */
export function BlockRenderer({ blocks, siteId }: BlockRendererProps) {
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
      {blocks.map((block, index) => renderBlock(block, index, siteId))}
    </main>
  )
}

