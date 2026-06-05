/**
 * ShowMeAround — a small replay affordance that re-runs a screen's walkthrough
 * on demand, regardless of whether it has already been seen or globally
 * disabled. Drop it in a screen header.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';
import { useTour } from './TourContext';

interface ShowMeAroundProps {
  tourId: string;
  /** 'pill' shows an icon + label; 'icon' is a compact circular button. */
  variant?: 'pill' | 'icon';
  label?: string;
}

export function ShowMeAround({ tourId, variant = 'icon', label = 'Show me around' }: ShowMeAroundProps) {
  const { startTour } = useTour();

  if (variant === 'pill') {
    return (
      <Pressable
        onPress={() => startTour(tourId)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
      >
        <Icon name="help" size={15} color={BrandColors.crimson} strokeWidth={2} />
        <Text style={styles.pillText}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => startTour(tourId)}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.icon, pressed && styles.pressed]}
    >
      <View pointerEvents="none">
        <Icon name="help" size={20} color={BrandColors.garnet} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: BrandColors.softGold,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
  },
  pillText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: BrandColors.crimson,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
