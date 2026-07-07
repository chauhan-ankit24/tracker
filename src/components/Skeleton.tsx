import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  className?: string;
  style?: ViewStyle;
}

/** Shimmering placeholder block used for loading states. */
export function Skeleton({ width = '100%', height = 16, radius = 10, style }: Props) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: '#E9EBEF' },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** A stack of skeleton rows for list/card loading. */
export function SkeletonCard() {
  return (
    <View className="bg-white rounded-2xl p-5 border border-cloud-200">
      <Skeleton width="40%" height={14} />
      <View className="h-3" />
      <Skeleton width="70%" height={20} />
      <View className="h-2" />
      <Skeleton width="55%" height={20} />
    </View>
  );
}
