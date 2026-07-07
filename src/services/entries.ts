import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';
import { AppUser, DailyEntry } from '../types';
import { todayKey } from '../utils/date';

const ENTRIES = 'entries';
const USERS = 'users';

/**
 * Deterministic document id per user+day guarantees the "one entry per day"
 * rule without extra queries: writing the same day simply overwrites.
 */
function entryId(userId: string, date: string): string {
  return `${userId}_${date}`;
}

export async function getEntryForDay(
  userId: string,
  date: string,
): Promise<DailyEntry | null> {
  const snap = await getDoc(doc(db, ENTRIES, entryId(userId, date)));
  if (!snap.exists()) return null;
  return snap.data() as DailyEntry;
}

export function getTodayEntry(userId: string): Promise<DailyEntry | null> {
  return getEntryForDay(userId, todayKey());
}

interface SaveInput {
  userId: string;
  chantingRounds: number;
  readingMinutes: number;
}

/**
 * Creates or updates today's entry. Editing is allowed only while it is still
 * the same calendar day the entry belongs to.
 */
export async function saveTodayEntry({
  userId,
  chantingRounds,
  readingMinutes,
}: SaveInput): Promise<DailyEntry> {
  const date = todayKey();
  const id = entryId(userId, date);
  const ref = doc(db, ENTRIES, id);
  const existing = await getDoc(ref);
  const now = Date.now();

  const entry: DailyEntry = {
    id,
    userId,
    date,
    chantingRounds,
    readingMinutes,
    createdAt: existing.exists() ? (existing.data() as DailyEntry).createdAt : now,
    updatedAt: now,
  };

  try {
    await setDoc(ref, entry);
  } catch (e) {
    // The write rule requires a verified email. Just after verifying, the
    // cached ID token can still say email_verified=false. Force a token
    // refresh (which re-reads the claim from the server) and retry once.
    if ((e as { code?: string })?.code === 'permission-denied' && auth.currentUser) {
      await auth.currentUser.getIdToken(true);
      await setDoc(ref, entry);
    } else {
      throw e;
    }
  }
  return entry;
}

/** All entries for a user (newest-first sorting is applied client-side). */
export async function getEntriesForUser(userId: string): Promise<DailyEntry[]> {
  const q = query(collection(db, ENTRIES), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyEntry);
}

/** Removes every entry belonging to a user (used when deleting their account). */
export async function deleteAllEntriesForUser(userId: string): Promise<void> {
  const q = query(collection(db, ENTRIES), where('userId', '==', userId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

/** All devotees assigned to a given admin/mentor. */
export async function getStudentsForAdmin(adminId: string): Promise<AppUser[]> {
  const q = query(collection(db, USERS), where('adminId', '==', adminId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppUser, 'id'>) }));
}
