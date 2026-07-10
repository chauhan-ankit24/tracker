import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { Card } from './Card';
import { MetricIcon } from './MetricIcon';
import { colors } from '../theme/colors';
import { SeriesPoint } from '../utils/stats';

interface Props {
  title: string;
  icon: string;
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

  // A line needs at least two points, and an all-zero series has nothing to
  // show — fall back to a compact placeholder in those cases.
  const values = data.map((p) => p.value);
  const hasTrend = data.length >= 2 && values.some((v) => v > 0);
  const single = data.length === 1 ? data[0] : null;

  // Show a compact set of x-axis labels to avoid crowding.
  const labels = data.map((p, i) => {
    const stride = Math.ceil(data.length / 5);
    return i % stride === 0 || i === data.length - 1 ? p.label : '';
  });

  const rgb = hexToRgb(color);

  return (
    <Card delay={delay} className="pr-2">
      <View className="flex-row items-center mb-3 pr-3">
        <MetricIcon name={icon} size={18} color={color} />
        <Text className="text-base font-semibold text-ink-700 ml-2">{title}</Text>
      </View>

      {hasTrend ? (
        <LineChart
          data={{ labels, datasets: [{ data: values }] }}
          width={chartWidth}
          height={160}
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
      ) : (
        <View className="items-center py-7 pr-2">
          <View className="w-10 h-10 rounded-full bg-cloud-200 items-center justify-center mb-2">
            <MetricIcon name="trending-up-outline" size={20} color={colors.ink[400]} />
          </View>
          {single && single.value > 0 ? (
            <>
              <Text className="text-2xl font-bold text-ink-900">
                {single.value}
                {suffix}
              </Text>
              <Text className="text-xs text-ink-400 mt-1 text-center">
                One day logged — your trend appears with a few more.
              </Text>
            </>
          ) : (
            <Text className="text-xs text-ink-400 text-center">
              Not enough data yet. Keep logging to see your trend.
            </Text>
          )}
        </View>
      )}
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
