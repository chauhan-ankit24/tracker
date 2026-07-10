import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { PressableScale } from './PressableScale';

interface Props {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}

/** White "Continue with Google" button matching Google's branding guidance. */
export function GoogleButton({ onPress, loading, label = 'Continue with Google' }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={loading}
      activeScale={0.97}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: !!loading }}
    >
      <View
        className={`flex-row items-center justify-center rounded-2xl py-4 px-6 min-h-[52px] bg-white border border-cloud-300 ${
          loading ? 'opacity-60' : ''
        }`}
      >
        {loading ? (
          <ActivityIndicator color={colors.ink[500]} />
        ) : (
          <View className="flex-row items-center">
            <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
            <Text className="text-base font-semibold text-ink-700">{label}</Text>
          </View>
        )}
      </View>
    </PressableScale>
  );
}
