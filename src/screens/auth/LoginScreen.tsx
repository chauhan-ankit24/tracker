import React, { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { BrandMark } from '../../components/BrandMark';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { GoogleButton } from '../../components/GoogleButton';
import { OrDivider } from '../../components/OrDivider';
import { signIn, authErrorMessage } from '../../services/auth';
import { signInWithGoogle } from '../../services/google';
import { isExpoGo } from '../../config/app';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      // AuthContext's listener handles navigation on success.
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // AuthContext routes to the app or onboarding on success.
    } catch (err) {
      if ((err as { code?: string })?.code !== 'app/google-cancelled') {
        setError(authErrorMessage(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(500)} className="mb-8">
            <BrandMark />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(120)}>
            <Text className="text-xl font-bold text-ink-900 mb-1">Welcome back</Text>
            <Text className="text-sm text-ink-400 mb-6">Sign in to continue your practice</Text>

            {/* Lead with Google — the most-used sign-in path. */}
            {!isExpoGo ? (
              <>
                <GoogleButton onPress={onGoogle} loading={googleLoading} />
                <OrDivider label="or continue with email" />
              </>
            ) : null}

            <TextField
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label="Password"
              icon="lock-closed-outline"
              placeholder="••••••••"
              secure
              value={password}
              onChangeText={setPassword}
            />

            {error ? (
              <Animated.Text entering={FadeIn} className="text-sm text-red-500 mb-3 ml-1">
                {error}
              </Animated.Text>
            ) : null}

            <Button label="Sign In" onPress={onSubmit} loading={loading} className="mt-2" />

            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-ink-400">New devotee? </Text>
              <Pressable onPress={() => navigation.navigate('Signup')}>
                <Text className="text-sm font-semibold text-saffron-600">Create an account</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
