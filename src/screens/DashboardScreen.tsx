import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatsView } from '../components/StatsView';
import { StreakBadge } from '../components/StreakBadge';
import { GoalsEditor } from '../components/GoalsEditor';
import { SkeletonCard, Skeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { getEntriesForUser } from '../services/entries';
import { getMetricsForUser, activeMetrics } from '../services/metrics';
import { getGoals, saveGoals } from '../services/goals';
import { currentStreak } from '../utils/stats';
import { DailyEntry, Metric } from '../types';

export function DashboardScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [editingGoals, setEditingGoals] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [e, m, g] = await Promise.all([
        getEntriesForUser(user.id),
        getMetricsForUser(user),
        getGoals(user.id),
      ]);
      setEntries(e);
      setMetrics(m);
      setTargets(g?.targets ?? {});
    } catch {
      // Fall through to the empty/stat view rather than hanging.
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reload every time the tab gains focus so a just-saved entry shows up.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const streak = useMemo(() => currentStreak(entries), [entries]);
  const hasData = entries.length > 0;

  const onSaveGoals = async (next: Record<string, number>) => {
    if (!user) return;
    setSavingGoals(true);
    try {
      await saveGoals(user.id, user.adminId, next);
      setTargets(next);
      setEditingGoals(false);
    } catch {
      // Keep the editor open so the user can retry.
    } finally {
      setSavingGoals(false);
    }
  };

  return (
    <ScreenContainer scroll refreshing={loading && entries.length > 0} onRefresh={load}>
      <ScreenHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(' ')[0] ?? ''}`}
        right={hasData ? <StreakBadge streak={streak} /> : undefined}
      />

      {loading && entries.length === 0 ? (
        <View className="gap-4">
          <Skeleton height={92} radius={16} />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <>
          <GoalsEditor
            visible={editingGoals}
            metrics={activeMetrics(metrics)}
            initialTargets={targets}
            saving={savingGoals}
            onSave={onSaveGoals}
            onClose={() => setEditingGoals(false)}
          />
          <StatsView
            entries={entries}
            metrics={metrics}
            targets={targets}
            onEditGoals={() => setEditingGoals(true)}
            hideStreak
          />
        </>
      )}
    </ScreenContainer>
  );
}
