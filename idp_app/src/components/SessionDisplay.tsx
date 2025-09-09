import React, { useMemo, memo } from 'react';
import { Button } from '@/components/ui';
import type { StytchSession } from '@/types';

interface AuthenticationFactor {
  type: string;
  delivery_method: string;
  last_authenticated_at: string;
}

export interface SessionDisplayProps {
  session: StytchSession;
  onLogout: () => void;
  isLoading?: boolean;
}

const SessionDisplayComponent: React.FC<SessionDisplayProps> = ({
  session,
  onLogout,
  isLoading = false,
}) => {
  // Memoize formatted dates to avoid recalculation on every render
  const formattedDates = useMemo(() => {
    if (!session.member_session) {return null;}
    
    return {
      started: new Date(session.member_session.started_at).toLocaleString(),
      lastAccessed: new Date(session.member_session.last_accessed_at).toLocaleString(),
      expires: new Date(session.member_session.expires_at).toLocaleString(),
    };
  }, [session.member_session]);

  const memberCreatedDate = useMemo(() => {
    if (!session.member) {return null;}
    return new Date(session.member.created_at).toLocaleDateString();
  }, [session.member]);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4" role="main">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="text-success-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Successfully Authenticated
            </h1>
            
            <p className="text-lg text-gray-600">
              You are now logged in to your account.
            </p>
          </div>

          {(session.member || session.organization) && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Session Information
              </h2>
              
              <div className="space-y-4">
                {session.member && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Member ID:</span>
                      <p className="text-gray-600 font-mono text-xs break-all">
                        {session.member.member_id}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-600" data-testid="user-email">
                        {session.member.email_address}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <p className="text-gray-600" data-testid="user-name">
                        {session.member.name || 'Not set'}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <p className="text-gray-600 capitalize">
                        {session.member.status}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Role:</span>
                      <p className="text-gray-600">
                        {session.member.is_admin ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Member
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <p className="text-gray-600">
                        {memberCreatedDate}
                      </p>
                    </div>
                  </div>
                )}
                
                {session.organization && (
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <span className="font-medium text-gray-700">Organization ID:</span>
                      <p className="text-gray-600 font-mono text-xs break-all">
                        {session.organization.organization_id}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Organization:</span>
                      <p className="text-gray-600" data-testid="org-name">
                        {session.organization.organization_name}
                      </p>
                    </div>
                    
                    {session.organization.organization_slug && (
                      <div>
                        <span className="font-medium text-gray-700">Organization Slug:</span>
                        <p className="text-gray-600">
                          {session.organization.organization_slug}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {session.member_session && (
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <span className="font-medium text-gray-700">Session ID:</span>
                      <p className="text-gray-600 font-mono text-xs break-all">
                        {session.member_session.member_session_id}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Started:</span>
                      <p className="text-gray-600">
                        {formattedDates?.started}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Last Accessed:</span>
                      <p className="text-gray-600">
                        {formattedDates?.lastAccessed}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Session Expires:</span>
                      <p className="text-gray-600" data-testid="session-expires">
                        {formattedDates?.expires}
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Authentication Methods:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {session.member_session.authentication_factors.map((factor: AuthenticationFactor, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {factor.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={onLogout}
              variant="danger"
              loading={isLoading}
              disabled={isLoading}
              type="button"
              aria-label={isLoading ? 'Logging out' : 'Logout'}
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </Button>
            
            <p className="mt-6 text-sm text-gray-500">
              Your session is actively managed by Stytch B2B.
              Signing out will revoke your current session token.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const SessionDisplay = memo(SessionDisplayComponent, (prevProps, nextProps) => {
  // Custom comparison function for optimization
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.session?.session_token === nextProps.session?.session_token &&
    prevProps.session?.member_session?.member_session_id === nextProps.session?.member_session?.member_session_id
  );
});