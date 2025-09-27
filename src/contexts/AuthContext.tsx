import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/types/movie';
import { authService } from '@/lib/auth';
import LoginSuccessVideo from '@/components/auth/LoginSuccessVideo';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginVideo, setShowLoginVideo] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        
        // Test Telegram connection on app start (optional)
        if (process.env.NODE_ENV === 'development') {
          authService.testTelegramConnection();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        setShowLoginVideo(true); // Show the video transition
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await authService.register(name, email, password);
      return success;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setShowLoginVideo(false);
  };

  const handleVideoComplete = () => {
    setShowLoginVideo(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && user.status === 'approved',
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showLoginVideo && (
        <LoginSuccessVideo onVideoComplete={handleVideoComplete} />
      )}
    </AuthContext.Provider>
  );
};
