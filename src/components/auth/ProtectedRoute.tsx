import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/pages/Auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading CouchPotato...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated or user is not approved
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Additional check for user status
  if (user && user.status !== 'approved') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-card/80 backdrop-blur-strong border border-border rounded-2xl shadow-card p-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-lg"></div>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-4">Account Pending</h1>
            
            {user.status === 'pending' && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Your account is currently pending approval. Please check back in 24 hours.
                </p>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-primary">
                    We've notified our admin team about your registration. You'll be able to access the platform once approved.
                  </p>
                </div>
              </div>
            )}
            
            {user.status === 'denied' && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Your account access has been denied. Please contact support for more information.
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">
                    If you believe this is an error, please reach out to our support team.
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
