// Firebase Configuration Template
// Copy this file to firebase.ts and replace with your actual Firebase config

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// 🔥 REPLACE THESE WITH YOUR ACTUAL FIREBASE CONFIG
// Get this from Firebase Console → Project Settings → General → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development (optional)
if (import.meta.env.DEV) {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, "localhost", 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
}

export default app;

// 📋 SETUP CHECKLIST:
// [ ] 1. Create Firebase project at https://console.firebase.google.com/
// [ ] 2. Enable Authentication → Email/Password
// [ ] 3. Create Firestore Database
// [ ] 4. Copy your config from Project Settings
// [ ] 5. Replace the config above with your actual values
// [ ] 6. Create admin users in Firebase Console
// [ ] 7. Set up Firestore security rules
// [ ] 8. Test authentication flow
// [ ] 9. Deploy and test on production

// 🔐 ADMIN USERS TO CREATE:
// Email: admin@couchpotato.com, Password: admin123
// Email: tashingachitambira@gmail.com, Password: CouchPotato2024!

// 🗄️ FIRESTORE COLLECTION STRUCTURE:
// Collection: users
// Document ID: user UID
// Fields: uid, email, displayName, role, status, createdAt, etc.

// 🛡️ SECURITY RULES EXAMPLE:
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//   }
// }
