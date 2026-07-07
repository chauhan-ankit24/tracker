import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(400)} className="items-center py-16 px-6">
      <View className="w-20 h-20 rounded-full bg-saffron-50 items-center justify-center mb-4">
        <Ionicons name={icon} size={34} color={colors.saffron[400]} />
      </View>
      <Text className="text-lg font-semibold text-ink-700 text-center">{title}</Text>
      {subtitle ? (
        <Text className="text-sm text-ink-400 text-center mt-1.5 leading-5">{subtitle}</Text>
      ) : null}
    </Animated.View>
  );
}
