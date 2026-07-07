import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
// @ts-expect-error getReactNativePersistence is exported at runtime but missing from types.
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, type Firestore } from 'firebase/firestore';

import { env, optionalEnv } from './env';

/**
 * Firebase credentials come from `.env` (see `.env.example`).
 * Enable "Email/Password" under Authentication → Sign-in method, and create a
 * Cloud Firestore database. See README.md for the recommended security rules.
 */
const firebaseConfig = {
  apiKey: env('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: env('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: env('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: env('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('EXPO_PUBLIC_FIREBASE_APP_ID'),
  ...(optionalEnv('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID')
    ? { measurementId: optionalEnv('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID') }
    : {}),
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth can only be called once per app; fall back to getAuth on reload.
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };

/**
 * Force long-polling: the Firestore JS SDK's default WebChannel transport is
 * unreliable on React Native (especially Android), causing reads/writes to
 * hang or fail. Long-polling is the recommended transport for RN.
 */
let db: Firestore;
try {
  db = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch {
  // Already initialized (e.g. after a Fast Refresh) — reuse the instance.
  db = getFirestore(app);
}
export { db };
export default app;
