import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UserStackParamList } from './types';
import { UserTabs } from './UserTabs';
import { RespondQuestionnaireScreen } from '../screens/RespondQuestionnaireScreen';

const Stack = createNativeStackNavigator<UserStackParamList>();

/** Devotees get the tab bar plus a pushable questionnaire-answering screen. */
export function UserNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs" component={UserTabs} />
      <Stack.Screen name="RespondQuestionnaire" component={RespondQuestionnaireScreen} />
    </Stack.Navigator>
  );
}
