import React from 'react';
import { View, Text } from 'react-native';

import { Card } from './Card';
import { DailyEntry, Metric } from '../types';
import { toDayKey } from '../utils/date';
import { colors } from '../theme/colors';

interface Props {
  entries: DailyEntry[];
  /** Which metric drives the intensity (typically the first active one). */
  metric: Metric;
  /** Number of days to display (defaults to ~10 weeks). */
  days?: number;
  delay?: number;
}

/**
 * GitHub-style contribution heatmap for a single metric. Intensity buckets are
 * relative to the highest value logged, so it stays readable for any metric.
 */
export function CalendarHeatmap({ entries, metric, days = 70, delay = 0 }: Props) {
  const byDay = new Map(entries.map((e) => [e.date, e]));

  const today = new Date();
  const cells: { key: string; value: number | null }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDayKey(d);
    const entry = byDay.get(key);
    const v = entry?.values?.[metric.id];
    cells.push({ key, value: v === undefined ? null : v });
  }

  const peak = Math.max(1, ...cells.map((c) => c.value ?? 0));
  const level = (v: number | null) => {
    if (v === null) return colors.cloud[200];
    if (v <= 0) return colors.saffron[100];
    const ratio = v / peak;
    if (ratio < 0.34) return colors.saffron[200];
    if (ratio < 0.67) return colors.saffron[400];
    return colors.saffron[600];
  };

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <Card delay={delay}>
      <Text className="text-base font-semibold text-ink-700 mb-3">
        {metric.label} activity
      </Text>
      <View className="flex-row justify-between">
        {weeks.map((week, wi) => (
          <View key={wi} className="justify-between">
            {week.map((cell) => (
              <View
                key={cell.key}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 4,
                  marginVertical: 2,
                  backgroundColor: level(cell.value),
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <View className="flex-row items-center justify-end mt-3">
        <Text className="text-xs text-ink-400 mr-2">Less</Text>
        {[colors.cloud[200], colors.saffron[200], colors.saffron[400], colors.saffron[600]].map(
          (c) => (
            <View
              key={c}
              style={{ width: 11, height: 11, borderRadius: 3, marginHorizontal: 1.5, backgroundColor: c }}
            />
          ),
        )}
        <Text className="text-xs text-ink-400 ml-2">More</Text>
      </View>
    </Card>
  );
}
