import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminStackParamList, AdminTabParamList } from './types';
import { tabScreenOptions, tabIcon } from './tabBar';
import { TodayScreen } from '../screens/TodayScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { StudentsScreen } from '../screens/admin/StudentsScreen';
import { StudentDetailScreen } from '../screens/admin/StudentDetailScreen';
import { ApprovalsScreen } from '../screens/admin/ApprovalsScreen';
import { QuestionnairesScreen } from '../screens/admin/QuestionnairesScreen';
import { QuestionnaireEditorScreen } from '../screens/admin/QuestionnaireEditorScreen';
import { QuestionnaireResponsesScreen } from '../screens/admin/QuestionnaireResponsesScreen';
import { MetricsEditorScreen } from '../screens/admin/MetricsEditorScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabScreenOptions,
        tabBarIcon: tabIcon(route.name),
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Students" component={StudentsScreen} />
      <Tab.Screen name="Questions" component={QuestionnairesScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/** Admins get the tab bar plus a pushable student-detail screen. */
export function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs" component={AdminTabs} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="Approvals" component={ApprovalsScreen} />
      <Stack.Screen name="QuestionnaireEditor" component={QuestionnaireEditorScreen} />
      <Stack.Screen name="QuestionnaireResponses" component={QuestionnaireResponsesScreen} />
      <Stack.Screen name="MetricsEditor" component={MetricsEditorScreen} />
    </Stack.Navigator>
  );
}
