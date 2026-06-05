/**
 * PageDots — the progress indicator under the pager.
 *
 * Each dot widens and shifts from warm gray to crimson as its page scrolls into
 * view, driven by the shared horizontal scroll offset (Reanimated worklets).
 */

import { BrandColors } from '@/core/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

interface PageDotsProps {
  count: number;
  /** Current horizontal scroll offset in px. */
  scrollX: SharedValue<number>;
  /** Page width in px (offset → page index). */
  width: number;
}

function Dot({ index, scrollX, width }: { index: number; scrollX: SharedValue<number>; width: number }) {
  const style = useAnimatedStyle(() => {
    const page = scrollX.value / width;
    const distance = Math.abs(page - index);
    const t = Math.min(distance, 1); // 0 at active, 1 once a page away
    return {
      width: interpolate(t, [0, 1], [22, 8]),
      backgroundColor: interpolateColor(t, [0, 1], [BrandColors.crimson, BrandColors.warmGray]),
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

export function PageDots({ count, scrollX, width }: PageDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} scrollX={scrollX} width={width} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
