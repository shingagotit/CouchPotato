import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration for CouchPotato
const firebaseConfig = {
  apiKey: "AIzaSyAHvwYrZCFnvX2xyp1u4unC81VAoJeSLCY",
  authDomain: "couchpotato-daaa3.firebaseapp.com",
  projectId: "couchpotato-daaa3",
  storageBucket: "couchpotato-daaa3.appspot.com",
  messagingSenderId: "612756968309",
  appId: "1:612756968309:web:couchpotato-app"
};

// Initialize Firebase with error handling
let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('🔥 Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  // Create fallback objects to prevent app crashes
  app = null;
  auth = null;
  db = null;
  storage = null;
}

export { auth, db, storage };
export default app;

// Connect to emulators in development (optional)
if (import.meta.env.DEV) {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, "localhost", 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
}
