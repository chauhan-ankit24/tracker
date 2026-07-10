import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { UserNavigator } from './UserNavigator';
import { AdminNavigator } from './AdminNavigator';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { PendingApprovalScreen } from '../screens/auth/PendingApprovalScreen';
import { isPendingMentor } from '../utils/roles';
import { colors } from '../theme/colors';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cloud[100], primary: colors.saffron[500] },
};

export function RootNavigator() {
  const { user, initializing, needsVerification, needsOnboarding } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-cloud-100">
        <ActivityIndicator size="large" color={colors.saffron[500]} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {renderRoot()}
    </NavigationContainer>
  );

  function renderRoot() {
    // Email/password account that still needs to confirm its email. Gated on
    // `user` so an invalid-mentor sign-up keeps the Signup screen mounted.
    if (needsVerification && user) return <VerifyEmailScreen />;
    // Authenticated Google user with no profile yet.
    if (needsOnboarding) return <OnboardingScreen />;
    if (!user) return <AuthNavigator />;
    // Mentors must be approved by the owner before they get mentor features.
    if (isPendingMentor(user)) return <PendingApprovalScreen />;
    if (user.role === 'admin') return <AdminNavigator />;
    return <UserNavigator />;
  }
}
