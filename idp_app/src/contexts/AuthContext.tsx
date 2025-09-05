import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import * as authService from '@/services/stytch';
import type { AuthState, StytchSession, LoginCredentials, PasswordResetRequest } from '@/types';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: StytchSession }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        isAuthenticated: true,
        isLoading: false,
        session: action.payload,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        isAuthenticated: false,
        isLoading: false,
        session: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        isLoading: false,
        session: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  session: null,
  error: null,
};

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkSession = useCallback(async (): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const session = await authService.getCurrentSession();
      if (session) {
        dispatch({ type: 'AUTH_SUCCESS', payload: session });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const session = await authService.authenticateWithPassword(credentials, credentials.organization);
      dispatch({ type: 'AUTH_SUCCESS', payload: session });
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const resetPassword = useCallback(async (request: PasswordResetRequest): Promise<void> => {
    await authService.requestPasswordReset(request);
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    resetPassword,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};