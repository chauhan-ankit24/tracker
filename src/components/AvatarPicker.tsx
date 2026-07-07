import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { AVATARS } from '../theme/avatars';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  currentId?: string;
  saving?: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/**
 * Inline avatar chooser rendered directly in the Profile screen tree.
 *
 * Deliberately NOT a <Modal>: modal content lives in a separate native view
 * tree where both NativeWind classes and some flex layout misbehaved, which
 * produced a broken vertical strip. Rendering inline avoids all of that.
 */
export function AvatarPicker({ visible, currentId, saving, onSelect, onClose }: Props) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      style={{
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.cloud[200],
        padding: 16,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink[900] }}>
          Choose an avatar
        </Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={20} color={colors.ink[400]} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {AVATARS.map((a) => {
          const selected = a.id === currentId;
          return (
            <Pressable
              key={a.id}
              onPress={() => onSelect(a.id)}
              disabled={saving}
              style={{ width: '20%', alignItems: 'center', marginBottom: 14 }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: a.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: selected ? 3 : 0,
                  borderColor: colors.ink[900],
                  opacity: saving && selected ? 0.6 : 1,
                }}
              >
                <Ionicons name={a.icon} size={22} color={colors.white} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}
