export interface StytchConfig {
  projectId: string;
  publicToken: string;
}

export interface StytchSession {
  session_token?: string;
  session_jwt?: string;
  user?: StytchUser;
  session?: {
    session_id: string;
    user_id: string;
    started_at: string;
    last_accessed_at: string;
    expires_at: string;
    attributes: Record<string, unknown>;
    authentication_factors: Array<{
      type: string;
      delivery_method: string;
      last_authenticated_at: string;
    }>;
  };
}

export interface StytchUser {
  user_id: string;
  emails: Array<{
    email: string;
    verified: boolean;
  }>;
  status: string;
  created_at: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  session: StytchSession | null;
  error: string | null;
  loading: boolean;
}

export interface StytchError {
  error_type: string;
  error_message: string;
  error_url?: string;
}