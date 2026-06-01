/**
 * DashboardScreen — placeholder for the home dashboard.
 * Owned by M2 (Dashboard + Onboarding).
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ThemedText,
  ThemedView,
  ServiceTile,
  SectionHeader,
} from '@/core/components';
import { Spacing, AppColors, AI_BAR_HERO } from '@/core/theme';
import { navigateTo, Routes } from '@/core/routing';
import type { ServiceTileData } from '@/core/models';

/** Stub service tiles — M2 will expand these */
const SERVICE_TILES: ServiceTileData[] = [
  {
    id: 'transparency',
    label: 'Transparency Tracker',
    icon: '📊',
    route: Routes.TRANSPARENCY,
    color: AppColors.sector.infra,
  },
  {
    id: 'permit',
    label: 'Business Permit',
    icon: '📋',
    route: Routes.PERMIT,
    color: AppColors.accent,
  },
  {
    id: 'emergency',
    label: 'Emergency Services',
    icon: '🚨',
    route: Routes.EMERGENCY,
    color: AppColors.error,
  },
  {
    id: 'hotlines',
    label: 'Hotlines',
    icon: '📞',
    route: Routes.EMERGENCY,
    color: AppColors.info,
  },
];

export default function DashboardScreen() {
  const handleTilePress = (tile: ServiceTileData) => {
    navigateTo(tile.route as keyof import('@/core/routing').RouteParams);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* AI Bar Stub */}
        <View style={styles.aiBar}>
          <ThemedText type="bodySmall" color="#FFFFFF" style={styles.aiBarText}>
            {AI_BAR_HERO}
          </ThemedText>
        </View>

        {/* Services Grid */}
        <SectionHeader title="Services" />
        <View style={styles.grid}>
          {SERVICE_TILES.map((tile, index) => (
            <View key={tile.id} style={styles.tileWrapper}>
              <ServiceTile tile={tile} onPress={handleTilePress} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  aiBar: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  aiBarText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  tileWrapper: {
    width: '48%',
    flexGrow: 1,
  },
});
