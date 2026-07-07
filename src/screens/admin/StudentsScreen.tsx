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
import { useAuth } from '../../context/AuthContext';
import { getStudentsForAdmin } from '../../services/entries';
import { AppUser } from '../../types';
import { AdminStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'Tabs'>;

export function StudentsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const [students, setStudents] = useState<AppUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setStudents(await getStudentsForAdmin(user.id));
    } catch {
      // Show the empty state rather than an endless spinner.
    } finally {
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
        <ScreenHeader title="Devotees" subtitle={`${students.length} assigned to you`} />

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
  index,
  onPress,
}: {
  student: AppUser;
  index: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(360).delay(Math.min(index, 8) * 50)}>
      <Pressable
        onPress={onPress}
        className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 mb-3 border border-cloud-200"
        style={{
          shadowColor: '#1F2430',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 1,
        }}
      >
        <View className="mr-3">
          <Avatar name={student.name} avatarId={student.avatar} size={44} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-ink-900">{student.name}</Text>
          <Text className="text-xs text-ink-400 mt-0.5">{student.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.ink[400]} />
      </Pressable>
    </Animated.View>
  );
}
