import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  mockStytchClient, 
  mockStytchSession,
  createMockStytchB2BUIClient 
} from '@/test/mocks/stytch'

// Mock the Stytch module before importing the service
vi.mock('@stytch/vanilla-js/b2b', () => ({
  StytchB2BUIClient: createMockStytchB2BUIClient,
}))

// Now import the service after mocking
import {
  initializeStytch,
  getStoredOrganization,
  storeOrganization,
  clearStoredOrganization,
  authenticateWithPassword,
  getCurrentSession,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
} from './stytch'

describe('Stytch Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    createMockStytchB2BUIClient.mockClear()
    createMockStytchB2BUIClient.mockImplementation(() => mockStytchClient)
  })

  describe('initializeStytch', () => {
    it('should initialize Stytch client with correct configuration', async () => {
      // Clear any previous singleton state by reloading the module
      vi.doUnmock('./stytch')
      const { initializeStytch: freshInitializeStytch } = await import('./stytch')
      
      const client = await freshInitializeStytch()
      expect(client).toBeDefined()
      expect(createMockStytchB2BUIClient).toHaveBeenCalledWith(
        'test-public-token',  // This comes from the env validation in test mode
        expect.objectContaining({
          cookieOptions: expect.objectContaining({
            domain: 'localhost',
            path: '/',
          }),
        })
      )
    })

    it('should return the same instance on multiple calls', async () => {
      // Since the singleton persists from the previous test, we need to test differently
      // We'll check that within this test context, multiple calls don't create new instances
      // const _callCountBefore = createMockStytchB2BUIClient.mock.calls.length
      
      const client1 = await initializeStytch()
      const callCountAfter1 = createMockStytchB2BUIClient.mock.calls.length
      
      const client2 = await initializeStytch()
      const callCountAfter2 = createMockStytchB2BUIClient.mock.calls.length
      
      expect(client1).toBe(client2)
      // Should not create new instance on second call
      expect(callCountAfter2 - callCountAfter1).toBe(0)
    })
  })

  describe('Organization Storage', () => {
    it('should store organization slug in localStorage', () => {
      const slug = 'test-org'
      storeOrganization(slug)
      expect(localStorage.getItem('stytch_organization_slug')).toBe(slug)
    })

    it('should retrieve stored organization slug', () => {
      const slug = 'test-org'
      localStorage.setItem('stytch_organization_slug', slug)
      expect(getStoredOrganization()).toBe(slug)
    })

    it('should clear stored organization slug', () => {
      localStorage.setItem('stytch_organization_slug', 'test-org')
      clearStoredOrganization()
      expect(localStorage.getItem('stytch_organization_slug')).toBeNull()
    })

    it('should return null when no organization is stored', () => {
      expect(getStoredOrganization()).toBeNull()
    })
  })

  describe('authenticateWithPassword', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should authenticate successfully with stored organization', async () => {
      storeOrganization('test-org')
      mockStytchClient.passwords.authenticate.mockResolvedValue({
        ...mockStytchSession,
        status_code: 200,
        session_token: 'test-token',
      })

      const result = await authenticateWithPassword(credentials)

      expect(mockStytchClient.passwords.authenticate).toHaveBeenCalledWith({
        email_address: credentials.email,
        password: credentials.password,
        organization_id: 'test-org',
        session_duration_minutes: 60,
      })
      expect(result).toBeDefined()
      expect(getStoredOrganization()).toBe('test-org')
    })

    it('should authenticate with provided organization slug', async () => {
      mockStytchClient.passwords.authenticate.mockResolvedValue({
        ...mockStytchSession,
        status_code: 200,
        session_token: 'test-token',
      })

      const result = await authenticateWithPassword(credentials, 'provided-org')

      expect(mockStytchClient.passwords.authenticate).toHaveBeenCalledWith(
        expect.objectContaining({
          organization_id: 'provided-org',
        })
      )
      expect(result).toBeDefined()
      expect(getStoredOrganization()).toBe('provided-org')
    })

    it('should throw error when no organization is available', async () => {
      await expect(authenticateWithPassword(credentials)).rejects.toThrow(
        'An unexpected error occurred during authentication.'
      )
    })

    it('should handle invalid credentials error', async () => {
      storeOrganization('test-org')
      mockStytchClient.passwords.authenticate.mockRejectedValue({
        error_type: 'invalid_credentials',
        error_message: 'Invalid credentials',
      })

      await expect(authenticateWithPassword(credentials)).rejects.toThrow(
        'Invalid email or password'
      )
    })

    it('should clear stored organization on organization_not_found error', async () => {
      storeOrganization('invalid-org')
      mockStytchClient.passwords.authenticate.mockRejectedValue({
        error_type: 'organization_not_found',
        error_message: 'Organization not found',
      })

      await expect(authenticateWithPassword(credentials)).rejects.toThrow(
        'Organization not found'
      )
      expect(getStoredOrganization()).toBeNull()
    })
  })

  describe('getCurrentSession', () => {
    it('should return current session when valid', async () => {
      mockStytchClient.session.getSync.mockReturnValue('test-session-token')
      mockStytchClient.session.authenticate.mockResolvedValue({
        ...mockStytchSession,
        status_code: 200,
      })

      const session = await getCurrentSession()

      expect(session).toBeDefined()
      expect(mockStytchClient.session.authenticate).toHaveBeenCalledWith({
        session_duration_minutes: 60,
      })
    })

    it('should return null when no session token exists', async () => {
      mockStytchClient.session.getSync.mockReturnValue(null)

      const session = await getCurrentSession()

      expect(session).toBeNull()
      expect(mockStytchClient.session.authenticate).not.toHaveBeenCalled()
    })

    it('should return null when session validation fails', async () => {
      mockStytchClient.session.getSync.mockReturnValue('test-session-token')
      mockStytchClient.session.authenticate.mockResolvedValue({
        status_code: 401,
      })

      const session = await getCurrentSession()

      expect(session).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      mockStytchClient.session.getSync.mockImplementation(() => {
        throw new Error('Session error')
      })

      const session = await getCurrentSession()

      expect(session).toBeNull()
    })
  })

  describe('logout', () => {
    it('should revoke session successfully', async () => {
      mockStytchClient.session.revoke.mockResolvedValue(undefined)

      await logout()

      expect(mockStytchClient.session.revoke).toHaveBeenCalled()
    })

    it('should handle revoke errors gracefully', async () => {
      mockStytchClient.session.revoke.mockRejectedValue(new Error('Revoke failed'))

      // Should not throw
      await expect(logout()).resolves.toBeUndefined()
    })
  })

  describe('requestPasswordReset', () => {
    const request = { email: 'test@example.com' }

    it('should send password reset email successfully', async () => {
      storeOrganization('test-org')
      mockStytchClient.passwords.resetByEmailStart.mockResolvedValue({
        status_code: 200,
      })

      await requestPasswordReset(request)

      expect(mockStytchClient.passwords.resetByEmailStart).toHaveBeenCalledWith({
        email_address: request.email,
        organization_id: 'test-org',
        reset_password_redirect_url: 'http://localhost:3001/reset-password',
        reset_password_expiration_minutes: 60,
      })
    })

    it('should throw error when no organization is stored', async () => {
      await expect(requestPasswordReset(request)).rejects.toThrow(
        'Failed to send password reset email. Please try again.'
      )
    })

    it('should handle member not found error', async () => {
      storeOrganization('test-org')
      mockStytchClient.passwords.resetByEmailStart.mockRejectedValue({
        error_type: 'member_not_found',
        error_message: 'Member not found',
      })

      await expect(requestPasswordReset(request)).rejects.toThrow(
        'No account found with this email address'
      )
    })
  })

  describe('confirmPasswordReset', () => {
    const confirm = {
      token: 'reset-token',
      password: 'newPassword123',
    }

    it('should reset password successfully', async () => {
      mockStytchClient.passwords.resetByEmail.mockResolvedValue({
        ...mockStytchSession,
        status_code: 200,
      })

      const result = await confirmPasswordReset(confirm)

      expect(mockStytchClient.passwords.resetByEmail).toHaveBeenCalledWith({
        password_reset_token: confirm.token,
        password: confirm.password,
        session_duration_minutes: 60,
      })
      expect(result).toBeDefined()
    })

    it('should handle invalid reset token', async () => {
      mockStytchClient.passwords.resetByEmail.mockRejectedValue({
        error_type: 'reset_token_invalid',
        error_message: 'Invalid token',
      })

      await expect(confirmPasswordReset(confirm)).rejects.toThrow(
        'Invalid or expired reset token'
      )
    })

    it('should handle weak password error', async () => {
      mockStytchClient.passwords.resetByEmail.mockRejectedValue({
        error_type: 'password_too_weak',
        error_message: 'Password too weak',
      })

      await expect(confirmPasswordReset(confirm)).rejects.toThrow(
        'Password is too weak'
      )
    })
  })
})