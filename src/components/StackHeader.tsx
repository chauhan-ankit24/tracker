import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  /** Optional trailing element (e.g. a save/menu action). */
  right?: React.ReactNode;
}

/** Back-button header used by pushed (non-tab) screens. */
export function StackHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <View className="flex-row items-center px-5 pt-2 pb-4">
      <Pressable
        onPress={onBack}
        hitSlop={10}
        className="w-10 h-10 rounded-full bg-white border border-cloud-200 items-center justify-center mr-3"
      >
        <Ionicons name="chevron-back" size={20} color={colors.ink[700]} />
      </Pressable>
      <View className="flex-1">
        {subtitle ? (
          <Text className="text-xs text-saffron-600 font-medium">{subtitle}</Text>
        ) : null}
        <Text className="text-xl font-bold text-ink-900" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right ? <View className="ml-3">{right}</View> : null}
    </View>
  );
}
