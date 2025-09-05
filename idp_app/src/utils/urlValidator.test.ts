import { describe, it, expect, beforeEach } from 'vitest'
import { isValidRedirectUrl, generateCSRFToken, validateCSRFToken } from './urlValidator'

describe('urlValidator', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('isValidRedirectUrl', () => {
    it('should accept URLs from allowed domains', () => {
      expect(isValidRedirectUrl('http://localhost:3000/dashboard')).toBe(true)
      expect(isValidRedirectUrl('http://localhost:3001/profile')).toBe(true)
      expect(isValidRedirectUrl('https://app.example.com/settings')).toBe(true)
    })

    it('should reject URLs from non-allowed domains', () => {
      expect(isValidRedirectUrl('http://evil.com/phishing')).toBe(false)
      expect(isValidRedirectUrl('http://localhost:9999/hack')).toBe(false)
      expect(isValidRedirectUrl('https://malicious.example.com/steal')).toBe(false)
    })

    it('should reject javascript: and data: URLs', () => {
      expect(isValidRedirectUrl('javascript:alert("XSS")')).toBe(false)
      expect(isValidRedirectUrl('data:text/html,<script>alert("XSS")</script>')).toBe(false)
      expect(isValidRedirectUrl('javascript:void(0)')).toBe(false)
    })

    it('should handle relative URLs', () => {
      expect(isValidRedirectUrl('/dashboard')).toBe(true)
      expect(isValidRedirectUrl('/profile/settings')).toBe(true)
      expect(isValidRedirectUrl('../admin')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidRedirectUrl('not-a-url')).toBe(false)
      expect(isValidRedirectUrl('ftp://file-server.com')).toBe(false)
      expect(isValidRedirectUrl('file:///etc/passwd')).toBe(false)
    })

    it('should handle URLs with ports correctly', () => {
      expect(isValidRedirectUrl('http://localhost:3000/page')).toBe(true)
      expect(isValidRedirectUrl('http://localhost:3001/page')).toBe(true)
      expect(isValidRedirectUrl('http://localhost:8080/page')).toBe(false)
    })

    it('should handle URLs with query parameters and fragments', () => {
      expect(isValidRedirectUrl('http://localhost:3000/page?param=value')).toBe(true)
      expect(isValidRedirectUrl('http://localhost:3000/page#section')).toBe(true)
      expect(isValidRedirectUrl('http://localhost:3000/page?param=value#section')).toBe(true)
    })

    it('should be case-insensitive for protocols', () => {
      expect(isValidRedirectUrl('HTTP://localhost:3000/page')).toBe(true)
      expect(isValidRedirectUrl('HTTPS://app.example.com/page')).toBe(true)
    })

    it('should handle null and undefined gracefully', () => {
      expect(isValidRedirectUrl(null as unknown as string)).toBe(false)
      expect(isValidRedirectUrl(undefined as unknown as string)).toBe(false)
      expect(isValidRedirectUrl('')).toBe(false)
    })
  })

  describe('generateCSRFToken', () => {
    it('should generate a token of correct length', () => {
      const token = generateCSRFToken()
      expect(token).toHaveLength(64) // 32 bytes * 2 hex chars per byte
    })

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      const token3 = generateCSRFToken()
      
      expect(token1).not.toBe(token2)
      expect(token2).not.toBe(token3)
      expect(token1).not.toBe(token3)
    })

    it('should store the token in sessionStorage', () => {
      const token = generateCSRFToken()
      const storedToken = sessionStorage.getItem('csrf_token')
      
      expect(storedToken).toBe(token)
    })

    it('should only contain hexadecimal characters', () => {
      const token = generateCSRFToken()
      expect(/^[0-9a-f]+$/.test(token)).toBe(true)
    })
  })

  describe('validateCSRFToken', () => {
    it('should validate matching tokens', () => {
      const token = generateCSRFToken()
      expect(validateCSRFToken(token)).toBe(true)
    })

    it('should reject non-matching tokens', () => {
      generateCSRFToken() // Generate and store a token
      const fakeToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      
      expect(validateCSRFToken(fakeToken)).toBe(false)
    })

    it('should reject when no stored token exists', () => {
      const fakeToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      expect(validateCSRFToken(fakeToken)).toBe(false)
    })

    it('should reject null or undefined tokens', () => {
      generateCSRFToken() // Generate and store a token
      
      expect(validateCSRFToken(null as unknown as string)).toBe(false)
      expect(validateCSRFToken(undefined as unknown as string)).toBe(false)
      expect(validateCSRFToken('')).toBe(false)
    })

    it('should clear token after successful validation', () => {
      const token = generateCSRFToken()
      expect(validateCSRFToken(token)).toBe(true)
      
      // Token should be cleared after validation
      const storedToken = sessionStorage.getItem('csrf_token')
      expect(storedToken).toBeNull()
      
      // Second validation with same token should fail
      expect(validateCSRFToken(token)).toBe(false)
    })
  })

  describe('Integration tests', () => {
    it('should handle full CSRF flow', () => {
      // Generate token
      const token = generateCSRFToken()
      expect(token).toBeTruthy()
      
      // Validate token
      expect(validateCSRFToken(token)).toBe(true)
      
      // Token should be cleared
      expect(sessionStorage.getItem('csrf_token')).toBeNull()
      
      // Revalidation should fail
      expect(validateCSRFToken(token)).toBe(false)
    })

    it('should handle concurrent tokens correctly', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken() // This overwrites token1
      
      // Only the latest token should be valid
      expect(validateCSRFToken(token1)).toBe(false)
      expect(validateCSRFToken(token2)).toBe(true)
    })
  })
})