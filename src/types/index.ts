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
  chantingRounds: number;
  readingMinutes: number;
  createdAt: number;
  updatedAt: number;
}

export type HistoryFilter = '7d' | '30d' | 'all';

export interface Stats {
  currentStreak: number;
  totalDays: number;
  avgChanting: number;
  avgReading: number;
  totalRounds: number;
  totalMinutes: number;
}
