import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { UserTabParamList } from './types';
import { tabScreenOptions, tabIcon } from './tabBar';
import { TodayScreen } from '../screens/TodayScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<UserTabParamList>();

export function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabScreenOptions,
        tabBarIcon: tabIcon(route.name),
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
