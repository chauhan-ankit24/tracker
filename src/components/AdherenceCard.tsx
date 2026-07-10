import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from './Card';
import { Adherence } from '../utils/stats';
import { formatMetricValue } from '../services/metrics';
import { colors } from '../theme/colors';

interface Props {
  adherence: Adherence[];
  /** When provided, an edit control (or a "set goals" CTA) is shown. */
  onEdit?: () => void;
  delay?: number;
}

/** Daily-goal adherence: target vs. how often it was met, per metric. */
export function AdherenceCard({ adherence, onEdit, delay = 0 }: Props) {
  // Read-only viewer with no goals set → nothing to show.
  if (adherence.length === 0 && !onEdit) return null;

  if (adherence.length === 0 && onEdit) {
    return (
      <Card delay={delay}>
        <Pressable onPress={onEdit} className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-saffron-100 items-center justify-center mr-3">
            <Ionicons name="flag-outline" size={20} color={colors.saffron[600]} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-ink-900">Set daily goals</Text>
            <Text className="text-xs text-ink-400 mt-0.5">
              Pick a target (e.g. 16 rounds) and track how often you meet it.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.ink[400]} />
        </Pressable>
      </Card>
    );
  }

  return (
    <Card delay={delay}>
      <View className="flex-row items-center mb-4">
        <Ionicons name="flag" size={16} color={colors.saffron[600]} />
        <Text className="text-base font-semibold text-ink-700 ml-2 flex-1">Daily goals</Text>
        {onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8} className="flex-row items-center">
            <Ionicons name="create-outline" size={15} color={colors.saffron[600]} />
            <Text className="text-xs font-semibold text-saffron-600 ml-1">Edit</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="gap-4">
        {adherence.map((a) => (
          <GoalRow key={a.metric.id} adherence={a} />
        ))}
      </View>
    </Card>
  );
}

function GoalRow({ adherence: a }: { adherence: Adherence }) {
  const pctColor =
    a.pct >= 80 ? '#16A34A' : a.pct >= 50 ? colors.saffron[600] : colors.ink[500];
  return (
    <View>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-sm font-medium text-ink-700 flex-1 pr-2" numberOfLines={1}>
          {a.metric.label}
          <Text className="text-ink-400"> · goal {formatMetricValue(a.metric, a.target)}</Text>
        </Text>
        <Text className="text-sm font-bold" style={{ color: pctColor }}>
          {a.pct}%
        </Text>
      </View>
      <View className="h-2 rounded-full bg-cloud-200 overflow-hidden">
        <View
          className="h-2 rounded-full"
          style={{ width: `${a.pct}%`, backgroundColor: pctColor }}
        />
      </View>
      <Text className="text-xs text-ink-400 mt-1">
        Met on {a.metDays} of {a.daysLogged} logged day{a.daysLogged === 1 ? '' : 's'}
      </Text>
    </View>
  );
}
