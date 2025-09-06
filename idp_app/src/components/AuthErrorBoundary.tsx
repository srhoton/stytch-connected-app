import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

function AuthErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  // Check if it's a Stytch-specific error
  const isStytchError = error?.message?.toLowerCase().includes('stytch') || 
                        error?.message?.toLowerCase().includes('authentication');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-lg rounded-lg">
        <div className="text-center mb-6">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {isStytchError ? 'Authentication Error' : 'Something went wrong'}
        </h1>
        
        <p className="text-gray-600 mb-6 text-center">
          {isStytchError 
            ? 'We encountered an issue with the authentication service. Please try again or contact support if the problem persists.'
            : 'An unexpected error occurred. Please refresh the page and try again.'}
        </p>

        {/* Show error details in development */}
        {import.meta.env.DEV && error?.message && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
            <p className="text-red-800 font-semibold">Debug Info:</p>
            <p className="text-red-700 mt-1">{error.message}</p>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              // Clear any stored auth data and reload
              sessionStorage.clear();
              localStorage.removeItem('stytch_organization_slug');
              window.location.href = '/';
            }}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition"
          >
            Clear Session & Reload
          </button>
        </div>
      </div>
    </div>
  );
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

export function AuthErrorBoundary({ 
  children, 
  onError 
}: AuthErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={AuthErrorFallback}
      onError={(error, errorInfo) => {
        // Log errors for monitoring
        console.error('Authentication error:', error);
        
        if (import.meta.env.DEV) {
          console.error('Error details:', errorInfo);
        }
        
        // Send to error reporting service in production
        if (onError && errorInfo.componentStack) {
          onError(error, { componentStack: errorInfo.componentStack });
        }
        
        // Track authentication-specific errors
        if (error?.message?.toLowerCase().includes('stytch') || 
            error?.message?.toLowerCase().includes('authentication')) {
          // Could send to analytics here
          console.error('Stytch authentication error detected:', error.message);
        }
      }}
      onReset={() => {
        // Clear any error state and reload
        sessionStorage.clear();
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}