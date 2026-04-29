'use client'

import React from 'react'
import type { Config } from '@measured/puck'
import { NavbarBlock, navbarBlockFields, navbarBlockDefaultProps } from '@/blocks/NavbarBlock'
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
import { ProductGridBlock, productGridBlockFields, productGridBlockDefaultProps } from '@/blocks/ProductGridBlock'
import { StatsBlock, statsBlockFields, statsBlockDefaultProps } from '@/blocks/StatsBlock'
import { NewsletterBlock, newsletterBlockFields, newsletterBlockDefaultProps } from '@/blocks/NewsletterBlock'
import { CategoryGridBlock, categoryGridBlockFields, categoryGridBlockDefaultProps } from '@/blocks/CategoryGridBlock'
import { SplitContentBlock, splitContentBlockFields, splitContentBlockDefaultProps } from '@/blocks/SplitContentBlock'
import { FooterBlock, footerBlockFields, footerBlockDefaultProps } from '@/blocks/FooterBlock'
import { PayButtonBlock, payButtonBlockFields, payButtonBlockDefaultProps } from '@/blocks/PayButtonBlock'
import { MediaPicker } from '@/components/MediaPicker'
import { ColorPickerField } from '@/components/ColorPickerField'
import { FontFamilyField } from '@/components/FontFamilyField'

// Campo reutilizable de color para usar en cualquier bloque
const colorField = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
    <ColorPickerField value={value as string} onChange={onChange} />
  ),
})

// Campo reutilizable de fuente para usar en cualquier bloque
const fontFamilyField = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value: unknown; onChange: (v: string) => void }) => (
    <FontFamilyField value={value as string} onChange={onChange} />
  ),
})

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
 * FASE 3.1: NavbarBlock, ProductGridBlock, StatsBlock, NewsletterBlock
 * FASE 3.2: CategoryGridBlock, SplitContentBlock, FooterBlock
 *           HeroBlock v1.1 (+eyebrowText, cta2, overlayOpacity)
 *           ProductGridBlock v1.1 (+eyebrowText, viewAllText, categoryPosition, showCta)
 * FASE 3.3: root config (estilos globales), NavbarBlock logo multi-línea
 * FASE 3.4: ProductGridBlock v1.2 (+whatsappPhone, ctaType por producto)
 *           PayButtonBlock — enlace de pago Wompi/PayU/MercadoPago/Nequi
 */
export const puckConfig: Config = {
  root: {
    render: ({ children, fontHeading, fontBody, colorPrimary, colorText, colorBackground }: {
      children: React.ReactNode
      fontHeading?: string
      fontBody?: string
      colorPrimary?: string
      colorText?: string
      colorBackground?: string
    }) => (
      <>
        <style>{`
          :root {
            ${fontHeading ? `--ep-font-heading: ${fontHeading};` : ''}
            ${fontBody ? `--ep-font-body: ${fontBody};` : ''}
            --ep-color-primary: ${colorPrimary ?? '#b45309'};
            --ep-color-text: ${colorText ?? '#1e293b'};
            --ep-color-bg: ${colorBackground ?? '#ffffff'};
          }
        `}</style>
        <div>{children}</div>
      </>
    ),
    fields: {
      fontHeading: fontFamilyField('Fuente de títulos (H1, H2, logo...)'),
      fontBody: fontFamilyField('Fuente del cuerpo de texto'),
      colorPrimary: colorField('Color primario / acento'),
      colorText: colorField('Color del texto'),
      colorBackground: colorField('Color de fondo global'),
    },
    defaultProps: {
      fontHeading: '',
      fontBody: '',
      colorPrimary: '#b45309',
      colorText: '#1e293b',
      colorBackground: '#ffffff',
    },
  },
  components: {
    NavbarBlock: {
      label: 'Navbar / Menú',
      fields: {
        ...navbarBlockFields,
        backgroundColor: colorField('Color de fondo'),
        textColor: colorField('Color del texto'),
        accentColor: colorField('Color de acento'),
        logoImageUrl: {
          type: 'custom',
          label: 'Logo (imagen, opcional)',
          render: ({ value, onChange }) => (
            <MediaPicker value={value as string} onChange={onChange} label="Logo" />
          ),
        },
        logoText: { type: 'text', label: 'Logo texto (fallback legacy)' },
      },
      defaultProps: navbarBlockDefaultProps,
      render: NavbarBlock,
    },
    HeroBlock: {
      label: 'Hero',
      fields: {
        ...heroBlockFields,
        backgroundColor: colorField('Color de fondo'),
        textColor: colorField('Color del texto'),
        overlayColor: colorField('Color del overlay sobre imagen'),
        fontFamily: fontFamilyField('Fuente'),
      },
      defaultProps: heroBlockDefaultProps,
      render: HeroBlock,
    },
    TextBlock: {
      label: 'Texto',
      fields: {
        ...textBlockFields,
        textColor: colorField('Color del texto'),
        fontFamily: fontFamilyField('Fuente'),
      },
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
      fields: {
        ...buttonBlockFields,
        primaryColor: colorField('Color principal'),
      },
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
    ProductGridBlock: {
      label: 'Grilla de Productos',
      fields: {
        ...productGridBlockFields,
        backgroundColor: colorField('Color de fondo'),
        textColor: colorField('Color del texto'),
        accentColor: colorField('Color de acento'),
        products: {
          type: 'array',
          label: 'Productos',
          arrayFields: {
            image: {
              type: 'custom',
              label: 'Imagen del producto',
              render: ({ value, onChange }) => (
                <MediaPicker value={value as string} onChange={onChange} label="Imagen del producto" />
              ),
            },
            imageAlt: { type: 'text', label: 'Texto alternativo' },
            category: { type: 'text', label: 'Categoría' },
            name: { type: 'text', label: 'Nombre del producto' },
            description: { type: 'text', label: 'Descripción breve' },
            price: { type: 'text', label: 'Precio (ej: $85.000)' },
            artisan: { type: 'text', label: 'Artesano/a (opcional)' },
            ctaText: { type: 'text', label: 'Texto del botón' },
            ctaUrl: { type: 'text', label: 'URL del botón' },
          },
          defaultItemProps: productGridBlockDefaultProps.products[0],
          getItemSummary: (item: { name?: string }) => (item.name as string) || 'Producto',
        },
      },
      defaultProps: productGridBlockDefaultProps,
      render: ProductGridBlock,
    },
    StatsBlock: {
      label: 'Estadísticas',
      fields: {
        ...statsBlockFields,
        backgroundColor: colorField('Color de fondo'),
        textColor: colorField('Color del texto'),
        accentColor: colorField('Color del número'),
      },
      defaultProps: statsBlockDefaultProps,
      render: StatsBlock,
    },
    NewsletterBlock: {
      label: 'Suscripción / Newsletter',
      fields: {
        ...newsletterBlockFields,
        backgroundColor: colorField('Color de fondo'),
        textColor: colorField('Color del texto'),
        accentColor: colorField('Color del botón'),
      },
      defaultProps: newsletterBlockDefaultProps,
      render: NewsletterBlock,
    },
    CategoryGridBlock: {
      label: 'Grilla de Categorías',
      fields: {
        ...categoryGridBlockFields,
        backgroundColor: colorField('Color de fondo'),
        textColor: colorField('Color del texto'),
        accentColor: colorField('Color de acento'),
        overlayColor: colorField('Color del overlay'),
        categories: {
          type: 'array',
          label: 'Categorías',
          arrayFields: {
            image: {
              type: 'custom',
              label: 'Imagen de la categoría',
              render: ({ value, onChange }) => (
                <MediaPicker value={value as string} onChange={onChange} label="Imagen de la categoría" />
              ),
            },
            imageAlt: { type: 'text', label: 'Texto alternativo' },
            name: { type: 'text', label: 'Nombre de la categoría' },
            description: { type: 'text', label: 'Descripción breve' },
            url: { type: 'text', label: 'URL de destino' },
          },
          defaultItemProps: categoryGridBlockDefaultProps.categories[0],
          getItemSummary: (item: { name?: string }) => (item.name as string) || 'Categoría',
        },
      },
      defaultProps: categoryGridBlockDefaultProps,
      render: CategoryGridBlock,
    },
    SplitContentBlock: {
      label: 'Contenido Dividido',
      fields: {
        ...splitContentBlockFields,
        backgroundColor: colorField('Color de fondo'),
        textColor: colorField('Color del texto'),
        accentColor: colorField('Color de acento'),
        images: {
          type: 'array',
          label: 'Imágenes',
          arrayFields: {
            src: {
              type: 'custom',
              label: 'Imagen',
              render: ({ value, onChange }) => (
                <MediaPicker value={value as string} onChange={onChange} label="Imagen" />
              ),
            },
            alt: { type: 'text', label: 'Texto alternativo' },
          },
          defaultItemProps: splitContentBlockDefaultProps.images[0],
          getItemSummary: (item: { alt?: string }) => (item.alt as string) || 'Imagen',
        },
      },
      defaultProps: splitContentBlockDefaultProps,
      render: SplitContentBlock,
    },
    FooterBlock: {
      label: 'Footer / Pie de página',
      fields: {
        ...footerBlockFields,
        backgroundColor: colorField('Color de fondo'),
        textColor: colorField('Color del texto'),
        accentColor: colorField('Color de acento'),
        newsletterBackgroundColor: colorField('Color de fondo del newsletter'),
        logoImageUrl: {
          type: 'custom',
          label: 'Logo (imagen, opcional)',
          render: ({ value, onChange }) => (
            <MediaPicker value={value as string} onChange={onChange} label="Logo" />
          ),
        },
      },
      defaultProps: footerBlockDefaultProps,
      render: FooterBlock,
    },
    PayButtonBlock: {
      label: 'Botón de pago (Wompi / PayU / Nequi)',
      fields: payButtonBlockFields,
      defaultProps: payButtonBlockDefaultProps,
      render: PayButtonBlock,
    },
  },
}
