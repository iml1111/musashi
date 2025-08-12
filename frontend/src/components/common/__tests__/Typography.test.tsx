import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Typography from '../Typography'

describe('Typography', () => {
  it('renders h1 variant correctly', () => {
    render(<Typography variant="h1">Heading 1</Typography>)
    const element = screen.getByText('Heading 1')
    expect(element.tagName).toBe('H1')
    expect(element).toHaveStyle({ fontSize: expect.any(String) })
  })

  it('renders h2 variant correctly', () => {
    render(<Typography variant="h2">Heading 2</Typography>)
    const element = screen.getByText('Heading 2')
    expect(element.tagName).toBe('H2')
    expect(element).toHaveStyle({ fontSize: expect.any(String) })
  })

  it('renders h3 variant correctly', () => {
    render(<Typography variant="h3">Heading 3</Typography>)
    const element = screen.getByText('Heading 3')
    expect(element.tagName).toBe('H3')
    expect(element).toHaveStyle({ fontSize: expect.any(String) })
  })

  it('renders h4 variant correctly', () => {
    render(<Typography variant="h4">Heading 4</Typography>)
    const element = screen.getByText('Heading 4')
    expect(element.tagName).toBe('H4')
    expect(element).toHaveStyle({ fontSize: expect.any(String) })
  })

  it('renders body variant correctly', () => {
    render(<Typography variant="body">Body text</Typography>)
    const element = screen.getByText('Body text')
    expect(element.tagName).toBe('P')
    expect(element).toHaveStyle({ fontSize: expect.any(String) })
  })

  it('renders small variant correctly', () => {
    render(<Typography variant="small">Small text</Typography>)
    const element = screen.getByText('Small text')
    expect(element.tagName).toBe('SPAN')
    expect(element).toHaveStyle({ fontSize: expect.any(String) })
  })

  it('applies primary color', () => {
    render(<Typography color="primary">Primary</Typography>)
    const element = screen.getByText('Primary')
    expect(element.style.color).toBeTruthy()
  })

  it('applies medium color', () => {
    render(<Typography color="medium">Medium</Typography>)
    const element = screen.getByText('Medium')
    expect(element.style.color).toBeTruthy()
  })

  it('applies light color', () => {
    render(<Typography color="light">Light</Typography>)
    const element = screen.getByText('Light')
    expect(element.style.color).toBeTruthy()
  })

  it('applies custom className', () => {
    render(<Typography className="custom-class">Custom</Typography>)
    const element = screen.getByText('Custom')
    expect(element).toHaveClass('custom-class')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Typography variant="h1">Heading 1</Typography>)
    expect(screen.getByText('Heading 1')).toBeInTheDocument()
    
    rerender(<Typography variant="body">Body Text</Typography>)
    expect(screen.getByText('Body Text')).toBeInTheDocument()
    
    rerender(<Typography variant="small">Small Text</Typography>)
    expect(screen.getByText('Small Text')).toBeInTheDocument()
  })

  it('handles weight prop', () => {
    const { rerender } = render(<Typography weight="bold">Bold</Typography>)
    expect(screen.getByText('Bold')).toHaveStyle({ fontWeight: expect.any(String) })
    
    rerender(<Typography weight="medium">Medium</Typography>)
    expect(screen.getByText('Medium')).toHaveStyle({ fontWeight: expect.any(String) })
    
    rerender(<Typography weight="regular">Regular</Typography>)
    expect(screen.getByText('Regular')).toHaveStyle({ fontWeight: expect.any(String) })
  })
})