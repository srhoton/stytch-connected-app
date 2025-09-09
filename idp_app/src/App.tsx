import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, Navigate } from 'react-router-dom';
import { StytchB2B } from '@stytch/react/b2b';
import { useStytchMemberSession, useStytchB2BClient } from '@stytch/react/b2b';
import { ErrorBoundary, AuthErrorBoundary, SessionDisplay, LoadingSpinner } from '@/components';
import { sanitizeReturnUrl } from '@/utils/urlValidator';
import { Products } from '@stytch/vanilla-js/b2b';
import type { StytchSession } from '@/types';
import { useNavigation } from '@/services/navigation';

// Define Stytch event types
interface StytchAuthEvent {
  type: 'AUTHENTICATE_SUCCESS' | 'AUTHENTICATE_ERROR' | 'ORGANIZATION_SELECTED' | 'DISCOVERY_STARTED';
  data?: unknown;
}

// Convert MemberSession from hook to our StytchSession format
const convertToStytchSession = (memberSession: any): StytchSession | null => {
  if (!memberSession) return null;
  
  // The MemberSession from the hook has a different structure
  // We need to adapt it to our StytchSession interface
  return {
    status_code: 200,
    request_id: 'react-hook-session',
    member_id: memberSession.member_id,
    organization_id: memberSession.organization_id,
    session_token: memberSession.session_token || '',
    session_jwt: memberSession.session_jwt || '',
    member_session: {
      member_session_id: memberSession.member_session_id,
      member_id: memberSession.member_id,
      organization_id: memberSession.organization_id,
      started_at: memberSession.started_at,
      last_accessed_at: memberSession.last_accessed_at,
      expires_at: memberSession.expires_at,
      authentication_factors: memberSession.authentication_factors || [],
    },
    member: memberSession.member,
    organization: memberSession.organization,
  };
};

// Helper functions for return URL management
const AUTH_RETURN_URL_KEY = 'auth_return_url';

const storeReturnUrl = (url: string): void => {
  const validatedUrl = sanitizeReturnUrl(url);
  if (validatedUrl) {
    sessionStorage.setItem(AUTH_RETURN_URL_KEY, validatedUrl);
  }
};

const getStoredReturnUrl = (): string | null => {
  return sessionStorage.getItem(AUTH_RETURN_URL_KEY);
};

const clearStoredReturnUrl = (): void => {
  sessionStorage.removeItem(AUTH_RETURN_URL_KEY);
};

const handleReturnUrlRedirect = (navigation: ReturnType<typeof useNavigation>, returnUrl?: string | null): boolean => {
  // Try to use provided returnUrl first, then check stored URL
  const urlToValidate = returnUrl || getStoredReturnUrl();
  
  if (!urlToValidate) {
    return false;
  }
  
  const validatedUrl = sanitizeReturnUrl(urlToValidate);
  if (validatedUrl) {
    clearStoredReturnUrl();
    navigation.navigateTo(validatedUrl);
    return true;
  } else {
    console.error('[Auth] Return URL failed validation:', urlToValidate);
    return false;
  }
};

// Component to handle the main authentication flow
const AuthenticationFlow: React.FC = () => {
  const { session, isInitialized } = useStytchMemberSession();
  const stytchClient = useStytchB2BClient();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return_url');

  // Handle logout
  const handleLogout = async () => {
    try {
      await stytchClient.session.revoke();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle redirect when authenticated with return URL
  useEffect(() => {
    if (session && returnUrl) {
      // Session detected with return URL - validate and redirect
      handleReturnUrlRedirect(navigation, returnUrl);
    }
  }, [session, returnUrl, navigation]);

  // Store return URL for post-auth redirect
  useEffect(() => {
    if (returnUrl && !session) {
      storeReturnUrl(returnUrl);
    }
  }, [returnUrl, session]);

  // Show loading while Stytch initializes
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4 text-primary-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a token with discovery type, let the StytchB2B component handle it
  // The component will automatically process tokens in the URL
  // Token validation: token present and type check

  // If authenticated, show session or redirect
  if (session) {
    // If there's a return URL, show redirecting message
    if (returnUrl) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-4 text-primary-600" />
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      );
    }

    // Show session details
    const stytchSession = convertToStytchSession(session);
    if (!stytchSession) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-red-600">Invalid session format</div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <AuthErrorBoundary>
            <SessionDisplay
              session={stytchSession}
              onLogout={handleLogout}
            />
          </AuthErrorBoundary>
        </div>
      </div>
    );
  }

  // Show Stytch B2B UI component for authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4">
          <img 
            src="/FullbayLogo.svg" 
            alt="Fullbay" 
            className="h-20 w-20"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fullbay</h1>
        <p className="text-gray-600 mt-2 text-base">Sign in to continue to your account</p>
      </div>
      <div className="w-full max-w-md">
        <AuthErrorBoundary>
          <StytchB2B
            config={{
              products: [Products.passwords],
              authFlowType: 'Discovery',
              disableCreateOrganization: true,
              passwordOptions: {
                loginRedirectURL: window.location.origin,
                resetPasswordRedirectURL: `${window.location.origin}/authenticate`,
              },
              sessionOptions: {
                sessionDurationMinutes: 60,
              },
            }}
            styles={{
              container: {
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                // boxShadow and padding removed - not supported in Stytch styles type
              },
              colors: {
                primary: '#cf2027',
              },
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
            callbacks={{
              onEvent: (event) => {
                // Stytch authentication event received
                const authEvent = event as unknown as StytchAuthEvent;
                if (authEvent.type === 'AUTHENTICATE_SUCCESS') {
                  // After successful authentication, check for return URL
                  const savedReturnUrl = getStoredReturnUrl();
                  if (savedReturnUrl) {
                    clearStoredReturnUrl();
                    setTimeout(() => {
                      window.location.href = savedReturnUrl;
                    }, 100);
                  }
                }
              },
              onError: (error) => {
                console.error('Stytch error:', error);
              },
            }}
          />
        </AuthErrorBoundary>
      </div>
    </div>
  );
};

// Main App component with routing
export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthenticationFlow />} />
          <Route path="/authenticate" element={<AuthenticationFlow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
