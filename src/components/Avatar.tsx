import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getAvatar } from '../theme/avatars';
import { colors } from '../theme/colors';

interface Props {
  name: string;
  avatarId?: string;
  size?: number;
  shadow?: boolean;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Renders a chosen predefined avatar, or the user's initials as a fallback. */
export function Avatar({ name, avatarId, size = 96, shadow = false }: Props) {
  const preset = getAvatar(avatarId);
  const bg = preset?.bg ?? colors.saffron[500];

  const shadowStyle = shadow
    ? {
        shadowColor: bg,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
      }
    : undefined;

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        shadowStyle,
      ]}
      className="items-center justify-center"
    >
      {preset ? (
        <Ionicons name={preset.icon} size={Math.round(size * 0.46)} color={colors.white} />
      ) : (
        <Text style={{ fontSize: Math.round(size * 0.34) }} className="text-white font-bold">
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}
