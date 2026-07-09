import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  children: React.ReactNode;
  activeScale?: number;
  className?: string;
  style?: any;
}

/**
 * Reusable wrapper that applies a premium scale shrink on press.
 * Animates the Pressable itself to preserve exact flex layouts of children.
 */
export function PressableScale({
  children,
  activeScale = 0.96,
  className = '',
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withTiming(activeScale, { duration: 90 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
      style={[animatedStyle, style]}
      className={className}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
