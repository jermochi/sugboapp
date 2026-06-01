/**
 * ServiceTile — a pressable tile for the dashboard service grid.
 *
 * Displays an icon and label. Navigates to the associated route on press.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { useAppTheme } from '@/core/hooks/useAppTheme';
import { Spacing, BorderRadius, AppColors } from '@/core/theme';
import type { ServiceTileData } from '@/core/models';

interface ServiceTileProps {
  tile: ServiceTileData;
  onPress: (tile: ServiceTileData) => void;
}

export function ServiceTile({ tile, onPress }: ServiceTileProps) {
  const theme = useAppTheme();
  const tileColor = tile.color ?? AppColors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={() => onPress(tile)}
      accessibilityLabel={tile.label}
      accessibilityRole="button"
    >
      <View style={[styles.iconContainer, { backgroundColor: tileColor + '15' }]}>
        <ThemedText style={[styles.iconText, { color: tileColor }]}>
          {tile.icon}
        </ThemedText>
      </View>
      <ThemedText type="caption" style={styles.label} numberOfLines={2}>
        {tile.label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    flex: 1,
    minHeight: 100,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  label: {
    textAlign: 'center',
  },
});
