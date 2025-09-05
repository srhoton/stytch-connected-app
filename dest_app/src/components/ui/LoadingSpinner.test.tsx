import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('inline-block', 'animate-spin', 'rounded-full')
  })

  it('should apply size classes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-4', 'w-4')

    rerender(<LoadingSpinner size="md" />)
    spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-6', 'w-6')

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-8', 'w-8')
  })

  it('should apply additional className', () => {
    render(<LoadingSpinner className="custom-class" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-class')
    expect(spinner).toHaveClass('h-6', 'w-6') // default md size
  })

  it('should have accessible screen reader text', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toHaveClass('sr-only')
  })

  it('should combine size and custom className', () => {
    render(<LoadingSpinner size="lg" className="mt-4" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('h-8', 'w-8', 'mt-4')
  })
})