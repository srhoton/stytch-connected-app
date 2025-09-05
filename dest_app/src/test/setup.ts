import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

// Mock import.meta.env
vi.mock('import.meta.env', () => ({
  VITE_STYTCH_PROJECT_ID: 'test-project-id',
  VITE_STYTCH_PUBLIC_TOKEN: 'test-public-token',
  VITE_STYTCH_COOKIE_DOMAIN: 'localhost',
  VITE_IDP_APP_URL: 'http://localhost:3001',
}))

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    hostname: 'localhost',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
})

// Suppress console errors during tests unless explicitly needed
const originalError = console.error
beforeAll(() => {
  console.error = vi.fn()
})

afterAll(() => {
  console.error = originalError
})