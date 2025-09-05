import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';
import type { StytchConfig, StytchSession, SessionValidationResult, StytchError } from '@/types/stytch';

const STYTCH_CONFIG: StytchConfig = {
  projectId: 'project-test-6849076e-d381-4c46-a477-75501bbe3431',
  publicToken: 'public-token-test-22dae31b-07a8-4af8-9b58-be277c857fb9',
  cookieOptions: {
    domain: 'localhost',
    path: '/',
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stytchClient: any = null;
let initializationPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initializeStytch = async (): Promise<any> => {
  if (stytchClient) {
    return stytchClient;
  }
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    // Use the same initialization as idp_app for consistency
    stytchClient = new StytchB2BUIClient(STYTCH_CONFIG.publicToken, {
      cookieOptions: STYTCH_CONFIG.cookieOptions,
    });
    // Wait for the client to be fully initialized
    await new Promise(resolve => setTimeout(resolve, 100));
    return stytchClient;
  })();
  
  return initializationPromise;
};

export const validateSession = async (): Promise<SessionValidationResult> => {
  try {
    console.log('Starting session validation...');
    const client = await initializeStytch();
    
    // Wait a bit more for client to be fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!client) {
      console.log('Stytch client not initialized');
      return {
        isValid: false,
        session: null,
        error: 'Stytch client not initialized',
        loading: false,
      };
    }

    console.log('Client initialized, checking session...');
    console.log('Client session object:', client.session);
    
    // Try to get the current session
    try {
      // First check if there's a session at all
      const sessionJWT = client.session.getTokens()?.session_jwt;
      const sessionToken = client.session.getTokens()?.session_token;
      
      console.log('Session JWT exists:', !!sessionJWT);
      console.log('Session token exists:', !!sessionToken);
      
      if (!sessionJWT && !sessionToken) {
        console.log('No session tokens found');
        return {
          isValid: false,
          session: null,
          error: null,
          loading: false,
        };
      }
      
      // Try to authenticate the session
      const sessionData = await client.session.authenticate();
      
      console.log('Session authentication response:', sessionData);
      
      if (sessionData && (sessionData.member_session || sessionData.session)) {
        console.log('Session is valid');
        return {
          isValid: true,
          session: (sessionData.member_session || sessionData) as StytchSession,
          error: null,
          loading: false,
        };
      } else {
        console.log('Session response but no valid session data');
        return {
          isValid: false,
          session: null,
          error: null,
          loading: false,
        };
      }
    } catch (authError: any) {
      console.log('Session authentication error:', authError);
      console.log('Error details:', JSON.stringify(authError, null, 2));
      
      // Check if it's just no session vs actual error
      if (authError.status_code === 401 || authError.error_type === 'unauthorized' || authError.error_type === 'session_not_found') {
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
        error: authError.error_message || 'Failed to validate session',
        loading: false,
      };
    }
  } catch (error: any) {
    console.error('Session validation error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return {
      isValid: false,
      session: null,
      error: error.error_message || error.message || 'Failed to validate session',
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