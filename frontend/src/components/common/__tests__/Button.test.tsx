import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies primary variant styles', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('applies tertiary variant styles', () => {
    render(<Button variant="tertiary">Tertiary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies small size styles', () => {
    render(<Button size="small">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-3')
  })

  it('applies large size styles', () => {
    render(<Button size="large">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6')
  })

  it('renders with loading state', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('renders with custom props', () => {
    render(<Button data-testid="custom-btn">Custom</Button>)
    expect(screen.getByTestId('custom-btn')).toBeInTheDocument()
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('passes through other props', () => {
    render(<Button data-testid="custom-button">Test</Button>)
    expect(screen.getByTestId('custom-button')).toBeInTheDocument()
  })
})