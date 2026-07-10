import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

/** Semantic tones — colour communicates meaning, never decoration. */
export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

interface Props {
  label: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  icon?: keyof typeof Ionicons.glyphMap;
}

const TONE: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: 'bg-cloud-200', fg: colors.ink[500] },
  brand: { bg: 'bg-saffron-50', fg: colors.saffron[700] },
  success: { bg: 'bg-emerald-50', fg: '#047857' },
  warning: { bg: 'bg-amber-50', fg: '#B45309' },
  danger: { bg: 'bg-red-50', fg: '#B91C1C' },
};

/** Compact status/label pill with consistent padding, type and tone. */
export function Badge({ label, tone = 'neutral', size = 'md', icon }: Props) {
  const { bg, fg } = TONE[tone];
  const pad = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const text = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <View className={`flex-row items-center rounded-full ${bg} ${pad}`}>
      {icon ? (
        <Ionicons name={icon} size={size === 'sm' ? 11 : 12} color={fg} style={{ marginRight: 4 }} />
      ) : null}
      <Text className={`${text} font-semibold`} style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}
