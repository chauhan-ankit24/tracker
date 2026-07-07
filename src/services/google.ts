import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

import { auth } from '../config/firebase';
import { GOOGLE_WEB_CLIENT_ID } from '../config/app';
import { AppAuthError } from './auth';

/**
 * Google Sign-In lives behind a dynamic import so the native module is never
 * touched at app launch — that keeps the app usable in Expo Go (where the
 * native module is absent). The import only runs when the button is pressed.
 */
async function loadGoogle() {
  const mod = await import('@react-native-google-signin/google-signin');
  mod.GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  return mod.GoogleSignin;
}

/**
 * Signs in with Google and exchanges the token with Firebase. On success the
 * AuthContext listener takes over (routing to the app or onboarding).
 */
export async function signInWithGoogle(): Promise<void> {
  let GoogleSignin;
  try {
    GoogleSignin = await loadGoogle();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  } catch {
    throw new AppAuthError(
      'app/google-unavailable',
      'Google sign-in needs the installed app (not Expo Go) and Play Services.',
    );
  }

  const response: any = await GoogleSignin.signIn();
  // v13+ returns { type, data }; older returns the payload directly.
  if (response?.type === 'cancelled') {
    throw new AppAuthError('app/google-cancelled', 'Google sign-in was cancelled.');
  }
  const idToken: string | undefined = response?.data?.idToken ?? response?.idToken;
  if (!idToken) {
    throw new AppAuthError('app/google-cancelled', 'Google sign-in was cancelled.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}

/** Best-effort clearing of the native Google session on sign-out. */
export async function googleSignOut(): Promise<void> {
  try {
    const mod = await import('@react-native-google-signin/google-signin');
    await mod.GoogleSignin.signOut();
  } catch {
    // Not signed in with Google, or module unavailable — ignore.
  }
}
