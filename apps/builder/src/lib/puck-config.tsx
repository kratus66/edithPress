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

/**
 * Configuración principal de Puck.
 *
 * Cada clave de `components` se mapea a un tipo de bloque en el JSON del contenido.
 * El contrato { type, props } es inmutable en producción — cambios al schema
 * requieren migración de datos en la base de datos.
 *
 * FASE 0: HeroBlock, TextBlock, ImageBlock, ButtonBlock, SeparatorBlock
 * FASE 1: GalleryBlock, ContactFormBlock, CardGridBlock
 */
export const puckConfig: Config = {
  components: {
    HeroBlock: {
      label: 'Hero',
      fields: heroBlockFields,
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
      fields: imageBlockFields,
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
      fields: galleryBlockFields,
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
      fields: cardGridBlockFields,
      defaultProps: cardGridBlockDefaultProps,
      render: CardGridBlock,
    },
  },
}
