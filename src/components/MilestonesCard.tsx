import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from './Card';
import { MetricIcon } from './MetricIcon';
import { MilestoneSummary } from '../utils/milestones';
import { colors } from '../theme/colors';

/** Quiet acknowledgment of milestones reached, plus the next one to aim for. */
export function MilestonesCard({
  summary,
  delay = 0,
}: {
  summary: MilestoneSummary;
  delay?: number;
}) {
  const { earned, next } = summary;
  if (earned.length === 0 && !next) return null;

  // Nothing earned yet — a gentle nudge toward the first one.
  if (earned.length === 0 && next) {
    const pct = Math.min(100, Math.round((next.current / next.target) * 100));
    return (
      <Card delay={delay}>
        <View className="flex-row items-center mb-3">
          <View className="w-9 h-9 rounded-full bg-saffron-100 items-center justify-center mr-3">
            <MetricIcon name={next.icon} size={18} color={colors.saffron[600]} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-ink-900">Your first milestone</Text>
            <Text className="text-xs text-ink-400 mt-0.5">
              {next.label} · {next.remaining} to go
            </Text>
          </View>
        </View>
        <View className="h-2 rounded-full bg-cloud-200 overflow-hidden">
          <View
            className="h-2 rounded-full bg-saffron-500"
            style={{ width: `${pct}%` }}
          />
        </View>
      </Card>
    );
  }

  return (
    <Card delay={delay}>
      <View className="flex-row items-center mb-4">
        <Ionicons name="ribbon" size={16} color={colors.saffron[600]} />
        <Text className="text-base font-semibold text-ink-700 ml-2">Milestones</Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {earned.map((b) => (
          <View
            key={b.id}
            className="flex-row items-center bg-saffron-50 rounded-full pl-2 pr-3 py-1.5 border border-saffron-100"
          >
            <View className="w-6 h-6 rounded-full bg-saffron-500 items-center justify-center mr-2">
              <MetricIcon name={b.icon} size={13} color={colors.white} />
            </View>
            <Text className="text-xs font-semibold text-saffron-700">{b.label}</Text>
          </View>
        ))}
      </View>

      {next ? (
        <Text className="text-xs text-ink-400 mt-3">
          Next: {next.label} · {next.remaining} to go
        </Text>
      ) : null}
    </Card>
  );
}
