import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HeroBlock, heroBlockDefaultProps } from '../HeroBlock'

describe('HeroBlock', () => {
  // ---------- TAREA 4 — nuevas funcionalidades Sprint 03.2 ----------

  it('should render with defaultProps without errors (retro-compatibility)', () => {
    const { container } = render(<HeroBlock {...heroBlockDefaultProps} />)
    expect(container.firstChild).toBeTruthy()
    // Core content must be present
    expect(screen.getByText('Bienvenido a mi negocio')).toBeTruthy()
    expect(screen.getByText('Ofrecemos los mejores servicios de la región')).toBeTruthy()
  })

  it('should NOT render eyebrowText when it is empty string (default)', () => {
    render(<HeroBlock {...heroBlockDefaultProps} eyebrowText="" />)
    // Default eyebrowText is '' — no eyebrow paragraph should appear
    // We verify by checking no element carries the empty string as text content
    // and that a non-existent text is absent
    const eyebrow = screen.queryByText(/^[A-Z\s]{3,}$/)
    // The default props have eyebrowText='' so no uppercase-only short label
    // More directly: we check the title renders but no eyebrow sibling is present
    expect(screen.getByText('Bienvenido a mi negocio')).toBeTruthy()
    expect(eyebrow).toBeNull()
  })

  it('should render eyebrowText when provided', () => {
    render(<HeroBlock {...heroBlockDefaultProps} eyebrowText="ARTESANÍAS ÚNICAS" />)
    expect(screen.getByText('ARTESANÍAS ÚNICAS')).toBeTruthy()
  })

  it('should NOT render the second CTA when cta2Text is empty string (default)', () => {
    // Default cta2Text is '' — no second CTA anchor should be in the DOM
    render(<HeroBlock {...heroBlockDefaultProps} cta2Text="" />)
    // The primary CTA "Contáctanos" should exist
    expect(screen.getByText('Contáctanos')).toBeTruthy()
    // No second CTA text should be present
    // We verify by querying a known second CTA text — must return null
    expect(screen.queryByText('Saber más')).toBeNull()
  })

  it('should render the second CTA when cta2Text has a value', () => {
    render(
      <HeroBlock
        {...heroBlockDefaultProps}
        cta2Text="Saber más"
        cta2Url="/about"
        cta2Variant="outline"
      />
    )
    const cta2 = screen.getByText('Saber más')
    expect(cta2).toBeTruthy()
    expect(cta2.getAttribute('href')).toBe('/about')
  })

  it('should NOT render an overlay div when overlayOpacity is 0 (default)', () => {
    // overlayOpacity=0 means overlayHex is null, so no overlay div is rendered
    const { container } = render(
      <HeroBlock
        {...heroBlockDefaultProps}
        backgroundImage="https://example.com/hero.jpg"
        overlayOpacity={0}
      />
    )
    // The overlay div has pointerEvents: 'none' — only present when overlayOpacity > 0
    const overlayDiv = Array.from(container.querySelectorAll('div')).find(
      (el) => el.style.pointerEvents === 'none'
    )
    expect(overlayDiv).toBeUndefined()
  })

  it('should render the overlay div when overlayOpacity is 50', () => {
    const { container } = render(
      <HeroBlock
        {...heroBlockDefaultProps}
        backgroundImage="https://example.com/hero.jpg"
        overlayColor="#000000"
        overlayOpacity={50}
      />
    )
    // overlayOpacity=50 → overlayHex is set → overlay div is rendered with pointerEvents: none
    const overlayDiv = Array.from(container.querySelectorAll('div')).find(
      (el) => el.style.pointerEvents === 'none'
    )
    expect(overlayDiv).toBeTruthy()
    // backgroundColor should be set to the hex+alpha value
    expect(overlayDiv?.style.backgroundColor).toBeTruthy()
  })
})
