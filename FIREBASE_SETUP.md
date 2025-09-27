# 🔥 Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your CouchPotato application.

## 📋 Prerequisites

1. A Google account
2. Access to [Firebase Console](https://console.firebase.google.com/)
3. Your CouchPotato project ready for Firebase integration

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `couchpotato-streaming`
4. Enable Google Analytics (optional but recommended)
5. Click **"Create project"**

## 🔧 Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"** authentication
5. Click **"Save"**

## 🌐 Step 3: Configure Web App

1. In Firebase Console, click the **Web icon** (`</>`)
2. Register your app with nickname: `CouchPotato Web`
3. Copy the Firebase configuration object
4. Replace the placeholder config in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-actual-app-id"
};
```

## 🗄️ Step 4: Set Up Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location (choose closest to your users)
5. Click **"Done"**

### Firestore Security Rules (for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read/write all user data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.email == 'admin@couchpotato.com' ||
         request.auth.token.email == 'tashingachitambira@gmail.com');
    }
  }
}
```

## 👤 Step 5: Create Admin Users

### Method 1: Through Firebase Console
1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Create these admin accounts:

**Main Admin:**
- Email: `admin@couchpotato.com`
- Password: `admin123`

**Personal Admin:**
- Email: `tashingachitambira@gmail.com`
- Password: `CouchPotato2024!`

### Method 2: Through Application
1. Start your development server: `npm run dev`
2. Go to `/firebase-auth`
3. Register the admin accounts
4. They will be automatically approved

## 🔐 Step 6: Configure Admin Roles

After creating users, you need to set their roles in Firestore:

1. Go to **Firestore Database**
2. Create a collection called `users`
3. For each admin user, create a document with their UID as the document ID:

**Document Structure:**
```json
{
  "uid": "user-uid-here",
  "email": "admin@couchpotato.com",
  "displayName": "Administrator",
  "role": "admin",
  "status": "approved",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "approvedAt": "2024-01-01T00:00:00.000Z",
  "emailVerified": true,
  "loginAttempts": 0
}
```

## 🚀 Step 7: Deploy and Test

1. Build your application: `npm run build`
2. Deploy to GitHub Pages: `npm run deploy`
3. Test the authentication flow:
   - Go to your deployed site
   - Navigate to `/firebase-auth`
   - Try logging in with admin credentials
   - Test user registration and approval flow

## 🔧 Step 8: Environment Configuration

For production, consider using environment variables:

1. Create `.env.local` file:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

2. Update `src/lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## 🛡️ Step 9: Security Best Practices

1. **Enable App Check** (optional but recommended)
2. **Set up proper Firestore security rules**
3. **Enable email verification** for new users
4. **Configure password reset templates**
5. **Set up monitoring and alerts**

## 📱 Step 10: Testing Features

### Test Authentication Flow:
- [ ] User registration
- [ ] Email verification
- [ ] Password reset
- [ ] Admin approval/denial
- [ ] Role management
- [ ] Account locking

### Test Admin Features:
- [ ] User management dashboard
- [ ] Approve/deny users
- [ ] Promote/demote users
- [ ] Unlock accounts
- [ ] View analytics

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/user-not-found)"**
   - Check if user exists in Firebase Console
   - Verify email spelling

2. **"Firebase: Error (auth/wrong-password)"**
   - Reset password through Firebase Console
   - Check password complexity requirements

3. **"Firebase: Error (auth/email-already-in-use)"**
   - User already exists
   - Try password reset instead

4. **"Firebase: Error (auth/too-many-requests)"**
   - Rate limiting triggered
   - Wait before retrying

5. **Firestore permission denied**
   - Check security rules
   - Verify user authentication status

### Debug Mode:
Enable Firebase debug mode by adding to your browser console:
```javascript
localStorage.setItem('firebase:debug', '*');
```

## 📞 Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Verify your configuration
3. Test with Firebase emulators locally
4. Check browser console for detailed errors

## 🎉 Success!

Once configured, your CouchPotato application will have:
- ✅ Enterprise-grade authentication
- ✅ Real-time user management
- ✅ Secure password handling
- ✅ Email verification
- ✅ Admin dashboard
- ✅ Cloud-based user storage
- ✅ Scalable infrastructure

Your users can now register, login, and access the platform with Firebase's robust authentication system!
