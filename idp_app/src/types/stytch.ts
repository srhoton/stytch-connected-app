/**
 * Comprehensive Stytch B2B type definitions
 * These types provide strict typing for all Stytch B2B interactions
 */

import type { Session, Member, Organization, AuthenticationFactor } from '@stytch/vanilla-js/b2b';

// Re-export core Stytch types
export type { Session, Member, Organization, AuthenticationFactor };

/**
 * Authentication methods supported by Stytch B2B
 */
export type AuthMethod = 
  | 'password'
  | 'magic_link'
  | 'oauth'
  | 'sso'
  | 'totp'
  | 'sms_otp'
  | 'whatsapp_otp';

/**
 * OAuth provider types
 */
export type OAuthProvider = 
  | 'google'
  | 'microsoft'
  | 'github'
  | 'gitlab'
  | 'slack';

/**
 * Session duration configuration
 */
export interface SessionConfig {
  sessionDurationMinutes: number;
  sessionCustomClaims?: Record<string, unknown>;
}

/**
 * Cookie configuration for Stytch SDK
 */
export interface CookieConfig {
  domain: string;
  path: string;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
}

/**
 * Stytch B2B client configuration
 */
export interface StytchB2BConfig {
  publicToken: string;
  projectId: string;
  cookieOptions?: CookieConfig;
  dfpProtectedAuthEnabled?: boolean;
  pkceRequiredForEmailMagicLinks?: boolean;
  pkceRequiredForPasswordResets?: boolean;
  pkceRequiredForOAuth?: boolean;
  pkceRequiredForSso?: boolean;
}

/**
 * Password strength requirements
 */
export interface PasswordStrengthConfig {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSymbols?: boolean;
  validateOnType?: boolean;
  checkBreaches?: boolean;
}

/**
 * Authentication response from Stytch
 */
export interface AuthenticationResponse {
  status_code: number;
  request_id: string;
  member_id: string;
  organization_id: string;
  session_token: string;
  session_jwt: string;
  member: Member;
  organization: Organization;
  session: Session;
}

/**
 * Error response from Stytch API
 */
export interface StytchErrorResponse {
  status_code: number;
  request_id: string;
  error_type: string;
  error_message: string;
  error_url?: string;
}

/**
 * Password reset start response
 */
export interface PasswordResetStartResponse {
  status_code: number;
  request_id: string;
  member_id: string;
  member_email_id: string;
  organization_id: string;
}

/**
 * Discovery intermediate session
 */
export interface IntermediateSession {
  intermediate_session_token: string;
  email_address: string;
  discovered_organizations: DiscoveredOrganization[];
}

/**
 * Discovered organization in discovery flow
 */
export interface DiscoveredOrganization {
  organization: Organization;
  membership: {
    type: 'active_member' | 'pending_member' | 'invited_member' | 'eligible_to_join';
    details?: {
      status: string;
      member_id?: string;
    };
  };
  member_authenticated: boolean;
  primary_required?: {
    allowed_auth_methods: AuthMethod[];
  };
  mfa_required?: {
    primary_required: boolean;
    secondary_required: boolean;
  };
}

/**
 * Magic link authentication request
 */
export interface MagicLinkAuthRequest {
  email_address: string;
  organization_id?: string;
  login_redirect_url?: string;
  signup_redirect_url?: string;
  pkce_code_challenge?: string;
  login_template_id?: string;
  signup_template_id?: string;
}

/**
 * OAuth authentication request
 */
export interface OAuthAuthRequest {
  provider: OAuthProvider;
  organization_id?: string;
  login_redirect_url?: string;
  signup_redirect_url?: string;
  pkce_code_challenge?: string;
  custom_scopes?: string[];
  provider_params?: Record<string, string>;
}

/**
 * SSO authentication request
 */
export interface SSOAuthRequest {
  organization_id: string;
  connection_id?: string;
  login_redirect_url?: string;
  signup_redirect_url?: string;
  pkce_code_challenge?: string;
}

/**
 * Session exchange request
 */
export interface SessionExchangeRequest {
  organization_id: string;
  session_duration_minutes?: number;
  session_custom_claims?: Record<string, unknown>;
  locale?: string;
}

/**
 * Member update request
 */
export interface MemberUpdateRequest {
  name?: string;
  trusted_metadata?: Record<string, unknown>;
  untrusted_metadata?: Record<string, unknown>;
  mfa_phone_number?: string;
  mfa_enrolled?: boolean;
}

/**
 * Organization update request  
 */
export interface OrganizationUpdateRequest {
  organization_name?: string;
  organization_slug?: string;
  organization_logo_url?: string;
  trusted_metadata?: Record<string, unknown>;
  email_allowed_domains?: string[];
  email_jit_provisioning?: 'RESTRICTED' | 'NOT_ALLOWED' | 'ALL_ALLOWED';
  email_invites?: 'RESTRICTED' | 'NOT_ALLOWED' | 'ALL_ALLOWED';
  auth_methods?: AuthMethod[];
  allowed_auth_methods?: AuthMethod[];
  mfa_policy?: 'OPTIONAL' | 'REQUIRED_FOR_ALL';
}

/**
 * RBAC permission
 */
export interface Permission {
  permission_id: string;
  description: string;
  name: string;
}

/**
 * RBAC role
 */
export interface Role {
  role_id: string;
  description: string;
  name: string;
  permissions: Permission[];
}

/**
 * Member with RBAC
 * Note: This extends the Member type with custom role structure
 */
export interface MemberWithRoles {
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
  custom_roles: Role[]; // Using custom_roles instead of roles to avoid conflict
}

/**
 * SCIM user representation
 */
export interface SCIMUser {
  id: string;
  userName: string;
  name: {
    givenName: string;
    familyName: string;
    formatted: string;
  };
  emails: Array<{
    value: string;
    primary: boolean;
  }>;
  active: boolean;
  groups?: string[];
  meta: {
    resourceType: string;
    created: string;
    lastModified: string;
  };
}

/**
 * SCIM group representation
 */
export interface SCIMGroup {
  id: string;
  displayName: string;
  members: Array<{
    value: string;
    display: string;
  }>;
  meta: {
    resourceType: string;
    created: string;
    lastModified: string;
  };
}