/**
 * TransparencyScreen — placeholder for the budget transparency tracker.
 * Owned by M3 (Transparency).
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText, ThemedView, AIHelperButton } from '@/core/components';
import { Spacing } from '@/core/theme';

export default function TransparencyScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedText type="title">Transparency Tracker</ThemedText>
        <ThemedText type="body" secondary>
          City budget overview, sector breakdown, and project tracking.
        </ThemedText>
        <ThemedText type="caption" secondary style={styles.placeholder}>
          Coming soon — M3 will implement this screen.
        </ThemedText>
      </SafeAreaView>
      <AIHelperButton context="transparency" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  placeholder: {
    marginTop: Spacing.xl,
    fontStyle: 'italic',
  },
});
