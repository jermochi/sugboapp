/**
 * OnboardingScreen — placeholder for first-launch onboarding flow.
 * Owned by M2 (Dashboard + Onboarding).
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText, ThemedView, AppButton } from '@/core/components';
import { Spacing } from '@/core/theme';
import { APP_NAME } from '@/core/theme/strings';
import { navigateTo, Routes } from '@/core/routing';

export default function OnboardingScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedText type="hero" style={styles.title}>
          {APP_NAME}
        </ThemedText>
        <ThemedText type="body" secondary style={styles.subtitle}>
          Your Cebu City in one app
        </ThemedText>
        <ThemedText type="bodySmall" secondary style={styles.description}>
          One app for every government service, hotline, and announcement —
          fronted by an AI that speaks Cebuano, Tagalog, and English.
        </ThemedText>
        <AppButton
          title="Get Started"
          onPress={() => navigateTo(Routes.DASHBOARD)}
          style={styles.button}
        />
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
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    marginTop: Spacing.xxl,
    minWidth: 200,
  },
});
