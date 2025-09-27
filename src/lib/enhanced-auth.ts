import { User } from '@/types/movie';

// Enhanced authentication service with password reset functionality
const USERS_STORAGE_KEY = 'couchpotato_users_v2';
const PASSWORDS_STORAGE_KEY = 'couchpotato_passwords_v2';
const SESSIONS_STORAGE_KEY = 'couchpotato_sessions_v2';
const RESET_TOKENS_STORAGE_KEY = 'couchpotato_reset_tokens_v2';

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8051082292:AAGGlCmbl38GOQSZxxOEqBLUetyBoiZfSAE';
const TELEGRAM_CHAT_ID = '1048281561';

// Enhanced User interface with security features
export interface EnhancedUser extends User {
  securityQuestion?: string;
  securityAnswer?: string;
  lastLogin?: string;
  loginAttempts?: number;
  lockedUntil?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
}

// Password reset token interface
interface PasswordResetToken {
  email: string;
  token: string;
  expires: string;
  used: boolean;
}

// Simple but effective password hashing (for demo - use bcrypt in production)
function hashPassword(password: string): string {
  // Simple hash using multiple encoding layers
  let hash = btoa(password);
  for (let i = 0; i < 3; i++) {
    hash = btoa(hash + 'couchpotato_salt_' + i);
  }
  return hash;
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate secure random token
function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Generate UUID
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const enhancedAuthService = {
  // Initialize the system with default admin accounts
  async initialize(): Promise<void> {
    try {
      const users = this.getStoredUsers();
      const passwords = this.getStoredPasswords();
      
      // Create main admin account
      const mainAdminExists = users.some(user => user.email === 'admin@couchpotato.com');
      if (!mainAdminExists) {
        console.log('🔧 Creating main admin account...');
        
        const mainAdminUser: EnhancedUser = {
          id: generateUUID(),
          name: 'Administrator',
          email: 'admin@couchpotato.com',
          status: 'approved',
          role: 'admin',
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginAttempts: 0,
          securityQuestion: 'What is the name of this streaming platform?',
          securityAnswer: hashPassword('couchpotato'),
        };
        
        users.push(mainAdminUser);
        passwords['admin@couchpotato.com'] = hashPassword('admin123');
        
        console.log('✅ Main admin created: admin@couchpotato.com / admin123');
      }

      // Create personal admin account with your email
      const personalAdminExists = users.some(user => user.email === 'tashingachitambira@gmail.com');
      if (!personalAdminExists) {
        console.log('🔧 Creating personal admin account...');
        
        const personalAdminUser: EnhancedUser = {
          id: generateUUID(),
          name: 'Tashinga Chitambira',
          email: 'tashingachitambira@gmail.com',
          status: 'approved',
          role: 'admin',
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginAttempts: 0,
          securityQuestion: 'What is your favorite streaming platform?',
          securityAnswer: hashPassword('couchpotato'),
        };
        
        users.push(personalAdminUser);
        passwords['tashingachitambira@gmail.com'] = hashPassword('CouchPotato2024!');
        
        console.log('✅ Personal admin created: tashingachitambira@gmail.com / CouchPotato2024!');
      }

      // Save all users and passwords
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
      
      console.log('✅ Enhanced auth system initialized with both admin accounts!');
    } catch (error) {
      console.error('Failed to initialize enhanced auth:', error);
    }
  },

  // Get stored users
  getStoredUsers(): EnhancedUser[] {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  },

  // Get stored passwords
  getStoredPasswords(): Record<string, string> {
    try {
      const passwords = localStorage.getItem(PASSWORDS_STORAGE_KEY);
      return passwords ? JSON.parse(passwords) : {};
    } catch {
      return {};
    }
  },

  // Get stored reset tokens
  getStoredResetTokens(): PasswordResetToken[] {
    try {
      const tokens = localStorage.getItem(RESET_TOKENS_STORAGE_KEY);
      return tokens ? JSON.parse(tokens) : [];
    } catch {
      return [];
    }
  },

  // Enhanced login with security features
  async login(email: string, password: string): Promise<EnhancedUser | null> {
    try {
      // Ensure system is initialized
      await this.initialize();
      
      const users = this.getStoredUsers();
      const passwords = this.getStoredPasswords();
      
      const userIndex = users.findIndex(u => u.email === email.toLowerCase().trim());
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const user = users[userIndex];
      
      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        const unlockTime = new Date(user.lockedUntil).toLocaleString();
        throw new Error(`Account is locked until ${unlockTime}. Too many failed login attempts.`);
      }
      
      // Check account status
      if (user.status === 'pending') {
        throw new Error('Account is pending approval. Please check back in 24 hours.');
      }
      
      if (user.status === 'denied') {
        throw new Error('Account access has been denied.');
      }
      
      if (user.status !== 'approved') {
        throw new Error('Account not approved yet. Please check back in 24 hours.');
      }
      
      // Verify password
      const storedPassword = passwords[email.toLowerCase().trim()];
      if (!storedPassword || !verifyPassword(password, storedPassword)) {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
          users[userIndex] = user;
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
          throw new Error('Account locked due to too many failed login attempts. Try again in 30 minutes.');
        }
        
        users[userIndex] = user;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        throw new Error('Invalid password');
      }
      
      // Successful login - reset attempts and update last login
      user.loginAttempts = 0;
      user.lockedUntil = undefined;
      user.lastLogin = new Date().toISOString();
      users[userIndex] = user;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      
      // Store current session
      localStorage.setItem('couchpotato_current_user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  async register(name: string, email: string, password: string, securityQuestion?: string, securityAnswer?: string): Promise<boolean> {
    try {
      const users = this.getStoredUsers();
      const passwords = this.getStoredPasswords();
      
      if (users.find(u => u.email === email.toLowerCase().trim())) {
        throw new Error('User with this email already exists');
      }
      
      const isAdmin = email.toLowerCase().trim() === 'admin@couchpotato.com' || 
                      email.toLowerCase().trim() === 'tashingachitambira@gmail.com';
      
      const newUser: EnhancedUser = {
        id: generateUUID(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        status: isAdmin ? 'approved' : 'pending',
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        ...(isAdmin && { approvedAt: new Date().toISOString() }),
        loginAttempts: 0,
        ...(securityQuestion && securityAnswer && {
          securityQuestion,
          securityAnswer: hashPassword(securityAnswer.toLowerCase().trim())
        })
      };
      
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      
      // Store hashed password
      passwords[email.toLowerCase().trim()] = hashPassword(password);
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
      
      // Send Telegram notification for non-admin users
      if (!isAdmin) {
        try {
          await this.sendTelegramNotification(newUser);
        } catch (error) {
          console.error('Telegram notification failed:', error);
        }
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.email === email.toLowerCase().trim());
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        };
      }
      
      // Generate reset token
      const resetToken = generateSecureToken();
      const resetTokens = this.getStoredResetTokens();
      
      // Remove any existing tokens for this email
      const filteredTokens = resetTokens.filter(token => token.email !== email.toLowerCase().trim());
      
      // Add new token (expires in 1 hour)
      const newToken: PasswordResetToken = {
        email: email.toLowerCase().trim(),
        token: resetToken,
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        used: false
      };
      
      filteredTokens.push(newToken);
      localStorage.setItem(RESET_TOKENS_STORAGE_KEY, JSON.stringify(filteredTokens));
      
      // In a real app, you'd send this via email
      // For demo purposes, we'll return it and show it in the UI
      console.log(`🔑 Password reset token for ${email}: ${resetToken}`);
      
      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.',
        resetToken // Only for demo - remove in production
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while processing your request.'
      };
    }
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const resetTokens = this.getStoredResetTokens();
      const tokenData = resetTokens.find(t => t.token === token && !t.used);
      
      if (!tokenData) {
        return {
          success: false,
          message: 'Invalid or expired reset token.'
        };
      }
      
      // Check if token is expired
      if (new Date(tokenData.expires) < new Date()) {
        return {
          success: false,
          message: 'Reset token has expired. Please request a new one.'
        };
      }
      
      // Update password
      const passwords = this.getStoredPasswords();
      passwords[tokenData.email] = hashPassword(newPassword);
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
      
      // Mark token as used
      tokenData.used = true;
      localStorage.setItem(RESET_TOKENS_STORAGE_KEY, JSON.stringify(resetTokens));
      
      // Reset login attempts and unlock account
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.email === tokenData.email);
      if (userIndex !== -1) {
        users[userIndex].loginAttempts = 0;
        users[userIndex].lockedUntil = undefined;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
      
      return {
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while resetting your password.'
      };
    }
  },

  // Reset password using security question
  async resetPasswordWithSecurityQuestion(email: string, securityAnswer: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.email === email.toLowerCase().trim());
      
      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found.'
        };
      }
      
      const user = users[userIndex];
      
      if (!user.securityQuestion || !user.securityAnswer) {
        return {
          success: false,
          message: 'No security question set for this account.'
        };
      }
      
      // Verify security answer
      if (!verifyPassword(securityAnswer.toLowerCase().trim(), user.securityAnswer)) {
        return {
          success: false,
          message: 'Incorrect security answer.'
        };
      }
      
      // Update password
      const passwords = this.getStoredPasswords();
      passwords[email.toLowerCase().trim()] = hashPassword(newPassword);
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
      
      // Reset login attempts and unlock account
      user.loginAttempts = 0;
      user.lockedUntil = undefined;
      users[userIndex] = user;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      
      return {
        success: true,
        message: 'Password has been reset successfully using your security question.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while resetting your password.'
      };
    }
  },

  // Get current user
  getCurrentUser(): EnhancedUser | null {
    try {
      const userStr = localStorage.getItem('couchpotato_current_user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      
      // Verify user still exists and is approved
      const users = this.getStoredUsers();
      const currentUser = users.find(u => u.id === user.id);
      
      if (!currentUser || currentUser.status !== 'approved') {
        this.logout();
        return null;
      }
      
      return currentUser;
    } catch {
      return null;
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem('couchpotato_current_user');
  },

  // Change password (when logged in)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to change your password.'
        };
      }
      
      const passwords = this.getStoredPasswords();
      const storedPassword = passwords[user.email];
      
      if (!storedPassword || !verifyPassword(currentPassword, storedPassword)) {
        return {
          success: false,
          message: 'Current password is incorrect.'
        };
      }
      
      // Update password
      passwords[user.email] = hashPassword(newPassword);
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
      
      return {
        success: true,
        message: 'Password changed successfully.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while changing your password.'
      };
    }
  },

  // Send Telegram notification
  async sendTelegramNotification(user: EnhancedUser): Promise<boolean> {
    const message = `🎬 New CouchPotato Registration Request

👤 Name: ${user.name}
📧 Email: ${user.email}
🆔 User ID: ${user.id}
🕒 Time: ${new Date().toLocaleString()}

A new user has requested access to CouchPotato. Please review and approve or deny their access.

Reply with:
• "approve ${user.id}" to approve
• "deny ${user.id}" to deny

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
      return true;
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }
  },

  // Admin functions
  approveUser(userId: string): boolean {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex].status = 'approved';
      users[userIndex].approvedAt = new Date().toISOString();

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  },

  denyUser(userId: string): boolean {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex].status = 'denied';
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  },

  // Unlock user account
  unlockUser(userId: string): boolean {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex].loginAttempts = 0;
      users[userIndex].lockedUntil = undefined;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  },

  // Admin password reset for any user
  adminResetPassword(userId: string, newPassword: string): boolean {
    try {
      const users = this.getStoredUsers();
      const user = users.find(u => u.id === userId);

      if (!user) return false;

      const passwords = this.getStoredPasswords();
      passwords[user.email] = hashPassword(newPassword);
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));

      // Reset login attempts and unlock account
      const userIndex = users.findIndex(u => u.id === userId);
      users[userIndex].loginAttempts = 0;
      users[userIndex].lockedUntil = undefined;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      return true;
    } catch {
      return false;
    }
  }
};

// Auto-initialize when module loads
enhancedAuthService.initialize();
