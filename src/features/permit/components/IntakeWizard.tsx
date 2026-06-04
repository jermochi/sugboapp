/**
 * IntakeWizard — the chip branching engine. Steps through the intake questions
 * one at a time, accumulating answers, then hands the assembled profile up.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/core/components';
import type {
  ApplicationType,
  BusinessType,
  LegalStructure,
  PermitProfile,
} from '@/core/models/permit';
import { BorderRadius, BrandColors, Spacing } from '@/core/theme';

import { intakeQuestions } from '../data';

export function IntakeWizard({
  onComplete,
}: {
  onComplete: (profile: PermitProfile) => void;
}) {
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const question = intakeQuestions[index];

  const select = (value: string) => {
    const nextAnswers = { ...answers, [question.key]: value };
    setAnswers(nextAnswers);
    if (index < intakeQuestions.length - 1) {
      setIndex(index + 1);
      return;
    }
    onComplete({
      application: nextAnswers.application as ApplicationType,
      businessType: nextAnswers.businessType as BusinessType,
      legalStructure: nextAnswers.legalStructure as LegalStructure,
    });
  };

  return (
    <View style={styles.container}>
      <ThemedText type="caption" color={BrandColors.muted}>
        Step {index + 1} of {intakeQuestions.length}
      </ThemedText>
      <ThemedText type="title" color={BrandColors.charcoal} style={styles.prompt}>
        {question.prompt}
      </ThemedText>

      <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
        {question.options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => select(option.value)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <View style={styles.optionCopy}>
              <ThemedText type="body" color={BrandColors.charcoal} style={styles.optionLabel}>
                {option.label}
              </ThemedText>
              {option.hint ? (
                <ThemedText type="caption" color={BrandColors.muted}>
                  {option.hint}
                </ThemedText>
              ) : null}
            </View>
            <ThemedText type="title" color={BrandColors.gold}>
              ›
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {index > 0 ? (
        <Pressable
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
          accessibilityRole="button"
          accessibilityLabel="Back to previous question"
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ThemedText type="caption" color={BrandColors.crimson}>
            ‹ Back
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.md,
  },
  prompt: {
    fontWeight: '700',
  },
  options: {
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  option: {
    minHeight: 64,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  pressed: {
    opacity: 0.72,
  },
});
