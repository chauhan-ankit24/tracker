import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AdminStackParamList } from '../../navigation/types';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonCard } from '../../components/Skeleton';
import { getPendingMentors, approveMentor, rejectMentor } from '../../services/mentors';
import { AppUser } from '../../types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AdminStackParamList, 'Approvals'>;

export function ApprovalsScreen({ navigation }: Props) {
  const [pending, setPending] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPending(await getPendingMentors());
    } catch {
      // leave list as-is
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const act = async (mentor: AppUser, approve: boolean) => {
    setBusyId(mentor.id);
    try {
      if (approve) await approveMentor(mentor.id);
      else await rejectMentor(mentor.id);
      setPending((list) => list.filter((m) => m.id !== mentor.id));
    } catch {
      Alert.alert('Action failed', 'Please check your connection and try again.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = (mentor: AppUser) => {
    Alert.alert('Reject mentor', `Reject ${mentor.name}'s mentor request?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => act(mentor, false) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          className="w-10 h-10 rounded-2xl bg-white border border-cloud-200 items-center justify-center mr-3"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink[700]} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xs text-saffron-600 font-medium">Admin</Text>
          <Text className="text-xl font-bold text-ink-900">Mentor approvals</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading && pending.length > 0} onRefresh={load} tintColor={colors.saffron[500]} />
        }
      >
        {loading && pending.length === 0 ? (
          <View className="gap-3 mt-2">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : pending.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="All caught up"
            subtitle="There are no mentor requests waiting for approval."
          />
        ) : (
          pending.map((mentor, i) => (
            <Animated.View
              key={mentor.id}
              entering={FadeInDown.duration(360).delay(Math.min(i, 8) * 45)}
              className="bg-white rounded-2xl p-4 mb-3 border border-cloud-200"
              style={{
                shadowColor: '#1F2430',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 1,
              }}
            >
              <View className="flex-row items-center">
                <View className="mr-3">
                  <Avatar name={mentor.name} avatarId={mentor.avatar} size={44} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink-900">{mentor.name}</Text>
                  <Text className="text-xs text-ink-400 mt-0.5">{mentor.email}</Text>
                </View>
              </View>
              <View className="flex-row mt-3 gap-3">
                <Pressable
                  onPress={() => act(mentor, true)}
                  disabled={busyId === mentor.id}
                  className="flex-1 flex-row items-center justify-center rounded-xl py-3 bg-saffron-500"
                >
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                  <Text className="text-sm font-semibold text-white ml-1.5">Approve</Text>
                </Pressable>
                <Pressable
                  onPress={() => confirmReject(mentor)}
                  disabled={busyId === mentor.id}
                  className="flex-1 flex-row items-center justify-center rounded-xl py-3 bg-cloud-200"
                >
                  <Ionicons name="close" size={16} color={colors.ink[500]} />
                  <Text className="text-sm font-semibold text-ink-500 ml-1.5">Reject</Text>
                </Pressable>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
