import { daysBetween, todayKey } from './date';

/** How recently a devotee has been logging entries. */
export type ActivityStatus = 'active' | 'occasional' | 'atRisk';

export interface Activity {
  status: ActivityStatus;
  /** Last entry day key, or null if they've never logged. */
  lastDate: string | null;
  /** Whole days since the last entry, or null if never. */
  daysSince: number | null;
}

/**
 * Classifies a devotee from their last entry date:
 *   • active     — logged within the last 2 days
 *   • occasional — last logged 3–6 days ago (slipping)
 *   • atRisk     — 7+ days, or never logged (needs follow-up)
 */
export function classifyActivity(lastDate: string | null): Activity {
  if (!lastDate) return { status: 'atRisk', lastDate: null, daysSince: null };
  const daysSince = Math.max(0, daysBetween(lastDate, todayKey()));
  const status: ActivityStatus =
    daysSince <= 2 ? 'active' : daysSince <= 6 ? 'occasional' : 'atRisk';
  return { status, lastDate, daysSince };
}

/** Colour + label for each status (traffic-light palette). */
export const ACTIVITY_META: Record<
  ActivityStatus,
  { color: string; label: string }
> = {
  active: { color: '#16A34A', label: 'Active' },
  occasional: { color: '#F59E0B', label: 'Slipping' },
  atRisk: { color: '#DC2626', label: 'Needs follow-up' },
};

/** Human phrase for how long since the last entry. */
export function lastSeenLabel(a: Activity): string {
  if (a.daysSince === null) return 'Never logged';
  if (a.daysSince === 0) return 'Logged today';
  if (a.daysSince === 1) return 'Logged yesterday';
  return `${a.daysSince} days ago`;
}
