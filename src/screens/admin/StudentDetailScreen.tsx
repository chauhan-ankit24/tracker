import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AdminStackParamList } from '../../navigation/types';
import { StatsView } from '../../components/StatsView';
import { SegmentedControl } from '../../components/SegmentedControl';
import { EntryRow } from '../../components/EntryRow';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonCard } from '../../components/Skeleton';
import { getEntriesForUser } from '../../services/entries';
import { DailyEntry } from '../../types';
import { sortByDateDesc } from '../../utils/stats';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AdminStackParamList, 'StudentDetail'>;
type Tab = 'stats' | 'history';

export function StudentDetailScreen({ route, navigation }: Props) {
  const { studentId, studentName } = route.params;
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [tab, setTab] = useState<Tab>('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setEntries(await getEntriesForUser(studentId));
      } catch {
        // Render the empty state instead of hanging.
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  const history = useMemo(() => sortByDateDesc(entries), [entries]);

  return (
    <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          className="w-10 h-10 rounded-full bg-white border border-cloud-200 items-center justify-center mr-3"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink[700]} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xs text-saffron-600 font-medium">Devotee</Text>
          <Text className="text-xl font-bold text-ink-900" numberOfLines={1}>
            {studentName}
          </Text>
        </View>
      </View>

      <View className="px-5 mb-4">
        <SegmentedControl
          options={[
            { label: 'Statistics', value: 'stats' },
            { label: 'History', value: 'history' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      <View className="flex-row items-center px-5 mb-2">
        <Ionicons name="eye-outline" size={13} color={colors.ink[400]} />
        <Text className="text-xs text-ink-400 ml-1.5">View only — submissions can't be edited</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        {loading ? (
          <View className="gap-3 mt-2">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : tab === 'stats' ? (
          <StatsView entries={entries} />
        ) : history.length === 0 ? (
          <EmptyState icon="time-outline" title="No entries yet" />
        ) : (
          history.map((entry, i) => <EntryRow key={entry.id} entry={entry} index={i} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
