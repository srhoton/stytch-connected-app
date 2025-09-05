import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProtectedRoute } from './ProtectedRoute'
import * as useSessionHook from '@/hooks/useSession'
import { mockStytchSession } from '@/test/mocks/stytch'
import userEvent from '@testing-library/user-event'

// Mock the useSession hook
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}))

// Mock window.location.href setter
const mockLocationHref = vi.fn()
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    href: 'http://localhost:3000',
    hostname: 'localhost',
  },
  writable: true,
})

describe('ProtectedRoute', () => {
  const mockUseSession = useSessionHook.useSession as ReturnType<typeof vi.fn>
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocationHref.mockClear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      isValid: false,
      session: null,
      error: null,
      loading: true,
      logout: vi.fn(),
      refetch: mockRefetch,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Checking session...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render children when session is valid', () => {
    mockUseSession.mockReturnValue({
      isValid: true,
      session: mockStytchSession,
      error: null,
      loading: false,
      logout: vi.fn(),
      refetch: mockRefetch,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should redirect to IDP app when session is invalid and not loading', async () => {
    const originalHref = window.location.href
    let hrefValue = originalHref
    
    Object.defineProperty(window, 'location', {
      value: {
        href: hrefValue,
        hostname: 'localhost',
        pathname: '/',
      },
      writable: true,
    })
    
    // Spy on href setter
    const hrefSetter = vi.fn((value: string) => {
      hrefValue = value
    })
    
    Object.defineProperty(window.location, 'href', {
      get: () => hrefValue,
      set: hrefSetter,
    })

    mockUseSession.mockReturnValue({
      isValid: false,
      session: null,
      error: null,
      loading: false,
      logout: vi.fn(),
      refetch: mockRefetch,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Fast-forward the 500ms timeout
    await vi.runAllTimersAsync()

    await waitFor(() => {
      expect(hrefSetter).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3001?return_url=')
      )
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should not redirect when there is an error', () => {
    const hrefSetter = vi.fn()
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
    })

    mockUseSession.mockReturnValue({
      isValid: false,
      session: null,
      error: 'Session validation failed',
      loading: false,
      logout: vi.fn(),
      refetch: mockRefetch,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    vi.runAllTimers()

    expect(hrefSetter).not.toHaveBeenCalled()
    expect(screen.getByText('Session Validation Failed')).toBeInTheDocument()
    expect(screen.getByText('Session validation failed')).toBeInTheDocument()
  })

  it('should show error state with retry button when validation fails', async () => {
    const user = userEvent.setup({ delay: null })
    mockRefetch.mockResolvedValue(undefined)

    mockUseSession.mockReturnValue({
      isValid: false,
      session: null,
      error: 'Network error',
      loading: false,
      logout: vi.fn(),
      refetch: mockRefetch,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    const retryButton = screen.getByRole('button', { name: 'Retry' })
    expect(retryButton).toBeInTheDocument()

    await user.click(retryButton)

    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('should show redirecting message when not valid and no error after loading', () => {
    mockUseSession.mockReturnValue({
      isValid: false,
      session: null,
      error: null,
      loading: false,
      logout: vi.fn(),
      refetch: mockRefetch,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Redirecting to login...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should encode the current URL in the return_url parameter', async () => {
    const currentUrl = 'http://localhost:3000/some/path?query=param'
    let hrefValue = currentUrl
    const hrefSetter = vi.fn((value: string) => {
      hrefValue = value
    })

    Object.defineProperty(window, 'location', {
      value: {
        href: currentUrl,
        hostname: 'localhost',
        pathname: '/some/path',
        search: '?query=param',
      },
      writable: true,
    })

    Object.defineProperty(window.location, 'href', {
      get: () => hrefValue,
      set: hrefSetter,
    })

    mockUseSession.mockReturnValue({
      isValid: false,
      session: null,
      error: null,
      loading: false,
      logout: vi.fn(),
      refetch: mockRefetch,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await vi.runAllTimersAsync()

    await waitFor(() => {
      expect(hrefSetter).toHaveBeenCalledWith(
        `http://localhost:3001?return_url=${encodeURIComponent(currentUrl)}`
      )
    })
  })

  it('should clear redirect timeout on unmount', () => {
    mockUseSession.mockReturnValue({
      isValid: false,
      session: null,
      error: null,
      loading: false,
      logout: vi.fn(),
      refetch: mockRefetch,
    })

    const { unmount } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    unmount()

    // Run all timers - should not cause any redirects since component unmounted
    const hrefSetter = vi.fn()
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
    })

    vi.runAllTimers()

    expect(hrefSetter).not.toHaveBeenCalled()
  })
})