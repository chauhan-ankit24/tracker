import React from 'react';
import { View, Text } from 'react-native';

/** "or" separator with hairlines, used between form and social auth. */
export function OrDivider({ label = 'or' }: { label?: string }) {
  return (
    <View className="flex-row items-center my-5">
      <View className="flex-1 h-px bg-cloud-300" />
      <Text className="text-xs text-ink-400 mx-3">{label}</Text>
      <View className="flex-1 h-px bg-cloud-300" />
    </View>
  );
}
