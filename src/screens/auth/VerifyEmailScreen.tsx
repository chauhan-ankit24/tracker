import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';
import { colors } from '../../theme/colors';

/**
 * Shown when a signed-in account hasn't confirmed its email. Blocks the app
 * until the user clicks the link and taps "I've verified", and quietly polls
 * in the background so it can advance on its own.
 */
export function VerifyEmailScreen() {
  const { checkVerification, resendVerification, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const email = auth.currentUser?.email ?? 'your email';

  // Poll every few seconds so verification is picked up without a manual tap.
  useEffect(() => {
    const id = setInterval(() => {
      checkVerification().catch(() => {});
    }, 4000);
    return () => clearInterval(id);
  }, [checkVerification]);

  // Simple resend cooldown to avoid rate limits.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const onCheck = async () => {
    setChecking(true);
    setMessage('');
    try {
      const ok = await checkVerification();
      if (!ok) setMessage('Not verified yet. Please click the link in your email.');
    } finally {
      setChecking(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    setMessage('');
    try {
      await resendVerification();
      setMessage('Verification email sent. Check your inbox and spam folder.');
      setCooldown(30);
      timerRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1 && timerRef.current) clearInterval(timerRef.current);
          return c - 1;
        });
      }, 1000);
    } catch {
      setMessage('Could not send right now. Please wait a moment and try again.');
    } finally {
      setResending(false);
    }
  };

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
            <Ionicons name="mail-unread-outline" size={40} color={colors.white} />
          </View>
          <Text className="text-2xl font-bold text-ink-900 mt-5">Verify your email</Text>
          <Text className="text-sm text-ink-400 text-center mt-2 leading-5">
            We sent a verification link to{'\n'}
            <Text className="font-semibold text-ink-700">{email}</Text>
          </Text>
          <Text className="text-sm text-ink-400 text-center mt-3 leading-5">
            Open it, confirm your address, then come back here.
          </Text>
        </Animated.View>

        {message ? (
          <Animated.Text
            entering={FadeIn}
            className="text-sm text-center text-saffron-700 mb-4"
          >
            {message}
          </Animated.Text>
        ) : null}

        <Animated.View entering={FadeInDown.duration(450).delay(120)}>
          <Button
            label="I've verified"
            icon="checkmark-circle-outline"
            onPress={onCheck}
            loading={checking}
          />
          <View className="h-3" />
          <Button
            label={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
            icon="paper-plane-outline"
            variant="secondary"
            onPress={onResend}
            loading={resending}
            disabled={cooldown > 0}
          />
          <View className="h-3" />
          <Button label="Sign out" variant="ghost" onPress={() => signOut()} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
