import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { shadows } from '../theme/elevation';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  /** Tailwind bg class for the leading icon chip (default saffron). */
  iconBg?: string;
  iconColor?: string;
  disabled?: boolean;
}

/** A tappable settings/navigation row: icon chip, title + subtitle, chevron. */
export function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  iconBg = 'bg-saffron-100',
  iconColor = colors.saffron[600],
  disabled,
}: Props) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      activeScale={0.98}
      className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-cloud-200"
      style={shadows.sm}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View className={`w-9 h-9 rounded-full ${iconBg} items-center justify-center mr-3`}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1 pr-2">
        <Text className="text-sm font-semibold text-ink-900">{title}</Text>
        {subtitle ? <Text className="text-xs text-ink-400 mt-0.5">{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.ink[400]} />
    </PressableScale>
  );
}
