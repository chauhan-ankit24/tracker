import {
  createUserWithEmailAndPassword,
  deleteUser,
  signOut as fbSignOut,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { isOwner } from "../config/app";
import { auth, db } from "../config/firebase";
import { AppUser, Role } from "../types";
import { normalizeMentorCode } from "../utils/mentorCode";
import { isApprovedMentor } from "../utils/roles";
import { deleteAllEntriesForUser, getStudentsForAdmin } from "./entries";
import { createMentorCode, resolveMentorCode } from "./mentors";

const USERS = "users";

/** Thrown for validation problems we raise ourselves (not from Firebase). */
export class AppAuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Reads the Firestore user profile document for an auth uid. */
export async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, USERS, uid));
  if (!snap.exists()) return null;
  return { id: uid, ...(snap.data() as Omit<AppUser, "id">) };
}

/** Updates just the user's chosen avatar id. */
export async function updateUserAvatar(
  uid: string,
  avatar: string,
): Promise<void> {
  await updateDoc(doc(db, USERS, uid), { avatar });
}

interface ProfileInput {
  uid: string;
  name: string;
  email: string;
  role: Role;
  /** Short mentor code entered by a devotee joining a mentor. */
  mentorCodeInput?: string;
}

/**
 * Creates the Firestore profile for a freshly-authenticated user. Shared by
 * email/password sign-up and Google onboarding.
 *
 * - Devotee: resolves the short mentor code to a real, *approved* mentor.
 * - Mentor: starts unapproved (owner is auto-approved) and gets a short code.
 */
export async function writeUserProfile({
  uid,
  name,
  email,
  role,
  mentorCodeInput,
}: ProfileInput): Promise<AppUser> {
  let profile: Omit<AppUser, "id">;

  const code = normalizeMentorCode(mentorCodeInput ?? "");
  const mentorId = code ? await resolveMentorCode(code) : null;

  if (role === "user") {
    if (!mentorId) {
      throw new AppAuthError("app/invalid-mentor", "Invalid mentor code.");
    }
    const mentor = await fetchUserProfile(mentorId).catch(() => null);
    if (!mentor || !isApprovedMentor(mentor)) {
      throw new AppAuthError(
        "app/mentor-not-approved",
        "That mentor is not active yet.",
      );
    }
    profile = {
      name: name.trim(),
      email: email.trim(),
      role,
      adminId: mentorId,
    };
  } else {
    if (mentorId) {
      const mentor = await fetchUserProfile(mentorId).catch(() => null);
      if (!mentor || !isApprovedMentor(mentor)) {
        throw new AppAuthError(
          "app/mentor-not-approved",
          "That mentor is not active yet.",
        );
      }
    }
    // Mentor: owner is auto-approved, everyone else awaits approval.
    const mentorCode = await createMentorCode(uid);
    profile = {
      name: name.trim(),
      email: email.trim(),
      role,
      adminId: mentorId || null,
      approved: isOwner(uid),
      rejected: false,
      mentorCode,
    };
  }

  await setDoc(doc(db, USERS, uid), profile);
  return { id: uid, ...profile };
}

interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
  /** Short mentor code (devotees only). */
  mentorCode?: string;
}

export async function signUp({
  name,
  email,
  password,
  role = "user",
  mentorCode = "",
}: SignUpInput): Promise<AppUser> {
  // Firebase enforces one account per email; this throws auth/email-already-in-use
  // if the address is taken. Creating the user also signs us in, which is what
  // lets the mentor-code lookup below pass Firestore's auth check.
  const cred = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  try {
    await updateProfile(cred.user, { displayName: name.trim() });
    const profile = await writeUserProfile({
      uid: cred.user.uid,
      name,
      email,
      role,
      mentorCodeInput: mentorCode,
    });

    // Kick off email verification. A failure here (e.g. rate limit) shouldn't
    // undo an otherwise-valid sign-up — the user can resend from the app.
    await sendEmailVerification(cred.user).catch(() => {});

    return profile;
  } catch (err) {
    // Roll back the half-created account so the email stays free to retry.
    await deleteUser(cred.user).catch(() => {});
    throw err;
  }
}

/**
 * Finishes account setup for a Google user who has authenticated but has no
 * profile yet. Unlike sign-up, a failure here does NOT delete the Google
 * account — the user simply stays on the onboarding screen to retry.
 */
export async function completeOnboarding(input: {
  role: Role;
  name?: string;
  mentorCode?: string;
}): Promise<AppUser> {
  const current = auth.currentUser;
  if (!current)
    throw new AppAuthError("app/no-session", "You are not signed in.");
  return writeUserProfile({
    uid: current.uid,
    name: input.name?.trim() || current.displayName || "Devotee",
    email: current.email ?? "",
    role: input.role,
    mentorCodeInput: input.mentorCode,
  });
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Permanently deletes the signed-in user's account and their own data.
 *
 * A mentor is blocked while any devotees are still assigned to them, so no
 * student is ever orphaned. Students' own data is never touched.
 */
export async function deleteOwnAccount(user: AppUser): Promise<void> {
  const current = auth.currentUser;
  if (!current)
    throw new AppAuthError("app/no-session", "You are not signed in.");

  if (user.role === "admin") {
    const students = await getStudentsForAdmin(user.id);
    if (students.length > 0) {
      throw new AppAuthError(
        "app/mentor-has-students",
        `You still have ${students.length} devotee${students.length === 1 ? "" : "s"} assigned to you. ` +
          "They must move to another mentor before you can delete your account.",
      );
    }
  }

  // Delete Firestore data while still authenticated, then the auth account.
  await deleteAllEntriesForUser(user.id);
  await deleteDoc(doc(db, USERS, user.id));
  // May throw auth/requires-recent-login if the session is old.
  await deleteUser(current);
}

/** Re-sends the verification email to the currently signed-in user. */
export async function resendVerificationEmail(): Promise<void> {
  if (auth.currentUser) await sendEmailVerification(auth.currentUser);
}

/** Refreshes the auth token and reports whether the email is now verified. */
export async function reloadVerificationStatus(): Promise<boolean> {
  const current = auth.currentUser;
  if (!current) return false;
  await current.reload();
  if (current.emailVerified) {
    // Force a fresh ID token so Firestore security rules immediately see
    // email_verified === true (otherwise the cached token lags behind).
    await current.getIdToken(true);
  }
  return current.emailVerified;
}

/** Human-friendly messages for the Firebase auth error codes we expect. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "app/invalid-mentor":
      return "That mentor code doesn't match any mentor. Please double-check it.";
    case "app/mentor-not-approved":
      return "That mentor is not active yet. Please try again once they are approved.";
    case "app/mentor-has-students":
      // Surface the specific count-aware message we raised.
      return (err as Error).message;
    case "auth/requires-recent-login":
      return "For your security, please sign out and sign in again, then delete your account.";
    case "app/google-unavailable":
      return (err as Error).message;
    case "app/google-cancelled":
      return "";
    case "auth/account-exists-with-different-credential":
      return "An account with this email already exists. Sign in with your email and password instead.";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/email-already-in-use":
      return "An account already exists for this email.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}
