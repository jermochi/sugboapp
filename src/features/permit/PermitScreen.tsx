/**
 * PermitScreen — placeholder for the business permit walkthrough.
 * Owned by M4 (Business Permit).
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText, ThemedView, AIHelperButton } from '@/core/components';
import { Spacing } from '@/core/theme';

export default function PermitScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedText type="title">Business Permit</ThemedText>
        <ThemedText type="body" secondary>
          Personalized permit walkthrough based on your business profile.
        </ThemedText>
        <ThemedText type="caption" secondary style={styles.placeholder}>
          Coming soon — M4 will implement this screen.
        </ThemedText>
      </SafeAreaView>
      <AIHelperButton context="permit" />
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
