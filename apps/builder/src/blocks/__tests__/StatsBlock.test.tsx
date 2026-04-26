import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatsBlock, statsBlockDefaultProps } from '../StatsBlock'

describe('StatsBlock', () => {
  it('renders with defaultProps without errors', () => {
    const { container } = render(<StatsBlock {...statsBlockDefaultProps} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders the correct number of stat items', () => {
    render(<StatsBlock {...statsBlockDefaultProps} />)
    // defaultProps has 4 stats
    expect(screen.getByText('Artesanos')).toBeTruthy()
    expect(screen.getByText('Productos')).toBeTruthy()
    expect(screen.getByText('Años de experiencia')).toBeTruthy()
    expect(screen.getByText('Hecho a mano')).toBeTruthy()
  })

  it('renders stat values', () => {
    render(<StatsBlock {...statsBlockDefaultProps} />)
    expect(screen.getByText('50+')).toBeTruthy()
    expect(screen.getByText('200+')).toBeTruthy()
    expect(screen.getByText('15')).toBeTruthy()
    expect(screen.getByText('100%')).toBeTruthy()
  })

  it('applies accentColor to value elements', () => {
    const { container } = render(
      <StatsBlock {...statsBlockDefaultProps} accentColor="#ff0000" />
    )
    const valueEls = container.querySelectorAll('[style*="color: rgb(255, 0, 0)"]')
    expect(valueEls.length).toBeGreaterThan(0)
  })

  it('renders emoji icons when provided', () => {
    render(<StatsBlock {...statsBlockDefaultProps} />)
    expect(screen.getByText('🎨')).toBeTruthy()
    expect(screen.getByText('📦')).toBeTruthy()
  })

  it('applies backgroundColor to section', () => {
    const { container } = render(
      <StatsBlock {...statsBlockDefaultProps} backgroundColor="#123456" />
    )
    const section = container.querySelector('section') as HTMLElement
    expect(section.style.backgroundColor).toBe('rgb(18, 52, 86)')
  })

  it('renders custom stats correctly', () => {
    const customStats = [
      { value: '99', label: 'Clientes', icon: '👥' },
      { value: '$1M', label: 'En ventas', icon: '💰' },
    ]
    render(<StatsBlock {...statsBlockDefaultProps} stats={customStats} />)
    expect(screen.getByText('Clientes')).toBeTruthy()
    expect(screen.getByText('En ventas')).toBeTruthy()
    expect(screen.getByText('99')).toBeTruthy()
    expect(screen.getByText('$1M')).toBeTruthy()
  })
})
