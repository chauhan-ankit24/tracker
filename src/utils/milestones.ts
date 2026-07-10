import { OverviewStats } from './stats';

/** A milestone the devotee has reached (kept once earned). */
export interface EarnedBadge {
  id: string;
  label: string;
  icon: string;
}

/** The nearest milestone still ahead, with progress toward it. */
export interface NextMilestone {
  id: string;
  label: string;
  icon: string;
  current: number;
  target: number;
  remaining: number;
}

export interface MilestoneSummary {
  earned: EarnedBadge[];
  next: NextMilestone | null;
}

const STREAK_TIERS = [7, 30, 50, 100, 180, 365];
const DAYS_TIERS = [10, 30, 100, 250, 365];
const TOTAL_TIERS = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000];

const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function highestReached(tiers: number[], value: number): number | null {
  let reached: number | null = null;
  for (const t of tiers) if (value >= t) reached = t;
  return reached;
}

function nextTier(tiers: number[], value: number): number | null {
  for (const t of tiers) if (value < t) return t;
  return null;
}

interface Category {
  key: string;
  icon: string;
  value: number;
  tiers: number[];
  /** Renders a tier value into a human label, e.g. 100 → "100-day streak". */
  label: (n: number) => string;
}

/**
 * Turns the already-computed stats into gentle, genuine milestones: the
 * highest reached tier per category becomes a retained badge, and the single
 * nearest upcoming tier (by progress) is surfaced as encouragement.
 */
export function computeMilestones(stats: OverviewStats): MilestoneSummary {
  const categories: Category[] = [
    {
      key: 'streak',
      icon: 'flame',
      value: stats.longestStreak,
      tiers: STREAK_TIERS,
      label: (n) => `${n}-day streak`,
    },
    {
      key: 'days',
      icon: 'calendar',
      value: stats.totalDays,
      tiers: DAYS_TIERS,
      label: (n) => `${fmt(n)} days tracked`,
    },
    ...stats.metrics
      .filter((s) => s.metric.type === 'counter')
      .map((s) => {
        const noun = s.metric.unit?.trim() || s.metric.label.toLowerCase();
        return {
          key: `metric_${s.metric.id}`,
          icon: s.metric.icon ?? 'ellipse-outline',
          value: s.total,
          tiers: TOTAL_TIERS,
          label: (n: number) => `${fmt(n)} ${noun}`,
        };
      }),
  ];

  const earned: EarnedBadge[] = [];
  let next: NextMilestone | null = null;
  let bestProgress = -1;

  for (const c of categories) {
    const reached = highestReached(c.tiers, c.value);
    if (reached !== null) {
      earned.push({ id: `${c.key}_${reached}`, label: c.label(reached), icon: c.icon });
    }
    const target = nextTier(c.tiers, c.value);
    if (target !== null) {
      const progress = c.value / target;
      if (progress > bestProgress) {
        bestProgress = progress;
        next = {
          id: `${c.key}_next_${target}`,
          label: c.label(target),
          icon: c.icon,
          current: c.value,
          target,
          remaining: target - c.value,
        };
      }
    }
  }

  return { earned, next };
}
