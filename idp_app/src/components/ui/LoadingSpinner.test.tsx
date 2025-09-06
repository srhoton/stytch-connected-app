import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-6', 'w-6'); // Default is 'md'
  });

  it('should apply size classes correctly', () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    
    let spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('h-4', 'w-4');
    
    rerender(<LoadingSpinner size="md" />);
    spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('h-6', 'w-6');
    
    rerender(<LoadingSpinner size="lg" />);
    spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="text-red-500" />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('text-red-500');
    expect(spinner).toHaveClass('loading-spinner'); // Should still have default classes
  });

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    
    // Should have screen reader text
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  it('should combine size and className props', () => {
    const { container } = render(
      <LoadingSpinner size="lg" className="text-blue-600" />
    );
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('h-8', 'w-8', 'text-blue-600', 'loading-spinner');
  });

  it('should have proper ARIA attributes', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});