import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Extra classes applied to the inner content wrapper. */
  contentClassName?: string;
}

/**
 * Standard safe-area screen wrapper with a soft off-white background and
 * consistent horizontal padding. Optionally scrollable with pull-to-refresh.
 */
export function ScreenContainer({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  contentClassName = '',
}: Props) {
  const inner = (
    <View className={`px-5 pt-2 pb-8 ${contentClassName}`}>{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-cloud-100" edges={['top']}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.saffron[500]}
                colors={[colors.saffron[500]]}
              />
            ) : undefined
          }
        >
          {inner}
        </ScrollView>
      ) : (
        <View className="flex-1">{inner}</View>
      )}
    </SafeAreaView>
  );
}
