import React from 'react';
import { useSession } from '@/hooks/useSession';
import { Button } from '@/components/ui';
import { clearSession } from '@/services/stytch';

export const ProtectedPage: React.FC = () => {
  const { session, refetch } = useSession() as ReturnType<typeof useSession> & { refetch: () => Promise<void> };

  const handleClearSession = (): void => {
    clearSession();
    void refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
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
              🎉 Access Granted!
            </h1>
            
            <p className="text-lg text-gray-600">
              You have successfully accessed the protected content with a valid Stytch B2B session.
            </p>
          </div>

          {session && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Session Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {session.user && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">User ID:</span>
                      <p className="text-gray-600 font-mono text-xs break-all">
                        {session.user.user_id}
                      </p>
                    </div>
                    
                    {session.user.emails?.[0] && (
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-600">
                          {session.user.emails[0].email}
                          {session.user.emails[0].verified && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                              Verified
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <p className="text-gray-600 capitalize">{session.user.status}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <p className="text-gray-600">
                        {new Date(session.user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
                
                {session.session && (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">Session ID:</span>
                      <p className="text-gray-600 font-mono text-xs break-all">
                        {session.session.session_id}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Last Accessed:</span>
                      <p className="text-gray-600">
                        {new Date(session.session.last_accessed_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Expires:</span>
                      <p className="text-gray-600">
                        {new Date(session.session.expires_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Authentication Factors:</span>
                      <p className="text-gray-600">
                        {session.session.authentication_factors.length} factor(s)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="space-x-4">
              <Button
                onClick={() => void refetch()}
                variant="primary"
              >
                Refresh Session
              </Button>
              
              <Button
                onClick={handleClearSession}
                variant="danger"
              >
                Clear Session
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              This page validates your session but does not log you in. 
              Session management is handled by your Stytch B2B application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};