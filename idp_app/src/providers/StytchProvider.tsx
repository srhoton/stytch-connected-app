import React from 'react';
import { StytchB2BProvider } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';

interface StytchProviderProps {
  children: React.ReactNode;
}

const PUBLIC_TOKEN = 'public-token-test-22dae31b-07a8-4af8-9b58-be277c857fb9';

// Initialize the Stytch client with cookie options for session sharing
const stytchClient = new StytchB2BUIClient(PUBLIC_TOKEN, {
  cookieOptions: {
    domain: 'localhost',
    path: '/',
  },
});

export const StytchProvider: React.FC<StytchProviderProps> = ({ children }) => {
  return (
    <StytchB2BProvider stytch={stytchClient}>
      {children}
    </StytchB2BProvider>
  );
};