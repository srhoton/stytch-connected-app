import { vi } from 'vitest'
import type { StytchSession } from '@/types/stytch'

export const mockStytchSession: StytchSession = {
  member_session_id: 'test-session-id',
  member_id: 'test-member-id',
  organization_id: 'test-org-id',
  started_at: '2024-01-01T00:00:00Z',
  last_accessed_at: '2024-01-01T00:00:00Z',
  expires_at: '2024-01-02T00:00:00Z',
  authentication_factors: [],
  custom_claims: {},
}

export const mockStytchClient = {
  session: {
    getTokens: vi.fn(),
    authenticate: vi.fn(),
    getSync: vi.fn(),
    revoke: vi.fn(),
  },
}

export const createMockStytchB2BUIClient = vi.fn(() => mockStytchClient)