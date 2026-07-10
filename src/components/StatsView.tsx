import React, { useMemo } from 'react';
import { View, Text } from 'react-native';

import { StreakCard } from './StreakCard';
import { Card } from './Card';
import { MetricIcon } from './MetricIcon';
import { LineChartCard } from './LineChartCard';
import { SummaryCard } from './SummaryCard';
import { CalendarHeatmap } from './CalendarHeatmap';
import { AdherenceCard } from './AdherenceCard';
import { MilestonesCard } from './MilestonesCard';
import { EmptyState } from './EmptyState';
import { DailyEntry, Metric } from '../types';
import { MetricStat, buildSeries, computeAdherence, computeStats, summarizeWindow } from '../utils/stats';
import { computeMilestones } from '../utils/milestones';
import { metricUnitShort } from '../services/metrics';
import { colors } from '../theme/colors';

/** Short overview label for a metric's average column. */
function overviewLabel(s: MetricStat): string {
  if (s.metric.type === 'scale') return 'Avg rating';
  return `Avg ${s.metric.unit || 'daily'}`;
}

interface OverviewItem {
  key: string;
  icon: string;
  value: number | string;
  label: string;
}

/**
 * A single compact stat bar: equal-width columns divided by hairlines, so it
 * always fills the row with no orphaned empty space regardless of how many
 * metrics exist.
 */
function OverviewStats({ items, delay }: { items: OverviewItem[]; delay?: number }) {
  return (
    <Card delay={delay} className="mb-4 py-4 px-2">
      <View className="flex-row items-stretch">
        {items.map((it, i) => (
          <React.Fragment key={it.key}>
            {i > 0 ? <View className="w-px bg-cloud-200 my-1" /> : null}
            <View className="flex-1 items-center px-1">
              <MetricIcon name={it.icon} size={18} color={colors.saffron[500]} />
              <Text className="text-xl font-bold text-ink-900 mt-1.5">{it.value}</Text>
              <Text
                className="text-[11px] text-ink-400 mt-0.5 text-center"
                numberOfLines={1}
              >
                {it.label}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </Card>
  );
}

/**
 * The full analytics view for a set of entries, driven by the mentor's metric
 * set. Shared by the user's own Dashboard and the admin's read-only student
 * detail screen.
 */
export function StatsView({
  entries,
  metrics,
  targets = {},
  onEditGoals,
  hideStreak = false,
}: {
  entries: DailyEntry[];
  metrics: Metric[];
  /** Per-metric daily targets (goals/{userId}.targets). */
  targets?: Record<string, number>;
  /** Present on the viewer's own dashboard → enables goal editing. */
  onEditGoals?: () => void;
  /** Hide the hero streak card (e.g. Dashboard shows the streak in its header). */
  hideStreak?: boolean;
}) {
  const stats = useMemo(() => computeStats(entries, metrics), [entries, metrics]);
  const week = useMemo(() => summarizeWindow(entries, metrics, 7), [entries, metrics]);
  const month = useMemo(() => summarizeWindow(entries, metrics, 30), [entries, metrics]);
  const adherence = useMemo(
    () => computeAdherence(entries, metrics, targets),
    [entries, metrics, targets],
  );
  const milestones = useMemo(() => computeMilestones(stats), [stats]);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon="stats-chart-outline"
        title="No data yet"
        subtitle="Once daily entries are logged, progress and charts will appear here."
      />
    );
  }

  // Compact overview: days tracked + each metric's average, capped so the row
  // never gets cramped (extra metrics still get their own chart below).
  const overviewItems: OverviewItem[] = [
    { key: '__days', icon: 'calendar-outline', value: stats.totalDays, label: 'Days' },
    ...stats.metrics.map((s) => ({
      key: s.metric.id,
      icon: s.metric.icon ?? 'ellipse-outline',
      value: s.avg,
      label: overviewLabel(s),
    })),
  ].slice(0, 4);

  const chartColors = [colors.saffron[500], colors.saffron[700]];
  const primary = stats.metrics[0]?.metric;

  return (
    <View>
      {hideStreak ? null : <StreakCard streak={stats.currentStreak} />}

      <OverviewStats items={overviewItems} delay={40} />

      <View className="gap-4">
        <MilestonesCard summary={milestones} delay={260} />
        <AdherenceCard adherence={adherence} onEdit={onEditGoals} delay={280} />
        {stats.metrics.map((s, i) => (
          <LineChartCard
            key={s.metric.id}
            title={s.metric.label}
            icon={s.metric.icon ?? 'ellipse-outline'}
            data={buildSeries(entries, s.metric.id)}
            color={chartColors[i % chartColors.length]}
            suffix={s.metric.type === 'counter' ? metricUnitShort(s.metric) : ''}
            delay={300 + i * 60}
          />
        ))}
        <SummaryCard title="This week" summary={week} delay={420} />
        <SummaryCard title="This month" summary={month} delay={480} />
        {primary ? (
          <CalendarHeatmap entries={entries} metric={primary} delay={540} />
        ) : null}
      </View>
    </View>
  );
}
