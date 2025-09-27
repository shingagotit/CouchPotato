import { User } from '@/types/movie';

// Custom UUID generator that works in all browsers
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function initializeAdminUser(): void {
  try {
    const usersData = localStorage.getItem('couchpotato_users');
    let users: User[] = [];
    
    if (usersData) {
      users = JSON.parse(usersData);
    }
    
    // Check if admin user already exists
    const adminExists = users.some(user => user.email === 'admin@couchpotato.com');
    
    if (!adminExists) {
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
      localStorage.setItem('couchpotato_users', JSON.stringify(users));
      
      // Also set admin password
      const passwordsData = localStorage.getItem('couchpotato_passwords');
      let passwords: Record<string, string> = {};
      
      if (passwordsData) {
        passwords = JSON.parse(passwordsData);
      }
      
      passwords['admin@couchpotato.com'] = 'admin123';
      localStorage.setItem('couchpotato_passwords', JSON.stringify(passwords));
      
      console.log('✅ Admin user initialized for GitHub Pages deployment');
    }
  } catch (error) {
    console.error('Failed to initialize admin user:', error);
  }
}

// Initialize admin user when this module is imported
initializeAdminUser();
