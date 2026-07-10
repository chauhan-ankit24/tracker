import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AdminStackParamList } from '../../navigation/types';
import { StackHeader } from '../../components/StackHeader';
import { Button } from '../../components/Button';
import { Toggle } from '../../components/Toggle';
import { DateField, isValidDayKey } from '../../components/DateField';
import { SegmentedControl } from '../../components/SegmentedControl';
import { PressableScale } from '../../components/PressableScale';
import { useAuth } from '../../context/AuthContext';
import {
  getQuestionnaire,
  saveQuestionnaire,
  newQuestionId,
  instantiateStarter,
  STARTER_TEMPLATES,
} from '../../services/questionnaires';
import { Question, Questionnaire, ScheduleType } from '../../types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AdminStackParamList, 'QuestionnaireEditor'>;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function blankQuestion(): Question {
  return { id: newQuestionId(), text: '', required: true };
}

export function QuestionnaireEditorScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const params = route.params ?? {};
  const editingId = params.questionnaireId;

  const [loading, setLoading] = useState(!!(editingId || params.duplicateFrom));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([blankQuestion()]);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [isTemplate, setIsTemplate] = useState(!!params.asTemplate);
  const [active, setActive] = useState(true);
  const [createdAt, setCreatedAt] = useState<number | undefined>(undefined);

  const heading = editingId ? 'Edit questionnaire' : 'New questionnaire';

  // Seed the form from an existing questionnaire, a duplicate, or a starter.
  useEffect(() => {
    (async () => {
      const applyDoc = (q: Questionnaire, keepId: boolean) => {
        setTitle(keepId ? q.title : `${q.title} (copy)`);
        setQuestions(q.questions.length ? q.questions : [blankQuestion()]);
        setScheduleType(q.schedule.type);
        setStartDate(q.schedule.startDate);
        setEndDate(q.schedule.endDate);
        setWeekdays(q.schedule.weekdays ?? []);
        setIsTemplate(keepId ? q.isTemplate : false);
        setActive(keepId ? q.active : true);
        setCreatedAt(keepId ? q.createdAt : undefined);
      };

      try {
        if (editingId) {
          const q = await getQuestionnaire(editingId);
          if (q) applyDoc(q, true);
        } else if (params.duplicateFrom) {
          const q = await getQuestionnaire(params.duplicateFrom);
          if (q) applyDoc(q, false);
        } else if (params.starter) {
          const starter = STARTER_TEMPLATES.find((s) => s.key === params.starter);
          if (starter) {
            setTitle(starter.title);
            setQuestions(instantiateStarter(starter));
            setScheduleType(starter.scheduleType);
            setWeekdays(starter.weekdays);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, params.duplicateFrom, params.starter]);

  const updateQuestion = (id: string, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const removeQuestion = (id: string) =>
    setQuestions((qs) => (qs.length > 1 ? qs.filter((q) => q.id !== id) : qs));
  const addQuestion = () => setQuestions((qs) => [...qs, blankQuestion()]);

  const toggleWeekday = (d: number) =>
    setWeekdays((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d]));

  const validate = (): string | null => {
    if (!title.trim()) return 'Give your questionnaire a title.';
    const filled = questions.filter((q) => q.text.trim());
    if (filled.length === 0) return 'Add at least one question.';
    if (!isTemplate) {
      if (scheduleType === 'range') {
        if (!startDate || !endDate) return 'A date range needs both a start and end date.';
        if (endDate < startDate) return 'The end date must be on or after the start date.';
      }
      if (scheduleType === 'daily' && endDate && startDate && endDate < startDate) {
        return 'The end date must be on or after the start date.';
      }
      if (scheduleType === 'weekdays' && weekdays.length === 0) {
        return 'Pick at least one weekday.';
      }
    }
    if (startDate && !isValidDayKey(startDate)) return 'Start date is not a valid date.';
    if (endDate && !isValidDayKey(endDate)) return 'End date is not a valid date.';
    return null;
  };

  const onSave = async () => {
    if (!user) return;
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const cleanedQuestions = questions
        .filter((q) => q.text.trim())
        .map((q) => ({ ...q, text: q.text.trim() }));
      await saveQuestionnaire({
        id: editingId,
        adminId: user.id,
        title: title.trim(),
        questions: cleanedQuestions,
        schedule: {
          type: scheduleType,
          startDate,
          endDate,
          weekdays: scheduleType === 'weekdays' ? [...weekdays].sort() : [],
        },
        isTemplate,
        active,
        createdAt,
      });
      navigation.goBack();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(`Couldn't save${code ? ` (${code})` : ''}. Check your connection and try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
        <StackHeader title={heading} onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
      <StackHeader title={heading} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          {error ? (
            <Animated.View
              entering={FadeInDown.duration(250)}
              className="flex-row items-center bg-red-50 rounded-2xl px-4 py-3 mb-4"
            >
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text className="text-sm text-red-600 ml-2 flex-1">{error}</Text>
            </Animated.View>
          ) : null}

          {/* Title */}
          <Text className="text-xs font-semibold text-ink-500 mb-1.5 ml-1">Title</Text>
          <View className="bg-white rounded-2xl px-4 border border-cloud-300 mb-6">
            <TextInput
              className="py-4 text-base text-ink-900"
              placeholder="e.g. Daily sadhana check-in"
              placeholderTextColor={colors.ink[400]}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Questions */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-semibold text-ink-500 ml-1">Questions</Text>
            <Text className="text-xs text-ink-400">{questions.length}</Text>
          </View>
          {questions.map((q, i) => (
            <QuestionRow
              key={q.id}
              index={i}
              question={q}
              canRemove={questions.length > 1}
              onChangeText={(text) => updateQuestion(q.id, { text })}
              onToggleRequired={() => updateQuestion(q.id, { required: !q.required })}
              onRemove={() => removeQuestion(q.id)}
            />
          ))}
          <PressableScale
            onPress={addQuestion}
            activeScale={0.97}
            className="flex-row items-center justify-center bg-saffron-50 rounded-2xl py-3.5 mb-6"
          >
            <Ionicons name="add" size={18} color={colors.saffron[600]} />
            <Text className="text-sm font-semibold text-saffron-700 ml-1">Add question</Text>
          </PressableScale>

          {/* Schedule (hidden for templates) */}
          {isTemplate ? (
            <View className="flex-row items-center bg-saffron-50 rounded-2xl px-4 py-3 mb-6">
              <Ionicons name="information-circle-outline" size={18} color={colors.saffron[600]} />
              <Text className="text-xs text-saffron-700 ml-2 flex-1">
                Templates aren't scheduled. Pick the schedule when you use it.
              </Text>
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-xs font-semibold text-ink-500 mb-2 ml-1">When it appears</Text>
              <SegmentedControl
                options={[
                  { label: 'Every day', value: 'daily' },
                  { label: 'Date range', value: 'range' },
                  { label: 'Specific days', value: 'weekdays' },
                ]}
                value={scheduleType}
                onChange={setScheduleType}
              />

              <View className="mt-4">
                {scheduleType === 'daily' ? (
                  <View className="flex-row gap-3">
                    <DateField
                      label="Start (optional)"
                      value={startDate}
                      onChange={setStartDate}
                      clearable
                    />
                    <DateField
                      label="End (optional — ongoing)"
                      value={endDate}
                      onChange={setEndDate}
                      clearable
                    />
                  </View>
                ) : scheduleType === 'range' ? (
                  <View className="flex-row gap-3">
                    <DateField label="Start" value={startDate} onChange={setStartDate} />
                    <DateField label="End" value={endDate} onChange={setEndDate} />
                  </View>
                ) : (
                  <View>
                    <View className="flex-row justify-between">
                      {WEEKDAYS.map((label, d) => {
                        const on = weekdays.includes(d);
                        return (
                          <Pressable
                            key={d}
                            onPress={() => toggleWeekday(d)}
                            className={`w-11 h-11 rounded-full items-center justify-center ${
                              on ? 'bg-saffron-500' : 'bg-white border border-cloud-300'
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                on ? 'text-white' : 'text-ink-500'
                              }`}
                            >
                              {label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <View className="flex-row gap-3 mt-4">
                      <DateField
                        label="From (optional)"
                        value={startDate}
                        onChange={setStartDate}
                        clearable
                      />
                      <DateField
                        label="Until (optional)"
                        value={endDate}
                        onChange={setEndDate}
                        clearable
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Save as template */}
          <ToggleRow
            icon="bookmark-outline"
            label="Save as reusable template"
            hint="Templates aren't sent to students — reuse them any week."
            value={isTemplate}
            onToggle={() => setIsTemplate((t) => !t)}
          />

          <View className="mt-6">
            <Button
              label={isTemplate ? 'Save template' : editingId ? 'Save changes' : 'Create questionnaire'}
              icon="checkmark"
              onPress={onSave}
              loading={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function QuestionRow({
  index,
  question,
  canRemove,
  onChangeText,
  onToggleRequired,
  onRemove,
}: {
  index: number;
  question: Question;
  canRemove: boolean;
  onChangeText: (text: string) => void;
  onToggleRequired: () => void;
  onRemove: () => void;
}) {
  return (
    <View className="bg-white rounded-2xl px-4 py-3 mb-3 border border-cloud-200">
      <View className="flex-row items-center mb-2">
        <View className="w-6 h-6 rounded-full bg-saffron-100 items-center justify-center mr-2">
          <Text className="text-xs font-bold text-saffron-700">{index + 1}</Text>
        </View>
        <Text className="text-xs text-ink-400 flex-1">Question</Text>
        {canRemove ? (
          <Pressable onPress={onRemove} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.ink[400]} />
          </Pressable>
        ) : null}
      </View>
      <TextInput
        className="text-base text-ink-900 pb-2"
        placeholder="Type your question…"
        placeholderTextColor={colors.ink[400]}
        value={question.text}
        onChangeText={onChangeText}
        multiline
      />
      <View className="h-px bg-cloud-200 my-1" />
      <Pressable
        onPress={onToggleRequired}
        className="flex-row items-center justify-between py-2"
        accessibilityRole="switch"
        accessibilityState={{ checked: question.required }}
        accessibilityLabel="Mandatory question"
      >
        <Text className="text-sm text-ink-700">
          {question.required ? 'Mandatory' : 'Optional'}
        </Text>
        <Toggle value={question.required} />
      </Pressable>
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  value,
  onToggle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-cloud-200"
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
    >
      <View className="w-9 h-9 rounded-full bg-saffron-100 items-center justify-center mr-3">
        <Ionicons name={icon} size={17} color={colors.saffron[600]} />
      </View>
      <View className="flex-1 pr-2">
        <Text className="text-sm font-semibold text-ink-900">{label}</Text>
        <Text className="text-xs text-ink-400 mt-0.5 leading-4">{hint}</Text>
      </View>
      <Toggle value={value} />
    </Pressable>
  );
}
