import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

// Set up import.meta.env for tests
Object.assign(import.meta.env, {
  VITE_STYTCH_PROJECT_ID: 'project-test-636d0918-b73a-42a1-8677-ccb760c87944',
  VITE_STYTCH_PUBLIC_TOKEN: 'public-token-test-eb26150c-bc05-4980-a56a-627263e2a433',
  VITE_STYTCH_COOKIE_DOMAIN: 'localhost',
  VITE_DEFAULT_REDIRECT_URL: 'http://localhost:3000',
  VITE_ALLOWED_REDIRECT_DOMAINS: 'localhost:3000,localhost:3001,app.example.com',
  MODE: 'test',
  DEV: false,
  TEST: true,
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3001',
    hostname: 'localhost',
    host: 'localhost:3001',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'http://localhost:3001',
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
})

// Mock crypto for CSRF token generation
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    }),
  },
})

// Suppress console errors during tests unless explicitly needed
/* eslint-disable no-console */
const originalError = console.error
const originalLog = console.log
beforeAll(() => {
  console.error = vi.fn()
  console.log = vi.fn()
})

afterAll(() => {
  console.error = originalError
  console.log = originalLog
})
/* eslint-enable no-console */