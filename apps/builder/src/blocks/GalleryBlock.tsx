'use client'

import React, { useState, useCallback } from 'react'
import type { Fields } from '@measured/puck'

export interface GalleryImage {
  src: string
  alt: string
}

export interface GalleryBlockProps {
  images: GalleryImage[]
  columns: 2 | 3 | 4
  gap: 'sm' | 'md' | 'lg'
  borderRadius: 'none' | 'sm' | 'md' | 'lg'
  padding: 'sm' | 'md' | 'lg'
}

const gapMap: Record<GalleryBlockProps['gap'], string> = {
  sm: '8px',
  md: '16px',
  lg: '24px',
}

const paddingMap: Record<GalleryBlockProps['padding'], string> = {
  sm: '16px 24px',
  md: '32px 40px',
  lg: '64px 40px',
}

const borderRadiusMap: Record<GalleryBlockProps['borderRadius'], string> = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
}

export const galleryBlockFields: Fields<GalleryBlockProps> = {
  images: {
    type: 'array',
    label: 'Imágenes',
    arrayFields: {
      src: { type: 'text', label: 'URL de la imagen' },
      alt: { type: 'text', label: 'Texto alternativo' },
    },
    defaultItemProps: {
      src: 'https://placehold.co/600x400/e2e8f0/64748b?text=Imagen',
      alt: 'Descripción de la imagen',
    },
    getItemSummary: (item) => item.alt || 'Imagen',
  },
  columns: {
    type: 'radio',
    label: 'Columnas',
    options: [
      { label: '2 columnas', value: 2 },
      { label: '3 columnas', value: 3 },
      { label: '4 columnas', value: 4 },
    ],
  },
  gap: {
    type: 'radio',
    label: 'Separación entre imágenes',
    options: [
      { label: 'Pequeña', value: 'sm' },
      { label: 'Mediana', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
  borderRadius: {
    type: 'radio',
    label: 'Bordes redondeados',
    options: [
      { label: 'Sin redondeo', value: 'none' },
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
  padding: {
    type: 'radio',
    label: 'Espaciado interno',
    options: [
      { label: 'Pequeño', value: 'sm' },
      { label: 'Mediano', value: 'md' },
      { label: 'Grande', value: 'lg' },
    ],
  },
}

export const galleryBlockDefaultProps: GalleryBlockProps = {
  images: [
    { src: 'https://placehold.co/600x400/e2e8f0/64748b?text=Foto+1', alt: 'Foto 1' },
    { src: 'https://placehold.co/600x400/dde6f0/64748b?text=Foto+2', alt: 'Foto 2' },
    { src: 'https://placehold.co/600x400/d0daf0/64748b?text=Foto+3', alt: 'Foto 3' },
  ],
  columns: 3,
  gap: 'md',
  borderRadius: 'md',
  padding: 'md',
}

export function GalleryBlock({ images, columns, gap, borderRadius, padding }: GalleryBlockProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % images.length
    )
  }, [images.length])

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length
    )
  }, [images.length])

  return (
    <div style={{ padding: paddingMap[padding] }}>
      {/* Grid de imágenes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gapMap[gap],
        }}
      >
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => openLightbox(index)}
            style={{
              border: 'none',
              padding: 0,
              cursor: 'zoom-in',
              borderRadius: borderRadiusMap[borderRadius],
              overflow: 'hidden',
              display: 'block',
              background: 'none',
            }}
            aria-label={`Ver ${image.alt}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                display: 'block',
                borderRadius: borderRadiusMap[borderRadius],
                transition: 'transform 0.2s, opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.transform = 'scale(1.03)'
                ;(e.currentTarget as HTMLImageElement).style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'
                ;(e.currentTarget as HTMLImageElement).style.opacity = '1'
              }}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={closeLightbox}
        >
          {/* Botón cerrar */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Cerrar visor"
            style={{
              position: 'absolute',
              top: '16px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '2rem',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Botón anterior */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              aria-label="Imagen anterior"
              style={{
                position: 'absolute',
                left: '16px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '12px 16px',
                borderRadius: '4px',
              }}
            >
              ‹
            </button>
          )}

          {/* Imagen activa */}
          <img
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '4px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          />

          {/* Botón siguiente */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext() }}
              aria-label="Imagen siguiente"
              style={{
                position: 'absolute',
                right: '16px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '12px 16px',
                borderRadius: '4px',
              }}
            >
              ›
            </button>
          )}

          {/* Contador */}
          <span
            style={{
              position: 'absolute',
              bottom: '16px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.875rem',
            }}
          >
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  )
}
