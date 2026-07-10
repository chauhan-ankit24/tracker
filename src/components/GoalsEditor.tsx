import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Button } from './Button';
import { MetricIcon } from './MetricIcon';
import { Metric } from '../types';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  metrics: Metric[];
  initialTargets: Record<string, number>;
  saving?: boolean;
  onSave: (targets: Record<string, number>) => void;
  onClose: () => void;
}

/**
 * Inline daily-goal editor (rendered in the Dashboard tree rather than a
 * <Modal>, which misbehaves with NativeWind here — see AvatarPicker). A blank
 * or zero target means "no goal" for that metric.
 */
export function GoalsEditor({
  visible,
  metrics,
  initialTargets,
  saving,
  onSave,
  onClose,
}: Props) {
  const [text, setText] = useState<Record<string, string>>({});

  // Seed the local text fields each time the editor opens.
  React.useEffect(() => {
    if (visible) {
      const seed: Record<string, string> = {};
      metrics.forEach((m) => {
        const t = initialTargets[m.id];
        seed[m.id] = t ? String(t) : '';
      });
      setText(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const save = () => {
    const targets: Record<string, number> = {};
    metrics.forEach((m) => {
      const n = parseInt((text[m.id] ?? '').replace(/[^0-9]/g, ''), 10);
      if (!Number.isNaN(n) && n > 0) {
        const cap = m.type === 'scale' ? 5 : m.max ?? 999;
        targets[m.id] = Math.min(n, cap);
      }
    });
    onSave(targets);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      className="bg-white rounded-2xl p-4 border border-cloud-200 mb-4"
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-base font-bold text-ink-900">Daily goals</Text>
        <Pressable onPress={onClose} hitSlop={10} disabled={saving}>
          <Ionicons name="close" size={20} color={colors.ink[400]} />
        </Pressable>
      </View>
      <Text className="text-xs text-ink-400 mb-3">
        Set a target per metric. Leave blank to skip.
      </Text>

      <View className="gap-2.5">
        {metrics.map((m) => (
          <View key={m.id} className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-saffron-100 items-center justify-center mr-3">
              <MetricIcon name={m.icon} size={16} color={colors.saffron[600]} />
            </View>
            <Text className="flex-1 text-sm text-ink-700" numberOfLines={1}>
              {m.label}
            </Text>
            <View className="flex-row items-center bg-cloud-100 rounded-xl px-3">
              <TextInput
                className="py-2 text-base text-ink-900 text-center"
                style={{ minWidth: 48 }}
                keyboardType="number-pad"
                placeholder={m.type === 'scale' ? '1–5' : '0'}
                placeholderTextColor={colors.ink[400]}
                value={text[m.id] ?? ''}
                onChangeText={(t) =>
                  setText((cur) => ({ ...cur, [m.id]: t.replace(/[^0-9]/g, '') }))
                }
                maxLength={3}
              />
              {m.type === 'counter' && m.unit ? (
                <Text className="text-xs text-ink-400 ml-1">{m.unit}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View className="mt-4">
        <Button label="Save goals" icon="checkmark" onPress={save} loading={saving} />
      </View>
    </Animated.View>
  );
}
