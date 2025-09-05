import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, Navigate } from 'react-router-dom';
import { StytchB2B } from '@stytch/react/b2b';
import { useStytchMemberSession, useStytchB2BClient } from '@stytch/react/b2b';
import { ErrorBoundary, SessionDisplay, LoadingSpinner } from '@/components';
import { sanitizeReturnUrl } from '@/utils/urlValidator';
import { Products } from '@stytch/vanilla-js/b2b';

// Component to handle the main authentication flow
const AuthenticationFlow: React.FC = () => {
  const { session, isInitialized } = useStytchMemberSession();
  const stytchClient = useStytchB2BClient();
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
      const validatedUrl = sanitizeReturnUrl(returnUrl);
      if (validatedUrl) {
        // Clear any stored return URL and redirect
        sessionStorage.removeItem('auth_return_url');
        window.location.href = validatedUrl;
      }
    }
  }, [session, returnUrl]);

  // Store return URL for post-auth redirect
  useEffect(() => {
    if (returnUrl && !session) {
      const validatedUrl = sanitizeReturnUrl(returnUrl);
      if (validatedUrl) {
        sessionStorage.setItem('auth_return_url', validatedUrl);
      }
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
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <SessionDisplay
            session={session}
            onLogout={handleLogout}
          />
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
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '40px',
            },
            primaryColor: '#cf2027',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
          callbacks={{
            onEvent: (event) => {
              // Stytch authentication event received

              // After successful authentication, check for return URL
              if (event.type === 'AUTHENTICATE_SUCCESS') {
                const savedReturnUrl = sessionStorage.getItem('auth_return_url');
                if (savedReturnUrl) {
                  sessionStorage.removeItem('auth_return_url');
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
