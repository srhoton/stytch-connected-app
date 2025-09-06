import { useStytchB2BClient, useStytchMemberSession } from '@stytch/react/b2b';
import { useState } from 'react';
import type { LoginCredentials, AuthError } from '@/types';

export const useStytchAuth = () => {
  const stytch = useStytchB2BClient();
  const { session } = useStytchMemberSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get stored organization from localStorage
  const getStoredOrganization = (): string | null => {
    return localStorage.getItem('stytch_organization_slug');
  };

  // Store organization in localStorage
  const storeOrganization = (slug: string): void => {
    localStorage.setItem('stytch_organization_slug', slug);
  };

  // Clear stored organization
  const clearStoredOrganization = (): void => {
    localStorage.removeItem('stytch_organization_slug');
  };

  const login = async (credentials: LoginCredentials, organizationSlug?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const orgToUse = organizationSlug || credentials.organization || getStoredOrganization();
      
      if (!orgToUse) {
        throw new Error('Please enter your organization identifier. Contact your admin if you don\'t know it.');
      }

      // Attempting authentication with organization

      // Use the Stytch client to authenticate
      const response = await stytch.passwords.authenticate({
        email_address: credentials.email,
        password: credentials.password,
        organization_id: orgToUse,
        session_duration_minutes: 60,
      });

      // Authentication response received

      if (response.status_code === 200) {
        // Authentication successful
        storeOrganization(orgToUse);
        
        // Check for return URL and redirect if needed
        const savedReturnUrl = sessionStorage.getItem('auth_return_url');
        if (savedReturnUrl) {
          sessionStorage.removeItem('auth_return_url');
          window.location.href = savedReturnUrl;
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      const authError = err as AuthError;
      console.error('Authentication error:', authError);
      let errorMessage = 'An unexpected error occurred during authentication.';
      
      if (authError.error_type === 'invalid_credentials') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (authError.error_type === 'organization_not_found') {
        clearStoredOrganization();
        errorMessage = 'Organization not found. Please check your organization identifier and try again.';
      } else if (authError.error_type === 'member_not_found') {
        errorMessage = 'No account found with this email address in the specified organization.';
      } else if (authError.error_type === 'password_required') {
        errorMessage = 'Password authentication is required for this account.';
      } else if (authError.error_message) {
        errorMessage = authError.error_message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await stytch.session.revoke();
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const organizationId = getStoredOrganization();
      if (!organizationId) {
        throw new Error('Please log in at least once to set your organization before resetting your password.');
      }

      const response = await stytch.passwords.resetByEmailStart({
        email_address: email,
        organization_id: organizationId,
        reset_password_redirect_url: `${window.location.origin}/reset-password`,
        reset_password_expiration_minutes: 60,
      });

      if (response.status_code !== 200) {
        throw new Error('Failed to send password reset email');
      }
    } catch (err) {
      const authError = err as AuthError;
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (authError.error_type === 'member_not_found') {
        errorMessage = 'No account found with this email address in your organization.';
      } else if (authError.error_type === 'organization_not_found') {
        clearStoredOrganization();
        errorMessage = 'Organization not found. Please log in again to set your organization.';
      } else if (authError.error_message) {
        errorMessage = authError.error_message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPasswordReset = async (token: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await stytch.passwords.resetByEmail({
        password_reset_token: token,
        password,
        session_duration_minutes: 60,
      });

      if (response.status_code !== 200) {
        throw new Error('Password reset failed');
      }
    } catch (err) {
      const authError = err as AuthError;
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (authError.error_type === 'reset_token_invalid') {
        errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
      } else if (authError.error_type === 'password_too_weak') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (authError.error_message) {
        errorMessage = authError.error_message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    isAuthenticated: !!session,
    isLoading,
    error,
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    getStoredOrganization,
    storeOrganization,
    clearStoredOrganization,
  };
};