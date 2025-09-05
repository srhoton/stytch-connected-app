import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button, Alert } from '@/components/ui';
import type { LoginCredentials } from '@/types';
import { getStoredOrganization } from '@/services/stytch';

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  onPasswordReset: () => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onPasswordReset,
  isLoading = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [showOrgField, setShowOrgField] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>();

  useEffect(() => {
    // Check if we have a stored organization
    const storedOrg = getStoredOrganization();
    if (storedOrg) {
      setValue('organization', storedOrg);
    } else {
      // If no stored org, show the field
      setShowOrgField(true);
    }
  }, [setValue]);

  const handleFormSubmit = async (data: LoginCredentials): Promise<void> => {
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      
      // If the error is about organization, show the org field
      if (errorMessage.toLowerCase().includes('organization')) {
        setShowOrgField(true);
      }
    }
  };

  const isDisabled = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <Input
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        error={errors.email?.message}
        disabled={isDisabled}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        disabled={isDisabled}
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        })}
      />

      {showOrgField && (
        <div className="space-y-2">
          <Input
            label="Organization ID"
            type="text"
            autoComplete="organization"
            placeholder="your-org-slug"
            error={errors.organization?.message}
            disabled={isDisabled}
            {...register('organization', {
              required: showOrgField ? 'Organization ID is required' : false,
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: 'Organization ID should contain only lowercase letters, numbers, and hyphens',
              },
            })}
          />
          <p className="text-xs text-gray-500">
            Contact your admin if you don't know your organization ID.
            {getStoredOrganization() && (
              <button
                type="button"
                onClick={() => setShowOrgField(false)}
                className="ml-2 text-primary-600 hover:text-primary-500"
              >
                Use saved organization
              </button>
            )}
          </p>
        </div>
      )}

      {!showOrgField && getStoredOrganization() && (
        <div className="text-sm text-gray-600">
          Signing in to organization: <strong>{getStoredOrganization()}</strong>
          <button
            type="button"
            onClick={() => setShowOrgField(true)}
            className="ml-2 text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
            disabled={isDisabled}
          >
            Change
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPasswordReset}
          className="text-sm text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
          disabled={isDisabled}
        >
          Forgot your password?
        </button>
      </div>

      <Button
        type="submit"
        fullWidth
        loading={isDisabled}
        disabled={isDisabled}
      >
        Sign In
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          This app validates existing Stytch B2B accounts only.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          New users should be created through your organization's admin portal.
        </p>
      </div>
    </form>
  );
};