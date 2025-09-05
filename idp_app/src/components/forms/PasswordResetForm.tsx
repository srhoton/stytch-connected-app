import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button, Alert } from '@/components/ui';
import type { PasswordResetRequest } from '@/types';

export interface PasswordResetFormProps {
  onSubmit: (data: PasswordResetRequest) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSubmit,
  onBack,
  isLoading = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequest>();

  const handleFormSubmit = async (data: PasswordResetRequest): Promise<void> => {
    setError(null);
    setSuccess(false);
    try {
      await onSubmit(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email');
    }
  };

  const isDisabled = isLoading || isSubmitting;

  if (success) {
    return (
      <div className="space-y-6">
        <Alert
          type="success"
          title="Check your email"
          message="We've sent you a password reset link. Please check your email and follow the instructions to reset your password."
        />
        
        <div className="text-center">
          <Button
            onClick={onBack}
            variant="secondary"
            fullWidth
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

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

      <div className="space-y-3">
        <Button
          type="submit"
          fullWidth
          loading={isDisabled}
          disabled={isDisabled}
        >
          Send Reset Link
        </Button>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onBack}
          disabled={isDisabled}
        >
          Back to Login
        </Button>
      </div>
    </form>
  );
};