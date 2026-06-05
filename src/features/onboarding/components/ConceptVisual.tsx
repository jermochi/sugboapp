/**
 * ConceptVisual — looping, brand-styled animations that convey the *idea* of a
 * service (no device chrome). Replaces the earlier phone mockups on the
 * service slides:
 *   - 'steps'   → a checklist that fills step by step (Permits)
 *   - 'bars'    → a budget bar chart rippling up and down (Transparency)
 *   - 'hotline' → concentric pulse rings around a hotline badge (Emergency)
 *
 * Built on React Native's `Animated` (JS-driven) so the loops run reliably on
 * every target. Each animation is tinted with the slide accent so it sits
 * inside SlideVisual's shared gold halo / Sinulog texture.
 */
import { Icon, type IconName } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import type { SlideFlowKind } from '../data';

interface ConceptVisualProps {
  kind: SlideFlowKind;
  icon?: IconName;
  accent: string;
}

/** Append alpha to a 6-digit hex color (#990000 + 0.5 → #99000080). */
function hexA(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

/** A value that loops 0→1 forever (optionally after an initial stagger delay). */
function useLoopValue(duration: number, startDelay = 0) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    const anim = startDelay
      ? Animated.sequence([Animated.delay(startDelay), loop])
      : loop;
    anim.start();
    return () => {
      value.stopAnimation();
      value.setValue(0);
    };
  }, [value, duration, startDelay]);
  return value;
}

export function ConceptVisual({ kind, icon, accent }: ConceptVisualProps) {
  return (
    <View style={styles.stage} pointerEvents="none">
      {kind === 'steps' && <StepsConcept accent={accent} />}
      {kind === 'bars' && <BarsConcept accent={accent} />}
      {kind === 'hotline' && <HotlineConcept accent={accent} icon={icon} />}
    </View>
  );
}

/* ----------------------------- Permits: checklist ----------------------------- */

const STEP_COUNT = 4;

function StepsConcept({ accent }: { accent: string }) {
  const t = useLoopValue(3400);
  return (
    <View style={styles.steps}>
      <View style={[styles.stepsConnector, { backgroundColor: BrandColors.warmGray }]} />
      {Array.from({ length: STEP_COUNT }, (_, i) => (
        <StepRow key={i} index={i} t={t} accent={accent} />
      ))}
    </View>
  );
}

function StepRow({ index, t, accent }: { index: number; t: Animated.Value; accent: string }) {
  const threshold = (index + 1) / (STEP_COUNT + 1);
  // Fills as the clock sweeps past this row's slot, then holds until the loop
  // resets — so the checklist visibly completes top-to-bottom and repeats.
  const fill = t.interpolate({
    inputRange: [Math.max(0, threshold - 0.16), threshold, 1],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });
  const badgeColor = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [BrandColors.softGold, accent],
  });
  return (
    <View style={styles.stepRow}>
      <Animated.View style={[styles.stepBadge, { backgroundColor: badgeColor, transform: [{ scale: fill.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }]}>
        <Animated.Text style={[styles.stepCheck, { opacity: fill }]}>✓</Animated.Text>
      </Animated.View>
      <View style={styles.stepLines}>
        <Animated.View style={[styles.stepLine, { width: index % 2 ? '64%' : '82%', opacity: fill.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]} />
        <Animated.View style={[styles.stepLineThin, { width: '92%', opacity: fill.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.8] }) }]} />
      </View>
    </View>
  );
}

/* ----------------------------- Budget: bar chart ----------------------------- */

const BAR_MAX = 96;
const BAR_MIN = 28;
// Phase-shifted keyframes (start == end so the loop is seamless).
const BAR_FRAMES: number[][] = [
  [0.32, 1.0, 0.5, 0.82, 0.32],
  [0.74, 0.42, 1.0, 0.56, 0.74],
  [1.0, 0.62, 0.36, 0.92, 1.0],
  [0.46, 0.86, 0.66, 0.4, 0.46],
];

function BarsConcept({ accent }: { accent: string }) {
  const t = useLoopValue(2600);
  const colors = [hexA(accent, 0.55), accent, hexA(accent, 0.8), hexA(accent, 0.65)];
  return (
    <View style={styles.bars}>
      <View style={styles.barsPlot}>
        {BAR_FRAMES.map((frame, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: colors[i],
                height: t.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: frame.map((f) => BAR_MIN + f * (BAR_MAX - BAR_MIN)),
                }),
              },
            ]}
          />
        ))}
      </View>
      <View style={[styles.barsAxis, { backgroundColor: BrandColors.warmGray }]} />
      <View style={[styles.pesoChip, { backgroundColor: hexA(accent, 0.14) }]}>
        <Text style={[styles.pesoText, { color: accent }]}>₱</Text>
      </View>
    </View>
  );
}

/* --------------------------- Emergency: pulse rings --------------------------- */

function HotlineConcept({ accent, icon }: { accent: string; icon?: IconName }) {
  return (
    <View style={styles.hotline}>
      <PulseRing accent={accent} delay={0} />
      <PulseRing accent={accent} delay={600} />
      <PulseRing accent={accent} delay={1200} />
      <View style={[styles.hotlineCore, { backgroundColor: accent }]}>
        <Icon name={icon ?? 'hotline'} size={40} color="#fff" strokeWidth={2} />
        <Text style={styles.hotlineNumber}>166</Text>
      </View>
    </View>
  );
}

function PulseRing({ accent, delay }: { accent: string; delay: number }) {
  const t = useLoopValue(1800, delay);
  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          borderColor: accent,
          opacity: t.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 0.5, 0] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.1] }) }],
        },
      ]}
    />
  );
}

const STAGE = 230;

const styles = StyleSheet.create({
  stage: {
    width: STAGE,
    height: STAGE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Steps
  steps: {
    width: 210,
    gap: 16,
    paddingVertical: 4,
  },
  stepsConnector: {
    position: 'absolute',
    left: 17,
    top: 22,
    bottom: 22,
    width: 2,
    borderRadius: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCheck: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Fonts.bodyBold,
    lineHeight: 20,
  },
  stepLines: {
    flex: 1,
    gap: 7,
  },
  stepLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.warmGray,
  },
  stepLineThin: {
    height: 7,
    borderRadius: 4,
    backgroundColor: BrandColors.warmGray,
  },

  // Bars
  bars: {
    width: 210,
    height: 150,
    justifyContent: 'flex-end',
  },
  barsPlot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: BAR_MAX,
  },
  bar: {
    width: 34,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barsAxis: {
    height: 2,
    borderRadius: 1,
    marginTop: 6,
  },
  pesoChip: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pesoText: {
    fontFamily: Fonts.headingBlack,
    fontSize: 20,
  },

  // Hotline
  hotline: {
    width: STAGE,
    height: STAGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  hotlineCore: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  hotlineNumber: {
    fontFamily: Fonts.headingBlack,
    fontSize: 22,
    color: '#fff',
    letterSpacing: 1,
  },
});
