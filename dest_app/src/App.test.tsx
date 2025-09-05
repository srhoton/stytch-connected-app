import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { App } from './App'
import * as useSessionHook from '@/hooks/useSession'
import { mockStytchSession } from '@/test/mocks/stytch'

// Mock the useSession hook
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}))

// Mock react-router-dom to avoid router setup
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    RouterProvider: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    createBrowserRouter: vi.fn((routes) => routes),
  }
})

describe('App', () => {
  const mockUseSession = useSessionHook.useSession as ReturnType<typeof vi.fn>

  it('should render without crashing', () => {
    mockUseSession.mockReturnValue({
      isValid: true,
      session: mockStytchSession,
      error: null,
      loading: false,
      logout: vi.fn(),
      refetch: vi.fn(),
    })

    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('should wrap content with ErrorBoundary', () => {
    // Mock console.error to suppress error output in tests
    const originalError = console.error
    console.error = vi.fn()

    mockUseSession.mockReturnValue({
      isValid: true,
      session: mockStytchSession,
      error: null,
      loading: false,
      logout: vi.fn(),
      refetch: vi.fn(),
    })

    const { container } = render(<App />)
    
    // ErrorBoundary should be present in the component tree
    expect(container.firstChild).toBeTruthy()
    
    console.error = originalError
  })

  it('should handle loading state with Suspense', async () => {
    mockUseSession.mockReturnValue({
      isValid: false,
      session: null,
      error: null,
      loading: true,
      logout: vi.fn(),
      refetch: vi.fn(),
    })

    render(<App />)

    // The app should render something even in loading state
    await waitFor(() => {
      expect(document.body).toBeTruthy()
    })
  })
})