import React, { useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { LoadingSpinner, Button } from '@/components/ui';

// Configuration for the IDP app URL
const IDP_APP_URL = import.meta.env.VITE_IDP_APP_URL || 'http://localhost:3001';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isValid, error, loading, refetch } = useSession() as ReturnType<typeof useSession> & { refetch: () => Promise<void> };

  useEffect(() => {
    // Only redirect if we're definitely not authenticated (after loading completes)
    // Don't redirect if there's an error - let user see the error message
    if (!loading && !isValid && !error) {
      // Add a small delay to prevent redirect loops due to async session checks
      const timeoutId = setTimeout(() => {
        const currentUrl = window.location.href;
        const returnUrl = encodeURIComponent(currentUrl);
        window.location.href = `${IDP_APP_URL}?return_url=${returnUrl}`;
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, isValid, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-error-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Session Validation Failed
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <Button
            onClick={() => void refetch()}
            variant="primary"
            className="mb-4"
          >
            Retry
          </Button>
          
          <p className="text-sm text-gray-500">
            Please ensure you have a valid Stytch session to access this content.
          </p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    // This state should be temporary - we're redirecting to IDP app
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};