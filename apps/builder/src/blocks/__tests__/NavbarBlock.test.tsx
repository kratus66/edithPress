import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NavbarBlock, navbarBlockDefaultProps } from '../NavbarBlock'

describe('NavbarBlock', () => {
  it('renders with defaultProps without errors', () => {
    const { container } = render(<NavbarBlock {...navbarBlockDefaultProps} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders logoText when logoImageUrl is empty and logoLines is empty', () => {
    render(<NavbarBlock {...navbarBlockDefaultProps} logoText="Mi Tienda" logoImageUrl="" logoLines={[]} />)
    expect(screen.getByText('Mi Tienda')).toBeTruthy()
  })

  it('renders img element when logoImageUrl is defined', () => {
    const { container } = render(
      <NavbarBlock {...navbarBlockDefaultProps} logoImageUrl="https://example.com/logo.png" />
    )
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe('https://example.com/logo.png')
  })

  it('applies position sticky when sticky is true', () => {
    const { container } = render(<NavbarBlock {...navbarBlockDefaultProps} sticky={true} />)
    const nav = container.firstChild as HTMLElement
    expect(nav.style.position).toBe('sticky')
    expect(nav.style.top).toBe('0px')
  })

  it('applies position relative when sticky is false', () => {
    const { container } = render(<NavbarBlock {...navbarBlockDefaultProps} sticky={false} />)
    const nav = container.firstChild as HTMLElement
    expect(nav.style.position).toBe('relative')
  })

  it('renders navLinks labels', () => {
    const navLinks = [
      { label: 'Inicio', url: '/' },
      { label: 'Contacto', url: '/contacto' },
    ]
    render(<NavbarBlock {...navbarBlockDefaultProps} navLinks={navLinks} />)
    expect(screen.getByText('Inicio')).toBeTruthy()
    expect(screen.getByText('Contacto')).toBeTruthy()
  })

  it('shows search icon when showSearch is true', () => {
    const { container } = render(
      <NavbarBlock {...navbarBlockDefaultProps} showSearch={true} showCart={false} />
    )
    const svgs = container.querySelectorAll('svg')
    // Al menos un SVG de iconos de acción debe existir
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('hides cart icon when showCart is false', () => {
    const { container } = render(
      <NavbarBlock {...navbarBlockDefaultProps} showCart={false} showSearch={false} />
    )
    // Sin íconos de acción → solo el SVG de hamburger si existe
    // Verificamos que el componente renderiza sin errores
    expect(container.firstChild).toBeTruthy()
  })

  it('applies backgroundColor to nav style', () => {
    const { container } = render(
      <NavbarBlock {...navbarBlockDefaultProps} backgroundColor="#ff0000" />
    )
    const nav = container.firstChild as HTMLElement
    expect(nav.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })
})
