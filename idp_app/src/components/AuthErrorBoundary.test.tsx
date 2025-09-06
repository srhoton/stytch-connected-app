import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthErrorBoundary } from './AuthErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Component that throws a Stytch-specific error
const ThrowStytchError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Stytch authentication failed');
  }
  return <div>No error</div>;
};

describe('AuthErrorBoundary', () => {
  // Suppress console.error for these tests since we're testing error handling
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <AuthErrorBoundary>
        <div>Test content</div>
      </AuthErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should display error UI when a generic error is thrown', () => {
    render(
      <AuthErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AuthErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear session/i })).toBeInTheDocument();
  });

  it('should display authentication-specific message for Stytch errors', () => {
    render(
      <AuthErrorBoundary>
        <ThrowStytchError shouldThrow={true} />
      </AuthErrorBoundary>
    );

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an issue with the authentication service/)).toBeInTheDocument();
  });

  it('should show debug info in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV;
    vi.stubEnv('DEV', 'true');

    render(
      <AuthErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AuthErrorBoundary>
    );

    expect(screen.getByText('Debug Info:')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    // Restore original env
    vi.stubEnv('DEV', String(originalEnv));
  });

  it('should reset error boundary when Try Again is clicked', () => {
    // Mock window.location.reload
    const reloadSpy = vi.fn();
    Object.defineProperty(window.location, 'reload', {
      value: reloadSpy,
      writable: true,
    });

    render(
      <AuthErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AuthErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click Try Again - this triggers a reload in the component
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Verify reload was called
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should clear session storage when Clear Session & Reload is clicked', () => {
    const clearSpy = vi.spyOn(Storage.prototype, 'clear');
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    render(
      <AuthErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AuthErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /clear session/i }));

    expect(clearSpy).toHaveBeenCalled();
    expect(removeItemSpy).toHaveBeenCalledWith('stytch_organization_slug');
    expect(window.location.href).toBe('/');

    clearSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  it('should call onError callback when provided', () => {
    const onError = vi.fn();

    render(
      <AuthErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </AuthErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(
      <AuthErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AuthErrorBoundary>
    );

    // Check for SVG accessibility
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');

    // Check buttons are accessible
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear session/i })).toBeInTheDocument();
  });
});