/**
 * PermitScreen — the business permit walkthrough.
 *
 * One screen, internal view modes driven by the persisted profile + progress:
 *   loading → intake → (renewalNotice | roadmap → stepDetail | complete)
 * The AI front door may pre-seed the profile via the `profile` route param.
 */
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AIHelperButton, ThemedText, ThemedView } from '@/core/components';
import type { PermitProfile, PermitStep } from '@/core/models/permit';
import { goBack as goBackRoute } from '@/core/routing';
import { ShowMeAround, TourTargets, useAutoTour } from '@/core/tour';
import { BorderRadius, BrandColors, Spacing } from '@/core/theme';

import { IntakeWizard } from './components/IntakeWizard';
import { PermitHelperSheet } from './components/PermitHelperSheet';
import { RenewalNotice } from './components/RenewalNotice';
import { RoadmapOverview } from './components/RoadmapOverview';
import { StepDetail } from './components/StepDetail';
import { filterSteps } from './domain/permitPath';
import { usePermitStore } from './store/permitStore';

export default function PermitScreen() {
  const params = useLocalSearchParams<{ profile?: string }>();
  const profileParam = typeof params.profile === 'string' ? params.profile : undefined;

  const hasHydrated = usePermitStore((s) => s.hasHydrated);
  const profile = usePermitStore((s) => s.profile);
  const checkedRequirements = usePermitStore((s) => s.checkedRequirements);
  const doneSteps = usePermitStore((s) => s.doneSteps);
  const setProfile = usePermitStore((s) => s.setProfile);
  const toggleRequirement = usePermitStore((s) => s.toggleRequirement);
  const toggleStepDone = usePermitStore((s) => s.toggleStepDone);
  const startOver = usePermitStore((s) => s.startOver);

  const [detailStepId, setDetailStepId] = React.useState<string | null>(null);
  const [showComplete, setShowComplete] = React.useState(false);
  const [helperVisible, setHelperVisible] = React.useState(false);

  // Seed the profile from an AI-provided route param, once, if none is saved.
  React.useEffect(() => {
    if (!hasHydrated || profile || !profileParam) return;
    try {
      const parsed = JSON.parse(profileParam) as Partial<PermitProfile>;
      if (parsed.application && parsed.businessType && parsed.legalStructure) {
        setProfile(parsed as PermitProfile);
      }
    } catch {
      // Ignore a malformed param — intake will start normally.
    }
  }, [hasHydrated, profile, profileParam, setProfile]);

  const steps = React.useMemo<PermitStep[]>(
    () => (profile && profile.application === 'new' ? filterSteps(profile) : []),
    [profile],
  );
  const detailStep = steps.find((step) => step.id === detailStepId) ?? null;
  const detailIndex = steps.findIndex((step) => step.id === detailStepId);
  const isLastStep = detailIndex >= 0 && detailIndex === steps.length - 1;

  // The roadmap is the tour-worthy view; auto-run the Permits walkthrough the
  // first time it appears (replayable via the header ShowMeAround button).
  const inRoadmap = Boolean(
    hasHydrated && profile && profile.application === 'new' && !showComplete && !detailStep,
  );
  useAutoTour('permit', inRoadmap);

  const handleProceed = () => {
    if (detailIndex < 0) return;
    if (isLastStep) {
      setDetailStepId(null); // back to the roadmap overview
    } else {
      setDetailStepId(steps[detailIndex + 1].id);
    }
  };

  const handleStartOver = () => {
    setDetailStepId(null);
    setShowComplete(false);
    startOver();
  };

  const handleBack = () => {
    if (helperVisible) {
      setHelperVisible(false);
      return;
    }
    if (showComplete) {
      setShowComplete(false);
      return;
    }
    if (detailStepId) {
      setDetailStepId(null);
      return;
    }
    goBackRoute();
  };

  const showHelper = Boolean(profile && profile.application === 'new');

  const title = !profile
    ? 'Business Permit'
    : profile.application === 'renewal'
      ? 'Renewal'
      : showComplete
        ? 'Almost done'
        : detailStep
          ? detailStep.title
          : 'Your permit roadmap';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.pageHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <ThemedText type="title" color={BrandColors.charcoal} style={styles.backGlyph}>
                ‹
              </ThemedText>
            </Pressable>
            <ThemedText type="title" color={BrandColors.charcoal} numberOfLines={1} style={styles.pageTitle}>
              {title}
            </ThemedText>
            {inRoadmap ? <ShowMeAround tourId="permit" /> : null}
          </View>

          {!hasHydrated ? (
            <View style={styles.loading}>
              <ActivityIndicator color={BrandColors.crimson} />
            </View>
          ) : !profile ? (
            <IntakeWizard onComplete={(next) => setProfile(next)} />
          ) : profile.application === 'renewal' ? (
            <RenewalNotice onStartOver={handleStartOver} />
          ) : showComplete ? (
            <CompletionSummary steps={steps} onStartOver={handleStartOver} />
          ) : detailStep ? (
            <StepDetail
              step={detailStep}
              checkedRequirements={checkedRequirements[detailStep.id] ?? []}
              done={doneSteps.includes(detailStep.id)}
              onToggleRequirement={(index) => toggleRequirement(detailStep.id, index)}
              onToggleDone={() => toggleStepDone(detailStep.id)}
              onProceed={handleProceed}
              isLastStep={isLastStep}
            />
          ) : (
            <RoadmapOverview
              profile={profile}
              steps={steps}
              doneSteps={doneSteps}
              onStepPress={(step) => setDetailStepId(step.id)}
              onStartOver={handleStartOver}
              onFinish={() => setShowComplete(true)}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {showHelper ? (
        <AIHelperButton
          key={detailStepId ?? 'roadmap'}
          context="permit"
          hint="Ask Giya about this step"
          tourId={inRoadmap ? TourTargets.permitGiya : undefined}
          onPress={() => setHelperVisible(true)}
        />
      ) : null}
      {showHelper && profile ? (
        <PermitHelperSheet
          visible={helperVisible}
          step={detailStep}
          profile={profile}
          onClose={() => setHelperVisible(false)}
        />
      ) : null}
    </ThemedView>
  );
}

function CompletionSummary({
  steps,
  onStartOver,
}: {
  steps: PermitStep[];
  onStartOver: () => void;
}) {
  const release = steps[steps.length - 1];
  return (
    <View style={styles.completion}>
      <View style={styles.completionCard}>
        <ThemedText type="title" color={BrandColors.charcoal} style={styles.completionTitle}>
          You’re ready to claim your permit 🎉
        </ThemedText>
        <ThemedText type="bodySmall" color={BrandColors.muted}>
          You’ve completed all {steps.length} steps. Claim your business permit at:
        </ThemedText>
        {release ? (
          <>
            <ThemedText type="bodySmall" color={BrandColors.charcoal}>
              {release.office}
            </ThemedText>
            <ThemedText type="caption" color={BrandColors.muted}>
              {release.address}
            </ThemedText>
          </>
        ) : null}
        <ThemedText type="caption" color={BrandColors.muted} style={styles.completionNote}>
          Requirements may vary by business — confirm final requirements with BPLO.
        </ThemedText>
      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  safe: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.huge,
    gap: Spacing.md,
    minHeight: '100%',
  },
  pageHeader: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 34,
    lineHeight: 38,
  },
  pageTitle: {
    flex: 1,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  loading: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completion: {
    gap: Spacing.md,
  },
  completionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: BrandColors.softGold,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
  },
  completionTitle: {
    fontWeight: '700',
  },
  completionNote: {
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  startOver: {
    alignSelf: 'center',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
});
