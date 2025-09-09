/**
 * Type guards for runtime type checking
 */

import type { StytchSession } from '@/types';

/**
 * Check if a value is a valid Stytch session response
 */
export function isValidStytchSession(value: unknown): value is StytchSession {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  const session = value as Record<string, unknown>;
  
  // Check required fields for a valid session
  return (
    typeof session['session_token'] === 'string' &&
    typeof session['session_jwt'] === 'string' &&
    typeof session['member_session'] === 'object' &&
    session['member_session'] !== null &&
    typeof session['member'] === 'object' &&
    session['member'] !== null &&
    typeof session['organization'] === 'object' &&
    session['organization'] !== null &&
    typeof session['status_code'] === 'number' &&
    session['status_code'] === 200
  );
}

/**
 * Check if a response indicates successful authentication
 */
export function isSuccessfulAuthResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  const res = response as Record<string, unknown>;
  return res['status_code'] === 200 && typeof res['session_token'] === 'string';
}

/**
 * Convert an unknown response to a StytchSession with validation
 */
export function toStytchSession(response: unknown): StytchSession {
  if (!isValidStytchSession(response)) {
    throw new Error('Invalid session response structure');
  }
  return response;
}

/**
 * Extract error message from unknown error
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  if (error && typeof error === 'object' && 'error_message' in error) {
    return String(error.error_message);
  }
  
  return 'An unexpected error occurred';
}