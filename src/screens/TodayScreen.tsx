import React, { useCallback, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { NumberStepper } from '../components/NumberStepper';
import { ScaleInput } from '../components/ScaleInput';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { TodayQuestionnaires } from '../components/TodayQuestionnaires';
import { EkadasiBanner } from '../components/EkadasiBanner';
import { useAuth } from '../context/AuthContext';
import { getTodayEntry, saveTodayEntry } from '../services/entries';
import { getMetricsForUser, activeMetrics } from '../services/metrics';
import { syncDailyReminders, syncEkadasiReminders } from '../services/notifications';
import { EKADASI_DATES } from '../data/ekadasi';
import { Metric } from '../types';
import { formatToday } from '../utils/date';
import { colors } from '../theme/colors';

/** Extracts a short " (code)" suffix from a Firebase error for the UI. */
function errCode(e: unknown): string {
  const code = (e as { code?: string })?.code;
  return code ? ` (${code})` : '';
}

export function TodayScreen() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [values, setValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState('');

  const shown = activeMetrics(metrics);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [ms, entry] = await Promise.all([
        getMetricsForUser(user),
        getTodayEntry(user.id),
      ]);
      setMetrics(ms);
      if (entry) {
        setValues(entry.values ?? {});
        setAlreadyLogged(true);
      } else {
        setValues({});
        setAlreadyLogged(false);
      }
      // Devotees get evening reminders; skip tonight's if already logged.
      if (user.role === 'user') {
        syncDailyReminders(!!entry).catch(() => {});
      }
      // Ekadasi reminders are relevant to everyone (mentors observe too).
      syncEkadasiReminders(EKADASI_DATES).catch(() => {});
    } catch (e) {
      setError(`Couldn't load today's entry${errCode(e)}. Check your connection and Firestore rules.`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const setValue = (id: string, n: number) => setValues((v) => ({ ...v, [id]: n }));

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      // Persist every active counter (0 counts as a tracked day) and any rated
      // scale. Metrics left blank on a scale aren't stored.
      const payload: Record<string, number> = {};
      shown.forEach((m) => {
        const v = values[m.id] ?? 0;
        if (m.type === 'counter' || v > 0) payload[m.id] = v;
      });
      await saveTodayEntry({ userId: user.id, values: payload });
      setAlreadyLogged(true);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2200);
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
            Takes just a few seconds — fill in today's practice and tap save.
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
      ) : shown.length === 0 ? (
        <EmptyState
          icon="clipboard-outline"
          title="Nothing to log yet"
          subtitle="Your mentor hasn't set up any daily questions."
        />
      ) : (
        <View className="gap-4">
          {shown.map((m, i) => (
            <Animated.View
              key={m.id}
              entering={FadeInDown.duration(420).delay(80 + i * 80)}
            >
              {m.type === 'scale' ? (
                <ScaleInput
                  label={m.label}
                  icon={m.icon ?? 'star-outline'}
                  value={values[m.id] ?? 0}
                  onChange={(n) => setValue(m.id, n)}
                />
              ) : (
                <NumberStepper
                  label={m.label}
                  icon={m.icon ?? 'ellipse-outline'}
                  value={values[m.id] ?? 0}
                  onChange={(n) => setValue(m.id, n)}
                  step={m.step ?? 1}
                  max={m.max ?? 999}
                  unit={m.unit}
                  presets={m.presets}
                />
              )}
            </Animated.View>
          ))}

          <Animated.View entering={FadeInDown.duration(420).delay(80 + shown.length * 80)} className="mt-2">
            <Button
              label={justSaved ? 'Saved' : alreadyLogged ? 'Update Entry' : 'Save Entry'}
              icon={justSaved ? 'checkmark' : 'save-outline'}
              onPress={onSave}
              loading={saving}
            />
          </Animated.View>
        </View>
      )}

      {/* Upcoming Ekadasi — shown to everyone. */}
      <EkadasiBanner />

      {/* Devotees see today's reflection questions from their mentor here. */}
      {user?.role === 'user' ? <TodayQuestionnaires user={user} /> : null}
    </ScreenContainer>
  );
}
