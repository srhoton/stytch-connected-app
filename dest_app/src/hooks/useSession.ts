import { useState, useEffect } from 'react';
import { validateSession } from '@/services/stytch';
import type { SessionValidationResult } from '@/types/stytch';

export const useSession = (): SessionValidationResult => {
  const [sessionState, setSessionState] = useState<SessionValidationResult>({
    isValid: false,
    session: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      try {
        setSessionState(prev => ({ ...prev, loading: true }));
        const result = await validateSession();
        setSessionState(result);
      } catch (error) {
        setSessionState({
          isValid: false,
          session: null,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          loading: false,
        });
      }
    };

    void checkSession();
  }, []);

  const refetchSession = async (): Promise<void> => {
    try {
      setSessionState(prev => ({ ...prev, loading: true }));
      const result = await validateSession();
      setSessionState(result);
    } catch (error) {
      setSessionState({
        isValid: false,
        session: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false,
      });
    }
  };

  return {
    ...sessionState,
    refetch: refetchSession,
  } as SessionValidationResult & { refetch: () => Promise<void> };
};