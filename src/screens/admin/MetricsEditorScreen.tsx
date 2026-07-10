import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AdminStackParamList } from '../../navigation/types';
import { StackHeader } from '../../components/StackHeader';
import { Button } from '../../components/Button';
import { Toggle } from '../../components/Toggle';
import { MetricIcon } from '../../components/MetricIcon';
import { SegmentedControl } from '../../components/SegmentedControl';
import { PressableScale } from '../../components/PressableScale';
import { useAuth } from '../../context/AuthContext';
import {
  getMetricsForOwner,
  saveMetricSet,
  newMetricId,
} from '../../services/metrics';
import { Metric, MetricType } from '../../types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AdminStackParamList, 'MetricsEditor'>;

function newMetric(): Metric {
  return {
    id: newMetricId(),
    label: '',
    type: 'counter',
    icon: 'ellipse-outline',
    unit: '',
    step: 1,
    max: 100,
    active: true,
  };
}

export function MetricsEditorScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        setMetrics(await getMetricsForOwner(user.id));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const update = (id: string, patch: Partial<Metric>) =>
    setMetrics((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const remove = (id: string) => setMetrics((ms) => ms.filter((m) => m.id !== id));
  const add = () => setMetrics((ms) => [...ms, newMetric()]);

  const onSave = async () => {
    if (!user) return;
    const cleaned = metrics
      .map((m) => ({ ...m, label: m.label.trim() }))
      .filter((m) => m.label);
    if (cleaned.length === 0) {
      setError('Add at least one metric with a name.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await saveMetricSet(user.id, cleaned);
      navigation.goBack();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(`Couldn't save${code ? ` (${code})` : ''}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
      <StackHeader
        title="Daily metrics"
        subtitle="Quick questions"
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          <Text className="text-sm text-ink-400 leading-5 mb-4">
            These are the quick questions your devotees fill in each day on their Today
            screen. Counters use +/- steppers; ratings are a 1–5 scale.
          </Text>

          {error ? (
            <View className="flex-row items-center bg-red-50 rounded-2xl px-4 py-3 mb-4">
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text className="text-sm text-red-600 ml-2 flex-1">{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <Text className="text-sm text-ink-400">Loading…</Text>
          ) : (
            metrics.map((m, i) => (
              <MetricEditorCard
                key={m.id}
                metric={m}
                index={i}
                onChange={(patch) => update(m.id, patch)}
                onRemove={() => remove(m.id)}
              />
            ))
          )}

          <PressableScale
            onPress={add}
            activeScale={0.97}
            className="flex-row items-center justify-center bg-saffron-50 rounded-2xl py-3.5 mt-1 mb-6"
          >
            <Ionicons name="add" size={18} color={colors.saffron[600]} />
            <Text className="text-sm font-semibold text-saffron-700 ml-1">Add metric</Text>
          </PressableScale>

          <Button label="Save metrics" icon="checkmark" onPress={onSave} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MetricEditorCard({
  metric,
  index,
  onChange,
  onRemove,
}: {
  metric: Metric;
  index: number;
  onChange: (patch: Partial<Metric>) => void;
  onRemove: () => void;
}) {
  const setType = (type: MetricType) =>
    onChange({
      type,
      icon: metric.icon ?? (type === 'scale' ? 'star-outline' : 'ellipse-outline'),
    });

  return (
    <Animated.View entering={FadeInDown.duration(340).delay(Math.min(index, 8) * 45)}>
      <View className="bg-white rounded-2xl px-4 py-4 mb-3 border border-cloud-200">
        <View className="flex-row items-center mb-3">
          <View className="w-7 h-7 rounded-full bg-saffron-100 items-center justify-center mr-2">
            <MetricIcon name={metric.icon} size={15} color={colors.saffron[600]} />
          </View>
          <Text className="text-xs text-ink-400 flex-1">Metric {index + 1}</Text>
          <Pressable onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={17} color="#DC2626" />
          </Pressable>
        </View>

        <TextInput
          className="bg-cloud-100 rounded-xl px-3 py-3 text-base text-ink-900 mb-3"
          placeholder="Name (e.g. Hearing minutes)"
          placeholderTextColor={colors.ink[400]}
          value={metric.label}
          onChangeText={(label) => onChange({ label })}
        />

        <SegmentedControl
          options={[
            { label: 'Counter', value: 'counter' },
            { label: 'Rating 1–5', value: 'scale' },
          ]}
          value={metric.type}
          onChange={setType}
        />

        {metric.type === 'counter' ? (
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">
              <Text className="text-xs text-ink-500 mb-1 ml-1">Unit (optional)</Text>
              <TextInput
                className="bg-cloud-100 rounded-xl px-3 py-2.5 text-sm text-ink-900"
                placeholder="min, rounds…"
                placeholderTextColor={colors.ink[400]}
                value={metric.unit ?? ''}
                onChangeText={(unit) => onChange({ unit })}
              />
            </View>
            <View style={{ width: 96 }}>
              <Text className="text-xs text-ink-500 mb-1 ml-1">Max</Text>
              <TextInput
                className="bg-cloud-100 rounded-xl px-3 py-2.5 text-sm text-ink-900"
                keyboardType="number-pad"
                value={String(metric.max ?? 100)}
                onChangeText={(t) => {
                  const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
                  onChange({ max: Number.isNaN(n) ? 0 : Math.min(999, n) });
                }}
                maxLength={3}
              />
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={() => onChange({ active: !metric.active })}
          className="flex-row items-center justify-between mt-3 pt-3 border-t border-cloud-200"
          accessibilityRole="switch"
          accessibilityState={{ checked: metric.active }}
          accessibilityLabel="Show on Today"
        >
          <Text className="text-sm text-ink-700">Show on Today</Text>
          <Toggle value={metric.active} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
