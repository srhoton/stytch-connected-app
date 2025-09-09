/**
 * Environment variable validation and type-safe access
 */

export interface EnvConfig {
  VITE_STYTCH_PROJECT_ID: string;
  VITE_STYTCH_PUBLIC_TOKEN: string;
  VITE_STYTCH_COOKIE_DOMAIN?: string;  // Optional - falls back to current domain
  VITE_API_URL?: string;  // Made optional since it's not always needed
  NODE_ENV: 'development' | 'production' | 'test';
  DEV: boolean;
  PROD: boolean;
  MODE: string;
}

/**
 * Validates that a required environment variable is present
 */
function validateEnvVar(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Validates and returns the environment configuration
 * Throws an error if required variables are missing
 */
export function getEnvConfig(): EnvConfig {
  // In test environment, provide defaults
  if (import.meta.env.MODE === 'test') {
    return {
      VITE_STYTCH_PROJECT_ID: 'test-project-id',
      VITE_STYTCH_PUBLIC_TOKEN: 'test-public-token',
      VITE_STYTCH_COOKIE_DOMAIN: 'test.example.com',
      VITE_API_URL: undefined,  // Optional field
      NODE_ENV: 'test',
      DEV: false,
      PROD: false,
      MODE: 'test',
    };
  }

  return {
    VITE_STYTCH_PROJECT_ID: validateEnvVar(
      'VITE_STYTCH_PROJECT_ID',
      import.meta.env['VITE_STYTCH_PROJECT_ID']
    ),
    VITE_STYTCH_PUBLIC_TOKEN: validateEnvVar(
      'VITE_STYTCH_PUBLIC_TOKEN',
      import.meta.env['VITE_STYTCH_PUBLIC_TOKEN']
    ),
    VITE_STYTCH_COOKIE_DOMAIN: import.meta.env['VITE_STYTCH_COOKIE_DOMAIN'],  // Optional, no validation
    VITE_API_URL: import.meta.env['VITE_API_URL'],  // Optional, no validation
    NODE_ENV: (import.meta.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'],
    DEV: import.meta.env.DEV ?? false,
    PROD: import.meta.env.PROD ?? false,
    MODE: import.meta.env.MODE || 'development',
  };
}

/**
 * Singleton instance of validated environment configuration
 */
let envConfig: EnvConfig | null = null;

/**
 * Gets the validated environment configuration
 * Caches the result after first validation
 */
export function getEnv(): EnvConfig {
  if (!envConfig) {
    envConfig = getEnvConfig();
  }
  return envConfig;
}

/**
 * Checks if the application is running in development mode
 */
export function isDevelopment(): boolean {
  return getEnv().DEV || getEnv().NODE_ENV === 'development';
}

/**
 * Checks if the application is running in production mode
 */
export function isProduction(): boolean {
  return getEnv().PROD || getEnv().NODE_ENV === 'production';
}

/**
 * Checks if the application is running in test mode
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test' || getEnv().MODE === 'test';
}

/**
 * Gets the Stytch configuration from environment variables
 */
export function getStytchConfig() {
  const env = getEnv();
  return {
    projectId: env.VITE_STYTCH_PROJECT_ID,
    publicToken: env.VITE_STYTCH_PUBLIC_TOKEN,
    cookieDomain: env.VITE_STYTCH_COOKIE_DOMAIN || window.location.hostname,
  };
}

/**
 * Gets the API URL from environment variables
 * Returns a default if not set
 */
export function getApiUrl(): string {
  return getEnv().VITE_API_URL || 'http://localhost:3001';
}