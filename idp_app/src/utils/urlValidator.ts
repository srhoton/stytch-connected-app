// Security utility to validate return URLs and prevent open redirects

/**
 * List of allowed domains for redirects from environment variables
 */
export const getAllowedDomains = (): string[] => {
  const envDomains = import.meta.env.VITE_ALLOWED_REDIRECT_DOMAINS;
  if (envDomains) {
    return envDomains.split(',').map((domain: string) => domain.trim());
  }
  // Fallback for development and testing
  if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    return [
      'localhost:3000',
      'localhost:3001', 
      'localhost:3002',
      '127.0.0.1:3000',
      '127.0.0.1:3001',
      '127.0.0.1:3002',
      'app.example.com', // Added for testing
    ];
  }
  // In production, no fallback - must be explicitly configured
  return [];
};

/**
 * Validates if a URL is safe to redirect to
 * Prevents open redirect vulnerabilities
 */
export const isValidReturnUrl = (url: string): boolean => {
  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Check if it's HTTP or HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Get allowed domains from environment
    const allowedDomains = getAllowedDomains();
    
    // Check if the host is in our allowed list
    const host = parsedUrl.host;
    
    // First check against allowed domains
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        host === domain || 
        host === `www.${domain}` ||
        host.endsWith(`.${domain}`)
      );
      if (isAllowed) {return true;}
    }
    
    // Always allow same-origin redirects
    const currentHost = window.location.host;
    return parsedUrl.host === currentHost;
  } catch (error) {
    // Invalid URL
    return false;
  }
};

/**
 * Sanitizes a return URL, returning null if invalid
 */
export const sanitizeReturnUrl = (url: string | null): string | null => {
  if (!url) {return null;}
  
  try {
    const decodedUrl = decodeURIComponent(url);
    if (isValidReturnUrl(decodedUrl)) {
      return decodedUrl;
    }
  } catch (error) {
    // Decoding failed
    return null;
  }
  
  return null;
};

/**
 * Gets the default redirect URL for after login
 */
export const getDefaultRedirectUrl = (): string => {
  return import.meta.env.VITE_DEFAULT_REDIRECT_URL || '/';
};

/**
 * Generate a CSRF token for the session
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Store CSRF token in session storage
 */
export const storeCSRFToken = (token: string): void => {
  sessionStorage.setItem('csrf_token', token);
};

/**
 * Verify CSRF token
 */
export const verifyCSRFToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem('csrf_token');
  return storedToken !== null && storedToken === token;
};

/**
 * Validate CSRF token and clear it after validation
 */
export const validateCSRFToken = (token: string): boolean => {
  if (!token) {return false;}
  const storedToken = sessionStorage.getItem('csrf_token');
  if (storedToken && storedToken === token) {
    sessionStorage.removeItem('csrf_token');
    return true;
  }
  return false;
};

/**
 * Clear CSRF token
 */
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem('csrf_token');
};

/**
 * Validates if a redirect URL is safe
 * Alias for isValidReturnUrl for backwards compatibility
 */
export const isValidRedirectUrl = (url: string): boolean => {
  if (!url) {return false;}
  
  // Allow relative URLs (starting with / or ../)
  if ((url.startsWith('/') && !url.startsWith('//')) || url.startsWith('../')) {
    return true;
  }
  
  // Reject javascript: and data: URLs
  if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
    return false;
  }
  
  // Check if it's actually a URL (has protocol)
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
  if (!hasProtocol) {
    // Not a URL, treat as relative path - but reject if it doesn't start with / or ../
    return false;
  }
  
  try {
    // For absolute URLs, validate against allowed domains
    const parsedUrl = new URL(url);
    
    // Check if it's HTTP or HTTPS (URL constructor normalizes protocol to lowercase)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Get allowed domains from environment
    const allowedDomains = getAllowedDomains();
    
    // Check if the host is in our allowed list
    const host = parsedUrl.host;
    
    // First check against allowed domains
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        host === domain || 
        host === `www.${domain}` ||
        host.endsWith(`.${domain}`)
      );
      if (isAllowed) {return true;}
    }
    
    // Always allow same-origin redirects
    const currentHost = window.location.host;
    return parsedUrl.host === currentHost;
  } catch (error) {
    // Invalid URL
    return false;
  }
};