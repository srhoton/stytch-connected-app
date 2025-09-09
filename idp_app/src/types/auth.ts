export interface StytchConfig {
  projectId: string;
  publicToken: string;
}

export interface StytchUser {
  user_id: string;
  email: string;
  emails: Array<{
    email: string;
    verified: boolean;
  }>;
  status: string;
  created_at: string;
  name?: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
  };
}

export interface StytchMember {
  member_id: string;
  organization_id: string;
  email_address: string;
  status: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  member_password_id?: string;
  trusted_metadata?: Record<string, unknown>;
  untrusted_metadata?: Record<string, unknown>;
}

export interface StytchOrganization {
  organization_id: string;
  organization_name: string;
  organization_slug?: string;
  organization_logo_url?: string;
  trusted_metadata?: Record<string, unknown>;
  sso_active_connections?: Array<{
    connection_id: string;
    display_name: string;
  }>;
}

export interface StytchSession {
  status_code: number;
  request_id: string;
  member_id: string;
  organization_id: string;
  session_token: string;
  session_jwt: string;
  member: StytchMember;
  organization: StytchOrganization;
  member_session: {
    member_session_id: string;
    member_id: string;
    organization_id: string;
    started_at: string;
    last_accessed_at: string;
    expires_at: string;
    authentication_factors: Array<{
      type: string;
      delivery_method: string;
      last_authenticated_at: string;
    }>;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  organization?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: StytchSession | null;
  error: string | null;
}

export interface DiscoveryOrganization {
  organization_id: string;
  organization_name: string;
  organization_slug?: string;
  organization_logo_url?: string;
  member_is_admin: boolean;
  member_authenticated: boolean;
  primary_required?: {
    allowed_auth_methods: string[];
  };
}

export interface DiscoveryResponse {
  discovered_organizations: DiscoveryOrganization[];
  email_address: string;
  intermediate_session_token?: string;
}

export interface AuthError {
  error_type: string;
  error_message: string;
  error_url?: string;
  status_code?: number;
}