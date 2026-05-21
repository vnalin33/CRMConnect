/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase for server-side push notification delivery.
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    // Try loading service account from file
    const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with service account');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Fallback: use environment variables
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized with env variables');
    } else {
      console.warn('⚠️  Firebase not configured — push notifications disabled');
      console.warn('   Place firebase-service-account.json in backend/ or set FIREBASE_* env vars');
      return null;
    }
  } catch (err) {
    console.error('❌ Firebase init error:', err.message);
    return null;
  }

  return firebaseApp;
};

const getMessaging = () => {
  const app = initializeFirebase();
  if (!app) return null;
  return admin.messaging();
};

module.exports = { initializeFirebase, getMessaging };
