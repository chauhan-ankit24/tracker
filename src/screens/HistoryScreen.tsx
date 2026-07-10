import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { EntryRow } from '../components/EntryRow';
import { EmptyState } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { getEntriesForUser } from '../services/entries';
import { getMetricsForUser } from '../services/metrics';
import { DailyEntry, HistoryFilter, Metric } from '../types';
import { filterEntries, sortByDateDesc } from '../utils/stats';

const FILTERS: { label: string; value: HistoryFilter }[] = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'All Time', value: 'all' },
];

export function HistoryScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('7d');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [e, m] = await Promise.all([getEntriesForUser(user.id), getMetricsForUser(user)]);
      setEntries(e);
      setMetrics(m);
    } catch {
      // Leave existing entries; the empty state / list still renders.
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reload on focus so an entry saved on the Today tab appears right away.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const visible = useMemo(
    () => sortByDateDesc(filterEntries(entries, filter)),
    [entries, filter],
  );

  return (
    <ScreenContainer scroll refreshing={loading && entries.length > 0} onRefresh={load}>
      <ScreenHeader title="History" subtitle="Your journey" />

      <View className="mb-5">
        <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      {loading ? (
        <View className="gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No entries yet"
          subtitle="Your logged days will appear here. Start with today's tracker."
        />
      ) : (
        <View>
          {visible.map((entry, i) => (
            <EntryRow key={entry.id} entry={entry} metrics={metrics} index={i} />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
