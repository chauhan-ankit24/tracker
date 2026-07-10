import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import { Goals } from '../types';

const GOALS = 'goals';

/**
 * A user's daily targets. Doc id is the user's uid. Returns null when none are
 * set. Reads that the rules can't authorize (e.g. a mentor opening a devotee
 * who has no goals doc yet) are treated as "no goals" rather than errors.
 */
export async function getGoals(userId: string): Promise<Goals | null> {
  try {
    const snap = await getDoc(doc(db, GOALS, userId));
    return snap.exists() ? (snap.data() as Goals) : null;
  } catch {
    return null;
  }
}

/** Creates or replaces a user's targets. Only the user themselves may write. */
export async function saveGoals(
  userId: string,
  adminId: string | null,
  targets: Record<string, number>,
): Promise<Goals> {
  const goals: Goals = { userId, adminId, targets, updatedAt: Date.now() };
  try {
    await setDoc(doc(db, GOALS, userId), goals);
  } catch (e) {
    // Same freshly-verified-token race the other writers guard against.
    if ((e as { code?: string })?.code === 'permission-denied' && auth.currentUser) {
      await auth.currentUser.getIdToken(true);
      await setDoc(doc(db, GOALS, userId), goals);
    } else {
      throw e;
    }
  }
  return goals;
}
