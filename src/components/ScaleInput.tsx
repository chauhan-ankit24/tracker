import React from 'react';
import { View, Text, Pressable } from 'react-native';

import { colors } from '../theme/colors';
import { shadows } from '../theme/elevation';
import { MetricIcon } from './MetricIcon';

interface Props {
  label: string;
  icon: string;
  /** 0 = not yet rated; 1–5 otherwise. */
  value: number;
  onChange: (value: number) => void;
}

const SCALE = [1, 2, 3, 4, 5];

/** A 1–5 rating card — the "scale" quick-question input. */
export function ScaleInput({ label, icon, value, onChange }: Props) {
  return (
    <View
      className="bg-white rounded-2xl p-5 border border-cloud-200"
      style={shadows.md}
    >
      <View className="flex-row items-center mb-4">
        <View className="w-9 h-9 rounded-full bg-saffron-100 items-center justify-center mr-3">
          <MetricIcon name={icon} size={18} color={colors.saffron[600]} />
        </View>
        <Text className="text-base font-semibold text-ink-700 flex-1">{label}</Text>
        <Text className="text-sm font-medium text-ink-400">
          {value ? `${value}/5` : 'Not rated'}
        </Text>
      </View>

      <View className="flex-row justify-between">
        {SCALE.map((n) => {
          const on = value >= n && value > 0;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(value === n ? 0 : n)}
              hitSlop={6}
              className={`w-12 h-12 rounded-2xl items-center justify-center border ${
                on ? 'bg-saffron-500 border-saffron-500' : 'bg-white border-cloud-300'
              }`}
            >
              <Text className={`text-base font-bold ${on ? 'text-white' : 'text-ink-400'}`}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
