import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

/**
 * Compact streak indicator — flame + number only — sized to sit beside a
 * screen title. Muted when the streak is zero so it never feels discouraging.
 */
export function StreakBadge({ streak }: { streak: number }) {
  const active = streak > 0;
  return (
    <View
      className={`flex-row items-center rounded-full px-3 py-1.5 ${
        active ? 'bg-saffron-50' : 'bg-cloud-200'
      }`}
      accessibilityLabel={`Current streak ${streak} days`}
    >
      <Ionicons
        name="flame"
        size={16}
        color={active ? colors.saffron[600] : colors.ink[400]}
      />
      <Text
        className={`text-base font-bold ml-1 ${
          active ? 'text-saffron-700' : 'text-ink-400'
        }`}
      >
        {streak}
      </Text>
    </View>
  );
}
