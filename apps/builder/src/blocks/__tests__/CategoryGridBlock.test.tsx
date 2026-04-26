import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CategoryGridBlock, categoryGridBlockDefaultProps } from '../CategoryGridBlock'

describe('CategoryGridBlock', () => {
  it('should render with defaultProps without throwing errors', () => {
    const { container } = render(<CategoryGridBlock {...categoryGridBlockDefaultProps} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render the correct number of category cards', () => {
    // defaultProps has 4 categories
    render(<CategoryGridBlock {...categoryGridBlockDefaultProps} />)
    expect(screen.getByText('Mochilas')).toBeTruthy()
    expect(screen.getByText('Cerámica')).toBeTruthy()
    expect(screen.getByText('Joyería')).toBeTruthy()
    expect(screen.getByText('Textiles')).toBeTruthy()
  })

  it('should render a custom number of categories equal to categories.length', () => {
    const props = {
      ...categoryGridBlockDefaultProps,
      categories: [
        { image: 'img1.jpg', imageAlt: 'Cat A', name: 'Cat A', description: 'Desc A', url: '/a' },
        { image: 'img2.jpg', imageAlt: 'Cat B', name: 'Cat B', description: 'Desc B', url: '/b' },
      ],
    }
    render(<CategoryGridBlock {...props} />)
    expect(screen.getByText('Cat A')).toBeTruthy()
    expect(screen.getByText('Cat B')).toBeTruthy()
    expect(screen.queryByText('Mochilas')).toBeNull()
  })

  it('should render eyebrowText when it is not empty', () => {
    render(
      <CategoryGridBlock
        {...categoryGridBlockDefaultProps}
        eyebrowText="NUESTRAS CATEGORÍAS"
      />
    )
    expect(screen.getByText('NUESTRAS CATEGORÍAS')).toBeTruthy()
  })

  it('should NOT render eyebrowText when it is empty string', () => {
    render(<CategoryGridBlock {...categoryGridBlockDefaultProps} eyebrowText="" />)
    // The eyebrow paragraph element is conditionally rendered — it must not be in the DOM
    // The default title is "Explora por tipo de artesanía" so we can check the eyebrow text is absent
    expect(screen.queryByText('NUESTRAS CATEGORÍAS')).toBeNull()
  })

  it('should apply the correct number of columns in gridTemplateColumns CSS', () => {
    const { container } = render(
      <CategoryGridBlock {...categoryGridBlockDefaultProps} columns={3} />
    )
    // Find the grid div — it is the div that contains the category cards
    const gridDiv = container.querySelector('div[style*="grid-template-columns"]') as HTMLElement
    expect(gridDiv).toBeTruthy()
    expect(gridDiv.style.gridTemplateColumns).toContain('repeat(3, 1fr)')
  })

  it('should apply 2 columns when columns=2', () => {
    const { container } = render(
      <CategoryGridBlock {...categoryGridBlockDefaultProps} columns={2} />
    )
    const gridDiv = container.querySelector('div[style*="grid-template-columns"]') as HTMLElement
    expect(gridDiv).toBeTruthy()
    expect(gridDiv.style.gridTemplateColumns).toContain('repeat(2, 1fr)')
  })

  it('should apply 4 columns when columns=4 (default)', () => {
    const { container } = render(
      <CategoryGridBlock {...categoryGridBlockDefaultProps} columns={4} />
    )
    const gridDiv = container.querySelector('div[style*="grid-template-columns"]') as HTMLElement
    expect(gridDiv).toBeTruthy()
    expect(gridDiv.style.gridTemplateColumns).toContain('repeat(4, 1fr)')
  })

  it('should render the name and description of each category card', () => {
    const props = {
      ...categoryGridBlockDefaultProps,
      categories: [
        {
          image: 'img.jpg',
          imageAlt: 'Artesanía',
          name: 'Bolsos Wayuu',
          description: 'Tejidos a mano con arte indígena',
          url: '/bolsos',
        },
      ],
    }
    render(<CategoryGridBlock {...props} />)
    expect(screen.getByText('Bolsos Wayuu')).toBeTruthy()
    expect(screen.getByText('Tejidos a mano con arte indígena')).toBeTruthy()
  })
})
