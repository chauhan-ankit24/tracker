import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { colors } from '../theme/colors';

/** Shared bottom-tab styling for both user and admin navigators. */
export const tabScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.saffron[600],
  tabBarInactiveTintColor: colors.ink[400],
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopColor: colors.cloud[200],
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
};

type IconName = keyof typeof Ionicons.glyphMap;

/** Maps a route name to its focused/unfocused icon. */
export function tabIcon(routeName: string) {
  const map: Record<string, [IconName, IconName]> = {
    Today: ['sunny', 'sunny-outline'],
    History: ['time', 'time-outline'],
    Dashboard: ['stats-chart', 'stats-chart-outline'],
    Profile: ['person', 'person-outline'],
    Students: ['people', 'people-outline'],
    Questions: ['clipboard', 'clipboard-outline'],
  };
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
    const [active, inactive] = map[routeName] ?? ['ellipse', 'ellipse-outline'];
    return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
  };
}
