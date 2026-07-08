import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

interface Props extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
  error?: string;
}

/** Labeled input with a soft focus ring and optional password reveal. */
export function TextField({ label, icon, secure, error, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-ink-700 mb-2 ml-1">{label}</Text>
      <View
        className={`flex-row items-center bg-white rounded-2xl px-4 border ${
          error ? 'border-red-300 bg-red-50/10' : focused ? 'border-saffron-500' : 'border-cloud-300'
        }`}
        style={
          focused && !error
            ? {
                shadowColor: colors.saffron[500],
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 3,
              }
            : undefined
        }
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.saffron[500] : colors.ink[400]}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <TextInput
          className="flex-1 py-4 text-base text-ink-900"
          placeholderTextColor={colors.ink[400]}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          {...rest}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.ink[400]}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-xs text-red-500 mt-1.5 ml-1">{error}</Text> : null}
    </View>
  );
}
