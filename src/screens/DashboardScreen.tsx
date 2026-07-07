import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatsView } from '../components/StatsView';
import { SkeletonCard, Skeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { getEntriesForUser } from '../services/entries';
import { DailyEntry } from '../types';

export function DashboardScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setEntries(await getEntriesForUser(user.id));
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

  return (
    <ScreenContainer scroll refreshing={loading && entries.length > 0} onRefresh={load}>
      <ScreenHeader title="Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0] ?? ''}`} />

      {loading && entries.length === 0 ? (
        <View className="gap-4">
          <Skeleton height={130} radius={16} />
          <View className="flex-row gap-3">
            <Skeleton height={110} radius={12} />
            <Skeleton height={110} radius={12} />
          </View>
          <SkeletonCard />
        </View>
      ) : (
        <StatsView entries={entries} />
      )}
    </ScreenContainer>
  );
}
