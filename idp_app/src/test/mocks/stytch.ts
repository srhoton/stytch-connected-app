import { vi } from 'vitest'
import type { StytchSession, AuthError } from '@/types'

export const mockStytchSession: StytchSession = {
  member_session_id: 'test-session-id',
  member_id: 'test-member-id',
  organization_id: 'test-org-id',
  started_at: '2024-01-01T00:00:00Z',
  last_accessed_at: '2024-01-01T00:00:00Z',
  expires_at: '2024-01-02T00:00:00Z',
  authentication_factors: [],
  custom_claims: {},
  session_token: 'test-session-token',
  session_jwt: 'test-session-jwt',
  member: {
    member_id: 'test-member-id',
    email_address: 'test@example.com',
    name: 'Test User',
    organization_id: 'test-org-id',
  },
  organization: {
    organization_id: 'test-org-id',
    organization_name: 'Test Organization',
    organization_slug: 'test-org',
  },
  status_code: 200,
}

export const mockAuthError: AuthError = {
  status_code: 401,
  error_type: 'invalid_credentials',
  error_message: 'Invalid credentials',
}

export const mockStytchClient = {
  session: {
    getTokens: vi.fn(),
    authenticate: vi.fn(),
    getSync: vi.fn(),
    revoke: vi.fn(),
  },
  passwords: {
    authenticate: vi.fn(),
    resetByEmailStart: vi.fn(),
    resetByEmail: vi.fn(),
  },
}

export const createMockStytchB2BUIClient = vi.fn(() => mockStytchClient)

// Mock React hooks
export const mockUseStytchB2BClient = vi.fn(() => mockStytchClient)
export const mockUseStytchMemberSession = vi.fn(() => ({ 
  session: null,
  isLoading: false,
}))

// Setup mocks for @stytch packages
vi.mock('@stytch/vanilla-js/b2b', () => ({
  StytchB2BUIClient: createMockStytchB2BUIClient,
}))

vi.mock('@stytch/react/b2b', () => ({
  StytchB2BProvider: ({ children }: { children: React.ReactNode }) => children,
  useStytchB2BClient: mockUseStytchB2BClient,
  useStytchMemberSession: mockUseStytchMemberSession,
}))