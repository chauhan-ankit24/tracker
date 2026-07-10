import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonCard } from '../../components/Skeleton';
import { Avatar } from '../../components/Avatar';
import { PressableScale } from '../../components/PressableScale';
import { useAuth } from '../../context/AuthContext';
import { getStudentsForAdmin, getLastEntryDate } from '../../services/entries';
import { AppUser } from '../../types';
import { AdminStackParamList } from '../../navigation/types';
import { Activity, ACTIVITY_META, classifyActivity, lastSeenLabel } from '../../utils/activity';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/elevation';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'Tabs'>;

export function StudentsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const [students, setStudents] = useState<AppUser[]>([]);
  const [activity, setActivity] = useState<Record<string, Activity>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const studs = await getStudentsForAdmin(user.id);
      setStudents(studs);
      setLoading(false);
      // Activity fills in after the list is already visible — one lightweight
      // last-entry query per devotee, run in parallel.
      const dates = await Promise.all(studs.map((s) => getLastEntryDate(s.id).catch(() => null)));
      const map: Record<string, Activity> = {};
      studs.forEach((s, i) => (map[s.id] = classifyActivity(dates[i])));
      setActivity(map);
    } catch {
      // Show the empty state rather than an endless spinner.
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
      : students;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [students, search]);

  const atRiskCount = useMemo(
    () => Object.values(activity).filter((a) => a.status === 'atRisk').length,
    [activity],
  );

  return (
    <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={loading && students.length > 0}
            onRefresh={load}
            tintColor={colors.saffron[500]}
          />
        }
      >
        <ScreenHeader
          title="Devotees"
          subtitle={
            atRiskCount
              ? `${students.length} assigned · ${atRiskCount} need follow-up`
              : `${students.length} assigned to you`
          }
        />

        <View className="flex-row items-center bg-white rounded-2xl px-4 border border-cloud-300 mb-5">
          <Ionicons name="search-outline" size={18} color={colors.ink[400]} />
          <TextInput
            className="flex-1 py-3.5 px-2 text-base text-ink-900"
            placeholder="Search by name"
            placeholderTextColor={colors.ink[400]}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={colors.ink[400]} />
            </Pressable>
          ) : null}
        </View>

        {loading && students.length === 0 ? (
          <View className="gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title={search ? 'No matches' : 'No devotees yet'}
            subtitle={
              search
                ? 'Try a different name.'
                : 'Share your mentor code (in Profile) so devotees can join you.'
            }
          />
        ) : (
          filtered.map((student, i) => (
            <StudentRow
              key={student.id}
              student={student}
              activity={activity[student.id]}
              index={i}
              onPress={() =>
                navigation.navigate('StudentDetail', {
                  studentId: student.id,
                  studentName: student.name,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StudentRow({
  student,
  activity,
  index,
  onPress,
}: {
  student: AppUser;
  activity?: Activity;
  index: number;
  onPress: () => void;
}) {
  const meta = activity ? ACTIVITY_META[activity.status] : null;
  return (
    <Animated.View entering={FadeInDown.duration(360).delay(Math.min(index, 8) * 50)}>
      <PressableScale
        onPress={onPress}
        activeScale={0.97}
        className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 mb-3 border border-cloud-200"
        style={shadows.sm}
      >
        <View className="mr-3">
          <Avatar name={student.name} avatarId={student.avatar} size={44} />
          {meta ? (
            // Traffic-light dot on the avatar corner.
            <View
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
              style={{ backgroundColor: meta.color }}
            />
          ) : null}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-ink-900">{student.name}</Text>
          <Text className="text-xs text-ink-400 mt-0.5">{student.email}</Text>
          {activity && meta ? (
            <View className="flex-row items-center mt-1">
              <View
                className="w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: meta.color }}
              />
              <Text className="text-xs font-medium" style={{ color: meta.color }}>
                {meta.label}
              </Text>
              <Text className="text-xs text-ink-400"> · {lastSeenLabel(activity)}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.ink[400]} />
      </PressableScale>
    </Animated.View>
  );
}
