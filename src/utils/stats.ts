import { DailyEntry, HistoryFilter, Metric } from '../types';
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

const round1 = (n: number) => Math.round(n * 10) / 10;

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

/** Longest run of consecutive logged days ever (for retained streak badges). */
export function longestStreak(entries: DailyEntry[]): number {
  if (!entries.length) return 0;
  const days = [...new Set(entries.map((e) => e.date))].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = daysBetween(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

/** Per-metric roll-up across a set of entries. */
export interface MetricStat {
  metric: Metric;
  total: number;
  avg: number;
  /** Days on which this metric was logged (its key is present). */
  daysLogged: number;
}

export interface OverviewStats {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  metrics: MetricStat[];
}

/** Value of a metric on an entry, or undefined when it wasn't logged. */
function valueOf(entry: DailyEntry, metricId: string): number | undefined {
  return entry.values ? entry.values[metricId] : undefined;
}

function statFor(entries: DailyEntry[], metric: Metric): MetricStat {
  const present = entries.filter((e) => valueOf(e, metric.id) !== undefined);
  const total = present.reduce((s, e) => s + (valueOf(e, metric.id) ?? 0), 0);
  return {
    metric,
    total,
    daysLogged: present.length,
    avg: present.length ? round1(total / present.length) : 0,
  };
}

/**
 * Dynamic stats keyed on the mentor's metric set. A metric is included when
 * it's still active or has any historical data, so removed metrics with a past
 * don't vanish from the dashboard.
 */
export function computeStats(entries: DailyEntry[], metrics: Metric[]): OverviewStats {
  const stats = metrics
    .map((m) => statFor(entries, m))
    .filter((s) => s.metric.active || s.daysLogged > 0);
  return {
    currentStreak: currentStreak(entries),
    longestStreak: longestStreak(entries),
    totalDays: entries.length,
    metrics: stats,
  };
}

export interface WindowSummary {
  days: number;
  totals: { metric: Metric; total: number }[];
}

/** Aggregates each metric over the most recent `days` window (ending today). */
export function summarizeWindow(
  entries: DailyEntry[],
  metrics: Metric[],
  days: number,
): WindowSummary {
  const today = todayKey();
  const inWindow = entries.filter((e) => daysBetween(e.date, today) < days);
  return {
    days: inWindow.length,
    totals: metrics
      .filter((m) => m.active)
      .map((metric) => ({
        metric,
        total: inWindow.reduce((s, e) => s + (valueOf(e, metric.id) ?? 0), 0),
      })),
  };
}

/** How consistently a metric hit its target across logged days. */
export interface Adherence {
  metric: Metric;
  target: number;
  /** Days the logged value was >= target. */
  metDays: number;
  /** Days the metric was logged at all (the denominator). */
  daysLogged: number;
  /** 0–100, rounded. */
  pct: number;
}

/**
 * Per-metric adherence to personal targets. Only metrics with a positive
 * target are returned. A day counts toward adherence only if the metric was
 * logged that day; of those, the share meeting the target is the percentage.
 */
export function computeAdherence(
  entries: DailyEntry[],
  metrics: Metric[],
  targets: Record<string, number>,
): Adherence[] {
  return metrics
    .filter((m) => (targets[m.id] ?? 0) > 0)
    .map((metric) => {
      const target = targets[metric.id];
      const logged = entries.filter((e) => valueOf(e, metric.id) !== undefined);
      const metDays = logged.filter((e) => (valueOf(e, metric.id) ?? 0) >= target).length;
      return {
        metric,
        target,
        metDays,
        daysLogged: logged.length,
        pct: logged.length ? Math.round((metDays / logged.length) * 100) : 0,
      };
    });
}

export interface SeriesPoint {
  label: string;
  value: number;
}

/**
 * Chronological series (oldest→newest) of at most `limit` most-recent entries
 * for a given metric id, ready to feed a line chart.
 */
export function buildSeries(
  entries: DailyEntry[],
  metricId: string,
  limit = 14,
): SeriesPoint[] {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const recent = sorted.slice(-limit);
  return recent.map((e) => {
    const [, m, d] = e.date.split('-');
    return { label: `${d}/${m}`, value: valueOf(e, metricId) ?? 0 };
  });
}
