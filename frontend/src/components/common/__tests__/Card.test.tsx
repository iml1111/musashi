import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Card from '../Card'

describe('Card', () => {
  it('renders children content', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    )
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  it('applies default variant styles', () => {
    render(<Card>Default Card</Card>)
    const card = screen.getByText('Default Card').parentElement
    expect(card).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('applies outlined variant styles', () => {
    render(<Card variant="outlined">Outlined Card</Card>)
    const card = screen.getByText('Outlined Card').parentElement
    expect(card).toHaveStyle({ border: expect.any(String) })
  })

  it('applies elevated variant styles', () => {
    render(<Card variant="elevated" data-testid="elevated-card">Elevated Card</Card>)
    const card = screen.getByTestId('elevated-card')
    expect(card.style.boxShadow).toBeTruthy()
  })

  it('applies small padding', () => {
    render(<Card padding="small" data-testid="small-card">Small Card</Card>)
    const card = screen.getByTestId('small-card')
    expect(card).toHaveClass('p-4')
  })

  it('applies medium padding', () => {
    render(<Card padding="medium" data-testid="medium-card">Medium Card</Card>)
    const card = screen.getByTestId('medium-card')
    expect(card).toHaveClass('p-6')
  })

  it('applies large padding', () => {
    render(<Card padding="large" data-testid="large-card">Large Card</Card>)
    const card = screen.getByTestId('large-card')
    expect(card).toHaveClass('p-8')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(
      <Card onClick={handleClick} data-testid="clickable-card">
        Clickable Card
      </Card>
    )
    
    const card = screen.getByTestId('clickable-card')
    fireEvent.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies hover styles when hover prop is true', () => {
    render(<Card hover data-testid="hover-card">Hover Card</Card>)
    const card = screen.getByTestId('hover-card')
    expect(card).toHaveClass('hover:shadow-lg')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class" data-testid="custom-card">Custom Card</Card>)
    const card = screen.getByTestId('custom-card')
    expect(card).toHaveClass('custom-class')
  })

  it('renders with image', () => {
    render(
      <Card image="test.jpg" imageAlt="Test image">
        <div>Card Body</div>
      </Card>
    )
    const image = screen.getByAltText('Test image')
    expect(image).toBeInTheDocument()
    expect(screen.getByText('Card Body')).toBeInTheDocument()
  })

  it('renders with none padding', () => {
    render(
      <Card padding="none">
        <div>Card Body</div>
      </Card>
    )
    const card = screen.getByText('Card Body').parentElement
    expect(card).not.toHaveClass('p-4', 'p-6', 'p-8')
  })

  it('combines multiple props correctly', () => {
    render(
      <Card
        variant="elevated"
        padding="small"
        hover
        className="custom"
        data-testid="complex-card"
      >
        Complex Card
      </Card>
    )
    const card = screen.getByTestId('complex-card')
    expect(card).toHaveClass('p-4', 'hover:shadow-lg', 'custom')
    expect(card.style.boxShadow).toBeTruthy()
  })
})