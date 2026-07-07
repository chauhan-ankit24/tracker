import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

interface Props {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}

/** White "Continue with Google" button matching Google's branding guidance. */
export function GoogleButton({ onPress, loading, label = 'Continue with Google' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`flex-row items-center justify-center rounded-2xl py-4 px-6 bg-white border border-cloud-300 ${
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
    </Pressable>
  );
}
