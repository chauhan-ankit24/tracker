import React, { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { UserStackParamList } from '../navigation/types';
import { AppUser, Questionnaire } from '../types';
import {
  getActiveQuestionnairesForStudent,
  getResponse,
} from '../services/questionnaires';
import { todayKey } from '../utils/date';
import { colors } from '../theme/colors';
import { shadows } from '../theme/elevation';

type Nav = NativeStackNavigationProp<UserStackParamList, 'Tabs'>;

interface Item {
  questionnaire: Questionnaire;
  answered: boolean;
  requiredCount: number;
}

/**
 * Devotee-only section on the Today screen: the mentor's questions scheduled
 * for today, with each one's completion status and a tap-to-answer action.
 */
export function TodayQuestionnaires({ user }: { user: AppUser }) {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user.adminId) {
      setLoaded(true);
      return;
    }
    try {
      const active = await getActiveQuestionnairesForStudent(user.adminId, todayKey());
      const withStatus = await Promise.all(
        active.map(async (q) => ({
          questionnaire: q,
          answered: !!(await getResponse(q.id, user.id, todayKey())),
          requiredCount: q.questions.filter((x) => x.required).length,
        })),
      );
      setItems(withStatus);
    } catch {
      // Silent — this is a secondary section on the Today screen.
    } finally {
      setLoaded(true);
    }
  }, [user.adminId, user.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Nothing to show: no mentor, or no scheduled questions today.
  if (!loaded || items.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.duration(420).delay(120)} className="mt-6">
      <View className="flex-row items-center mb-3">
        <Ionicons name="clipboard-outline" size={16} color={colors.saffron[600]} />
        <Text className="text-base font-bold text-ink-900 ml-2">From your mentor</Text>
      </View>

      {items.map(({ questionnaire: q, answered, requiredCount }) => (
        <Pressable
          key={q.id}
          onPress={() =>
            navigation.navigate('RespondQuestionnaire', { questionnaireId: q.id })
          }
          className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 mb-3 border border-cloud-200"
          style={shadows.sm}
        >
          <View
            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
              answered ? 'bg-green-50' : 'bg-saffron-100'
            }`}
          >
            <Ionicons
              name={answered ? 'checkmark' : 'help-circle-outline'}
              size={20}
              color={answered ? '#16A34A' : colors.saffron[600]}
            />
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-sm font-semibold text-ink-900" numberOfLines={2}>
              {q.title}
            </Text>
            <Text className="text-xs text-ink-400 mt-0.5">
              {answered
                ? 'Answered — tap to review or edit'
                : `${q.questions.length} question${q.questions.length === 1 ? '' : 's'}${
                    requiredCount ? ` · ${requiredCount} required` : ''
                  }`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.ink[400]} />
        </Pressable>
      ))}
    </Animated.View>
  );
}
