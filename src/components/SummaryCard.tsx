import React from 'react';
import { View, Text } from 'react-native';

import { Card } from './Card';
import { MetricIcon } from './MetricIcon';
import { colors } from '../theme/colors';
import { WindowSummary } from '../utils/stats';

interface Props {
  title: string;
  summary: WindowSummary;
  delay?: number;
}

/** Weekly / monthly totals across the mentor's metrics plus days logged. */
export function SummaryCard({ title, summary, delay = 0 }: Props) {
  const items = [
    ...summary.totals.map((t) => ({
      key: t.metric.id,
      icon: t.metric.icon ?? 'ellipse-outline',
      value: t.total,
      label: t.metric.label,
    })),
    {
      key: '__days',
      icon: 'checkmark-done-outline',
      value: summary.days,
      label: 'days',
    },
  ];

  return (
    <Card delay={delay}>
      <Text className="text-base font-semibold text-ink-700 mb-4">{title}</Text>
      <View className="flex-row flex-wrap">
        {items.map((item) => (
          <View key={item.key} className="items-center px-2 mb-1" style={{ minWidth: 88 }}>
            <MetricIcon name={item.icon} size={18} color={colors.saffron[500]} />
            <Text className="text-xl font-bold text-ink-900 mt-1.5">{item.value}</Text>
            <Text
              className="text-xs text-ink-400 mt-0.5 text-center"
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
