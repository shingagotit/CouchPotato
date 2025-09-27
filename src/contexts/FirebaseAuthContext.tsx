import React, { createContext, useContext, useEffect, useState } from 'react';
import { FirebaseUser, firebaseAuthService } from '@/lib/firebase-auth';

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await firebaseAuthService.signIn(email, password);
    } catch (error: any) {
      throw error;
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
      await firebaseAuthService.register(email, password, displayName, securityQuestion, securityAnswer);
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseAuthService.signOut();
    } catch (error: any) {
      throw error;
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await firebaseAuthService.sendPasswordResetEmail(email);
    } catch (error: any) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await firebaseAuthService.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      throw error;
    }
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      await firebaseAuthService.updateProfile(updates);
    } catch (error: any) {
      throw error;
    }
  };

  const value: FirebaseAuthContextType = {
    user,
    isAuthenticated: firebaseAuthService.isAuthenticated(),
    isAdmin: firebaseAuthService.isAdmin(),
    isApproved: firebaseAuthService.isApproved(),
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
