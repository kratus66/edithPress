import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FooterBlock, footerBlockDefaultProps } from '../FooterBlock'

describe('FooterBlock', () => {
  it('should render with defaultProps without errors', () => {
    const { container } = render(<FooterBlock {...footerBlockDefaultProps} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render logoText when logoImageUrl is empty', () => {
    render(
      <FooterBlock
        {...footerBlockDefaultProps}
        logoText="Mi Negocio"
        logoImageUrl=""
      />
    )
    expect(screen.getByText('Mi Negocio')).toBeTruthy()
  })

  it('should NOT render logoText span when logoImageUrl is defined', () => {
    const { container } = render(
      <FooterBlock
        {...footerBlockDefaultProps}
        logoImageUrl="https://example.com/logo.png"
        logoText="Mi Negocio"
      />
    )
    // When logoImageUrl is set, an <img> is rendered instead of the text span
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe('https://example.com/logo.png')
    // The logo text span should NOT be present (it is replaced by the img)
    // The text "Mi Negocio" is only the alt attribute of the img, not a text node
    expect(screen.queryByText('Mi Negocio')).toBeNull()
  })

  it('should render an img element when logoImageUrl is defined', () => {
    const { container } = render(
      <FooterBlock
        {...footerBlockDefaultProps}
        logoImageUrl="https://example.com/logo.png"
      />
    )
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe('https://example.com/logo.png')
  })

  it('should render the correct number of nav columns', () => {
    const columns = [
      { heading: 'TIENDA', links: [{ label: 'Productos', url: '/productos' }] },
      { heading: 'EMPRESA', links: [{ label: 'Nosotros', url: '/about' }] },
      { heading: 'AYUDA', links: [{ label: 'FAQ', url: '/faq' }] },
    ]
    render(<FooterBlock {...footerBlockDefaultProps} columns={columns} />)
    expect(screen.getByText('TIENDA')).toBeTruthy()
    expect(screen.getByText('EMPRESA')).toBeTruthy()
    expect(screen.getByText('AYUDA')).toBeTruthy()
  })

  it('should render 2 columns when columns has 2 items', () => {
    const columns = [
      { heading: 'COL-ONE', links: [{ label: 'Link A', url: '/a' }] },
      { heading: 'COL-TWO', links: [{ label: 'Link B', url: '/b' }] },
    ]
    render(<FooterBlock {...footerBlockDefaultProps} columns={columns} />)
    expect(screen.getByText('COL-ONE')).toBeTruthy()
    expect(screen.getByText('COL-TWO')).toBeTruthy()
    // A third heading must not be present
    expect(screen.queryByText('COL-THREE')).toBeNull()
  })

  it('should render the newsletter section when showNewsletter is true', () => {
    render(<FooterBlock {...footerBlockDefaultProps} showNewsletter={true} newsletterTitle="Únete a nuestra comunidad" />)
    expect(screen.getByText('Únete a nuestra comunidad')).toBeTruthy()
  })

  it('should NOT render the newsletter section when showNewsletter is false', () => {
    render(
      <FooterBlock
        {...footerBlockDefaultProps}
        showNewsletter={false}
        newsletterTitle="Únete a nuestra comunidad"
      />
    )
    expect(screen.queryByText('Únete a nuestra comunidad')).toBeNull()
  })

  it('should render the copyright text', () => {
    render(
      <FooterBlock
        {...footerBlockDefaultProps}
        copyright="© 2024 Mi Negocio. Todos los derechos reservados."
      />
    )
    expect(screen.getByText('© 2024 Mi Negocio. Todos los derechos reservados.')).toBeTruthy()
  })

  it('should render legalLinks', () => {
    render(
      <FooterBlock
        {...footerBlockDefaultProps}
        legalLinks={[
          { label: 'Política de privacidad', url: '/privacidad' },
          { label: 'Términos y condiciones', url: '/terminos' },
        ]}
      />
    )
    expect(screen.getByText('Política de privacidad')).toBeTruthy()
    expect(screen.getByText('Términos y condiciones')).toBeTruthy()
  })

  it('should render one social link anchor per item in socialLinks', () => {
    const { container } = render(
      <FooterBlock
        {...footerBlockDefaultProps}
        socialLinks={[
          { platform: 'instagram', url: 'https://instagram.com/test' },
          { platform: 'facebook', url: 'https://facebook.com/test' },
          { platform: 'twitter', url: 'https://twitter.com/test' },
        ]}
      />
    )
    // Social links are <a> tags with SVG children inside the brand column
    // They have a specific width/height of 32px (inline style)
    const socialAnchors = Array.from(container.querySelectorAll('a')).filter(
      (a) => a.style.width === '32px'
    )
    expect(socialAnchors.length).toBe(3)
  })

  it('should render 2 social links when socialLinks has 2 items (default)', () => {
    const { container } = render(
      <FooterBlock
        {...footerBlockDefaultProps}
        socialLinks={[
          { platform: 'instagram', url: '#' },
          { platform: 'facebook', url: '#' },
        ]}
      />
    )
    const socialAnchors = Array.from(container.querySelectorAll('a')).filter(
      (a) => a.style.width === '32px'
    )
    expect(socialAnchors.length).toBe(2)
  })
})
