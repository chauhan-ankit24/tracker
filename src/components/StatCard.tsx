import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  unit?: string;
  tint?: 'saffron' | 'ink';
  delay?: number;
}

/** Compact metric tile used across the dashboard grid. */
export function StatCard({ icon, label, value, unit, tint = 'saffron', delay = 0 }: Props) {
  const iconBg = tint === 'saffron' ? 'bg-saffron-100' : 'bg-cloud-200';
  const iconColor = tint === 'saffron' ? colors.saffron[600] : colors.ink[500];

  return (
    <Animated.View
      entering={FadeInDown.duration(420).delay(delay)}
      className="flex-1 bg-white rounded-2xl p-4 border border-cloud-200"
      style={{
        shadowColor: '#1F2430',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center ${iconBg}`}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="mt-3 flex-row items-baseline">
        <Text className="text-2xl font-bold text-ink-900">{value}</Text>
        {unit ? <Text className="text-sm text-ink-400 ml-1">{unit}</Text> : null}
      </View>
      <Text className="text-xs text-ink-500 mt-0.5">{label}</Text>
    </Animated.View>
  );
}
