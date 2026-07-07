import { DailyEntry, HistoryFilter, Stats } from '../types';
import { daysBetween, todayKey } from './date';

/** Sorts entries newest-first by day key. */
export function sortByDateDesc(entries: DailyEntry[]): DailyEntry[] {
  return [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Filters entries by the selected history window. */
export function filterEntries(entries: DailyEntry[], filter: HistoryFilter): DailyEntry[] {
  if (filter === 'all') return entries;
  const window = filter === '7d' ? 7 : 30;
  const today = todayKey();
  return entries.filter((e) => daysBetween(e.date, today) < window);
}

const avg = (nums: number[]) =>
  nums.length ? Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10 : 0;

/**
 * Current streak = consecutive days ending today (or yesterday, so the streak
 * isn't "broken" simply because today's entry hasn't been logged yet).
 */
export function currentStreak(entries: DailyEntry[]): number {
  if (!entries.length) return 0;
  const days = new Set(entries.map((e) => e.date));
  const today = todayKey();

  let cursor = today;
  if (!days.has(today)) {
    // Allow the streak to be anchored at yesterday.
    const yesterday = shiftDay(today, -1);
    if (!days.has(yesterday)) return 0;
    cursor = yesterday;
  }

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + delta);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function computeStats(entries: DailyEntry[]): Stats {
  const rounds = entries.map((e) => e.chantingRounds);
  const minutes = entries.map((e) => e.readingMinutes);
  return {
    currentStreak: currentStreak(entries),
    totalDays: entries.length,
    avgChanting: avg(rounds),
    avgReading: avg(minutes),
    totalRounds: rounds.reduce((s, n) => s + n, 0),
    totalMinutes: minutes.reduce((s, n) => s + n, 0),
  };
}

export interface WindowSummary {
  rounds: number;
  minutes: number;
  days: number;
}

/** Aggregates the metrics over the most recent `days` window (ending today). */
export function summarizeWindow(entries: DailyEntry[], days: number): WindowSummary {
  const today = todayKey();
  const inWindow = entries.filter((e) => daysBetween(e.date, today) < days);
  return {
    rounds: inWindow.reduce((s, e) => s + e.chantingRounds, 0),
    minutes: inWindow.reduce((s, e) => s + e.readingMinutes, 0),
    days: inWindow.length,
  };
}

export interface SeriesPoint {
  label: string;
  value: number;
}

/**
 * Builds a chronological series (oldest→newest) of at most `limit` most-recent
 * entries for a given metric, ready to feed into a line chart.
 */
export function buildSeries(
  entries: DailyEntry[],
  metric: 'chantingRounds' | 'readingMinutes',
  limit = 14,
): SeriesPoint[] {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const recent = sorted.slice(-limit);
  return recent.map((e) => {
    const [, m, d] = e.date.split('-');
    return { label: `${d}/${m}`, value: e[metric] };
  });
}
