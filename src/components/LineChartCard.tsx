import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

import { Card } from './Card';
import { colors } from '../theme/colors';
import { SeriesPoint } from '../utils/stats';

interface Props {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  data: SeriesPoint[];
  color?: string;
  suffix?: string;
  delay?: number;
}

/** Animated line chart wrapped in a titled card. */
export function LineChartCard({
  title,
  icon,
  data,
  color = colors.saffron[500],
  suffix = '',
  delay = 0,
}: Props) {
  const { width } = useWindowDimensions();
  const chartWidth = width - 40 /* screen padding */ - 40 /* card padding */;

  // Show a compact set of x-axis labels to avoid crowding.
  const labels = data.map((p, i) => {
    const stride = Math.ceil(data.length / 5);
    return i % stride === 0 || i === data.length - 1 ? p.label : '';
  });

  const rgb = hexToRgb(color);

  return (
    <Card delay={delay} className="pr-2">
      <View className="flex-row items-center mb-3 pr-3">
        <Ionicons name={icon} size={18} color={color} />
        <Text className="text-base font-semibold text-ink-700 ml-2">{title}</Text>
      </View>
      <LineChart
        data={{ labels, datasets: [{ data: data.map((p) => p.value) }] }}
        width={chartWidth}
        height={180}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLines={false}
        withShadow
        bezier
        yAxisSuffix={suffix}
        fromZero
        segments={4}
        chartConfig={{
          backgroundGradientFrom: colors.white,
          backgroundGradientTo: colors.white,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(${rgb}, ${opacity})`,
          labelColor: () => colors.ink[400],
          propsForDots: { r: '4', strokeWidth: '2', stroke: colors.white },
          propsForBackgroundLines: { stroke: colors.cloud[200] },
        }}
        style={{ marginLeft: -8, borderRadius: 16 }}
      />
    </Card>
  );
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}
