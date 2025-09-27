import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  UserCredential,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from './firebase';

// User roles and permissions
export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'denied';

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  approvedAt?: string;
  lastLogin?: string;
  loginAttempts?: number;
  lockedUntil?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface AuthError {
  code: string;
  message: string;
}

class FirebaseAuthService {
  private currentUser: FirebaseUser | null = null;
  private authStateListeners: ((user: FirebaseUser | null) => void)[] = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userData = await this.getUserData(firebaseUser.uid);
        this.currentUser = userData;
      } else {
        this.currentUser = null;
      }
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(this.currentUser));
    });
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin' || 
           this.currentUser?.email === 'admin@couchpotato.com' ||
           this.currentUser?.email === 'tashingachitambira@gmail.com';
  }

  // Check if user is approved
  isApproved(): boolean {
    return this.currentUser?.status === 'approved';
  }

  // Register new user
  async register(
    email: string, 
    password: string, 
    displayName: string,
    securityQuestion?: string,
    securityAnswer?: string
  ): Promise<FirebaseUser> {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName });

      // Determine if user is admin
      const isAdmin = email === 'admin@couchpotato.com' || email === 'tashingachitambira@gmail.com';

      // Create user document in Firestore
      const userData: FirebaseUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        emailVerified: firebaseUser.emailVerified,
        role: isAdmin ? 'admin' : 'user',
        status: isAdmin ? 'approved' : 'pending',
        createdAt: new Date().toISOString(),
        ...(isAdmin && { approvedAt: new Date().toISOString() }),
        loginAttempts: 0,
        ...(securityQuestion && securityAnswer && {
          securityQuestion,
          securityAnswer: this.hashSecurityAnswer(securityAnswer)
        })
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Send Telegram notification for non-admin users
      if (!isAdmin) {
        await this.sendTelegramNotification(userData);
      }

      return userData;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in user
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userData = await this.getUserData(firebaseUser.uid);
      
      if (!userData) {
        throw new Error('User data not found');
      }

      // Check account status
      if (userData.status === 'pending') {
        await signOut(auth);
        throw new Error('Account is pending approval. Please check back in 24 hours.');
      }

      if (userData.status === 'denied') {
        await signOut(auth);
        throw new Error('Account access has been denied.');
      }

      if (userData.status !== 'approved') {
        await signOut(auth);
        throw new Error('Account not approved yet. Please check back in 24 hours.');
      }

      // Check if account is locked
      if (userData.lockedUntil && new Date(userData.lockedUntil) > new Date()) {
        await signOut(auth);
        const unlockTime = new Date(userData.lockedUntil).toLocaleString();
        throw new Error(`Account is locked until ${unlockTime}. Too many failed login attempts.`);
      }

      // Update last login and reset attempts
      await this.updateUserData(firebaseUser.uid, {
        lastLogin: new Date().toISOString(),
        loginAttempts: 0,
        lockedUntil: undefined
      });

      return userData;
    } catch (error: any) {
      // Handle failed login attempts
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        await this.handleFailedLogin(email);
      }
      throw this.handleAuthError(error);
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Update user profile
  async updateProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      await updateProfile(user, updates);
      
      // Update Firestore document
      if (updates.displayName) {
        await this.updateUserData(user.uid, { displayName: updates.displayName });
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Get user data from Firestore
  private async getUserData(uid: string): Promise<FirebaseUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as FirebaseUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Update user data in Firestore
  private async updateUserData(uid: string, updates: Partial<FirebaseUser>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }

  // Handle failed login attempts
  private async handleFailedLogin(email: string): Promise<void> {
    try {
      // Find user by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email),
        limit(1)
      );
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as FirebaseUser;
        
        const newAttempts = (userData.loginAttempts || 0) + 1;
        const updates: Partial<FirebaseUser> = {
          loginAttempts: newAttempts
        };

        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
        }

        await updateDoc(doc(db, 'users', userDoc.id), updates);
      }
    } catch (error) {
      console.error('Error handling failed login:', error);
    }
  }

  // Hash security answer
  private hashSecurityAnswer(answer: string): string {
    // Simple hash for demo - use proper hashing in production
    let hash = btoa(answer.toLowerCase().trim());
    for (let i = 0; i < 3; i++) {
      hash = btoa(hash + 'couchpotato_salt_' + i);
    }
    return hash;
  }

  // Send Telegram notification
  private async sendTelegramNotification(user: FirebaseUser): Promise<void> {
    const TELEGRAM_BOT_TOKEN = '8051082292:AAGGlCmbl38GOQSZxxOEqBLUetyBoiZfSAE';
    const TELEGRAM_CHAT_ID = '1048281561';

    const message = `🎬 New CouchPotato Registration Request

👤 Name: ${user.displayName}
📧 Email: ${user.email}
🆔 User ID: ${user.uid}
🕒 Time: ${new Date().toLocaleString()}

A new user has requested access to CouchPotato. Please review and approve or deny their access.

Reply with:
• "approve ${user.uid}" to approve
• "deny ${user.uid}" to deny

Or simply reply "approve" or "deny" to this message.`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const result = await response.json();
      console.log('Telegram notification sent successfully:', result);
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }

  // Handle Firebase auth errors
  private handleAuthError(error: AuthError): Error {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/requires-recent-login': 'Please sign in again to complete this action.'
    };

    const message = errorMessages[error.code] || error.message || 'An authentication error occurred.';
    return new Error(message);
  }

  // Admin functions
  async approveUser(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error approving user:', error);
      throw new Error('Failed to approve user');
    }
  }

  async denyUser(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        status: 'denied'
      });
    } catch (error) {
      console.error('Error denying user:', error);
      throw new Error('Failed to deny user');
    }
  }

  async promoteToAdmin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: 'admin'
      });
    } catch (error) {
      console.error('Error promoting user:', error);
      throw new Error('Failed to promote user');
    }
  }

  async demoteFromAdmin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: 'user'
      });
    } catch (error) {
      console.error('Error demoting user:', error);
      throw new Error('Failed to demote user');
    }
  }

  async unlockUser(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        loginAttempts: 0,
        lockedUntil: undefined
      });
    } catch (error) {
      console.error('Error unlocking user:', error);
      throw new Error('Failed to unlock user');
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<FirebaseUser[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => doc.data() as FirebaseUser);
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users');
    }
  }
}

// Create and export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
