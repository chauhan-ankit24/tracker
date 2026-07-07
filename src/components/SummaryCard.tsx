import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from './Card';
import { colors } from '../theme/colors';
import { WindowSummary } from '../utils/stats';

interface Props {
  title: string;
  summary: WindowSummary;
  delay?: number;
}

/** Weekly / monthly totals presented as a compact three-part card. */
export function SummaryCard({ title, summary, delay = 0 }: Props) {
  return (
    <Card delay={delay}>
      <Text className="text-base font-semibold text-ink-700 mb-4">{title}</Text>
      <View className="flex-row">
        <Item icon="ellipse-outline" value={summary.rounds} label="rounds" />
        <Divider />
        <Item icon="book-outline" value={summary.minutes} label="minutes" />
        <Divider />
        <Item icon="checkmark-done-outline" value={summary.days} label="days" />
      </View>
    </Card>
  );
}

function Item({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View className="flex-1 items-center">
      <Ionicons name={icon} size={18} color={colors.saffron[500]} />
      <Text className="text-xl font-bold text-ink-900 mt-1.5">{value}</Text>
      <Text className="text-xs text-ink-400 mt-0.5">{label}</Text>
    </View>
  );
}

function Divider() {
  return <View className="w-px bg-cloud-200 my-1" />;
}
