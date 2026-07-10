import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { todayKey } from '../utils/date';

interface Props {
  label: string;
  /** YYYY-MM-DD, or null when unset/ongoing. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Show a "clear" affordance (e.g. an ongoing end date). */
  clearable?: boolean;
  placeholder?: string;
}

/** Matches a real-ish YYYY-MM-DD day. */
export function isValidDayKey(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/**
 * Lightweight date entry as YYYY-MM-DD (the app's canonical day format), with
 * a "Today" shortcut. Avoids pulling in a native date-picker dependency.
 */
export function DateField({ label, value, onChange, clearable, placeholder }: Props) {
  const [text, setText] = useState(value ?? '');
  const [focused, setFocused] = useState(false);

  // Keep local text in sync when the parent value changes (e.g. Today button).
  React.useEffect(() => {
    setText(value ?? '');
  }, [value]);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      onChange(null);
    } else if (isValidDayKey(trimmed)) {
      onChange(trimmed);
    }
    // Invalid partial input is left in the field but not committed upward.
  };

  const invalid = text.trim() !== '' && !isValidDayKey(text.trim());

  return (
    <View className="flex-1">
      <Text className="text-xs font-medium text-ink-500 mb-1.5 ml-1">{label}</Text>
      <View
        className={`flex-row items-center bg-white rounded-xl px-3 border ${
          invalid ? 'border-red-300' : focused ? 'border-saffron-500' : 'border-cloud-300'
        }`}
      >
        <Ionicons name="calendar-outline" size={16} color={colors.ink[400]} />
        <TextInput
          className="flex-1 py-3 px-2 text-sm text-ink-900"
          value={text}
          onChangeText={setText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commit(text);
          }}
          placeholder={placeholder ?? 'YYYY-MM-DD'}
          placeholderTextColor={colors.ink[400]}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        {clearable && text ? (
          <Pressable
            onPress={() => {
              setText('');
              onChange(null);
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={16} color={colors.ink[400]} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              const t = todayKey();
              setText(t);
              onChange(t);
            }}
            hitSlop={8}
          >
            <Text className="text-xs font-semibold text-saffron-600">Today</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
