import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

interface Props {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

/**
 * Large, thumb-friendly numeric stepper — the core of the sub-30-second daily
 * entry. Supports tap +/- and direct keyboard entry.
 */
export function NumberStepper({
  label,
  icon,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
}: Props) {
  const scale = useSharedValue(1);
  const bump = () => {
    scale.value = withSequence(
      withTiming(1.12, { duration: 90 }),
      withTiming(1, { duration: 120 }),
    );
  };
  const valueStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const dec = () => {
    onChange(clamp(value - step));
    bump();
  };
  const inc = () => {
    onChange(clamp(value + step));
    bump();
  };

  return (
    <View className="bg-white rounded-2xl p-5 border border-cloud-200"
      style={{
        shadowColor: '#1F2430',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center mb-4">
        <View className="w-9 h-9 rounded-full bg-saffron-100 items-center justify-center mr-3">
          <Ionicons name={icon} size={18} color={colors.saffron[600]} />
        </View>
        <Text className="text-base font-semibold text-ink-700">{label}</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <StepButton icon="remove" onPress={dec} disabled={value <= min} />

        <Animated.View style={valueStyle} className="flex-row items-baseline">
          <TextInput
            value={String(value)}
            onChangeText={(t) => {
              const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
              onChange(clamp(Number.isNaN(n) ? 0 : n));
            }}
            keyboardType="number-pad"
            className="text-5xl font-bold text-ink-900 text-center"
            style={{ minWidth: 70 }}
            maxLength={3}
          />
          {unit ? <Text className="text-base text-ink-400 ml-1">{unit}</Text> : null}
        </Animated.View>

        <StepButton icon="add" onPress={inc} disabled={value >= max} />
      </View>
    </View>
  );
}

function StepButton({
  icon,
  onPress,
  disabled,
}: {
  icon: 'add' | 'remove';
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`w-14 h-14 rounded-full items-center justify-center border ${
        disabled ? 'border-cloud-200 bg-cloud-100' : 'border-saffron-200 bg-saffron-50'
      }`}
    >
      <Ionicons
        name={icon}
        size={26}
        color={disabled ? colors.ink[400] : colors.saffron[600]}
      />
    </Pressable>
  );
}
