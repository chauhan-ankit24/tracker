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
import {
  Question,
  Questionnaire,
  QuestionnaireResponse,
  Schedule,
} from '../types';
import { fromDayKey, todayKey } from '../utils/date';

const QUESTIONNAIRES = 'questionnaires';
const RESPONSES = 'responses';

/**
 * Deterministic id per questionnaire+student+day guarantees "one response per
 * student per questionnaire per day" without extra queries — writing the same
 * day overwrites. Mirrors the entries collection convention. Because ids never
 * contain underscores (Firestore auto-ids, uids and YYYY-MM-DD dates don't),
 * the security rules can recover the owner uid from `id.split('_')[1]`.
 */
function responseId(questionnaireId: string, userId: string, date: string): string {
  return `${questionnaireId}_${userId}_${date}`;
}

/**
 * True when a schedule makes a questionnaire visible on the given local day.
 * Day keys are YYYY-MM-DD, which compare correctly as strings.
 */
export function scheduleActiveOn(schedule: Schedule, dateKey: string): boolean {
  if (schedule.startDate && dateKey < schedule.startDate) return false;
  if (schedule.endDate && dateKey > schedule.endDate) return false;
  switch (schedule.type) {
    case 'daily':
    case 'range':
      return true;
    case 'weekdays':
      return schedule.weekdays.includes(fromDayKey(dateKey).getDay());
    default:
      return false;
  }
}

/** Short human sentence describing a schedule, for list rows. */
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function describeSchedule(schedule: Schedule): string {
  switch (schedule.type) {
    case 'daily':
      return schedule.endDate ? `Every day until ${schedule.endDate}` : 'Every day (ongoing)';
    case 'range':
      return `${schedule.startDate ?? '—'} → ${schedule.endDate ?? '—'}`;
    case 'weekdays': {
      const days = [...schedule.weekdays].sort().map((d) => WEEKDAY_LABELS[d]);
      return days.length ? days.join(' · ') : 'No days selected';
    }
    default:
      return '';
  }
}

interface SaveQuestionnaireInput {
  /** Provide to update an existing questionnaire; omit to create a new one. */
  id?: string;
  adminId: string;
  title: string;
  questions: Question[];
  schedule: Schedule;
  isTemplate: boolean;
  active: boolean;
  /** Preserved on update; ignored on create. */
  createdAt?: number;
}

/** Creates or updates a questionnaire owned by the given mentor. */
export async function saveQuestionnaire(
  input: SaveQuestionnaireInput,
): Promise<Questionnaire> {
  const now = Date.now();
  const ref = input.id
    ? doc(db, QUESTIONNAIRES, input.id)
    : doc(collection(db, QUESTIONNAIRES));

  const questionnaire: Questionnaire = {
    id: ref.id,
    adminId: input.adminId,
    title: input.title,
    questions: input.questions,
    schedule: input.schedule,
    isTemplate: input.isTemplate,
    active: input.active,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };

  await setDoc(ref, questionnaire);
  return questionnaire;
}

export async function getQuestionnaire(id: string): Promise<Questionnaire | null> {
  const snap = await getDoc(doc(db, QUESTIONNAIRES, id));
  return snap.exists() ? (snap.data() as Questionnaire) : null;
}

export async function deleteQuestionnaire(id: string): Promise<void> {
  await deleteDoc(doc(db, QUESTIONNAIRES, id));
}

/**
 * Every questionnaire owned by a mentor (live ones and templates). Sorting is
 * applied client-side so no composite index is needed.
 */
export async function getQuestionnairesForAdmin(
  adminId: string,
): Promise<Questionnaire[]> {
  const q = query(collection(db, QUESTIONNAIRES), where('adminId', '==', adminId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Questionnaire);
}

/**
 * Questionnaires a student should answer today: their mentor's live (non-
 * template, active) questionnaires whose schedule includes `date`. Filtered
 * client-side so the query stays a single-field equality (no index, and the
 * rules can prove it only touches the mentor's docs).
 */
export async function getActiveQuestionnairesForStudent(
  adminId: string,
  date: string = todayKey(),
): Promise<Questionnaire[]> {
  const q = query(collection(db, QUESTIONNAIRES), where('adminId', '==', adminId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Questionnaire)
    .filter((q) => !q.isTemplate && q.active && scheduleActiveOn(q.schedule, date));
}

export async function getResponse(
  questionnaireId: string,
  userId: string,
  date: string = todayKey(),
): Promise<QuestionnaireResponse | null> {
  const snap = await getDoc(
    doc(db, RESPONSES, responseId(questionnaireId, userId, date)),
  );
  return snap.exists() ? (snap.data() as QuestionnaireResponse) : null;
}

interface SaveResponseInput {
  questionnaireId: string;
  adminId: string;
  userId: string;
  answers: Record<string, string>;
  date?: string;
}

/** Creates or updates a student's answers for one questionnaire on one day. */
export async function saveResponse({
  questionnaireId,
  adminId,
  userId,
  answers,
  date = todayKey(),
}: SaveResponseInput): Promise<QuestionnaireResponse> {
  const id = responseId(questionnaireId, userId, date);
  const ref = doc(db, RESPONSES, id);
  const existing = await getDoc(ref);
  const now = Date.now();

  const response: QuestionnaireResponse = {
    id,
    questionnaireId,
    adminId,
    userId,
    date,
    answers,
    createdAt: existing.exists()
      ? (existing.data() as QuestionnaireResponse).createdAt
      : now,
    updatedAt: now,
  };

  try {
    await setDoc(ref, response);
  } catch (e) {
    // Same freshly-verified-token race the entries service guards against.
    if ((e as { code?: string })?.code === 'permission-denied' && auth.currentUser) {
      await auth.currentUser.getIdToken(true);
      await setDoc(ref, response);
    } else {
      throw e;
    }
  }
  return response;
}

/**
 * Every response across a mentor's questionnaires (queried by adminId — a
 * single-field equality the rules can prove safe), filtered to one
 * questionnaire client-side. Used by the responses screen.
 */
export async function getResponsesForQuestionnaire(
  adminId: string,
  questionnaireId: string,
): Promise<QuestionnaireResponse[]> {
  const q = query(collection(db, RESPONSES), where('adminId', '==', adminId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as QuestionnaireResponse)
    .filter((r) => r.questionnaireId === questionnaireId);
}

/** Removes every response a student authored (used on account deletion). */
export async function deleteAllResponsesForUser(userId: string): Promise<void> {
  const q = query(collection(db, RESPONSES), where('userId', '==', userId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

/* ------------------------------------------------------------------ */
/* Starter templates                                                   */
/* ------------------------------------------------------------------ */

let seq = 0;
/** Fresh, collision-free question id for editor/template use. */
export function newQuestionId(): string {
  seq += 1;
  return `q_${Date.now().toString(36)}_${seq}`;
}

function q(text: string, required: boolean): Question {
  return { id: newQuestionId(), text, required };
}

export interface StarterTemplate {
  key: string;
  title: string;
  description: string;
  questions: Omit<Question, 'id'>[];
  scheduleType: Schedule['type'];
  weekdays: number[];
}

/**
 * Read-only starters a mentor can customize before sending. Ids are minted
 * fresh when a starter is opened in the editor.
 */
export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    key: 'daily-checkin',
    title: 'Daily sadhana check-in',
    description: 'A short daily reflection beyond the numbers.',
    scheduleType: 'daily',
    weekdays: [],
    questions: [
      { text: 'How was the quality of your chanting today?', required: true },
      { text: 'What did you read, and what stood out?', required: false },
      { text: 'One thing you are grateful for today.', required: false },
    ],
  },
  {
    key: 'sunday-reflection',
    title: 'Sunday reflection',
    description: 'A weekly review, every Sunday.',
    scheduleType: 'weekdays',
    weekdays: [0],
    questions: [
      { text: 'How did your week of sadhana go overall?', required: true },
      { text: 'Where did you struggle, and why?', required: true },
      { text: 'What is one intention for the coming week?', required: false },
    ],
  },
  {
    key: 'retreat',
    title: 'Retreat journal',
    description: 'Deeper prompts for a retreat date range.',
    scheduleType: 'range',
    weekdays: [],
    questions: [
      { text: 'What association or class touched you today?', required: true },
      { text: 'What realization are you taking away?', required: true },
      { text: 'Any doubts or questions for your mentor?', required: false },
    ],
  },
];

/** Materializes a starter into editable questions (with fresh ids). */
export function instantiateStarter(starter: StarterTemplate): Question[] {
  return starter.questions.map((s) => q(s.text, s.required));
}
