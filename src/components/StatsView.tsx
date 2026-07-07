import React, { useMemo } from 'react';
import { View } from 'react-native';

import { StreakCard } from './StreakCard';
import { StatCard } from './StatCard';
import { LineChartCard } from './LineChartCard';
import { SummaryCard } from './SummaryCard';
import { CalendarHeatmap } from './CalendarHeatmap';
import { EmptyState } from './EmptyState';
import { DailyEntry } from '../types';
import { buildSeries, computeStats, summarizeWindow } from '../utils/stats';
import { colors } from '../theme/colors';

/**
 * The full analytics view for a set of entries. Shared by the user's own
 * Dashboard and the admin's read-only student detail screen.
 */
export function StatsView({ entries }: { entries: DailyEntry[] }) {
  const stats = useMemo(() => computeStats(entries), [entries]);
  const roundsSeries = useMemo(() => buildSeries(entries, 'chantingRounds'), [entries]);
  const readingSeries = useMemo(() => buildSeries(entries, 'readingMinutes'), [entries]);
  const week = useMemo(() => summarizeWindow(entries, 7), [entries]);
  const month = useMemo(() => summarizeWindow(entries, 30), [entries]);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon="stats-chart-outline"
        title="No data yet"
        subtitle="Once daily entries are logged, progress and charts will appear here."
      />
    );
  }

  return (
    <View>
      <StreakCard streak={stats.currentStreak} />

      <View className="flex-row gap-3 mb-3">
        <StatCard icon="calendar-outline" label="Days tracked" value={stats.totalDays} delay={60} />
        <StatCard
          icon="ellipse-outline"
          label="Avg rounds"
          value={stats.avgChanting}
          delay={120}
        />
      </View>
      <View className="flex-row gap-3 mb-4">
        <StatCard
          icon="book-outline"
          label="Avg reading"
          value={stats.avgReading}
          unit="min"
          delay={180}
        />
        <StatCard
          icon="ellipse"
          label="Total rounds"
          value={stats.totalRounds}
          tint="ink"
          delay={240}
        />
      </View>

      <View className="gap-4">
        <LineChartCard
          title="Chanting rounds"
          icon="ellipse-outline"
          data={roundsSeries}
          color={colors.saffron[500]}
          delay={300}
        />
        <LineChartCard
          title="Reading minutes"
          icon="book-outline"
          data={readingSeries}
          color={colors.saffron[700]}
          suffix="m"
          delay={360}
        />
        <SummaryCard title="This week" summary={week} delay={420} />
        <SummaryCard title="This month" summary={month} delay={480} />
        <CalendarHeatmap entries={entries} delay={540} />
      </View>
    </View>
  );
}
