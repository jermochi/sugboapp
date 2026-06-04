/**
 * RenewalNotice — renewals look supported but aren't built yet. Explain the
 * window and offer a way back to the "new application" path.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/core/components';
import { BorderRadius, BrandColors, Spacing } from '@/core/theme';

export function RenewalNotice({ onStartOver }: { onStartOver: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="subtitle" color={BrandColors.charcoal} style={styles.heading}>
          Renewals are coming soon
        </ThemedText>
        <ThemedText type="bodySmall" color={BrandColors.muted}>
          Business permit renewals run January 1–20 each year. The in-app renewal
          walkthrough isn’t ready yet — please confirm your renewal requirements
          with BPLO.
        </ThemedText>
        <Pressable
          onPress={onStartOver}
          accessibilityRole="button"
          accessibilityLabel="Start over"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <ThemedText type="caption" color={BrandColors.white}>
            Start a new application instead
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: BrandColors.softGold,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
  },
  heading: {
    fontWeight: '700',
  },
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    backgroundColor: BrandColors.crimson,
  },
  pressed: {
    opacity: 0.72,
  },
});
