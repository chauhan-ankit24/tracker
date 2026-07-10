import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UserStackParamList } from '../navigation/types';
import { StackHeader } from '../components/StackHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { getQuestionnaire, getResponse, saveResponse } from '../services/questionnaires';
import { Question, Questionnaire } from '../types';
import { formatDate, todayKey } from '../utils/date';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<UserStackParamList, 'RespondQuestionnaire'>;

export function RespondQuestionnaireScreen({ route, navigation }: Props) {
  const { questionnaireId, date = todayKey() } = route.params;
  const { user } = useAuth();

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [q, existing] = await Promise.all([
          getQuestionnaire(questionnaireId),
          getResponse(questionnaireId, user.id, date),
        ]);
        setQuestionnaire(q);
        if (existing) setAnswers(existing.answers);
      } catch {
        setError("Couldn't load this questionnaire. Check your connection.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, questionnaireId, date]);

  const setAnswer = (id: string, text: string) => {
    setAnswers((a) => ({ ...a, [id]: text }));
    if (missing.has(id) && text.trim()) {
      setMissing((m) => {
        const next = new Set(m);
        next.delete(id);
        return next;
      });
    }
  };

  const onSubmit = async () => {
    if (!user || !questionnaire) return;
    if (!user.adminId) {
      setError('You need to be assigned to a mentor before you can answer.');
      return;
    }
    // Mandatory questions must be answered before submitting.
    const unanswered = questionnaire.questions.filter(
      (q) => q.required && !(answers[q.id] ?? '').trim(),
    );
    if (unanswered.length) {
      setMissing(new Set(unanswered.map((q) => q.id)));
      setError(
        `Please answer the ${unanswered.length} required question${
          unanswered.length === 1 ? '' : 's'
        } before submitting.`,
      );
      return;
    }
    setError('');
    setSaving(true);
    try {
      // Persist only non-empty answers, keyed by question id.
      const cleaned: Record<string, string> = {};
      questionnaire.questions.forEach((q) => {
        const v = (answers[q.id] ?? '').trim();
        if (v) cleaned[q.id] = v;
      });
      await saveResponse({
        questionnaireId,
        adminId: user.adminId,
        userId: user.id,
        answers: cleaned,
        date,
      });
      navigation.goBack();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(`Couldn't submit${code ? ` (${code})` : ''}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
      <StackHeader
        title={questionnaire?.title ?? 'Reflection'}
        subtitle={formatDate(date)}
        onBack={() => navigation.goBack()}
      />
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
              entering={FadeIn.duration(250)}
              className="flex-row items-center bg-red-50 rounded-2xl px-4 py-3 mb-4"
            >
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text className="text-sm text-red-600 ml-2 flex-1">{error}</Text>
            </Animated.View>
          ) : null}

          {loading ? (
            <View className="gap-4 mt-2">
              <Skeleton height={120} radius={12} />
              <Skeleton height={120} radius={12} />
            </View>
          ) : !questionnaire ? (
            <Text className="text-sm text-ink-500 mt-6 text-center">
              This questionnaire is no longer available.
            </Text>
          ) : (
            <>
              <Text className="text-sm text-ink-400 leading-5 mb-4">
                Take a moment to reflect. Required questions are marked.
              </Text>
              {questionnaire.questions.map((q, i) => (
                <QuestionField
                  key={q.id}
                  index={i}
                  question={q}
                  value={answers[q.id] ?? ''}
                  onChange={(t) => setAnswer(q.id, t)}
                  missing={missing.has(q.id)}
                />
              ))}
              <View className="mt-2">
                <Button
                  label="Submit"
                  icon="checkmark"
                  onPress={onSubmit}
                  loading={saving}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function QuestionField({
  index,
  question,
  value,
  onChange,
  missing,
}: {
  index: number;
  question: Question;
  value: string;
  onChange: (text: string) => void;
  missing: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Animated.View
      entering={FadeInDown.duration(380).delay(Math.min(index, 8) * 60)}
      className="mb-4"
    >
      <View className="flex-row items-start mb-2">
        <Text className="text-sm font-semibold text-ink-900 flex-1 pr-2">
          {question.text}
        </Text>
        {question.required ? (
          <Badge label="Required" tone="brand" size="sm" />
        ) : (
          <Badge label="Optional" tone="neutral" size="sm" />
        )}
      </View>
      <View
        className={`bg-white rounded-2xl px-4 border ${
          missing ? 'border-red-300' : focused ? 'border-saffron-500' : 'border-cloud-300'
        }`}
      >
        <TextInput
          className="py-3.5 text-base text-ink-900 min-h-[52px]"
          placeholder={question.required ? 'Your answer…' : 'Optional…'}
          placeholderTextColor={colors.ink[400]}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          textAlignVertical="top"
        />
      </View>
    </Animated.View>
  );
}
