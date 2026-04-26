import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProductGridBlock, productGridBlockDefaultProps } from '../ProductGridBlock'

describe('ProductGridBlock', () => {
  it('renders with defaultProps without errors', () => {
    const { container } = render(<ProductGridBlock {...productGridBlockDefaultProps} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders the correct number of product cards', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} />)
    // defaultProps has 3 products
    expect(screen.getByText('Mochila Wayuu Premium')).toBeTruthy()
    expect(screen.getByText('Vasija de Barro Artesanal')).toBeTruthy()
    expect(screen.getByText('Collar de Semillas Naturales')).toBeTruthy()
  })

  it('does not show artisan name when showArtisan is false', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} showArtisan={false} />)
    expect(screen.queryByText('María López')).toBeNull()
    expect(screen.queryByText('Carlos Ruiz')).toBeNull()
  })

  it('shows artisan name when showArtisan is true and artisan is not empty', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} showArtisan={true} />)
    expect(screen.getByText('Por María López')).toBeTruthy()
    expect(screen.getByText('Por Carlos Ruiz')).toBeTruthy()
  })

  it('shows category when showCategory is true', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} showCategory={true} />)
    expect(screen.getByText('Mochilas')).toBeTruthy()
    expect(screen.getByText('Cerámica')).toBeTruthy()
    expect(screen.getByText('Joyería')).toBeTruthy()
  })

  it('hides category when showCategory is false', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} showCategory={false} />)
    expect(screen.queryByText('Mochilas')).toBeNull()
    expect(screen.queryByText('Cerámica')).toBeNull()
  })

  it('renders product prices', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} />)
    expect(screen.getByText('$85.000')).toBeTruthy()
    expect(screen.getByText('$45.000')).toBeTruthy()
    expect(screen.getByText('$32.000')).toBeTruthy()
  })

  it('renders CTA buttons for each product', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} />)
    const buttons = screen.getAllByText('Ver producto')
    expect(buttons.length).toBe(3)
  })

  it('renders section title when provided', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} title="Catálogo de Arte" />)
    expect(screen.getByText('Catálogo de Arte')).toBeTruthy()
  })

  it('applies backgroundColor to the section', () => {
    const { container } = render(
      <ProductGridBlock {...productGridBlockDefaultProps} backgroundColor="#f0f0f0" />
    )
    const section = container.querySelector('section') as HTMLElement
    expect(section.style.backgroundColor).toBe('rgb(240, 240, 240)')
  })

  it('renders with a single custom product', () => {
    const props = {
      ...productGridBlockDefaultProps,
      products: [
        {
          image: 'https://example.com/img.jpg',
          imageAlt: 'Test',
          category: 'Test Cat',
          name: 'Producto Test',
          description: 'Descripción test',
          price: '$100',
          artisan: 'Artesano Test',
          ctaText: 'Comprar',
          ctaUrl: '/comprar',
        },
      ],
    }
    render(<ProductGridBlock {...props} showArtisan={true} showCategory={true} />)
    expect(screen.getByText('Producto Test')).toBeTruthy()
    expect(screen.getByText('Test Cat')).toBeTruthy()
    expect(screen.getByText('Por Artesano Test')).toBeTruthy()
    expect(screen.getByText('Comprar')).toBeTruthy()
  })

  // ---------- TAREA 5 — nuevas funcionalidades Sprint 03.2 ----------

  it('should show CTA button on each card when showCta is true (default)', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} showCta={true} />)
    // Default has 3 products, each with ctaText "Ver producto"
    const ctaLinks = screen.getAllByText('Ver producto')
    expect(ctaLinks.length).toBe(3)
  })

  it('should NOT show CTA button on any card when showCta is false', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} showCta={false} />)
    expect(screen.queryByText('Ver producto')).toBeNull()
  })

  it('should render category as badge over image when categoryPosition is "badge" (default)', () => {
    const { container } = render(
      <ProductGridBlock
        {...productGridBlockDefaultProps}
        showCategory={true}
        categoryPosition="badge"
      />
    )
    // Badge spans are inside the image container div (position: relative, aspectRatio: 4/3)
    // They have position: absolute as inline style
    const badgeSpans = Array.from(container.querySelectorAll('span')).filter(
      (el) => el.style.position === 'absolute'
    )
    expect(badgeSpans.length).toBe(3) // one badge per product
    expect(badgeSpans[0].textContent).toBe('Mochilas')
  })

  it('should render category as text above product name when categoryPosition is "above-name"', () => {
    render(
      <ProductGridBlock
        {...productGridBlockDefaultProps}
        showCategory={true}
        categoryPosition="above-name"
      />
    )
    // When above-name, the category renders as a <p> in the content area — no absolute badges
    // The category text is still visible
    expect(screen.getByText('Mochilas')).toBeTruthy()
    expect(screen.getByText('Cerámica')).toBeTruthy()
    expect(screen.getByText('Joyería')).toBeTruthy()
  })

  it('should NOT render badge spans when categoryPosition is "above-name"', () => {
    const { container } = render(
      <ProductGridBlock
        {...productGridBlockDefaultProps}
        showCategory={true}
        categoryPosition="above-name"
      />
    )
    // No absolute-positioned span badges should exist
    const badgeSpans = Array.from(container.querySelectorAll('span')).filter(
      (el) => el.style.position === 'absolute'
    )
    expect(badgeSpans.length).toBe(0)
  })

  it('should show "Ver todo" link when viewAllText is not empty', () => {
    render(
      <ProductGridBlock
        {...productGridBlockDefaultProps}
        viewAllText="Ver todos los productos"
        viewAllUrl="/productos"
      />
    )
    const link = screen.getByText('Ver todos los productos')
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('/productos')
  })

  it('should NOT show "Ver todo" link when viewAllText is empty string (default)', () => {
    render(<ProductGridBlock {...productGridBlockDefaultProps} viewAllText="" />)
    // No link with "Ver todos" should be present
    expect(screen.queryByText('Ver todos los productos')).toBeNull()
  })

  it('should render eyebrowText above the title when eyebrowText is provided', () => {
    render(
      <ProductGridBlock
        {...productGridBlockDefaultProps}
        eyebrowText="LO MÁS VENDIDO"
        title="Nuestros Productos"
      />
    )
    expect(screen.getByText('LO MÁS VENDIDO')).toBeTruthy()
    expect(screen.getByText('Nuestros Productos')).toBeTruthy()
  })
})
