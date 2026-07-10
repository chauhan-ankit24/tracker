import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { DailyEntry, Metric } from '../types';
import { formatDateShort } from '../utils/date';
import { formatMetricValue } from '../services/metrics';
import { colors } from '../theme/colors';
import { shadows } from '../theme/elevation';
import { MetricIcon } from './MetricIcon';
import { PressableScale } from './PressableScale';

/**
 * A single history row: date on the left, each logged metric on the right.
 * The metric set comes from the mentor's configuration; only metrics with a
 * value on that day are shown.
 */
export function EntryRow({
  entry,
  metrics,
  index = 0,
}: {
  entry: DailyEntry;
  metrics: Metric[];
  index?: number;
}) {
  const logged = metrics.filter((m) => entry.values?.[m.id] !== undefined);
  return (
    <Animated.View entering={FadeInDown.duration(360).delay(Math.min(index, 8) * 45)}>
      <PressableScale
        activeScale={0.98}
        className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 mb-3 border border-cloud-200"
        style={shadows.sm}
      >
        <View className="w-11 h-11 rounded-xl bg-saffron-50 items-center justify-center mr-3">
          <Ionicons name="calendar-outline" size={20} color={colors.saffron[600]} />
        </View>
        <Text className="text-sm font-semibold text-ink-700 mr-2" style={{ width: 84 }}>
          {formatDateShort(entry.date)}
        </Text>

        <View className="flex-1 flex-row flex-wrap items-center justify-end gap-x-3 gap-y-1">
          {logged.length === 0 ? (
            <Text className="text-xs text-ink-400">No metrics</Text>
          ) : (
            logged.map((m) => (
              <MetricChip
                key={m.id}
                icon={m.icon ?? 'ellipse-outline'}
                value={formatMetricValue(m, entry.values[m.id])}
              />
            ))
          )}
        </View>
      </PressableScale>
    </Animated.View>
  );
}

function MetricChip({ icon, value }: { icon: string; value: string }) {
  return (
    <View className="flex-row items-center">
      <MetricIcon name={icon} size={15} color={colors.ink[400]} />
      <Text className="text-sm font-bold text-ink-900 ml-1.5">{value}</Text>
    </View>
  );
}
