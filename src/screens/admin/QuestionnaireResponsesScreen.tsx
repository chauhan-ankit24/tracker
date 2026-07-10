import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AdminStackParamList } from '../../navigation/types';
import { StackHeader } from '../../components/StackHeader';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonCard } from '../../components/Skeleton';
import { Avatar } from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import { getStudentsForAdmin } from '../../services/entries';
import {
  getQuestionnaire,
  getResponsesForQuestionnaire,
} from '../../services/questionnaires';
import { AppUser, Questionnaire, QuestionnaireResponse } from '../../types';
import { formatDate } from '../../utils/date';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AdminStackParamList, 'QuestionnaireResponses'>;

interface StudentResponses {
  student: AppUser;
  responses: QuestionnaireResponse[]; // newest day first
}

export function QuestionnaireResponsesScreen({ route, navigation }: Props) {
  const { questionnaireId, title } = route.params;
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [q, r, s] = await Promise.all([
        getQuestionnaire(questionnaireId),
        getResponsesForQuestionnaire(user.id, questionnaireId),
        getStudentsForAdmin(user.id),
      ]);
      setQuestionnaire(q);
      setResponses(r);
      setStudents(s);
    } catch {
      // Empty state below.
    } finally {
      setLoading(false);
    }
  }, [user, questionnaireId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Question id → text, for labeling answers.
  const questionText = useMemo(() => {
    const map: Record<string, string> = {};
    questionnaire?.questions.forEach((q) => (map[q.id] = q.text));
    return map;
  }, [questionnaire]);

  const grouped: StudentResponses[] = useMemo(() => {
    const byUser = new Map<string, QuestionnaireResponse[]>();
    responses.forEach((r) => {
      const list = byUser.get(r.userId) ?? [];
      list.push(r);
      byUser.set(r.userId, list);
    });
    const nameFor = new Map(students.map((s) => [s.id, s] as const));
    return [...byUser.entries()]
      .map(([userId, list]) => ({
        student:
          nameFor.get(userId) ??
          ({ id: userId, name: 'Former devotee', email: '', role: 'user', adminId: user?.id ?? null } as AppUser),
        responses: [...list].sort((a, b) => (a.date < b.date ? 1 : -1)),
      }))
      .sort((a, b) => a.student.name.localeCompare(b.student.name));
  }, [responses, students, user]);

  const respondedCount = grouped.length;

  return (
    <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
      <StackHeader
        title={title}
        subtitle="Responses"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={loading && responses.length > 0}
            onRefresh={load}
            tintColor={colors.saffron[500]}
          />
        }
      >
        {!loading ? (
          <View className="flex-row items-center mb-4">
            <Ionicons name="people-outline" size={14} color={colors.ink[400]} />
            <Text className="text-xs text-ink-500 ml-1.5">
              {respondedCount} of {students.length} devotee
              {students.length === 1 ? '' : 's'} responded · {responses.length} total
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View className="gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : grouped.length === 0 ? (
          <EmptyState
            icon="chatbox-ellipses-outline"
            title="No responses yet"
            subtitle="Answers from your devotees will appear here, grouped by day."
          />
        ) : (
          grouped.map((g, i) => (
            <StudentCard
              key={g.student.id}
              data={g}
              index={i}
              questionText={questionText}
              open={expanded === g.student.id}
              onToggle={() =>
                setExpanded((cur) => (cur === g.student.id ? null : g.student.id))
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StudentCard({
  data,
  index,
  questionText,
  open,
  onToggle,
}: {
  data: StudentResponses;
  index: number;
  questionText: Record<string, string>;
  open: boolean;
  onToggle: () => void;
}) {
  const { student, responses } = data;
  return (
    <Animated.View entering={FadeInDown.duration(340).delay(Math.min(index, 8) * 45)}>
      <View className="bg-white rounded-2xl mb-3 border border-cloud-200 overflow-hidden">
        <Pressable onPress={onToggle} className="flex-row items-center px-4 py-3.5">
          <Avatar name={student.name} avatarId={student.avatar} size={40} />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-semibold text-ink-900">{student.name}</Text>
            <Text className="text-xs text-ink-400 mt-0.5">
              {responses.length} day{responses.length === 1 ? '' : 's'} answered
            </Text>
          </View>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.ink[400]}
          />
        </Pressable>

        {open ? (
          <View className="px-4 pb-4">
            {responses.map((r) => (
              <View key={r.id} className="mt-1 pt-3 border-t border-cloud-200">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="calendar-outline" size={13} color={colors.saffron[600]} />
                  <Text className="text-xs font-semibold text-saffron-700 ml-1.5">
                    {formatDate(r.date)}
                  </Text>
                </View>
                {Object.entries(r.answers)
                  .filter(([, v]) => v && v.trim())
                  .map(([qid, answer]) => (
                    <View key={qid} className="mb-2.5">
                      <Text className="text-xs text-ink-400 mb-0.5">
                        {questionText[qid] ?? 'Question'}
                      </Text>
                      <Text className="text-sm text-ink-800 leading-5">{answer}</Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}
