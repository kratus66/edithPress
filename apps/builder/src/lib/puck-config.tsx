'use client'

import React from 'react'
import type { Config } from '@measured/puck'
import { HeroBlock, heroBlockFields, heroBlockDefaultProps } from '@/blocks/HeroBlock'
import { TextBlock, textBlockFields, textBlockDefaultProps } from '@/blocks/TextBlock'
import { ImageBlock, imageBlockFields, imageBlockDefaultProps } from '@/blocks/ImageBlock'
import { ButtonBlock, buttonBlockFields, buttonBlockDefaultProps } from '@/blocks/ButtonBlock'
import { SeparatorBlock, separatorBlockFields, separatorBlockDefaultProps } from '@/blocks/SeparatorBlock'
import { GalleryBlock, galleryBlockFields, galleryBlockDefaultProps } from '@/blocks/GalleryBlock'
import { ContactFormBlock, contactFormBlockFields, contactFormBlockDefaultProps } from '@/blocks/ContactFormBlock'
import { CardGridBlock, cardGridBlockFields, cardGridBlockDefaultProps } from '@/blocks/CardGridBlock'
import { VideoBlock, videoBlockFields, videoBlockDefaultProps } from '@/blocks/VideoBlock'
import { PricingBlock, pricingBlockFields, pricingBlockDefaultProps } from '@/blocks/PricingBlock'
import { MediaPicker } from '@/components/MediaPicker'

/**
 * Configuración principal de Puck.
 *
 * Cada clave de `components` se mapea a un tipo de bloque en el JSON del contenido.
 * El contrato { type, props } es inmutable en producción — cambios al schema
 * requieren migración de datos en la base de datos.
 *
 * FASE 0: HeroBlock, TextBlock, ImageBlock, ButtonBlock, SeparatorBlock
 * FASE 1: GalleryBlock, ContactFormBlock, CardGridBlock
 * FASE 2: VideoBlock, PricingBlock — MediaPicker integrado en campos de imagen
 */
export const puckConfig: Config = {
  components: {
    HeroBlock: {
      label: 'Hero',
      fields: {
        ...heroBlockFields,
        // Sobreescribir el campo backgroundImage con el MediaPicker personalizado
        backgroundImage: {
          type: 'custom',
          label: 'Imagen de fondo',
          render: ({ value, onChange }) => (
            <MediaPicker
              value={value as string}
              onChange={onChange}
              label="Imagen de fondo"
            />
          ),
        },
      },
      defaultProps: heroBlockDefaultProps,
      render: HeroBlock,
    },
    TextBlock: {
      label: 'Texto',
      fields: textBlockFields,
      defaultProps: textBlockDefaultProps,
      render: TextBlock,
    },
    ImageBlock: {
      label: 'Imagen',
      fields: {
        ...imageBlockFields,
        // Sobreescribir el campo src con el MediaPicker personalizado
        src: {
          type: 'custom',
          label: 'Imagen',
          render: ({ value, onChange }) => (
            <MediaPicker
              value={value as string}
              onChange={onChange}
              label="Imagen"
            />
          ),
        },
      },
      defaultProps: imageBlockDefaultProps,
      render: ImageBlock,
    },
    ButtonBlock: {
      label: 'Botón',
      fields: buttonBlockFields,
      defaultProps: buttonBlockDefaultProps,
      render: ButtonBlock,
    },
    SeparatorBlock: {
      label: 'Separador',
      fields: separatorBlockFields,
      defaultProps: separatorBlockDefaultProps,
      render: SeparatorBlock,
    },
    GalleryBlock: {
      label: 'Galería',
      fields: {
        ...galleryBlockFields,
        // Sobreescribir el campo images con MediaPicker en cada item
        images: {
          type: 'array',
          label: 'Imágenes',
          arrayFields: {
            src: {
              type: 'custom',
              label: 'Imagen',
              render: ({ value, onChange }) => (
                <MediaPicker
                  value={value as string}
                  onChange={onChange}
                  label="Imagen"
                />
              ),
            },
            alt: { type: 'text', label: 'Texto alternativo' },
          },
          defaultItemProps: {
            src: 'https://placehold.co/600x400/e2e8f0/64748b?text=Imagen',
            alt: 'Descripción de la imagen',
          },
          getItemSummary: (item: { alt?: string }) => (item.alt as string) || 'Imagen',
        },
      },
      defaultProps: galleryBlockDefaultProps,
      render: GalleryBlock,
    },
    ContactFormBlock: {
      label: 'Formulario de contacto',
      fields: contactFormBlockFields,
      defaultProps: contactFormBlockDefaultProps,
      render: ContactFormBlock,
    },
    CardGridBlock: {
      label: 'Grilla de tarjetas',
      fields: {
        ...cardGridBlockFields,
        // Sobreescribir el campo cards con MediaPicker en el campo image de cada tarjeta
        cards: {
          type: 'array',
          label: 'Tarjetas',
          arrayFields: {
            image: {
              type: 'custom',
              label: 'Imagen de la tarjeta',
              render: ({ value, onChange }) => (
                <MediaPicker
                  value={value as string}
                  onChange={onChange}
                  label="Imagen de la tarjeta"
                />
              ),
            },
            imageAlt: { type: 'text', label: 'Alt de imagen' },
            title: { type: 'text', label: 'Título' },
            description: { type: 'textarea', label: 'Descripción' },
            linkText: { type: 'text', label: 'Texto del enlace' },
            linkUrl: { type: 'text', label: 'URL del enlace' },
          },
          defaultItemProps: {
            image: 'https://placehold.co/400x250/e2e8f0/64748b?text=Imagen',
            imageAlt: 'Imagen de la tarjeta',
            title: 'Título de la tarjeta',
            description: 'Descripción breve del servicio, producto o miembro del equipo.',
            linkText: 'Ver más',
            linkUrl: '#',
          },
          getItemSummary: (item: { title?: string }) => (item.title as string) || 'Tarjeta',
        },
      },
      defaultProps: cardGridBlockDefaultProps,
      render: CardGridBlock,
    },
    VideoBlock: {
      label: 'Video',
      fields: videoBlockFields,
      defaultProps: videoBlockDefaultProps,
      render: VideoBlock,
    },
    PricingBlock: {
      label: 'Precios',
      fields: pricingBlockFields,
      defaultProps: pricingBlockDefaultProps,
      render: PricingBlock,
    },
  },
}
