// Fallback authentication system for when Firebase is not available
import { User } from '@/types/movie';

export interface FallbackUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  approvedAt?: string;
  lastLogin?: string;
  loginAttempts?: number;
  lockedUntil?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

class FallbackAuthService {
  private currentUser: FallbackUser | null = null;
  private authStateListeners: ((user: FallbackUser | null) => void)[] = [];

  constructor() {
    // Initialize with demo admin users
    this.initializeDemoUsers();
  }

  private initializeDemoUsers() {
    const users = this.getStoredUsers();
    
    // Create admin users if they don't exist
    const adminUsers = [
      {
        uid: 'admin-1',
        email: 'admin@couchpotato.com',
        displayName: 'Administrator',
        emailVerified: true,
        role: 'admin' as const,
        status: 'approved' as const,
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginAttempts: 0
      },
      {
        uid: 'admin-2',
        email: 'tashingachitambira@gmail.com',
        displayName: 'Tashinga Chitambira',
        emailVerified: true,
        role: 'admin' as const,
        status: 'approved' as const,
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginAttempts: 0
      }
    ];

    let updated = false;
    adminUsers.forEach(adminUser => {
      if (!users.find(u => u.email === adminUser.email)) {
        users.push(adminUser);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('fallback_users', JSON.stringify(users));
      console.log('🔧 Fallback admin users initialized');
    }
  }

  private getStoredUsers(): FallbackUser[] {
    try {
      const usersStr = localStorage.getItem('fallback_users');
      return usersStr ? JSON.parse(usersStr) : [];
    } catch (error) {
      console.error('Failed to parse users from localStorage', error);
      return [];
    }
  }

  private setStoredUsers(users: FallbackUser[]): void {
    try {
      localStorage.setItem('fallback_users', JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users to localStorage', error);
    }
  }

  onAuthStateChange(callback: (user: FallbackUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  getCurrentUser(): FallbackUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin' || 
           this.currentUser?.email === 'admin@couchpotato.com' ||
           this.currentUser?.email === 'tashingachitambira@gmail.com';
  }

  isApproved(): boolean {
    return this.currentUser?.status === 'approved';
  }

  async signIn(email: string, password: string): Promise<FallbackUser> {
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.email === email.toLowerCase().trim());

      if (!user) {
        throw new Error('No account found with this email address.');
      }

      // Simple password check for demo
      const validPasswords = {
        'admin@couchpotato.com': 'admin123',
        'tashingachitambira@gmail.com': 'CouchPotato2024!'
      };

      if (validPasswords[email.toLowerCase().trim() as keyof typeof validPasswords] !== password) {
        throw new Error('Incorrect password.');
      }

      if (user.status === 'pending') {
        throw new Error('Account is pending approval. Please check back in 24 hours.');
      }

      if (user.status === 'denied') {
        throw new Error('Account access has been denied.');
      }

      if (user.status !== 'approved') {
        throw new Error('Account not approved yet. Please check back in 24 hours.');
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      user.loginAttempts = 0;
      this.setStoredUsers(users);

      this.currentUser = user;
      this.authStateListeners.forEach(listener => listener(this.currentUser));

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Authentication failed');
    }
  }

  async signUp(
    email: string, 
    password: string, 
    displayName: string,
    securityQuestion?: string,
    securityAnswer?: string
  ): Promise<FallbackUser> {
    try {
      const users = this.getStoredUsers();
      
      if (users.find(u => u.email === email.toLowerCase().trim())) {
        throw new Error('An account with this email already exists.');
      }

      const isAdmin = email === 'admin@couchpotato.com' || email === 'tashingachitambira@gmail.com';
      
      const newUser: FallbackUser = {
        uid: `user-${Date.now()}`,
        email: email.toLowerCase().trim(),
        displayName: displayName.trim(),
        emailVerified: false,
        role: isAdmin ? 'admin' : 'user',
        status: isAdmin ? 'approved' : 'pending',
        createdAt: new Date().toISOString(),
        ...(isAdmin && { approvedAt: new Date().toISOString() }),
        loginAttempts: 0,
        ...(securityQuestion && securityAnswer && {
          securityQuestion,
          securityAnswer: btoa(securityAnswer) // Simple encoding
        })
      };

      users.push(newUser);
      this.setStoredUsers(users);

      if (isAdmin) {
        this.currentUser = newUser;
        this.authStateListeners.forEach(listener => listener(this.currentUser));
      }

      return newUser;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.authStateListeners.forEach(listener => listener(null));
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    // Demo implementation - in real app, this would send an email
    console.log(`Password reset email would be sent to: ${email}`);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user found');
    }
    // Demo implementation
    console.log('Password changed successfully');
  }

  async updateProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user found');
    }
    // Demo implementation
    console.log('Profile updated successfully');
  }

  // Admin functions
  async getAllUsers(): Promise<FallbackUser[]> {
    return this.getStoredUsers();
  }

  async approveUser(uid: string): Promise<void> {
    const users = this.getStoredUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.status = 'approved';
      user.approvedAt = new Date().toISOString();
      this.setStoredUsers(users);
    }
  }

  async denyUser(uid: string): Promise<void> {
    const users = this.getStoredUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.status = 'denied';
      this.setStoredUsers(users);
    }
  }

  async promoteToAdmin(uid: string): Promise<void> {
    const users = this.getStoredUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.role = 'admin';
      this.setStoredUsers(users);
    }
  }

  async demoteFromAdmin(uid: string): Promise<void> {
    const users = this.getStoredUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.role = 'user';
      this.setStoredUsers(users);
    }
  }

  async unlockUser(uid: string): Promise<void> {
    const users = this.getStoredUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.loginAttempts = 0;
      user.lockedUntil = undefined;
      this.setStoredUsers(users);
    }
  }
}

// Create and export singleton instance
export const fallbackAuthService = new FallbackAuthService();
export default fallbackAuthService;
