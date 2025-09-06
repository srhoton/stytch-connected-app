import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionDisplay } from './SessionDisplay';
import type { StytchSession } from '@/types';

const mockSession: StytchSession = {
  session_token: 'test-token',
  session_jwt: 'test-jwt',
  session: {
    session_id: 'session-123',
    member_id: 'member-123',
    organization_id: 'org-123',
    started_at: '2024-01-01T10:00:00Z',
    last_accessed_at: '2024-01-01T10:30:00Z',
    expires_at: '2024-01-01T11:00:00Z',
    authentication_factors: [
      {
        type: 'password',
        delivery_method: 'email',
        last_authenticated_at: '2024-01-01T10:00:00Z',
      },
    ],
  },
  member: {
    member_id: 'member-123',
    email_address: 'test@example.com',
    name: 'Test User',
    organization_id: 'org-123',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_admin: false,
  },
  organization: {
    organization_id: 'org-123',
    organization_name: 'Test Organization',
    organization_slug: 'test-org',
  },
};

describe('SessionDisplay', () => {
  it('should render session information', () => {
    const onLogout = vi.fn();
    render(<SessionDisplay session={mockSession} onLogout={onLogout} />);

    // Check if success message is displayed
    expect(screen.getByText('Successfully Authenticated')).toBeInTheDocument();
    expect(screen.getByText('You are now logged in to your account.')).toBeInTheDocument();

    // Check if user information is displayed
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    
    expect(screen.getByText('Organization:')).toBeInTheDocument();
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('should display session expiry time', () => {
    const onLogout = vi.fn();
    render(<SessionDisplay session={mockSession} onLogout={onLogout} />);

    expect(screen.getByText('Session Expires:')).toBeInTheDocument();
    // Check that the expiry date is displayed using the specific test id
    const expiryElement = screen.getByTestId('session-expires');
    expect(expiryElement).toBeInTheDocument();
    expect(expiryElement.textContent).toContain('2024');
  });

  it('should call onLogout when logout button is clicked', () => {
    const onLogout = vi.fn();
    render(<SessionDisplay session={mockSession} onLogout={onLogout} />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('should disable logout button when isLoading is true', () => {
    const onLogout = vi.fn();
    render(<SessionDisplay session={mockSession} onLogout={onLogout} isLoading={true} />);

    const logoutButton = screen.getByRole('button', { name: /logging out/i });
    expect(logoutButton).toBeDisabled();
  });

  it('should display admin badge when user is admin', () => {
    const adminSession = {
      ...mockSession,
      member: {
        ...mockSession.member,
        is_admin: true,
      } as StytchSession['member'],
    };

    const onLogout = vi.fn();
    render(<SessionDisplay session={adminSession} onLogout={onLogout} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalSession: StytchSession = {
      session_token: 'test-token',
      member: {
        member_id: 'member-123',
        email_address: 'test@example.com',
        name: '',
        organization_id: 'org-123',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        is_admin: false,
      },
    };

    const onLogout = vi.fn();
    render(<SessionDisplay session={minimalSession} onLogout={onLogout} />);

    // Should still render without crashing
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const onLogout = vi.fn();
    const { container } = render(<SessionDisplay session={mockSession} onLogout={onLogout} />);

    // Check for semantic HTML
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();

    // Check for button accessibility
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toHaveAttribute('type', 'button');
  });
});