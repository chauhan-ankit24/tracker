import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonCard } from '../../components/Skeleton';
import { SegmentedControl } from '../../components/SegmentedControl';
import { PressableScale } from '../../components/PressableScale';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { shadows } from '../../theme/elevation';
import {
  getQuestionnairesForAdmin,
  deleteQuestionnaire,
  saveQuestionnaire,
  describeSchedule,
  STARTER_TEMPLATES,
} from '../../services/questionnaires';
import { Questionnaire } from '../../types';
import { AdminStackParamList } from '../../navigation/types';
import { todayKey } from '../../utils/date';
import { showConfirmAlert } from '../../utils/alert';
import { colors } from '../../theme/colors';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'Tabs'>;
type Segment = 'active' | 'history' | 'templates';

/** A live questionnaire is "active" while it's running and not yet ended. */
function isCurrentlyActive(q: Questionnaire): boolean {
  const ended = !!q.schedule.endDate && q.schedule.endDate < todayKey();
  return q.active && !ended;
}

export function QuestionnairesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<Questionnaire[]>([]);
  const [segment, setSegment] = useState<Segment>('active');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setItems(await getQuestionnairesForAdmin(user.id));
    } catch {
      // Fall through to the empty state.
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reload whenever the tab regains focus (e.g. returning from the editor).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const { active, history, templates } = useMemo(() => {
    const live = items.filter((q) => !q.isTemplate);
    return {
      active: live.filter(isCurrentlyActive),
      history: live.filter((q) => !isCurrentlyActive(q)),
      templates: items.filter((q) => q.isTemplate),
    };
  }, [items]);

  const list = segment === 'active' ? active : segment === 'history' ? history : templates;

  const onDelete = (q: Questionnaire) =>
    showConfirmAlert(
      'Delete questionnaire',
      `“${q.title}” and its schedule will be removed. Student responses already collected are kept. This cannot be undone.`,
      async () => {
        await deleteQuestionnaire(q.id);
        load();
      },
      'Delete',
    );

  const onTogglePause = async (q: Questionnaire) => {
    await saveQuestionnaire({ ...q, active: !q.active });
    load();
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={loading && items.length > 0}
            onRefresh={load}
            tintColor={colors.saffron[500]}
          />
        }
      >
        <ScreenHeader
          title="Questions"
          subtitle="Reflection beyond the numbers"
          right={
            <PressableScale
              onPress={() => navigation.navigate('QuestionnaireEditor')}
              activeScale={0.9}
              className="w-11 h-11 rounded-full bg-saffron-500 items-center justify-center"
              style={{
                shadowColor: colors.saffron[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Ionicons name="add" size={26} color={colors.white} />
            </PressableScale>
          }
        />

        {/* Daily metrics (quick questions) — the mentor-configured fields
            devotees fill each day on their Today screen. */}
        <PressableScale
          onPress={() => navigation.navigate('MetricsEditor')}
          activeScale={0.98}
          className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-cloud-200 mb-5"
          style={shadows.sm}
        >
          <View className="w-9 h-9 rounded-full bg-saffron-100 items-center justify-center mr-3">
            <Ionicons name="options-outline" size={18} color={colors.saffron[600]} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-ink-900">Daily metrics</Text>
            <Text className="text-xs text-ink-400 mt-0.5">
              Quick questions devotees log each day (chanting, reading…)
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.ink[400]} />
        </PressableScale>

        <Text className="text-xs font-semibold text-ink-500 mb-2 ml-1">
          Reflection questionnaires
        </Text>
        <View className="mb-5">
          <SegmentedControl
            options={[
              { label: `Active${active.length ? ` (${active.length})` : ''}`, value: 'active' },
              { label: 'History', value: 'history' },
              { label: 'Templates', value: 'templates' },
            ]}
            value={segment}
            onChange={setSegment}
          />
        </View>

        {segment === 'templates' ? <StarterStrip navigation={navigation} /> : null}

        {loading && items.length === 0 ? (
          <View className="gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : list.length === 0 ? (
          <EmptyState
            icon="clipboard-outline"
            title={
              segment === 'active'
                ? 'No active questionnaires'
                : segment === 'history'
                  ? 'Nothing here yet'
                  : 'No saved templates'
            }
            subtitle={
              segment === 'active'
                ? 'Tap + to create one, or start from a template.'
                : segment === 'history'
                  ? 'Paused and ended questionnaires appear here.'
                  : 'Save a questionnaire as a template to reuse it, or start from one below.'
            }
          />
        ) : (
          list.map((q, i) => (
            <QuestionnaireCard
              key={q.id}
              q={q}
              index={i}
              onOpenResponses={() =>
                navigation.navigate('QuestionnaireResponses', {
                  questionnaireId: q.id,
                  title: q.title,
                })
              }
              onEdit={() =>
                navigation.navigate('QuestionnaireEditor', { questionnaireId: q.id })
              }
              onDuplicate={() =>
                navigation.navigate('QuestionnaireEditor', { duplicateFrom: q.id })
              }
              onTogglePause={() => onTogglePause(q)}
              onDelete={() => onDelete(q)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StarterStrip({ navigation }: { navigation: Nav }) {
  return (
    <View className="mb-5">
      <Text className="text-xs font-semibold text-ink-500 mb-2 ml-1">
        Start from a starter
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {STARTER_TEMPLATES.map((s) => (
          <PressableScale
            key={s.key}
            onPress={() =>
              navigation.navigate('QuestionnaireEditor', { starter: s.key })
            }
            activeScale={0.96}
            className="w-56 bg-white rounded-2xl p-4 mr-3 border border-cloud-200"
          >
            <View className="w-9 h-9 rounded-full bg-saffron-100 items-center justify-center mb-2">
              <Ionicons name="sparkles-outline" size={17} color={colors.saffron[600]} />
            </View>
            <Text className="text-sm font-semibold text-ink-900">{s.title}</Text>
            <Text className="text-xs text-ink-400 mt-1 leading-4">{s.description}</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

function QuestionnaireCard({
  q,
  index,
  onOpenResponses,
  onEdit,
  onDuplicate,
  onTogglePause,
  onDelete,
}: {
  q: Questionnaire;
  index: number;
  onOpenResponses: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
}) {
  const required = q.questions.filter((x) => x.required).length;
  const ended = !!q.schedule.endDate && q.schedule.endDate < todayKey();
  return (
    <Animated.View entering={FadeInDown.duration(360).delay(Math.min(index, 8) * 50)}>
      <View
        className="bg-white rounded-2xl px-4 py-4 mb-3 border border-cloud-200"
        style={shadows.sm}
      >
        <Pressable onPress={q.isTemplate ? onEdit : onOpenResponses}>
          <View className="flex-row items-start">
            <View className="flex-1 pr-2">
              <Text className="text-base font-semibold text-ink-900" numberOfLines={2}>
                {q.title}
              </Text>
              <Text className="text-xs text-ink-400 mt-1">
                {q.questions.length} question{q.questions.length === 1 ? '' : 's'}
                {required ? ` · ${required} required` : ''}
              </Text>
            </View>
            {q.isTemplate ? (
              <Badge label="Template" tone="brand" />
            ) : !q.active ? (
              <Badge label="Paused" tone="neutral" />
            ) : ended ? (
              <Badge label="Ended" tone="neutral" />
            ) : (
              <Badge label="Active" tone="success" />
            )}
          </View>

          {!q.isTemplate ? (
            <View className="flex-row items-center mt-2.5">
              <Ionicons name="calendar-outline" size={13} color={colors.ink[400]} />
              <Text className="text-xs text-ink-500 ml-1.5">
                {describeSchedule(q.schedule)}
              </Text>
            </View>
          ) : null}
        </Pressable>

        <View className="h-px bg-cloud-200 my-3" />

        <View className="flex-row items-center">
          {!q.isTemplate ? (
            <>
              <CardAction icon="eye-outline" label="Responses" onPress={onOpenResponses} />
              <CardAction
                icon={q.active ? 'pause-outline' : 'play-outline'}
                label={q.active ? 'Pause' : 'Resume'}
                onPress={onTogglePause}
              />
            </>
          ) : (
            <CardAction icon="duplicate-outline" label="Use" onPress={onDuplicate} />
          )}
          <CardAction icon="create-outline" label="Edit" onPress={onEdit} />
          {!q.isTemplate ? (
            <CardAction icon="copy-outline" label="Copy" onPress={onDuplicate} />
          ) : null}
          <CardAction icon="trash-outline" label="Delete" tone="danger" onPress={onDelete} />
        </View>
      </View>
    </Animated.View>
  );
}

function CardAction({
  icon,
  label,
  onPress,
  tone = 'default',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
}) {
  const color = tone === 'danger' ? '#DC2626' : colors.ink[500];
  return (
    <Pressable onPress={onPress} hitSlop={6} className="flex-row items-center mr-4">
      <Ionicons name={icon} size={15} color={color} />
      <Text
        className="text-xs font-medium ml-1"
        style={{ color: tone === 'danger' ? '#DC2626' : colors.ink[500] }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

