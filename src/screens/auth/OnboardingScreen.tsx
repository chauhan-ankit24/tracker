import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { BrandMark } from '../../components/BrandMark';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';
import { completeOnboarding, authErrorMessage } from '../../services/auth';
import { Role } from '../../types';
import { colors } from '../../theme/colors';

/**
 * Shown to a Google user who has authenticated but has no profile yet. Collects
 * the same details a normal sign-up needs: display name, role, and (for a
 * devotee) the mentor code.
 */
export function OnboardingScreen() {
  const { setUser, signOut } = useAuth();
  const [name, setName] = useState(auth.currentUser?.displayName ?? '');
  const [role, setRole] = useState<Role>('user');
  const [mentorCode, setMentorCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (role === 'user' && !mentorCode.trim()) {
      setError('Please enter your mentor code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await completeOnboarding({ role, name, mentorCode: mentorCode.trim() });
      setUser(user);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
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
          <Animated.View entering={FadeInDown.duration(500)} className="items-center mb-6">
            <BrandMark compact />
            <Text className="text-xl font-bold text-ink-900 mt-4">Almost there</Text>
            <Text className="text-sm text-ink-400 mt-1">Tell us a little about you</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(120)}>
            <TextField
              label="Full name"
              icon="person-outline"
              placeholder="Your name"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-sm font-medium text-ink-700 mb-2 ml-1">I am a</Text>
            <View className="flex-row bg-cloud-200 rounded-2xl p-1 mb-4">
              <RolePill label="Devotee" icon="leaf-outline" active={role === 'user'} onPress={() => setRole('user')} />
              <RolePill label="Mentor" icon="school-outline" active={role === 'admin'} onPress={() => setRole('admin')} />
            </View>

            {role === 'user' ? (
              <Animated.View entering={FadeIn}>
                <TextField
                  label="Mentor code"
                  icon="key-outline"
                  placeholder="6-character code from your mentor"
                  autoCapitalize="characters"
                  maxLength={6}
                  value={mentorCode}
                  onChangeText={setMentorCode}
                />
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn} className="mb-4">
                <View className="flex-row items-start bg-saffron-50 rounded-2xl p-4">
                  <Ionicons name="information-circle-outline" size={18} color={colors.saffron[600]} />
                  <Text className="text-xs text-ink-500 ml-2 flex-1 leading-5">
                    Mentor accounts need admin approval before activation.
                  </Text>
                </View>
              </Animated.View>
            )}

            {error ? (
              <Animated.Text entering={FadeIn} className="text-sm text-red-500 mb-3 ml-1">
                {error}
              </Animated.Text>
            ) : null}

            <Button label="Continue" onPress={onSubmit} loading={loading} className="mt-1" />

            <Pressable onPress={() => signOut()} className="mt-6 items-center">
              <Text className="text-sm text-ink-400">Cancel and sign out</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RolePill({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1">
      <View
        className={`flex-row items-center justify-center py-2.5 rounded-xl ${active ? 'bg-white' : ''}`}
        style={
          active
            ? { shadowColor: '#1F2430', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 1 }
            : undefined
        }
      >
        <Ionicons name={icon} size={16} color={active ? colors.saffron[600] : colors.ink[400]} />
        <Text className={`text-sm font-semibold ml-2 ${active ? 'text-saffron-700' : 'text-ink-500'}`}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
