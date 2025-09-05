import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoginForm, PasswordResetForm } from '@/components/forms';
import { LoadingSpinner } from '@/components/ui';
import { useStytchAuth } from '@/hooks/useStytchAuth';
import { sanitizeReturnUrl, getDefaultRedirectUrl } from '@/utils/urlValidator';
import type { LoginCredentials, PasswordResetRequest } from '@/types';

export const LoginPage: React.FC = () => {
  const { login, requestPasswordReset } = useStytchAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return_url');

  // Store the return URL in sessionStorage so it persists through the login flow
  useEffect(() => {
    if (returnUrl) {
      const validatedUrl = sanitizeReturnUrl(returnUrl);
      if (validatedUrl) {
        sessionStorage.setItem('auth_return_url', validatedUrl);
      }
    }
  }, [returnUrl]);

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    await login(credentials);
    
    // After successful login, check for return URL and redirect
    const savedReturnUrl = sessionStorage.getItem('auth_return_url');
    if (savedReturnUrl) {
      sessionStorage.removeItem('auth_return_url');
      // The URL is already validated and sanitized
      window.location.href = savedReturnUrl;
    } else {
      // If no return URL, use default
      const defaultUrl = getDefaultRedirectUrl();
      if (defaultUrl !== '/') {
        window.location.href = defaultUrl;
      }
    }
  };

  const handlePasswordReset = async (request: PasswordResetRequest): Promise<void> => {
    await requestPasswordReset(request.email);
  };

  const togglePasswordReset = (): void => {
    setShowPasswordReset(!showPasswordReset);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          {!showPasswordReset ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900">
                  Sign In to Your Account
                </h1>
                
                <p className="mt-2 text-sm text-gray-600">
                  Access your Stytch B2B organization
                </p>
              </div>

              <LoginForm
                onSubmit={handleLogin}
                onPasswordReset={togglePasswordReset}
              />
            </>
          ) : (
            <PasswordResetForm
              onSubmit={handlePasswordReset}
              onBack={togglePasswordReset}
            />
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Powered by Stytch B2B Authentication
          </p>
        </div>
      </div>
    </div>
  );
};