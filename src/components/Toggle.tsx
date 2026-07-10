import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';
import { shadows } from '../theme/elevation';

interface Props {
  value: boolean;
  /**
   * Provide to make the toggle interactive on its own. Omit when the toggle
   * sits inside an already-pressable row (it then renders presentationally and
   * the row handles the tap) — this keeps the whole row a 44pt+ target.
   */
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const TRACK_W = 46;
const TRACK_H = 28;
const THUMB = 22;
const TRAVEL = TRACK_W - THUMB - 6; // 3px inset each side

/** A single, accessible, smoothly-animated switch used app-wide. */
export function Toggle({ value, onValueChange, disabled, accessibilityLabel }: Props) {
  const progress = useDerivedValue(() => withTiming(value ? 1 : 0, { duration: 180 }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.cloud[300], colors.saffron[500]],
    ),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRAVEL }],
  }));

  const track = (
    <Animated.View
      style={[
        {
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          justifyContent: 'center',
          paddingHorizontal: 3,
          opacity: disabled ? 0.5 : 1,
        },
        trackStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            backgroundColor: colors.white,
          },
          shadows.sm,
          thumbStyle,
        ]}
      />
    </Animated.View>
  );

  // Presentational: parent row owns the press.
  if (!onValueChange) return <View pointerEvents="none">{track}</View>;

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
    >
      {track}
    </Pressable>
  );
}
