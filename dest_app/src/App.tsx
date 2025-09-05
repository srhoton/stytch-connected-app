import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundary, LoadingSpinner, ProtectedRoute } from '@/components';
import { ProtectedPage } from '@/pages';

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-600">Loading application...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ProtectedPage />
      </ProtectedRoute>
    ),
    errorElement: (
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
            Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-6">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          
          <button
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    ),
  },
  {
    path: '*',
    element: (
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
            404 - Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-6">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          
          <button
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    ),
  },
]);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
};