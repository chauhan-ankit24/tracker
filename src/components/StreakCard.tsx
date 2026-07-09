import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

/** Hero streak banner with a warm saffron gradient-like fill. */
export function StreakCard({ streak, delay = 0 }: { streak: number; delay?: number }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(delay)}
      className="relative rounded-3xl overflow-hidden mb-4 p-6 bg-saffron-500"
      style={{
        shadowColor: colors.saffron[600],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      {/* Decorative background shapes for a premium, modern aesthetic */}
      <View
        className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10"
        pointerEvents="none"
      />
      <View
        className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/5"
        pointerEvents="none"
      />

      <View className="flex-row items-center justify-between z-10">
        <View>
          <Text className="text-saffron-100 text-sm font-medium">Current streak</Text>
          <View className="flex-row items-baseline mt-1">
            <Text className="text-white text-5xl font-bold">{streak}</Text>
            <Text className="text-saffron-100 text-lg font-semibold ml-2">
              {streak === 1 ? 'day' : 'days'}
            </Text>
          </View>
          <Text className="text-saffron-100 text-xs mt-2">
            {streak > 0 ? 'Keep your practice consistent' : 'Log today to begin your streak'}
          </Text>
        </View>
        <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
          <Ionicons name="flame" size={34} color={colors.white} />
        </View>
      </View>
    </Animated.View>
  );
}
