// Security utility to validate return URLs and prevent open redirects

/**
 * List of allowed domains for redirects
 * In production, this should come from environment variables
 */
const ALLOWED_REDIRECT_DOMAINS = [
  'localhost:3000',
  'localhost:3001', 
  'localhost:3002',
  '127.0.0.1:3000',
  '127.0.0.1:3001',
  '127.0.0.1:3002',
];

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
    
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      // Check if the host is in our allowed list
      const host = parsedUrl.host;
      return ALLOWED_REDIRECT_DOMAINS.some(domain => host === domain || host.startsWith(domain));
    }
    
    // In production, you should check against a whitelist of allowed domains
    // For now, we'll be restrictive and only allow same-origin redirects
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
  if (!url) return null;
  
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
  // In production, this should come from environment variables
  return process.env.VITE_DEFAULT_REDIRECT_URL || '/';
};