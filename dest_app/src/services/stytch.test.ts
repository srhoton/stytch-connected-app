import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockStytchClient, mockStytchSession, createMockStytchB2BUIClient } from '@/test/mocks/stytch'

// Mock the Stytch module before importing the service
vi.mock('@stytch/vanilla-js/b2b', () => ({
  StytchB2BUIClient: createMockStytchB2BUIClient,
}))

// Now import the service after mocking
import { initializeStytch, validateSession, getSessionInfo, clearSession } from './stytch'

describe('Stytch Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock return values
    createMockStytchB2BUIClient.mockClear()
    createMockStytchB2BUIClient.mockImplementation(() => mockStytchClient)
  })

  describe('initializeStytch', () => {
    it('should initialize Stytch client with correct configuration', async () => {
      const client = await initializeStytch()
      expect(client).toBeDefined()
      expect(client).toBe(mockStytchClient)
    })

    it('should return the same instance on multiple calls', async () => {
      const client1 = await initializeStytch()
      const client2 = await initializeStytch()
      expect(client1).toBe(client2)
    })
  })

  describe('validateSession', () => {
    it('should return valid session when tokens exist and authentication succeeds', async () => {
      mockStytchClient.session.getTokens.mockReturnValue({
        session_jwt: 'test-jwt',
        session_token: 'test-token',
      })
      mockStytchClient.session.authenticate.mockResolvedValue({
        member_session: mockStytchSession,
      })

      const result = await validateSession()

      expect(result.isValid).toBe(true)
      expect(result.session).toEqual(mockStytchSession)
      expect(result.error).toBeNull()
      expect(result.loading).toBe(false)
    })

    it('should return invalid session when no tokens exist', async () => {
      mockStytchClient.session.getTokens.mockReturnValue({
        session_jwt: null,
        session_token: null,
      })

      const result = await validateSession()

      expect(result.isValid).toBe(false)
      expect(result.session).toBeNull()
      expect(result.error).toBeNull()
      expect(result.loading).toBe(false)
      expect(mockStytchClient.session.authenticate).not.toHaveBeenCalled()
    })

    it('should return invalid session when authentication fails with 401', async () => {
      mockStytchClient.session.getTokens.mockReturnValue({
        session_jwt: 'test-jwt',
        session_token: 'test-token',
      })
      mockStytchClient.session.authenticate.mockRejectedValue({
        status_code: 401,
        error_type: 'unauthorized',
        error_message: 'Unauthorized',
      })

      const result = await validateSession()

      expect(result.isValid).toBe(false)
      expect(result.session).toBeNull()
      expect(result.error).toBeNull()
      expect(result.loading).toBe(false)
    })

    it('should return error for non-401 authentication failures', async () => {
      mockStytchClient.session.getTokens.mockReturnValue({
        session_jwt: 'test-jwt',
        session_token: 'test-token',
      })
      const errorMessage = 'Network error'
      mockStytchClient.session.authenticate.mockRejectedValue({
        status_code: 500,
        error_type: 'internal_server_error',
        error_message: errorMessage,
      })

      const result = await validateSession()

      expect(result.isValid).toBe(false)
      expect(result.session).toBeNull()
      expect(result.error).toBe(errorMessage)
      expect(result.loading).toBe(false)
    })

    it('should handle authentication response without member_session', async () => {
      mockStytchClient.session.getTokens.mockReturnValue({
        session_jwt: 'test-jwt',
        session_token: 'test-token',
      })
      const sessionDataWithSessionProp = {
        session: mockStytchSession,
      }
      mockStytchClient.session.authenticate.mockResolvedValue(sessionDataWithSessionProp)

      const result = await validateSession()

      expect(result.isValid).toBe(true)
      // When there's no member_session, it returns sessionData itself
      expect(result.session).toEqual(sessionDataWithSessionProp)
      expect(result.error).toBeNull()
      expect(result.loading).toBe(false)
    })

    it('should handle null authentication response', async () => {
      mockStytchClient.session.getTokens.mockReturnValue({
        session_jwt: 'test-jwt',
        session_token: 'test-token',
      })
      mockStytchClient.session.authenticate.mockResolvedValue(null)

      const result = await validateSession()

      expect(result.isValid).toBe(false)
      expect(result.session).toBeNull()
      expect(result.error).toBeNull()
      expect(result.loading).toBe(false)
    })

    it('should handle general errors during validation', async () => {
      mockStytchClient.session.getTokens.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await validateSession()

      expect(result.isValid).toBe(false)
      expect(result.session).toBeNull()
      // The service may fall back to 'Failed to validate session' if message is not available
      expect(result.error).toBeTruthy()
      expect(result.loading).toBe(false)
    })
  })

  describe('getSessionInfo', () => {
    it('should return session info when session exists', async () => {
      const sessionInfo = 'test-session-info'
      mockStytchClient.session.getSync.mockReturnValue(sessionInfo)

      const result = await getSessionInfo()

      expect(result).toBe(sessionInfo)
      expect(mockStytchClient.session.getSync).toHaveBeenCalled()
    })

    it('should return null when session does not exist', async () => {
      mockStytchClient.session.getSync.mockReturnValue(null)

      const result = await getSessionInfo()

      expect(result).toBeNull()
    })

    it('should return null and handle errors gracefully', async () => {
      mockStytchClient.session.getSync.mockImplementation(() => {
        throw new Error('Session error')
      })

      const result = await getSessionInfo()

      expect(result).toBeNull()
    })
  })

  describe('clearSession', () => {
    it('should revoke session successfully', async () => {
      mockStytchClient.session.revoke.mockResolvedValue(undefined)

      await clearSession()

      expect(mockStytchClient.session.revoke).toHaveBeenCalled()
    })

    it('should handle revoke errors gracefully', async () => {
      mockStytchClient.session.revoke.mockRejectedValue(new Error('Revoke failed'))

      // Should not throw
      await expect(clearSession()).resolves.toBeUndefined()
    })
  })
})