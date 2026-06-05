/**
 * RoadmapOverview — the assembled roadmap: estimated totals, "X of N" progress,
 * and the ordered step list with visible add-on tags. Tapping a step opens its
 * detail; finishing reveals the completion summary.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/core/components';
import type { PermitProfile, PermitStep } from '@/core/models/permit';
import { TourSpot, TourTargets } from '@/core/tour';
import { BorderRadius, BrandColors, Spacing } from '@/core/theme';

import {
  addOnReason,
  computeTotals,
  formatEstimatedFees,
  isAddOn,
} from '../domain/permitPath';

export function RoadmapOverview({
  profile,
  steps,
  doneSteps,
  onStepPress,
  onStartOver,
  onFinish,
}: {
  profile: PermitProfile;
  steps: PermitStep[];
  doneSteps: string[];
  onStepPress: (step: PermitStep) => void;
  onStartOver: () => void;
  onFinish: () => void;
}) {
  const totals = React.useMemo(() => computeTotals(steps), [steps]);
  const doneCount = steps.filter((step) => doneSteps.includes(step.id)).length;
  const allDone = steps.length > 0 && doneCount === steps.length;

  return (
    <View style={styles.container}>
      <TourSpot id={TourTargets.permitSummary}>
        <View style={styles.summaryCard}>
          <ThemedText type="caption" color={BrandColors.muted}>
            Estimated total fees
          </ThemedText>
          <ThemedText type="title" color={BrandColors.charcoal} style={styles.feeTotal}>
            {formatEstimatedFees(totals)}
          </ThemedText>
          <ThemedText type="caption" color={BrandColors.muted}>
            {doneCount} of {steps.length} steps done · {profile.businessType} ·{' '}
            {profile.legalStructure}
          </ThemedText>
        </View>
      </TourSpot>

      <View style={styles.stepList}>
        {steps.map((step, position) => {
          const done = doneSteps.includes(step.id);
          const reason = isAddOn(step) ? addOnReason(step) : null;
          const row = (
            <Pressable
              onPress={() => onStepPress(step)}
              accessibilityRole="button"
              accessibilityLabel={step.title}
              style={({ pressed }) => [styles.stepRow, pressed && styles.pressed]}
            >
              <View style={[styles.indexBadge, done && styles.indexBadgeDone]}>
                <ThemedText
                  type="button"
                  color={done ? BrandColors.white : BrandColors.crimson}
                >
                  {done ? '✓' : String(position + 1)}
                </ThemedText>
              </View>
              <View style={styles.stepCopy}>
                <ThemedText type="body" color={BrandColors.charcoal} style={styles.stepTitle}>
                  {step.title}
                </ThemedText>
                <ThemedText type="caption" color={BrandColors.muted} numberOfLines={1}>
                  {step.office}
                </ThemedText>
                {reason ? (
                  <View style={styles.tag}>
                    <ThemedText type="caption" color={BrandColors.garnet}>
                      {reason}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <ThemedText type="title" color={BrandColors.gold}>
                ›
              </ThemedText>
            </Pressable>
          );
          // Spotlight the first step for the walkthrough.
          return position === 0 ? (
            <TourSpot key={step.id} id={TourTargets.permitStep}>
              {row}
            </TourSpot>
          ) : (
            <React.Fragment key={step.id}>{row}</React.Fragment>
          );
        })}
      </View>

      {allDone ? (
        <Pressable
          onPress={onFinish}
          accessibilityRole="button"
          accessibilityLabel="Review and finish"
          style={({ pressed }) => [styles.finishButton, pressed && styles.pressed]}
        >
          <ThemedText type="button" color={BrandColors.white}>
            Review &amp; finish
          </ThemedText>
        </Pressable>
      ) : null}

      <Pressable
        onPress={onStartOver}
        accessibilityRole="button"
        accessibilityLabel="Start over"
        style={({ pressed }) => [styles.startOver, pressed && styles.pressed]}
      >
        <ThemedText type="caption" color={BrandColors.crimson}>
          Start over
        </ThemedText>
      </Pressable>

      <ThemedText type="caption" color={BrandColors.muted} style={styles.disclaimer}>
        Requirements may vary by business — confirm final requirements with BPLO.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  feeTotal: {
    fontWeight: '700',
  },
  stepList: {
    gap: Spacing.md,
  },
  stepRow: {
    minHeight: 72,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.softGold,
  },
  indexBadgeDone: {
    backgroundColor: BrandColors.success,
  },
  stepCopy: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontWeight: '600',
  },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 2,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: BrandColors.softGold,
  },
  finishButton: {
    minHeight: 50,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.crimson,
  },
  startOver: {
    alignSelf: 'center',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  disclaimer: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.72,
  },
});
