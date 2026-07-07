import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

/**
 * Shown to a mentor whose account hasn't been approved yet (and isn't the
 * owner). They can't reach any mentor features until approved. Auto-rechecks
 * periodically and offers a manual refresh + sign out.
 */
export function PendingApprovalScreen() {
  const { user, refreshUser, signOut } = useAuth();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      refreshUser().catch(() => {});
    }, 8000);
    return () => clearInterval(id);
  }, [refreshUser]);

  const onCheck = async () => {
    setChecking(true);
    try {
      await refreshUser();
    } finally {
      setChecking(false);
    }
  };

  const rejected = user?.rejected === true;

  return (
    <SafeAreaView className="flex-1 bg-cloud-100">
      <View className="flex-1 justify-center px-6">
        <Animated.View entering={FadeInDown.duration(450)} className="items-center mb-8">
          <View
            className="w-20 h-20 rounded-3xl bg-saffron-500 items-center justify-center"
            style={{
              shadowColor: colors.saffron[500],
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 18,
              elevation: 6,
            }}
          >
            <Ionicons
              name={rejected ? 'close-circle-outline' : 'hourglass-outline'}
              size={40}
              color={colors.white}
            />
          </View>
          <Text className="text-2xl font-bold text-ink-900 mt-5">
            {rejected ? 'Request not approved' : 'Awaiting approval'}
          </Text>
          <Text className="text-sm text-ink-400 text-center mt-3 leading-5">
            {rejected
              ? 'Your mentor request was not approved. Please contact the admin if you think this is a mistake.'
              : 'Your mentor account is pending admin approval. You’ll get full access as soon as it’s approved.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(120)}>
          {!rejected ? (
            <Button
              label="Check again"
              icon="refresh-outline"
              onPress={onCheck}
              loading={checking}
            />
          ) : null}
          <View className="h-3" />
          <Button label="Sign out" variant="ghost" onPress={() => signOut()} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
