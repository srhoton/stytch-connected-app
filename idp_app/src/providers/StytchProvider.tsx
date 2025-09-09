import React, { useMemo } from 'react';
import { StytchB2BProvider } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';
import { STYTCH_PUBLIC_TOKEN, STYTCH_COOKIE_OPTIONS } from '@/config/stytch.config';
import { ErrorBoundary } from 'react-error-boundary';

interface StytchProviderProps {
  children: React.ReactNode;
}

const StytchErrorFallback: React.FC<{ error: Error }> = ({ error }) => {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Authentication Service Error
        </h2>
        <p className="text-gray-600 mb-4">
          Unable to initialize authentication service. Please check your configuration and try again.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500">
            Technical details
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
};

export const StytchProvider: React.FC<StytchProviderProps> = ({ children }) => {
  // Initialize Stytch client inside component with error handling
  const stytchClient = useMemo(() => {
    try {
      if (!STYTCH_PUBLIC_TOKEN) {
        throw new Error('Stytch public token is not configured');
      }
      
      return new StytchB2BUIClient(STYTCH_PUBLIC_TOKEN, {
        cookieOptions: STYTCH_COOKIE_OPTIONS,
      });
    } catch (error) {
      // Log error for debugging but don't expose details to users
      console.error('Failed to initialize Stytch client:', error);
      throw new Error('Failed to initialize authentication service');
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={StytchErrorFallback}>
      <StytchB2BProvider stytch={stytchClient}>
        {children}
      </StytchB2BProvider>
    </ErrorBoundary>
  );
};
