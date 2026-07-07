import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

/** Large, calm page title used at the top of each tab screen. */
export function ScreenHeader({ title, subtitle, right }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="flex-row items-end justify-between mt-2 mb-5"
    >
      <View className="flex-1">
        {subtitle ? (
          <Text className="text-sm font-medium text-saffron-600 mb-1">{subtitle}</Text>
        ) : null}
        <Text className="text-3xl font-bold text-ink-900">{title}</Text>
      </View>
      {right ? <View className="ml-3">{right}</View> : null}
    </Animated.View>
  );
}
