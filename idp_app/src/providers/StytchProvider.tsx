import React from 'react';
import { StytchB2BProvider } from '@stytch/react/b2b';
import { StytchB2BUIClient } from '@stytch/vanilla-js/b2b';

interface StytchProviderProps {
  children: React.ReactNode;
}

const PUBLIC_TOKEN = import.meta.env.VITE_STYTCH_PUBLIC_TOKEN;

if (!PUBLIC_TOKEN) {
  throw new Error('VITE_STYTCH_PUBLIC_TOKEN environment variable is not set');
}

// Initialize the Stytch client with cookie options for session sharing
const stytchClient = new StytchB2BUIClient(PUBLIC_TOKEN, {
  cookieOptions: {
    domain: import.meta.env.VITE_STYTCH_COOKIE_DOMAIN || window.location.hostname,
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
