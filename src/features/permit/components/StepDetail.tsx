/**
 * StepDetail — one permit step: office + directions, the requirements checklist,
 * fee/time, notes, a mark-done toggle, and a "Proceed to next step" action.
 * Asking Giya is handled by the floating helper button on the screen.
 */
import * as Linking from 'expo-linking';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/core/components';
import type { PermitStep } from '@/core/models/permit';
import { BorderRadius, BrandColors, Spacing } from '@/core/theme';

import { addOnReason, isAddOn } from '../domain/permitPath';

function openDirections(step: PermitStep) {
  const label = encodeURIComponent(step.office);
  const latLng = `${step.lat},${step.lng}`;
  const url = Platform.select({
    ios: `maps://?q=${label}&ll=${latLng}`,
    android: `geo:${latLng}?q=${latLng}(${label})`,
    default: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
  });
  void Linking.openURL(url as string);
}

export function StepDetail({
  step,
  checkedRequirements,
  done,
  onToggleRequirement,
  onToggleDone,
  onProceed,
  isLastStep,
}: {
  step: PermitStep;
  checkedRequirements: number[];
  done: boolean;
  onToggleRequirement: (index: number) => void;
  onToggleDone: () => void;
  onProceed: () => void;
  isLastStep: boolean;
}) {
  const reason = isAddOn(step) ? addOnReason(step) : null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {reason ? (
          <View style={styles.tag}>
            <ThemedText type="caption" color={BrandColors.garnet}>
              {reason}
            </ThemedText>
          </View>
        ) : null}
        <ThemedText type="title" color={BrandColors.charcoal} style={styles.title}>
          {step.title}
        </ThemedText>
        <ThemedText type="bodySmall" color={BrandColors.muted}>
          {step.notes}
        </ThemedText>

        <View style={styles.metaRow}>
          <View style={styles.metaTile}>
            <ThemedText type="caption" color={BrandColors.muted}>
              Fee
            </ThemedText>
            <ThemedText type="bodySmall" color={BrandColors.charcoal}>
              {step.fee}
            </ThemedText>
          </View>
          <View style={styles.metaTile}>
            <ThemedText type="caption" color={BrandColors.muted}>
              Processing time
            </ThemedText>
            <ThemedText type="bodySmall" color={BrandColors.charcoal}>
              {step.processingTime}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <ThemedText type="caption" color={BrandColors.muted}>
          Office
        </ThemedText>
        <ThemedText type="bodySmall" color={BrandColors.charcoal}>
          {step.office}
        </ThemedText>
        <ThemedText type="caption" color={BrandColors.muted}>
          {step.address}
        </ThemedText>
        <Pressable
          onPress={() => openDirections(step)}
          accessibilityRole="button"
          accessibilityLabel={`Get directions to ${step.office}`}
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
        >
          <ThemedText type="caption" color={BrandColors.crimson}>
            Get directions
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.card}>
        <ThemedText type="subtitle" color={BrandColors.charcoal} style={styles.sectionHeading}>
          What to bring
        </ThemedText>
        {step.requirements.map((requirement, index) => {
          const ticked = checkedRequirements.includes(index);
          return (
            <Pressable
              key={`${step.id}-${index}`}
              onPress={() => onToggleRequirement(index)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: ticked }}
              accessibilityLabel={requirement}
              style={({ pressed }) => [styles.checkRow, pressed && styles.pressed]}
            >
              <View style={[styles.checkbox, ticked && styles.checkboxTicked]}>
                {ticked ? (
                  <ThemedText type="caption" color={BrandColors.white}>
                    ✓
                  </ThemedText>
                ) : null}
              </View>
              <ThemedText type="bodySmall" color={BrandColors.charcoal} style={styles.checkLabel}>
                {requirement}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onToggleDone}
        accessibilityRole="button"
        accessibilityLabel={done ? 'Mark step not done' : 'Mark step done'}
        style={({ pressed }) => [
          styles.doneButton,
          done && styles.doneButtonActive,
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="button" color={done ? BrandColors.white : BrandColors.crimson}>
          {done ? '✓ Step done' : 'Mark step as done'}
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={onProceed}
        accessibilityRole="button"
        accessibilityLabel={isLastStep ? 'Back to roadmap' : 'Proceed to next step'}
        style={({ pressed }) => [styles.proceedButton, pressed && styles.pressed]}
      >
        <ThemedText type="button" color={BrandColors.white}>
          {isLastStep ? 'Back to roadmap' : 'Proceed to next step →'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: BrandColors.softGold,
  },
  title: {
    fontWeight: '700',
  },
  sectionHeading: {
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metaTile: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 2,
    backgroundColor: BrandColors.paper,
  },
  checkRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: BrandColors.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTicked: {
    backgroundColor: BrandColors.success,
    borderColor: BrandColors.success,
  },
  checkLabel: {
    flex: 1,
  },
  doneButton: {
    minHeight: 50,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BrandColors.crimson,
    backgroundColor: BrandColors.white,
  },
  doneButtonActive: {
    backgroundColor: BrandColors.success,
    borderColor: BrandColors.success,
  },
  proceedButton: {
    minHeight: 50,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.crimson,
  },
  outlineButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BrandColors.crimson,
  },
  pressed: {
    opacity: 0.72,
  },
});
