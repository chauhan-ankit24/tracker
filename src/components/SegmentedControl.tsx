import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Pill-style segmented filter used by History. */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View className="flex-row bg-cloud-200 rounded-2xl p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className="flex-1"
          >
            <Animated.View
              layout={LinearTransition.duration(200)}
              className={`py-2.5 rounded-xl items-center ${active ? 'bg-white' : ''}`}
              style={
                active
                  ? {
                      shadowColor: '#1F2430',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 6,
                      elevation: 1,
                    }
                  : undefined
              }
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? 'text-saffron-700' : 'text-ink-500'
                }`}
              >
                {opt.label}
              </Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
}
