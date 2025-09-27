import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Loader2 } from 'lucide-react';

interface FirebaseProtectedRouteProps {
  children: React.ReactNode;
}

const FirebaseProtectedRoute: React.FC<FirebaseProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isApproved, isLoading } = useFirebaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/auth');
        return;
      }

      if (!isApproved) {
        navigate('/auth');
        return;
      }
    }
  }, [isAuthenticated, isApproved, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isApproved) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

export default FirebaseProtectedRoute;
