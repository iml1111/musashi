import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../Badge'

describe('Badge', () => {
  it('renders badge with text', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies default variant styles', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('applies success variant styles', () => {
    render(<Badge variant="success">Success</Badge>)
    const badge = screen.getByText('Success')
    expect(badge).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Warning</Badge>)
    const badge = screen.getByText('Warning')
    expect(badge).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('applies danger variant styles', () => {
    render(<Badge variant="danger">Danger</Badge>)
    const badge = screen.getByText('Danger')
    expect(badge).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('applies primary variant styles', () => {
    render(<Badge variant="primary">Primary</Badge>)
    const badge = screen.getByText('Primary')
    expect(badge).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('applies small size styles', () => {
    render(<Badge size="small">Small</Badge>)
    const badge = screen.getByText('Small')
    expect(badge).toHaveClass('text-xs')
  })

  it('applies medium size styles', () => {
    render(<Badge size="medium">Medium</Badge>)
    const badge = screen.getByText('Medium')
    expect(badge).toHaveClass('text-sm')
  })

  it('applies large size styles', () => {
    render(<Badge size="large">Large</Badge>)
    const badge = screen.getByText('Large')
    expect(badge).toHaveClass('text-base')
  })

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    const badge = screen.getByText('Secondary')
    expect(badge).toHaveStyle({ backgroundColor: expect.any(String) })
  })

  it('renders badge with rounded corners', () => {
    render(<Badge>Rounded Badge</Badge>)
    const badge = screen.getByText('Rounded Badge')
    expect(badge).toHaveClass('rounded-full')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })

  it('renders with multiple children', () => {
    render(<Badge><span>Multiple</span> <span>Children</span></Badge>)
    expect(screen.getByText('Multiple')).toBeInTheDocument()
    expect(screen.getByText('Children')).toBeInTheDocument()
  })

  it('combines multiple props correctly', () => {
    render(
      <Badge
        variant="success"
        size="large"
        className="custom"
      >
        Complex Badge
      </Badge>
    )
    const badge = screen.getByText('Complex Badge')
    expect(badge).toHaveClass('text-base', 'custom')
    expect(badge).toHaveStyle({ backgroundColor: expect.any(String) })
  })
})