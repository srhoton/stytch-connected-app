/**
 * Custom error classes for better error handling
 */

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

/**
 * Type guard for authentication errors
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Type guard for validation errors
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard for network errors
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard for security errors
 */
export function isSecurityError(error: unknown): error is SecurityError {
  return error instanceof SecurityError;
}

/**
 * Helper to get a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle our custom errors with specific messages
    if (isAuthenticationError(error)) {
      switch (error.code) {
        case 'invalid_credentials':
          return 'Invalid email or password. Please check your credentials and try again.';
        case 'organization_not_found':
          return 'Organization not found. Please check your organization identifier.';
        case 'member_not_found':
          return 'No account found with this email address.';
        case 'session_expired':
          return 'Your session has expired. Please log in again.';
        default:
          return error.message;
      }
    }
    
    if (isValidationError(error)) {
      if (error.field) {
        return `Invalid ${error.field}: ${error.message}`;
      }
      return error.message;
    }
    
    if (isNetworkError(error)) {
      if (error.statusCode === 0) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }
      if (error.statusCode && error.statusCode >= 500) {
        return 'Server error. Please try again later.';
      }
      return error.message;
    }
    
    if (isSecurityError(error)) {
      return 'Security error: ' + error.message;
    }
    
    // Generic Error
    return error.message;
  }
  
  // Unknown error type
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Helper to log errors appropriately
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const errorMessage = getErrorMessage(error);
  
  if (import.meta.env.DEV) {
    console.error(`[${timestamp}]${context ? ` [${context}]` : ''} Error:`, error);
  } else {
    // In production, send to error tracking service
    console.error(`[${timestamp}]${context ? ` [${context}]` : ''} ${errorMessage}`);
    // TODO: Send to error tracking service like Sentry
  }
}