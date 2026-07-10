import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { nextEkadasi } from '../data/ekadasi';
import { formatDate, daysBetween, todayKey } from '../utils/date';
import { colors } from '../theme/colors';

/** Quiet "next Ekadasi" note. Renders nothing once the calendar runs out. */
export function EkadasiBanner() {
  const today = todayKey();
  const next = nextEkadasi(today);
  if (!next) return null;

  const isToday = next.date === today;
  const inDays = daysBetween(today, next.date);
  const when = isToday
    ? 'Observe the fast today'
    : `${formatDate(next.date)} · ${
        inDays === 1 ? 'tomorrow' : `in ${inDays} days`
      }`;

  return (
    <Animated.View
      entering={FadeInDown.duration(420).delay(100)}
      className="flex-row items-center bg-saffron-50 rounded-2xl px-4 py-3 mt-6"
    >
      <View className="w-9 h-9 rounded-full bg-white items-center justify-center mr-3">
        <Ionicons name="moon-outline" size={18} color={colors.saffron[600]} />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-semibold text-saffron-700">
          {isToday ? 'Today is Ekadasi' : 'Next Ekadasi'}
        </Text>
        <Text className="text-sm font-semibold text-ink-900 mt-0.5">{next.name}</Text>
        <Text className="text-xs text-ink-400 mt-0.5">{when}</Text>
      </View>
    </Animated.View>
  );
}
