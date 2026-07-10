import { doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from '../config/firebase';
import { AppUser, Metric, MetricSet } from '../types';

const METRIC_SETS = 'metricSets';

/**
 * The starter metrics every mentor gets until they customize their set. The
 * ids `chanting` and `reading` are stable and line up with the legacy entry
 * fields, so historical data maps across seamlessly (see entries service).
 */
export const DEFAULT_METRICS: Metric[] = [
  {
    id: 'chanting',
    label: 'Chanting rounds',
    type: 'counter',
    icon: 'mci:hands-pray',
    unit: 'rounds',
    step: 1,
    max: 200,
    presets: [
      { label: '+4', value: 4, type: 'add' },
      { label: '+8', value: 8, type: 'add' },
      { label: '16 Rounds', value: 16, type: 'set' },
    ],
    active: true,
  },
  {
    id: 'reading',
    label: 'Reading minutes',
    type: 'counter',
    icon: 'mci:book-open-variant',
    unit: 'min',
    step: 5,
    max: 720,
    presets: [
      { label: '+15m', value: 15, type: 'add' },
      { label: '+30m', value: 30, type: 'add' },
      { label: '+60m', value: 60, type: 'add' },
    ],
    active: true,
  },
];

let seq = 0;
/** Fresh, collision-free id for a newly created metric. */
export function newMetricId(): string {
  seq += 1;
  return `m_${Date.now().toString(36)}_${seq}`;
}

/**
 * The uid whose metric set applies to a user's own logging: a mentor logs
 * against their own set; a devotee against their mentor's. Null when a devotee
 * has no mentor (falls back to defaults).
 */
export function metricsOwnerId(user: AppUser): string | null {
  return user.role === 'admin' ? user.id : user.adminId;
}

/**
 * A mentor's metric set, or the defaults when none has been saved yet. Passing
 * a null owner (devotee without a mentor) also yields the defaults.
 */
export async function getMetricsForOwner(ownerId: string | null): Promise<Metric[]> {
  if (!ownerId) return DEFAULT_METRICS;
  const snap = await getDoc(doc(db, METRIC_SETS, ownerId));
  if (!snap.exists()) return DEFAULT_METRICS;
  const set = snap.data() as MetricSet;
  return set.metrics?.length ? set.metrics : DEFAULT_METRICS;
}

/** Convenience: the metrics that apply to this user's own Today/stats. */
export function getMetricsForUser(user: AppUser): Promise<Metric[]> {
  return getMetricsForOwner(metricsOwnerId(user));
}

/** Persists a mentor's full metric set (overwrites). */
export async function saveMetricSet(adminId: string, metrics: Metric[]): Promise<void> {
  const set: MetricSet = { adminId, metrics, updatedAt: Date.now() };
  await setDoc(doc(db, METRIC_SETS, adminId), set);
}

/** Metrics shown on the Today input screen (active only, in order). */
export function activeMetrics(metrics: Metric[]): Metric[] {
  return metrics.filter((m) => m.active);
}

/** Short unit suffix for compact displays (e.g. history rows). */
export function metricUnitShort(metric: Metric): string {
  if (metric.type === 'scale') return '/5';
  const u = metric.unit?.toLowerCase() ?? '';
  if (u.startsWith('min')) return 'm';
  if (u.startsWith('hour') || u === 'hr' || u === 'hrs') return 'h';
  return '';
}

/** Compact value label, e.g. "16", "30m", "4/5". */
export function formatMetricValue(metric: Metric, value: number): string {
  return `${value}${metricUnitShort(metric)}`;
}
