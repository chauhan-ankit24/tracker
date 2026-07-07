import { env } from './env';

/**
 * App-wide configuration constants (from `.env` — see `.env.example`).
 *
 * APP_OWNER_UID — the Firebase Auth UID of the app owner (you). This account:
 *   • is auto-approved as a mentor, and
 *   • can see the in-app "Approvals" screen to approve/reject other mentors.
 *
 * Find your UID in Firebase console → Authentication → your row → "User UID".
 * It must ALSO be set in firestore.rules (the isOwner() function).
 */
export const APP_OWNER_UID = env('EXPO_PUBLIC_APP_OWNER_UID');

/**
 * Google OAuth Web Client ID (from Google Cloud console → Credentials, or the
 * "Web client" auto-created by Firebase when Google sign-in is enabled).
 * Required for Google Sign-In. Format: "<id>.apps.googleusercontent.com".
 */
export const GOOGLE_WEB_CLIENT_ID = env('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');

export function isOwner(uid?: string | null): boolean {
  return !!uid && uid === APP_OWNER_UID;
}

// Running inside Expo Go? Custom native modules (Google Sign-In) don't exist
// there, so we hide Google login rather than let it crash.
export const isExpoGo =
  require('expo-constants').default?.appOwnership === 'expo';

