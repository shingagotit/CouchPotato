# VidKing Vizier - Telegram Bot Setup Guide

## Overview
This guide will help you set up the Telegram bot integration for receiving user registration notifications.

## Step 1: Get Your Chat ID

To receive notifications, you need to get your Telegram chat ID:

1. **Start a conversation with your bot:**
   - Open Telegram and search for your bot using the token: `8051082292:AAGGlCmbl38GOQSZxxOEqBLUetyBoiZfSAE`
   - Or create a new bot by messaging @BotFather if you haven't already

2. **Send a message to your bot:**
   - Send any message to your bot (e.g., "Hello")

3. **Get your chat ID:**
   - Open this URL in your browser: `https://api.telegram.org/bot8051082292:AAGGlCmbl38GOQSZxxOEqBLUetyBoiZfSAE/getUpdates`
   - Look for the `"chat":{"id":` field in the response
   - Copy the number after `"id":` (e.g., if you see `"id":123456789`, your chat ID is `123456789`)

## Step 2: Update the Auth Service

1. **Open `src/lib/auth.ts`**
2. **Find this line:**
   ```typescript
   const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID'; // Replace with your actual chat ID
   ```
3. **Replace `'YOUR_CHAT_ID'` with your actual chat ID:**
   ```typescript
   const TELEGRAM_CHAT_ID = '123456789'; // Your actual chat ID
   ```

## Step 3: Test the Integration

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Try registering a new user:**
   - Go to the registration page
   - Fill out the form with test data
   - Submit the registration

3. **Check your Telegram:**
   - You should receive a notification message with the user's details

## Step 4: Managing User Access

### Approving Users (Manual Method)

1. **Open browser developer tools (F12)**
2. **Go to Console tab**
3. **Run these commands to approve a user:**
   ```javascript
   // Get all pending users
   const users = JSON.parse(localStorage.getItem('vidking_users') || '[]');
   console.log('Pending users:', users.filter(u => u.status === 'pending'));

   // Approve a user by email
   const authService = {
     approveUser: (userId) => {
       const users = JSON.parse(localStorage.getItem('vidking_users') || '[]');
       const userIndex = users.findIndex(u => u.id === userId);
       if (userIndex !== -1) {
         users[userIndex].status = 'approved';
         users[userIndex].approvedAt = new Date().toISOString();
         localStorage.setItem('vidking_users', JSON.stringify(users));
         return true;
       }
       return false;
     }
   };

   // Approve user (replace 'USER_ID_HERE' with actual user ID)
   authService.approveUser('USER_ID_HERE');
   ```

### Denying Users

```javascript
// Deny a user
const authService = {
  denyUser: (userId) => {
    const users = JSON.parse(localStorage.getItem('vidking_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].status = 'denied';
      localStorage.setItem('vidking_users', JSON.stringify(users));
      return true;
    }
    return false;
  }
};

// Deny user (replace 'USER_ID_HERE' with actual user ID)
authService.denyUser('USER_ID_HERE');
```

## Step 5: Create an Admin Panel (Optional)

For easier user management, you can create a simple admin panel:

1. **Create `src/pages/Admin.tsx`:**
   ```typescript
   import React, { useState, useEffect } from 'react';
   import { authService } from '@/lib/auth';
   import { User } from '@/types/movie';

   const Admin = () => {
     const [users, setUsers] = useState<User[]>([]);

     useEffect(() => {
       setUsers(authService.getStoredUsers());
     }, []);

     const handleApprove = (userId: string) => {
       authService.approveUser(userId);
       setUsers(authService.getStoredUsers());
     };

     const handleDeny = (userId: string) => {
       authService.denyUser(userId);
       setUsers(authService.getStoredUsers());
     };

     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold mb-6">User Management</h1>
         <div className="space-y-4">
           {users.map(user => (
             <div key={user.id} className="border p-4 rounded">
               <p><strong>Name:</strong> {user.name}</p>
               <p><strong>Email:</strong> {user.email}</p>
               <p><strong>Status:</strong> {user.status}</p>
               <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
               {user.status === 'pending' && (
                 <div className="mt-2 space-x-2">
                   <button 
                     onClick={() => handleApprove(user.id)}
                     className="bg-green-500 text-white px-4 py-2 rounded"
                   >
                     Approve
                   </button>
                   <button 
                     onClick={() => handleDeny(user.id)}
                     className="bg-red-500 text-white px-4 py-2 rounded"
                   >
                     Deny
                   </button>
                 </div>
               )}
             </div>
           ))}
         </div>
       </div>
     );
   };

   export default Admin;
   ```

2. **Add the admin route to `src/App.tsx`:**
   ```typescript
   <Route path="/admin" element={<Admin />} />
   ```

## Troubleshooting

### Bot Not Receiving Messages
- Make sure your bot token is correct
- Ensure you've sent at least one message to the bot
- Check that your chat ID is correct

### Registration Not Working
- Check browser console for errors
- Verify localStorage is working
- Test with different browsers

### Telegram API Errors
- Check if the bot token is valid
- Ensure the chat ID is a number, not a string
- Verify internet connection

## Security Notes

1. **In Production:**
   - Use environment variables for sensitive data
   - Implement proper password hashing (bcrypt)
   - Use a real database instead of localStorage
   - Add rate limiting for registration attempts

2. **Bot Security:**
   - Keep your bot token secret
   - Consider using webhooks instead of polling
   - Implement proper error handling

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all steps in this guide
3. Test the Telegram bot connection manually
4. Ensure all file paths are correct

The authentication system is now fully implemented and ready to use!
