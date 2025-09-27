import React, { createContext, useContext, useEffect, useState } from 'react';
import { FirebaseUser, firebaseAuthService } from '@/lib/firebase-auth';
import { fallbackAuthService, FallbackUser } from '@/lib/fallback-auth';

interface FirebaseAuthContextType {
  user: FirebaseUser | FallbackUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, securityQuestion?: string, securityAnswer?: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | FallbackUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Try Firebase first, fallback to local auth if Firebase fails
    try {
      const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
        setUser(user);
        setIsLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.warn('Firebase auth failed, using fallback:', error);
      setUseFallback(true);
      
      // Use fallback auth service
      const unsubscribe = fallbackAuthService.onAuthStateChange((user) => {
        setUser(user);
        setIsLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      if (useFallback) {
        await fallbackAuthService.signIn(email, password);
      } else {
        await firebaseAuthService.signIn(email, password);
      }
    } catch (error: any) {
      // If Firebase fails, try fallback
      if (!useFallback) {
        try {
          await fallbackAuthService.signIn(email, password);
          setUseFallback(true);
        } catch (fallbackError: any) {
          throw error; // Throw original Firebase error
        }
      } else {
        throw error;
      }
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    displayName: string,
    securityQuestion?: string,
    securityAnswer?: string
  ): Promise<void> => {
    try {
      if (useFallback) {
        await fallbackAuthService.signUp(email, password, displayName, securityQuestion, securityAnswer);
      } else {
        await firebaseAuthService.register(email, password, displayName, securityQuestion, securityAnswer);
      }
    } catch (error: any) {
      // If Firebase fails, try fallback
      if (!useFallback) {
        try {
          await fallbackAuthService.signUp(email, password, displayName, securityQuestion, securityAnswer);
          setUseFallback(true);
        } catch (fallbackError: any) {
          throw error; // Throw original Firebase error
        }
      } else {
        throw error;
      }
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (useFallback) {
        await fallbackAuthService.signOut();
      } else {
        await firebaseAuthService.signOut();
      }
    } catch (error: any) {
      throw error;
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      if (useFallback) {
        await fallbackAuthService.sendPasswordResetEmail(email);
      } else {
        await firebaseAuthService.sendPasswordResetEmail(email);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      if (useFallback) {
        await fallbackAuthService.changePassword(currentPassword, newPassword);
      } else {
        await firebaseAuthService.changePassword(currentPassword, newPassword);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      if (useFallback) {
        await fallbackAuthService.updateProfile(updates);
      } else {
        await firebaseAuthService.updateProfile(updates);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const value: FirebaseAuthContextType = {
    user,
    isAuthenticated: useFallback ? fallbackAuthService.isAuthenticated() : firebaseAuthService.isAuthenticated(),
    isAdmin: useFallback ? fallbackAuthService.isAdmin() : firebaseAuthService.isAdmin(),
    isApproved: useFallback ? fallbackAuthService.isApproved() : firebaseAuthService.isApproved(),
    isLoading,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    changePassword,
    updateProfile
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
