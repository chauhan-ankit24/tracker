import React from 'react';
import { View, Text, Image } from 'react-native';

import { colors } from '../theme/colors';

// The app logo, also used as the launcher icon and splash image.
const logo = require('../../assets/icon.png');

/** The app's lotus wordmark used on auth screens. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? 56 : 84;
  return (
    <View className="items-center">
      <View
        className="rounded-3xl overflow-hidden"
        style={{
          width: size,
          height: size,
          shadowColor: colors.saffron[500],
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 18,
          elevation: 6,
        }}
      >
        <Image source={logo} style={{ width: size, height: size }} resizeMode="cover" />
      </View>
      {!compact ? (
        <>
          <Text className="text-2xl font-bold text-ink-900 mt-4">Bhakti Tracker</Text>
          <Text className="text-sm text-ink-400 mt-1">Steady practice, every day</Text>
        </>
      ) : null}
    </View>
  );
}
