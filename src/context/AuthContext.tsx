import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

import { auth } from '../config/firebase';
import {
  fetchUserProfile,
  reloadVerificationStatus,
  resendVerificationEmail,
  signOut as svcSignOut,
} from '../services/auth';
import { googleSignOut } from '../services/google';
import { AppUser } from '../types';

interface AuthContextValue {
  /** The Firestore profile, present whenever someone is authenticated. */
  user: AppUser | null;
  /** True while the initial auth state is being resolved. */
  initializing: boolean;
  /** Someone is signed in but hasn't confirmed their email yet. */
  needsVerification: boolean;
  /** Authenticated + verified but has no profile yet (new Google user). */
  needsOnboarding: boolean;
  setUser: (user: AppUser | null) => void;
  refreshUser: () => Promise<void>;
  /** Reloads the account and returns whether the email is now verified. */
  checkVerification: () => Promise<boolean>;
  resendVerification: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [verified, setVerified] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [profileResolved, setProfileResolved] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Monotonic guard: any profile update bumps the epoch so a slower, stale
  // async fetch cannot overwrite a fresher value.
  const epochRef = useRef(0);
  const setUser = useCallback((u: AppUser | null) => {
    epochRef.current += 1;
    setUserState(u);
    setProfileResolved(true);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      const epoch = (epochRef.current += 1);
      if (fbUser) {
        setHasSession(true);
        setVerified(fbUser.emailVerified);
        setProfileResolved(false);
        const profile = await fetchUserProfile(fbUser.uid).catch(() => null);
        if (epochRef.current === epoch) {
          setUserState(profile);
          setProfileResolved(true);
        }
      } else {
        setHasSession(false);
        setVerified(false);
        setUserState(null);
        setProfileResolved(false);
      }
      setInitializing(false);
    });
    return unsub;
  }, []);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      const profile = await fetchUserProfile(auth.currentUser.uid).catch(() => null);
      setUser(profile);
    }
  }, [setUser]);

  const checkVerification = useCallback(async () => {
    const isVerified = await reloadVerificationStatus();
    setVerified(isVerified);
    if (isVerified) await refreshUser();
    return isVerified;
  }, [refreshUser]);

  const resendVerification = useCallback(() => resendVerificationEmail(), []);

  const signOut = useCallback(async () => {
    await googleSignOut(); // best-effort; no-op for non-Google sessions
    await svcSignOut();
    setUserState(null);
    setHasSession(false);
    setVerified(false);
    setProfileResolved(false);
  }, []);

  const needsVerification = hasSession && !verified;
  const needsOnboarding = hasSession && verified && profileResolved && !user;

  const value = useMemo(
    () => ({
      user,
      initializing,
      needsVerification,
      needsOnboarding,
      setUser,
      refreshUser,
      checkVerification,
      resendVerification,
      signOut,
    }),
    [
      user,
      initializing,
      needsVerification,
      needsOnboarding,
      setUser,
      refreshUser,
      checkVerification,
      resendVerification,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
