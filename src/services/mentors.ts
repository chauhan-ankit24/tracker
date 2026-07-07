import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { AppUser } from '../types';
import { generateMentorCode } from '../utils/mentorCode';

const USERS = 'users';
const MENTOR_CODES = 'mentorCodes';

/** mentorCodes/{CODE} → { mentorId } : O(1) lookup from a short code. */
interface MentorCodeDoc {
  mentorId: string;
}

/**
 * Reserves a unique short mentor code and writes its lookup document.
 * Retries on the rare collision. Returns the chosen code.
 */
export async function createMentorCode(mentorId: string): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateMentorCode();
    const ref = doc(db, MENTOR_CODES, code);
    const existing = await getDoc(ref);
    if (existing.exists()) continue;
    await setDoc(ref, { mentorId } satisfies MentorCodeDoc);
    return code;
  }
  throw new Error('Could not generate a unique mentor code. Please try again.');
}

/** Resolves a short mentor code to the mentor's user id, or null if unknown. */
export async function resolveMentorCode(code: string): Promise<string | null> {
  const snap = await getDoc(doc(db, MENTOR_CODES, code));
  if (!snap.exists()) return null;
  return (snap.data() as MentorCodeDoc).mentorId;
}

/**
 * Mentors awaiting the owner's approval. Filtered client-side (approved:false,
 * not rejected) so no composite Firestore index is required.
 */
export async function getPendingMentors(): Promise<AppUser[]> {
  const q = query(collection(db, USERS), where('role', '==', 'admin'));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<AppUser, 'id'>) }))
    .filter((u) => u.approved === false && u.rejected !== true);
}

export async function approveMentor(mentorId: string): Promise<void> {
  await updateDoc(doc(db, USERS, mentorId), { approved: true, rejected: false });
}

export async function rejectMentor(mentorId: string): Promise<void> {
  await updateDoc(doc(db, USERS, mentorId), { rejected: true });
}
