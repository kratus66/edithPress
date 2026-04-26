import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SplitContentBlock, splitContentBlockDefaultProps } from '../SplitContentBlock'

describe('SplitContentBlock', () => {
  it('should render with defaultProps without errors', () => {
    const { container } = render(<SplitContentBlock {...splitContentBlockDefaultProps} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render eyebrowText when it is not empty', () => {
    render(
      <SplitContentBlock
        {...splitContentBlockDefaultProps}
        eyebrowText="NUESTRA HISTORIA"
      />
    )
    expect(screen.getByText('NUESTRA HISTORIA')).toBeTruthy()
  })

  it('should NOT render eyebrowText when it is empty string', () => {
    render(<SplitContentBlock {...splitContentBlockDefaultProps} eyebrowText="" />)
    expect(screen.queryByText('NUESTRA HISTORIA')).toBeNull()
  })

  it('should render the title and body paragraphs', () => {
    const body = 'Primer párrafo del cuerpo.\nSegundo párrafo del cuerpo.'
    render(
      <SplitContentBlock
        {...splitContentBlockDefaultProps}
        title="Preservando la tradición"
        body={body}
      />
    )
    expect(screen.getByText('Preservando la tradición')).toBeTruthy()
    expect(screen.getByText('Primer párrafo del cuerpo.')).toBeTruthy()
    expect(screen.getByText('Segundo párrafo del cuerpo.')).toBeTruthy()
  })

  it('should render stats when stats.length > 0', () => {
    render(
      <SplitContentBlock
        {...splitContentBlockDefaultProps}
        stats={[
          { value: '50+', label: 'Artesanos' },
          { value: '100%', label: 'Hecho a mano' },
        ]}
      />
    )
    expect(screen.getByText('50+')).toBeTruthy()
    expect(screen.getByText('Artesanos')).toBeTruthy()
    expect(screen.getByText('100%')).toBeTruthy()
    expect(screen.getByText('Hecho a mano')).toBeTruthy()
  })

  it('should NOT render the stats section when stats is empty array', () => {
    render(<SplitContentBlock {...splitContentBlockDefaultProps} stats={[]} />)
    // The default stats contain "50+" — it must not appear when stats=[]
    expect(screen.queryByText('50+')).toBeNull()
    expect(screen.queryByText('Artesanos')).toBeNull()
  })

  it('should render the CTA button when ctaVariant is "solid"', () => {
    render(
      <SplitContentBlock
        {...splitContentBlockDefaultProps}
        ctaText="Conoce más"
        ctaUrl="/about"
        ctaVariant="solid"
      />
    )
    const link = screen.getByText('Conoce más')
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('/about')
  })

  it('should render the CTA button when ctaVariant is "outline"', () => {
    render(
      <SplitContentBlock
        {...splitContentBlockDefaultProps}
        ctaText="Ver más"
        ctaVariant="outline"
      />
    )
    expect(screen.getByText('Ver más')).toBeTruthy()
  })

  it('should render the CTA button when ctaVariant is "ghost"', () => {
    render(
      <SplitContentBlock
        {...splitContentBlockDefaultProps}
        ctaText="Descubrir"
        ctaVariant="ghost"
      />
    )
    expect(screen.getByText('Descubrir')).toBeTruthy()
  })

  it('should NOT render the CTA button when ctaVariant is "none"', () => {
    render(
      <SplitContentBlock
        {...splitContentBlockDefaultProps}
        ctaText="Conoce más sobre nosotros"
        ctaVariant="none"
      />
    )
    expect(screen.queryByText('Conoce más sobre nosotros')).toBeNull()
  })

  it('should render 3 images when imageLayout is "collage"', () => {
    const { container } = render(
      <SplitContentBlock
        {...splitContentBlockDefaultProps}
        imageLayout="collage"
        images={[
          { src: 'img1.jpg', alt: 'Imagen 1' },
          { src: 'img2.jpg', alt: 'Imagen 2' },
          { src: 'img3.jpg', alt: 'Imagen 3' },
        ]}
      />
    )
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBe(3)
  })

  it('should render only the first image when imageLayout is "single"', () => {
    const { container } = render(
      <SplitContentBlock
        {...splitContentBlockDefaultProps}
        imageLayout="single"
        images={[
          { src: 'img1.jpg', alt: 'Imagen principal' },
          { src: 'img2.jpg', alt: 'Imagen extra' },
          { src: 'img3.jpg', alt: 'Imagen extra 2' },
        ]}
      />
    )
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBe(1)
    expect(imgs[0].getAttribute('alt')).toBe('Imagen principal')
  })
})
