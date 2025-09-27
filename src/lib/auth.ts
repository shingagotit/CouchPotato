import { User } from '@/types/movie';

const TELEGRAM_BOT_TOKEN = '8051082292:AAGGlCmbl38GOQSZxxOEqBLUetyBoiZfSAE';
// You'll need to get your chat ID by messaging your bot and checking getUpdates
const TELEGRAM_CHAT_ID = '1048281561'; // Your actual chat ID

// Generate a UUID that works in all browsers
function generateUUID(): string {
  // Try crypto.randomUUID first (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const authService = {
  // Send notification to Telegram
  async sendTelegramNotification(user: User) {
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
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Telegram API error:', errorData);
        throw new Error(`Failed to send Telegram notification: ${errorData.description || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Telegram notification sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      // Don't fail registration if Telegram fails
      return false;
    }
  },

  // Register a new user
  async register(name: string, email: string, password: string): Promise<boolean> {
    try {
      // Check if user already exists
      const existingUsers = this.getStoredUsers();
      if (existingUsers.find(u => u.email === email)) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: generateUUID(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        status: 'pending',
        role: email.toLowerCase().trim() === 'admin@couchpotato.com' ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      };

      // Store user locally
      existingUsers.push(newUser);
      localStorage.setItem('vidking_users', JSON.stringify(existingUsers));

      // Store password hash (in production, use proper hashing like bcrypt)
      const passwords = JSON.parse(localStorage.getItem('vidking_passwords') || '{}');
      passwords[email.toLowerCase().trim()] = btoa(password); // Simple base64 encoding
      localStorage.setItem('vidking_passwords', JSON.stringify(passwords));

      // Send Telegram notification (don't fail if this fails)
      try {
        await this.sendTelegramNotification(newUser);
      } catch (telegramError) {
        console.warn('Telegram notification failed, but registration continues:', telegramError);
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string): Promise<User | null> {
    try {
      // Ensure admin user exists for GitHub Pages deployment
      this.ensureAdminUserExists();
      
      const users = this.getStoredUsers();
      const user = users.find(u => u.email === email.toLowerCase().trim());

      if (!user) {
        throw new Error('User not found');
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

      // Verify password
      const passwords = JSON.parse(localStorage.getItem('vidking_passwords') || '{}');
      const storedPassword = passwords[email.toLowerCase().trim()];

      if (!storedPassword || atob(storedPassword) !== password) {
        throw new Error('Invalid password');
      }

      // Store current session
      localStorage.setItem('vidking_current_user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('vidking_current_user');
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
    localStorage.removeItem('vidking_current_user');
  },

  // Get all stored users (for admin purposes)
  getStoredUsers(): User[] {
    try {
      const usersStr = localStorage.getItem('vidking_users');
      return usersStr ? JSON.parse(usersStr) : [];
    } catch {
      return [];
    }
  },

  // Ensure admin user exists (for GitHub Pages deployment)
  ensureAdminUserExists(): void {
    try {
      const users = this.getStoredUsers();
      
      // Check if admin user already exists
      const adminExists = users.some(user => user.email === 'admin@couchpotato.com');
      
      if (!adminExists) {
        console.log('🔧 Creating admin user for GitHub Pages...');
        
        const adminUser: User = {
          id: generateUUID(),
          name: 'Administrator',
          email: 'admin@couchpotato.com',
          status: 'approved',
          role: 'admin',
          createdAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
        };
        
        users.push(adminUser);
        localStorage.setItem('vidking_users', JSON.stringify(users));
        
        // Also set admin password
        const passwordsStr = localStorage.getItem('vidking_passwords');
        const passwords = passwordsStr ? JSON.parse(passwordsStr) : {};
        passwords['admin@couchpotato.com'] = 'admin123';
        localStorage.setItem('vidking_passwords', JSON.stringify(passwords));
        
        console.log('✅ Admin user created successfully!');
      }
    } catch (error) {
      console.error('Failed to ensure admin user exists:', error);
    }
  },

  // Approve user (for admin use)
  approveUser(userId: string): boolean {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex].status = 'approved';
      users[userIndex].approvedAt = new Date().toISOString();

      localStorage.setItem('vidking_users', JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  },

  // Deny user (for admin use)
  denyUser(userId: string): boolean {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex].status = 'denied';
      localStorage.setItem('vidking_users', JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  },

  // Get Telegram bot info (for testing)
  async getBotInfo() {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting bot info:', error);
      return null;
    }
  },

  // Test Telegram connection
  async testTelegramConnection() {
    try {
      const botInfo = await this.getBotInfo();
      if (botInfo && botInfo.ok) {
        console.log('Telegram bot connected successfully:', botInfo.result);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Helper function to get chat ID (for setup)
  async getUpdates() {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
      const data = await response.json();
      console.log('Recent messages:', data);
      
      if (data.ok && data.result.length > 0) {
        const latestMessage = data.result[data.result.length - 1];
        if (latestMessage.message && latestMessage.message.chat) {
          console.log('Your Chat ID is:', latestMessage.message.chat.id);
          return latestMessage.message.chat.id;
        }
      }
      
      console.log('No messages found. Please send a message to your bot first.');
      return null;
    } catch (error) {
      console.error('Error getting updates:', error);
      return null;
    }
  },

  // Send confirmation message back to Telegram
  async sendTelegramConfirmation(message: string) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send Telegram confirmation:', error);
      throw error;
    }
  },

  // Process Telegram commands (approve/deny)
  async processTelegramCommand(command: string, userId?: string): Promise<string> {
    const lowerCommand = command.toLowerCase().trim();
    
    // Handle commands with user ID
    if (lowerCommand.startsWith('approve ') || lowerCommand.startsWith('deny ')) {
      const parts = lowerCommand.split(' ');
      const action = parts[0];
      const targetUserId = parts[1];
      
      if (!targetUserId) {
        return '❌ Please provide a user ID. Format: "approve [user-id]" or "deny [user-id]"';
      }
      
      return this.executeUserAction(action, targetUserId);
    }
    
    // Handle simple approve/deny (for reply to message)
    if (lowerCommand === 'approve' || lowerCommand === 'deny') {
      if (!userId) {
        return '❌ User ID not found. Please use format: "approve [user-id]" or "deny [user-id]"';
      }
      
      return this.executeUserAction(lowerCommand, userId);
    }
    
    // Handle other commands
    if (lowerCommand === '/start' || lowerCommand === 'start') {
      return '🎬 Welcome to CouchPotato Admin Bot!\n\nCommands:\n• "approve [user-id]" - Approve user\n• "deny [user-id]" - Deny user\n• "list" - Show pending users\n• "help" - Show this help';
    }
    
    if (lowerCommand === 'list') {
      return this.listPendingUsers();
    }
    
    if (lowerCommand === 'help') {
      return '🎬 CouchPotato Admin Commands:\n\n• "approve [user-id]" - Approve user access\n• "deny [user-id]" - Deny user access\n• "list" - Show all pending users\n• "help" - Show this help message\n\nYou can also reply "approve" or "deny" to registration messages.';
    }
    
    return '❓ Unknown command. Type "help" for available commands.';
  },

  // Execute user approval/denial action
  executeUserAction(action: string, userId: string): string {
    const users = this.getStoredUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return `❌ User with ID "${userId}" not found.`;
    }
    
    if (action === 'approve') {
      if (user.status === 'approved') {
        return `✅ User "${user.name}" (${user.email}) is already approved.`;
      }
      
      const success = this.approveUser(userId);
      if (success) {
        return `✅ User "${user.name}" (${user.email}) has been approved!\n\nThey can now log in to CouchPotato.`;
      } else {
        return `❌ Failed to approve user "${user.name}".`;
      }
    }
    
    if (action === 'deny') {
      if (user.status === 'denied') {
        return `❌ User "${user.name}" (${user.email}) is already denied.`;
      }
      
      const success = this.denyUser(userId);
      if (success) {
        return `❌ User "${user.name}" (${user.email}) has been denied access.`;
      } else {
        return `❌ Failed to deny user "${user.name}".`;
      }
    }
    
    return '❓ Invalid action. Use "approve" or "deny".';
  },

  // List all pending users
  listPendingUsers(): string {
    const users = this.getStoredUsers();
    const pendingUsers = users.filter(u => u.status === 'pending');
    
    if (pendingUsers.length === 0) {
      return '📋 No pending users at the moment.';
    }
    
    let message = `📋 Pending Users (${pendingUsers.length}):\n\n`;
    
    pendingUsers.forEach((user, index) => {
      message += `${index + 1}. 👤 ${user.name}\n`;
      message += `   📧 ${user.email}\n`;
      message += `   🆔 ${user.id}\n`;
      message += `   🕒 ${new Date(user.createdAt).toLocaleString()}\n\n`;
    });
    
    message += 'Reply with "approve [user-id]" or "deny [user-id]" to take action.';
    
    return message;
  },

  // Promote user to admin
  promoteToAdmin(userId: string): boolean {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex].role = 'admin';
      localStorage.setItem('vidking_users', JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  },

  // Demote admin to user
  demoteFromAdmin(userId: string): boolean {
    try {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex].role = 'user';
      localStorage.setItem('vidking_users', JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  },

  // Delete user
  deleteUser(userId: string): boolean {
    try {
      const users = this.getStoredUsers();
      const filteredUsers = users.filter(u => u.id !== userId);
      
      if (filteredUsers.length === users.length) return false; // User not found
      
      localStorage.setItem('vidking_users', JSON.stringify(filteredUsers));
      
      // Also remove password
      const passwords = JSON.parse(localStorage.getItem('vidking_passwords') || '{}');
      const user = users.find(u => u.id === userId);
      if (user) {
        delete passwords[user.email];
        localStorage.setItem('vidking_passwords', JSON.stringify(passwords));
      }
      
      return true;
    } catch {
      return false;
    }
  }
};
