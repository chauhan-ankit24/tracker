import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

/** Press-scale animated button with three tasteful variants. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  className = '',
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isDisabled = disabled || loading;

  const base = 'flex-row items-center justify-center rounded-2xl py-4 px-6';
  const styles: Record<Variant, string> = {
    primary: 'bg-saffron-500',
    secondary: 'bg-saffron-100',
    ghost: 'bg-transparent',
  };
  const textStyles: Record<Variant, string> = {
    primary: 'text-white',
    secondary: 'text-saffron-700',
    ghost: 'text-ink-500',
  };
  const iconColor =
    variant === 'primary' ? colors.white : variant === 'secondary' ? colors.saffron[700] : colors.ink[500];

  return (
    <Animated.View style={animatedStyle} className={className}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => (scale.value = withTiming(0.96, { duration: 90 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
        className={`${base} ${styles[variant]} ${isDisabled ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <View className="flex-row items-center">
            {icon ? <Ionicons name={icon} size={18} color={iconColor} style={{ marginRight: 8 }} /> : null}
            <Text className={`text-base font-semibold ${textStyles[variant]}`}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
