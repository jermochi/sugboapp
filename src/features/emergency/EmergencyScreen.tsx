/**
 * EmergencyScreen — placeholder for the emergency services hotline directory.
 * Owned by M5 (Emergency Services).
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText, ThemedView } from '@/core/components';
import { Spacing } from '@/core/theme';

export default function EmergencyScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedText type="title">Emergency Services</ThemedText>
        <ThemedText type="body" secondary>
          Categorized hotline directory — works fully offline.
        </ThemedText>
        <ThemedText type="caption" secondary style={styles.placeholder}>
          Coming soon — M5 will implement this screen.
        </ThemedText>
      </SafeAreaView>
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
