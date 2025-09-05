import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSession } from './useSession'
import * as stytchService from '@/services/stytch'
import { mockStytchSession } from '@/test/mocks/stytch'
import type { SessionValidationResult } from '@/types/stytch'

// Mock the stytch service
vi.mock('@/services/stytch', () => ({
  validateSession: vi.fn(),
}))

describe('useSession', () => {
  const mockValidateSession = stytchService.validateSession as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start with loading state', () => {
    mockValidateSession.mockResolvedValue({
      isValid: true,
      session: mockStytchSession,
      error: null,
      loading: false,
    })

    const { result } = renderHook(() => useSession())

    expect(result.current.loading).toBe(true)
    expect(result.current.isValid).toBe(false)
    expect(result.current.session).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should validate session on mount and update state with valid session', async () => {
    const validationResult: SessionValidationResult = {
      isValid: true,
      session: mockStytchSession,
      error: null,
      loading: false,
    }
    mockValidateSession.mockResolvedValue(validationResult)

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isValid).toBe(true)
    expect(result.current.session).toEqual(mockStytchSession)
    expect(result.current.error).toBeNull()
    expect(mockValidateSession).toHaveBeenCalledTimes(1)
  })

  it('should handle invalid session', async () => {
    const validationResult: SessionValidationResult = {
      isValid: false,
      session: null,
      error: null,
      loading: false,
    }
    mockValidateSession.mockResolvedValue(validationResult)

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isValid).toBe(false)
    expect(result.current.session).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should handle session validation error', async () => {
    const errorMessage = 'Session validation failed'
    const validationResult: SessionValidationResult = {
      isValid: false,
      session: null,
      error: errorMessage,
      loading: false,
    }
    mockValidateSession.mockResolvedValue(validationResult)

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isValid).toBe(false)
    expect(result.current.session).toBeNull()
    expect(result.current.error).toBe(errorMessage)
  })

  it('should handle validation service throwing an error', async () => {
    const error = new Error('Network error')
    mockValidateSession.mockRejectedValue(error)

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isValid).toBe(false)
    expect(result.current.session).toBeNull()
    expect(result.current.error).toBe(error.message)
  })

  it('should handle session validation errors gracefully', async () => {
    const errorMessage = 'Network failure'
    mockValidateSession.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isValid).toBe(false)
    expect(result.current.session).toBeNull()
    expect(result.current.error).toBe(errorMessage)
  })

  it('should provide refetch function to re-validate session', async () => {
    const initialResult: SessionValidationResult = {
      isValid: false,
      session: null,
      error: null,
      loading: false,
    }
    const updatedResult: SessionValidationResult = {
      isValid: true,
      session: mockStytchSession,
      error: null,
      loading: false,
    }

    mockValidateSession
      .mockResolvedValueOnce(initialResult)
      .mockResolvedValueOnce(updatedResult)

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isValid).toBe(false)
    expect(mockValidateSession).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.isValid).toBe(true)
    })

    expect(result.current.session).toEqual(mockStytchSession)
    expect(mockValidateSession).toHaveBeenCalledTimes(2)
  })

  it('should set loading state during refetch', async () => {
    const validationResult: SessionValidationResult = {
      isValid: true,
      session: mockStytchSession,
      error: null,
      loading: false,
    }
    
    let resolveValidation: (value: SessionValidationResult) => void
    const validationPromise = new Promise<SessionValidationResult>((resolve) => {
      resolveValidation = resolve
    })
    
    mockValidateSession
      .mockResolvedValueOnce(validationResult)
      .mockReturnValueOnce(validationPromise)

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      void result.current.refetch()
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveValidation!(validationResult)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})