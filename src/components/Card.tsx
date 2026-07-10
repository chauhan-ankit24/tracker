import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { shadows } from '../theme/elevation';

interface Props extends ViewProps {
  children: React.ReactNode;
  className?: string;
  /** Entry animation delay in ms. Set to null to disable animation. */
  delay?: number | null;
}

/**
 * Rounded white surface with a soft shadow — the base building block for the
 * app's premium, uncluttered look.
 */
export function Card({ children, className = '', delay = 0, style, ...rest }: Props) {
  const content = (
    <View
      className={`bg-white rounded-2xl p-5 border border-cloud-200 ${className}`}
      style={[shadows.md, style]}
      {...rest}
    >
      {children}
    </View>
  );

  if (delay === null) return content;
  return (
    <Animated.View entering={FadeInDown.duration(420).delay(delay)}>
      {content}
    </Animated.View>
  );
}
