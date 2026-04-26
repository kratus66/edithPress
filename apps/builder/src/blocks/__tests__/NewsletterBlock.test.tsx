import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NewsletterBlock, newsletterBlockDefaultProps } from '../NewsletterBlock'

describe('NewsletterBlock', () => {
  it('renders with defaultProps without errors', () => {
    const { container } = render(<NewsletterBlock {...newsletterBlockDefaultProps} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows the configured title', () => {
    render(<NewsletterBlock {...newsletterBlockDefaultProps} title="¡Suscríbete!" />)
    expect(screen.getByText('¡Suscríbete!')).toBeTruthy()
  })

  it('shows the configured subtitle', () => {
    render(
      <NewsletterBlock {...newsletterBlockDefaultProps} subtitle="Recibe ofertas exclusivas" />
    )
    expect(screen.getByText('Recibe ofertas exclusivas')).toBeTruthy()
  })

  it('renders the input with the correct placeholder', () => {
    render(<NewsletterBlock {...newsletterBlockDefaultProps} placeholder="correo@ejemplo.com" />)
    const input = screen.getByPlaceholderText('correo@ejemplo.com')
    expect(input).toBeTruthy()
  })

  it('renders the button with the configured text', () => {
    render(<NewsletterBlock {...newsletterBlockDefaultProps} buttonText="Quiero suscribirme" />)
    expect(screen.getByText('Quiero suscribirme')).toBeTruthy()
  })

  it('applies backgroundColor to the section', () => {
    const { container } = render(
      <NewsletterBlock {...newsletterBlockDefaultProps} backgroundColor="#ff0000" />
    )
    const section = container.querySelector('section') as HTMLElement
    expect(section.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('renders default title and subtitle from defaultProps', () => {
    render(<NewsletterBlock {...newsletterBlockDefaultProps} />)
    expect(screen.getByText('Únete a nuestra comunidad')).toBeTruthy()
    expect(screen.getByText('Recibe noticias sobre nuevos productos y artesanos.')).toBeTruthy()
  })

  it('renders in centered layout by default', () => {
    const { container } = render(
      <NewsletterBlock {...newsletterBlockDefaultProps} layout="centered" />
    )
    // El componente debe renderizar sin errores con layout centrado
    expect(container.firstChild).toBeTruthy()
  })

  it('renders in side-by-side layout', () => {
    const { container } = render(
      <NewsletterBlock {...newsletterBlockDefaultProps} layout="side-by-side" />
    )
    expect(container.firstChild).toBeTruthy()
  })
})
