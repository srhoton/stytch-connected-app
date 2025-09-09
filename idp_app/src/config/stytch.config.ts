/**
 * Centralized Stytch configuration
 * All Stytch-related settings should be defined here
 */

import { getStytchConfig as getStytchEnvConfig } from '@/utils/env';

// Get environment configuration
const envConfig = getStytchEnvConfig();

/**
 * Cookie configuration for Stytch session management
 * These settings enable cross-subdomain authentication
 */
export const STYTCH_COOKIE_OPTIONS = {
  domain: envConfig.cookieDomain,              // Domain from environment or current hostname
  path: '/',                                   // Cookie available on all paths
  availableToSubdomains: true,                 // Enable cookie sharing across subdomains
} as const;

/**
 * Complete Stytch configuration object
 */
export const STYTCH_CONFIG = {
  projectId: envConfig.projectId,
  publicToken: envConfig.publicToken,
  cookieOptions: STYTCH_COOKIE_OPTIONS,
} as const;

/**
 * Export individual config values for convenience
 */
export const STYTCH_PROJECT_ID = STYTCH_CONFIG.projectId;
export const STYTCH_PUBLIC_TOKEN = STYTCH_CONFIG.publicToken;