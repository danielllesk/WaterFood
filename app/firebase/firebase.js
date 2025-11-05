import { initializeApp, getApps } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Debug: Log environment variables (only in development)
// Log both on server and client side
if (process.env.NODE_ENV === 'development') {
  const envCheck = {
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    hasMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  console.log('🔥 Firebase Config Check:', envCheck);
  
  // Show actual values if any are missing (for debugging)
  if (Object.values(envCheck).some(v => !v)) {
    console.warn('⚠️  Some Firebase env vars are missing!');
    console.log('Environment variables:', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***' + process.env.NEXT_PUBLIC_FIREBASE_API_KEY.slice(-4) : 'MISSING',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
    });
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all required config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('Firebase configuration error: Missing required keys:', missingKeys);
  console.error('Current config:', firebaseConfig);
  console.error('Environment check:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing',
  });
  console.error('⚠️  Please ensure your .env file exists and contains all NEXT_PUBLIC_FIREBASE_* variables.');
  console.error('⚠️  After adding/updating .env, restart your Next.js dev server with: npm run dev');
}

// Initialize Firebase only if config is valid and not already initialized
let app;
if (missingKeys.length === 0) {
  try {
    // Check if Firebase app is already initialized
    const apps = getApps();
    if (apps.length === 0) {
      // Validate config values are not just empty strings
      const hasValidConfig = Object.values(firebaseConfig).every(val => val && val.trim() !== '');
      if (!hasValidConfig) {
        console.error('Firebase config has empty values:', firebaseConfig);
        throw new Error('Firebase configuration contains empty values. Please check your .env file.');
      }
      
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } else {
      app = apps[0];
      console.log('✅ Using existing Firebase app instance');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Firebase config used:', {
      apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'MISSING',
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
    });
    // Don't throw - allow app to continue but Firebase won't work
    app = null;
  }
} else {
  // Create a dummy app with placeholder values to prevent crashes
  // This allows the app to load but Firebase features won't work
  console.warn('Firebase will not be initialized due to missing configuration.');
  app = null;
}

// Initialize Firestore and Auth only if app exists
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

// Enable offline persistence for Firestore (only if db exists)
if (db && typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence failed: Browser does not support it.');
    } else {
      console.error('Firestore persistence error:', err);
    }
  });
}

export default app;
export { db, auth };
