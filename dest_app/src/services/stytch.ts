import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';
import type { StytchConfig, StytchSession, SessionValidationResult, StytchError } from '@/types/stytch';

const STYTCH_CONFIG: StytchConfig = {
  projectId: import.meta.env.VITE_STYTCH_PROJECT_ID || '',
  publicToken: import.meta.env.VITE_STYTCH_PUBLIC_TOKEN || '',
  cookieOptions: {
    domain: import.meta.env.VITE_STYTCH_COOKIE_DOMAIN || window.location.hostname,
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
    // Use the same initialization as idp_app for consistency
    stytchClient = new StytchB2BUIClient(STYTCH_CONFIG.publicToken, {
      cookieOptions: STYTCH_CONFIG.cookieOptions,
    });
    // Wait for the client to be fully initialized
    await new Promise<void>(resolve => setTimeout(resolve, 100));
    return stytchClient;
  })();
  
  return initializationPromise;
};

export const validateSession = async (): Promise<SessionValidationResult> => {
  try {
    const client = await initializeStytch();
    
    // Wait a bit more for client to be fully ready
    await new Promise<void>(resolve => setTimeout(resolve, 500));
    
    if (!client) {
      return {
        isValid: false,
        session: null,
        error: 'Stytch client not initialized',
        loading: false,
      };
    }

    
    // Try to get the current session
    try {
      // First check if there's a session at all
      const sessionJWT = client.session.getTokens()?.session_jwt;
      const sessionToken = client.session.getTokens()?.session_token;
      
      
      if (!sessionJWT && !sessionToken) {
        return {
          isValid: false,
          session: null,
          error: null,
          loading: false,
        };
      }
      
      // Try to authenticate the session
      const sessionData = await client.session.authenticate();
      
      if (sessionData && (sessionData.member_session || sessionData.session)) {
        return {
          isValid: true,
          session: (sessionData.member_session || sessionData) as StytchSession,
          error: null,
          loading: false,
        };
      } else {
        return {
          isValid: false,
          session: null,
          error: null,
          loading: false,
        };
      }
    } catch (authError) {
      const error = authError as StytchError;
      
      // Check if it's just no session vs actual error
      if (error.status_code === 401 || error.error_type === 'unauthorized' || error.error_type === 'session_not_found') {
        return {
          isValid: false,
          session: null,
          error: null,
          loading: false,
        };
      }
      
      return {
        isValid: false,
        session: null,
        error: error.error_message || 'Failed to validate session',
        loading: false,
      };
    }
  } catch (error) {
    const err = error as StytchError | Error;
    console.error('Session validation error:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    return {
      isValid: false,
      session: null,
      error: 'error_message' in err ? err.error_message : err.message || 'Failed to validate session',
      loading: false,
    };
  }
};

export const getSessionInfo = async (): Promise<string | null> => {
  try {
    const client = await initializeStytch();
    if (!client.session) {
      return null;
    }
    return client.session.getSync();
  } catch (error) {
    console.error('Failed to get session info:', error);
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  try {
    const client = await initializeStytch();
    if (client.session) {
      await client.session.revoke();
    }
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};