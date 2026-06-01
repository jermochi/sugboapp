/**
 * SectionHeader — a section title with an optional trailing action.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { AppColors, Spacing } from '@/core/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} accessibilityRole="button">
          <ThemedText type="bodySmall" color={AppColors.primary}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
