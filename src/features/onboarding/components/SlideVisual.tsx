/**
 * SlideVisual — the illustration for one onboarding slide.
 *
 * Reuses the brand kit already built for the "Meet Giya" dashboard (the Sinulog
 * {@link StarMotif}, the warm {@link RadialGlow}, and the Giya mascot art) so
 * the walkthrough feels like the same surface as the home screen. Welcome/Giya
 * slides lead with the mascot; service slides show a looping animation of the
 * service's concept (see {@link ConceptVisual}).
 */

import { type IconName } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AskGiyaButton } from '@/features/dashboard/components/AskGiyaButton';
import { RadialGlow } from '@/features/dashboard/components/RadialGlow';
import { StarMotif } from '@/features/dashboard/components/StarMotif';
import type { SlideFlowKind, SlideVisualKind } from '../data';
import { ConceptVisual } from './ConceptVisual';

const MASCOT = require('../../../../assets/images/giya-full.png');

interface SlideVisualProps {
  kind: SlideVisualKind;
  icon?: IconName;
  flow?: SlideFlowKind;
  accent: string;
}

export function SlideVisual({ kind, icon, flow, accent }: SlideVisualProps) {
  const isConcept = kind === 'service' || kind === 'emergency';

  return (
    <View style={styles.stage} pointerEvents="none">
      {/* Decorative Sinulog texture, faint behind the hero. */}
      <StarMotif size={180} color={BrandColors.gold} style={{ top: 4, right: 8, opacity: 0.22 }} />
      <StarMotif size={120} color={accent} style={{ bottom: 10, left: 4, opacity: 0.12 }} />
      <RadialGlow size={260} color={BrandColors.gold} innerOpacity={0.45} edge={0.7} style={styles.halo} />

      {kind === 'mascot' && (
        <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
      )}

      {kind === 'giya' && (
        <View style={styles.giyaStack}>
          <Image source={MASCOT} style={styles.giyaMascot} resizeMode="contain" />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Ask me anything —{'\n'}even in Bisaya.</Text>
          </View>
          <View style={styles.giyaButtonRow}>
            <AskGiyaButton label="Ask Giya" />
          </View>
        </View>
      )}

      {isConcept && flow && <ConceptVisual kind={flow} icon={icon} accent={accent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    // Horizontally centered behind the hero (stage is 280 wide; glow is 260).
    left: 10,
    top: 20,
  },
  mascot: {
    width: 230,
    height: 230,
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  giyaStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  giyaMascot: {
    width: 150,
    height: 150,
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  bubble: {
    maxWidth: 240,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  bubbleText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.garnet,
    textAlign: 'center',
  },
  // AskGiyaButton carries dashboard-specific left/top offsets; recenter it here.
  giyaButtonRow: {
    alignItems: 'center',
    marginLeft: -32,
  },
});
