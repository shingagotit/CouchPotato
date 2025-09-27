import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from './firebase';

// Initialize Firebase with admin users
export const initializeFirebaseAdminUsers = async () => {
  try {
    console.log('🔥 Initializing Firebase admin users...');

    // Admin users to create
    const adminUsers = [
      {
        email: 'admin@couchpotato.com',
        password: 'admin123',
        displayName: 'Administrator',
        role: 'admin',
        status: 'approved'
      },
      {
        email: 'tashingachitambira@gmail.com',
        password: 'CouchPotato2024!',
        displayName: 'Tashinga Chitambira',
        role: 'admin',
        status: 'approved'
      }
    ];

    for (const adminUser of adminUsers) {
      try {
        // Check if user already exists
        const userDocRef = doc(db, 'users', adminUser.email);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log(`🔧 Creating admin user: ${adminUser.email}`);
          
          // Create Firebase Auth user
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            adminUser.email, 
            adminUser.password
          );
          
          // Update display name
          await updateProfile(userCredential.user, {
            displayName: adminUser.displayName
          });

          // Create user document in Firestore
          const userData = {
            uid: userCredential.user.uid,
            email: adminUser.email,
            displayName: adminUser.displayName,
            emailVerified: userCredential.user.emailVerified,
            role: adminUser.role,
            status: adminUser.status,
            createdAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginAttempts: 0,
            securityQuestion: 'What is the name of this streaming platform?',
            securityAnswer: btoa('couchpotato') // Simple encoding for demo
          };

          await setDoc(userDocRef, userData);
          console.log(`✅ Admin user created: ${adminUser.email}`);
        } else {
          console.log(`ℹ️ Admin user already exists: ${adminUser.email}`);
        }
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`ℹ️ Admin user already exists in Auth: ${adminUser.email}`);
        } else {
          console.error(`❌ Error creating admin user ${adminUser.email}:`, error);
        }
      }
    }

    console.log('🎉 Firebase admin users initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing Firebase admin users:', error);
  }
};

// Initialize when module is imported
initializeFirebaseAdminUsers();
