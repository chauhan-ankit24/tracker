import React, { useCallback, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { NumberStepper } from '../components/NumberStepper';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { getTodayEntry, saveTodayEntry } from '../services/entries';
import { syncDailyReminders } from '../services/notifications';
import { formatToday } from '../utils/date';
import { colors } from '../theme/colors';

/** Extracts a short " (code)" suffix from a Firebase error for the UI. */
function errCode(e: unknown): string {
  const code = (e as { code?: string })?.code;
  return code ? ` (${code})` : '';
}

export function TodayScreen() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const entry = await getTodayEntry(user.id);
      if (entry) {
        setRounds(entry.chantingRounds);
        setMinutes(entry.readingMinutes);
        setAlreadyLogged(true);
      }
      // Devotees get evening reminders; skip tonight's if already logged.
      if (user.role === 'user') {
        syncDailyReminders(!!entry).catch(() => {});
      }
    } catch (e) {
      // Never leave the screen stuck on skeletons — show the inputs anyway.
      setError(`Couldn't load today's entry${errCode(e)}. Check your connection and Firestore rules.`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await saveTodayEntry({ userId: user.id, chantingRounds: rounds, readingMinutes: minutes });
      setAlreadyLogged(true);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2200);
      // Today is now logged — drop tonight's reminder.
      if (user.role === 'user') {
        syncDailyReminders(true).catch(() => {});
      }
    } catch (e) {
      setError(`Couldn't save${errCode(e)}. Check your connection and that Firestore rules are published.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer scroll refreshing={loading} onRefresh={load}>
      <ScreenHeader subtitle={formatToday()} title="Today's Sadhana" />

      {alreadyLogged ? (
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row items-center bg-saffron-50 rounded-2xl px-4 py-3 mb-4"
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.saffron[600]} />
          <Text className="text-sm text-saffron-700 ml-2 flex-1">
            Logged for today. You can edit it until midnight.
          </Text>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(400)} className="mb-4">
          <Text className="text-sm text-ink-400 leading-5">
            Takes just a few seconds — enter today's counts and tap save.
          </Text>
        </Animated.View>
      )}

      {error ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="flex-row items-center bg-red-50 rounded-2xl px-4 py-3 mb-4"
        >
          <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
          <Text className="text-sm text-red-600 ml-2 flex-1">{error}</Text>
        </Animated.View>
      ) : null}

      {loading ? (
        <View className="gap-4">
          <Skeleton height={150} radius={12} />
          <Skeleton height={150} radius={12} />
        </View>
      ) : (
        <View className="gap-4">
          <Animated.View entering={FadeInDown.duration(420).delay(80)}>
            <NumberStepper
              label="Chanting rounds"
              icon="ellipse-outline"
              value={rounds}
              onChange={setRounds}
              max={200}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(420).delay(160)}>
            <NumberStepper
              label="Reading minutes"
              icon="book-outline"
              value={minutes}
              onChange={setMinutes}
              step={5}
              max={720}
              unit="min"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(420).delay(240)} className="mt-2">
            <Button
              label={justSaved ? 'Saved' : alreadyLogged ? 'Update Entry' : 'Save Entry'}
              icon={justSaved ? 'checkmark' : 'save-outline'}
              onPress={onSave}
              loading={saving}
            />
          </Animated.View>
        </View>
      )}
    </ScreenContainer>
  );
}
