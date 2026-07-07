import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { DailyEntry } from '../types';
import { formatDateShort } from '../utils/date';
import { colors } from '../theme/colors';

/** A single history row: date on the left, the two metrics on the right. */
export function EntryRow({ entry, index = 0 }: { entry: DailyEntry; index?: number }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(360).delay(Math.min(index, 8) * 45)}
      className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 mb-3 border border-cloud-200"
      style={{
        shadowColor: '#1F2430',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <View className="w-11 h-11 rounded-xl bg-saffron-50 items-center justify-center mr-3">
        <Ionicons name="calendar-outline" size={20} color={colors.saffron[600]} />
      </View>
      <Text className="flex-1 text-sm font-semibold text-ink-700">
        {formatDateShort(entry.date)}
      </Text>

      <Metric icon="ellipse-outline" value={entry.chantingRounds} />
      <View className="w-4" />
      <Metric icon="book-outline" value={`${entry.readingMinutes}m`} />
    </Animated.View>
  );
}

function Metric({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
}) {
  return (
    <View className="flex-row items-center">
      <Ionicons name={icon} size={15} color={colors.ink[400]} />
      <Text className="text-sm font-bold text-ink-900 ml-1.5 min-w-[28px] text-right">{value}</Text>
    </View>
  );
}
