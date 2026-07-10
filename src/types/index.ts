export type Role = 'admin' | 'user';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** The admin/mentor this devotee belongs to. Null for admins with no mentor. */
  adminId: string | null;
  /** Id of a chosen predefined avatar; falls back to initials when absent. */
  avatar?: string;
  /** Mentors only: whether the app owner has approved this mentor. */
  approved?: boolean;
  /** Mentors only: set true if the owner rejected the mentor request. */
  rejected?: boolean;
  /** Mentors only: short human-friendly code devotees use to join. */
  mentorCode?: string;
}

export interface DailyEntry {
  id: string;
  userId: string;
  /** Local calendar day the entry belongs to, formatted as YYYY-MM-DD. */
  date: string;
  /**
   * The day's logged metrics, keyed by {@link Metric} id. Replaces the old
   * fixed chantingRounds/readingMinutes so mentors can define what devotees
   * track. Legacy entries are normalized into this shape on read.
   */
  values: Record<string, number>;
  createdAt: number;
  updatedAt: number;
}

/** How a quick question (daily metric) is entered. Both are numeric. */
export type MetricType = 'counter' | 'scale';

export interface MetricPreset {
  label: string;
  value: number;
  /** `add` bumps the current value; `set` replaces it. */
  type: 'add' | 'set';
}

/**
 * A "quick question" a mentor asks devotees to log each day — the mentor-
 * configurable replacement for the old hardcoded chanting/reading fields.
 */
export interface Metric {
  /** Stable id; also the key under {@link DailyEntry.values}. */
  id: string;
  label: string;
  type: MetricType;
  /** Ionicons glyph name shown on the input card. */
  icon?: string;
  /** Counter only: unit suffix (e.g. "rounds", "min"). */
  unit?: string;
  /** Counter only: +/- increment (defaults to 1). */
  step?: number;
  /** Counter only: upper bound. */
  max?: number;
  /** Counter only: optional quick-set chips. */
  presets?: MetricPreset[];
  /** Inactive metrics are hidden from Today but kept for historical data. */
  active: boolean;
}

/** A mentor's ordered set of quick questions, stored at metricSets/{adminId}. */
export interface MetricSet {
  adminId: string;
  metrics: Metric[];
  updatedAt: number;
}

/**
 * A devotee's personal daily targets, stored at goals/{userId}. Keyed by
 * {@link Metric} id → target value (e.g. 16 rounds). A day "meets" the goal
 * when its logged value is at least the target.
 */
export interface Goals {
  userId: string;
  /** Denormalized mentor id so mentors can read a devotee's adherence. */
  adminId: string | null;
  targets: Record<string, number>;
  updatedAt: number;
}

export type HistoryFilter = '7d' | '30d' | 'all';

/** A single reflection question inside a questionnaire. */
export interface Question {
  /** Stable id, unique within its questionnaire. */
  id: string;
  text: string;
  /** Mandatory questions must be answered before a student can submit. */
  required: boolean;
}

export type ScheduleType = 'daily' | 'range' | 'weekdays';

/**
 * When a questionnaire is shown to students. All fields are always present
 * (null / empty rather than absent) so Firestore never sees `undefined` and
 * the security rules can validate a fixed shape.
 */
export interface Schedule {
  type: ScheduleType;
  /** Inclusive lower bound (YYYY-MM-DD). Null = no start bound. */
  startDate: string | null;
  /** Inclusive upper bound (YYYY-MM-DD). Null = ongoing. */
  endDate: string | null;
  /** For `weekdays`: 0=Sun … 6=Sat. Empty for other types. */
  weekdays: number[];
}

export interface Questionnaire {
  id: string;
  /** The mentor who owns it — the visibility boundary. */
  adminId: string;
  title: string;
  questions: Question[];
  schedule: Schedule;
  /** Reusable templates are never shown to students. */
  isTemplate: boolean;
  /** Mentor can pause a live questionnaire without deleting it. */
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

/** One student's answers to one questionnaire on one calendar day. */
export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  /** Denormalized from the questionnaire so rules can grant the mentor read. */
  adminId: string;
  userId: string;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  /** Map of question id → the student's answer text. */
  answers: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}
