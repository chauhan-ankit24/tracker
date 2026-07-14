import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import { DashboardScreen } from "../screens/DashboardScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { TodayScreen } from "../screens/TodayScreen";
import { UserSettings } from "../screens/UserSettings";
import { tabIcon, tabScreenOptions } from "./tabBar";
import { UserTabParamList } from "./types";

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
      <Tab.Screen name="Settings" component={UserSettings} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
