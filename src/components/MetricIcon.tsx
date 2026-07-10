import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  /**
   * Icon name. A plain string renders an Ionicon (the app default); prefix with
   * `mci:` to render a MaterialCommunityIcons glyph — e.g. `mci:hands-pray`,
   * `mci:book-open-variant` — for icons Ionicons doesn't provide.
   */
  name?: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

const MCI = 'mci:';

/**
 * Renders a metric's icon from whichever family it belongs to, so metric icons
 * can use MaterialCommunityIcons (praying hands, open book) while everything
 * else stays on Ionicons. Falls back to a neutral Ionicon when unset.
 */
export function MetricIcon({ name, size = 18, color, style }: Props) {
  if (name?.startsWith(MCI)) {
    return (
      <MaterialCommunityIcons
        name={name.slice(MCI.length) as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size}
        color={color}
        style={style}
      />
    );
  }
  return (
    <Ionicons
      name={(name as keyof typeof Ionicons.glyphMap) ?? 'ellipse-outline'}
      size={size}
      color={color}
      style={style}
    />
  );
}
