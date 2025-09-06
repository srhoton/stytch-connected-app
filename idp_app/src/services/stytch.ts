import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';
import type { 
  StytchSession, 
  LoginCredentials,
  PasswordResetRequest,
  PasswordResetConfirm,
  AuthError
} from '@/types';
import { getStytchConfig } from '@/utils/env';
import { getNavigationService } from '@/services/navigation';

// Define cookie options interface
interface StytchCookieOptions {
  domain?: string;
  path?: string;
}

// Get validated configuration from env utility
const stytchEnvConfig = getStytchConfig();
const navigation = getNavigationService();

const STYTCH_CONFIG = {
  projectId: stytchEnvConfig.projectId,
  publicToken: stytchEnvConfig.publicToken,
  cookieOptions: {
    domain: import.meta.env['VITE_STYTCH_COOKIE_DOMAIN'] || navigation.getHostname(),
    path: '/',
  },
};

let stytchClient: StytchB2BUIClient | null = null;
let initializationPromise: Promise<StytchB2BUIClient> | null = null;

export const initializeStytch = async (): Promise<StytchB2BUIClient> => {
  if (stytchClient) {
    return stytchClient;
  }
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async (): Promise<StytchB2BUIClient> => {
    stytchClient = new StytchB2BUIClient(STYTCH_CONFIG.publicToken, {
      cookieOptions: STYTCH_CONFIG.cookieOptions as StytchCookieOptions,
    });
    // Wait for the client to be fully initialized
    await new Promise<void>(resolve => setTimeout(resolve, 100));
    return stytchClient;
  })();
  
  return initializationPromise;
};

// Get stored organization from localStorage
export const getStoredOrganization = (): string | null => {
  return localStorage.getItem('stytch_organization_slug');
};

// Store organization in localStorage
export const storeOrganization = (slug: string): void => {
  localStorage.setItem('stytch_organization_slug', slug);
};

// Clear stored organization
export const clearStoredOrganization = (): void => {
  localStorage.removeItem('stytch_organization_slug');
};

// Authenticate with email and password using discovery
export const authenticateWithPassword = async (
  credentials: LoginCredentials,
  organizationSlug?: string
): Promise<StytchSession> => {
  try {
    // Authenticating with provided credentials
    const client = await initializeStytch();
    
    // Use provided org, stored org, or default for testing
    const orgToUse = organizationSlug || getStoredOrganization();
    
    // If no organization is stored or provided, we need to handle discovery
    if (!orgToUse) {
      // For now, we'll throw an error asking user to provide organization
      // In production, you'd use the discovery flow with magic links
      throw new Error('Please enter your organization identifier. Contact your admin if you don\'t know it.');
    }
    
    // Attempting authentication with organization
    
    // Try authenticating with organization slug
    const response = await client.passwords.authenticate({
      email_address: credentials.email,
      password: credentials.password,
      organization_id: orgToUse,
      session_duration_minutes: 60,
    });
    
    // Authentication response received
    
    if (response.status_code === 200 && response.session_token) {
      // Authentication successful
      
      // Store the organization for future logins
      storeOrganization(orgToUse);
      
      // The session token is already set by the SDK automatically
      return response as unknown as StytchSession;
    }
    
    throw new Error('Authentication failed - unexpected response');
  } catch (error) {
    // Authentication error occurred
    const authError = error as AuthError;
    
    // Provide detailed error messages
    if (authError.error_type === 'invalid_credentials') {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    } else if (authError.error_type === 'organization_not_found') {
      // Clear stored org if it's invalid
      clearStoredOrganization();
      throw new Error('Organization not found. Please check your organization identifier and try again.');
    } else if (authError.error_type === 'member_not_found') {
      throw new Error('No account found with this email address in the specified organization.');
    } else if (authError.error_type === 'password_required') {
      throw new Error('Password authentication is required for this account.');
    } else if (authError.error_message) {
      throw new Error(authError.error_message);
    } else {
      throw new Error('An unexpected error occurred during authentication.');
    }
  }
};

// Get current session
export const getCurrentSession = async (): Promise<StytchSession | null> => {
  try {
    const client = await initializeStytch();
    
    // Check if session object exists (note: it's 'session' not 'sessions')
    if (!client.session) {
      return null;
    }
    
    const sessionToken = client.session.getSync();
    
    if (!sessionToken) {
      return null;
    }

    // Validate the session
    const response = await client.session.authenticate({
      session_duration_minutes: 60,
    });

    if (response.status_code === 200) {
      return response as unknown as StytchSession;
    } else {
      return null;
    }
  } catch (error) {
    // Failed to get current session
    return null;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    const client = await initializeStytch();
    if (client.session) {
      await client.session.revoke();
    }
    // Note: We keep the stored organization for convenience
    // Uncomment the line below if you want to clear it on logout
    // clearStoredOrganization();
  } catch (error) {
    // Failed to logout - fail silently
  }
};

// Request password reset
export const requestPasswordReset = async (request: PasswordResetRequest): Promise<void> => {
  try {
    const client = await initializeStytch();
    
    // Use stored organization or throw error
    const organizationId = getStoredOrganization();
    if (!organizationId) {
      throw new Error('Please log in at least once to set your organization before resetting your password.');
    }
    
    const response = await client.passwords.resetByEmailStart({
      email_address: request.email,
      organization_id: organizationId,
      reset_password_redirect_url: `${navigation.getOrigin()}/reset-password`,
      reset_password_expiration_minutes: 60,
    });

    if (response.status_code !== 200) {
      throw new Error('Failed to send password reset email');
    }
  } catch (error) {
    const authError = error as AuthError;
    if (authError.error_type === 'member_not_found') {
      throw new Error('No account found with this email address in your organization.');
    } else if (authError.error_type === 'organization_not_found') {
      clearStoredOrganization();
      throw new Error('Organization not found. Please log in again to set your organization.');
    } else if (authError.error_message) {
      throw new Error(authError.error_message);
    } else {
      throw new Error('Failed to send password reset email. Please try again.');
    }
  }
};

// Complete password reset
export const confirmPasswordReset = async (confirm: PasswordResetConfirm): Promise<StytchSession> => {
  try {
    const client = await initializeStytch();
    
    const response = await client.passwords.resetByEmail({
      password_reset_token: confirm.token,
      password: confirm.password,
      session_duration_minutes: 60,
    });

    if (response.status_code === 200) {
      // The session token is automatically stored by the SDK
      return response as unknown as StytchSession;
    } else {
      throw new Error('Password reset failed');
    }
  } catch (error) {
    const authError = error as AuthError;
    if (authError.error_type === 'reset_token_invalid') {
      throw new Error('Invalid or expired reset token. Please request a new password reset.');
    } else if (authError.error_type === 'password_too_weak') {
      throw new Error('Password is too weak. Please use a stronger password.');
    } else if (authError.error_message) {
      throw new Error(authError.error_message);
    } else {
      throw new Error('Failed to reset password. Please try again.');
    }
  }
};