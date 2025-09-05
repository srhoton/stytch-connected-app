import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-700 mb-4">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>
        {error && (
          <details className="text-sm text-gray-600 mb-4">
            <summary className="cursor-pointer mb-2 font-semibold">Error details</summary>
            <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs">
              {error.message}
              {import.meta.env.DEV && error.stack && (
                <>
                  {'\n\n'}Stack trace:{'\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}
        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

export function ErrorBoundary({ 
  children, 
  fallback = ErrorFallback, 
  onError 
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={(error, errorInfo) => {
        if (import.meta.env.DEV) {
          console.error('Error caught by ErrorBoundary:', error, errorInfo);
        }
        // Log to error reporting service in production
        if (onError) {
          onError(error, errorInfo);
        }
      }}
      onReset={() => {
        // Optionally clear any error state
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}