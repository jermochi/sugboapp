/**
 * OnboardingScreen — the first-launch walkthrough.
 *
 * A horizontally paged tour of the services that ship today (Giya, Permits,
 * Budget, Emergency), styled to match the "Meet Giya" dashboard: a warm-gold
 * wash with a left-aligned text block and a phone mockup previewing each
 * destination screen, bleeding off the bottom under a floating crimson→gold
 * CTA. Skip or finishing both persist the seen-flag (so it never auto-shows
 * again) and replace into the Dashboard.
 *
 * Reachable two ways: auto-gated on a fresh install by `app/index`, and
 * manually via the `/onboarding` route for a replay.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { replaceTo, Routes } from '@/core/routing';
import { BrandColors, Fonts } from '@/core/theme';

import { OnboardingSlide } from './components/OnboardingSlide';
import { ONBOARDING_SLIDES } from './data';
import { setOnboardingSeen } from './storage';

const LAST_INDEX = ONBOARDING_SLIDES.length - 1;

interface OnboardingScreenProps {
  /**
   * When the gate renders this inline on first launch, completing/skipping
   * calls this instead of navigating — avoids a startup redirect. The
   * standalone `/onboarding` route omits it and falls back to navigation.
   */
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  // Page width drives the pager geometry. Prefer the measured layout width
  // (authoritative, follows resize/rotation) and fall back to the window width
  // for the very first frame before onLayout fires.
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [layoutWidth, setLayoutWidth] = useState(0);
  const width = layoutWidth || window.width || 390;
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== layoutWidth) setLayoutWidth(w);
  };

  // Persist the seen-flag, then either hand control back to the gate (inline
  // first-launch) or replace into the Dashboard (standalone replay route).
  // Shared by Skip and the final Get Started.
  const finish = async () => {
    await setOnboardingSeen();
    if (onComplete) onComplete();
    else replaceTo(Routes.DASHBOARD);
  };

  const handleNext = () => {
    if (index >= LAST_INDEX) {
      void finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
  };

  const handleMomentumEnd = (offsetX: number) => {
    if (width <= 0) return;
    const next = Math.round(offsetX / width);
    if (next !== index) setIndex(next);
  };

  const isLast = index >= LAST_INDEX;

  return (
    <View style={styles.root} onLayout={handleLayout}>
      {/* Warm wash behind every page — same palette as the dashboard header. */}
      <LinearGradient
        colors={['#F6E6C9', '#FBF1DD', '#FBF8F3']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Skip — top-right, hidden on the final slide. */}
        <View style={styles.topBar}>
          {!isLast ? (
            <Pressable
              onPress={finish}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
            >
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.pager}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onMomentumScrollEnd={(e) => handleMomentumEnd(e.nativeEvent.contentOffset.x)}
        >
          {ONBOARDING_SLIDES.map((slide) => (
            <OnboardingSlide key={slide.id} slide={slide} width={width} />
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Floating CTA over the bleeding phone, with a scrim so it stays legible. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]} pointerEvents="box-none">
        <LinearGradient
          colors={['rgba(251,248,243,0)', 'rgba(251,248,243,0.92)', '#FBF8F3']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Pressable
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Get started' : 'Continue'}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <LinearGradient
            colors={[BrandColors.crimsonBright, BrandColors.crimson, BrandColors.crimsonDeep]}
            locations={[0, 0.52, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaLabel}>{isLast ? 'Get Started' : 'Continue'}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.paper,
  },
  safe: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  skip: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: BrandColors.muted,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  cta: {
    height: 54,
    borderRadius: 999,
    shadowColor: BrandColors.crimson,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(218,165,32,0.40)',
  },
  ctaLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 17,
    color: BrandColors.white,
    letterSpacing: 0.2,
  },
});
