// src/lib/firebase.js
// Add this alongside your existing src/lib/supabase.js

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ─── Replace with your actual Firebase project config ─────────────────────────
// Get this from: Firebase Console → Project Settings → Your Apps → SDK setup
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// ─────────────────────────────────────────────────────────────────────────────

// Initialize Firebase (guard against double-init in StrictMode)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messaging = null;

// Messaging is only available in browser environments
if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn('FCM not available:', err);
  }
}

export { messaging, getToken, onMessage };
export default app;