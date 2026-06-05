/**
 * PhoneMockup — a screenshot framed in a minimal iPhone-style device.
 *
 * Shown on every onboarding slide to preview the real destination screen. The
 * device is sized from the slide width and uses a tall phone aspect ratio so
 * its bottom bleeds off the page (the parent clips it), matching the onboarding
 * layout. A faint Sinulog star + warm gold glow sit behind it for brand
 * texture, reusing the dashboard's decorative pieces.
 */

import React from 'react';
import { Image, type ImageSourcePropType, StyleSheet, View } from 'react-native';

import { BrandColors } from '@/core/theme';
import { RadialGlow } from '@/features/dashboard/components/RadialGlow';
import { StarMotif } from '@/features/dashboard/components/StarMotif';

interface PhoneMockupProps {
  image: ImageSourcePropType;
  /** Outer device width in px; height follows a phone aspect ratio. */
  width: number;
}

export function PhoneMockup({ image, width }: PhoneMockupProps) {
  const bezel = Math.max(8, Math.round(width * 0.035));
  const innerW = width - 2 * bezel;
  // Match the screen to the screenshots' aspect (828×1792) so the image fills it
  // with no vertical crop — the full top (status bar) stays visible.
  const frameH = Math.round(innerW * (1792 / 828)) + 2 * bezel;
  const outerRadius = Math.round(width * 0.17);
  const innerRadius = outerRadius - bezel + 1;

  // Dynamic island — a pill centered at the top of the screen, sized to a real
  // device's proportions so it reads correctly at any scale.
  const islandW = Math.round(innerW * 0.32);
  const islandH = Math.round(islandW * 0.3);

  return (
    <View style={styles.wrap} pointerEvents="none">
      <RadialGlow
        size={Math.round(width * 1.7)}
        color={BrandColors.gold}
        innerOpacity={0.38}
        edge={0.72}
        style={{ top: -width * 0.18, left: -width * 0.35 }}
      />
      <StarMotif
        size={Math.round(width * 0.95)}
        color={BrandColors.gold}
        style={{ top: -width * 0.08, right: -width * 0.22, opacity: 0.16 }}
      />

      <View
        style={[
          styles.frame,
          { width, height: frameH, borderRadius: outerRadius, padding: bezel },
        ]}
      >
        <View style={[styles.screen, { borderRadius: innerRadius }]}>
          <Image source={image} style={styles.image} resizeMode="cover" />
          <View
            style={[
              styles.island,
              {
                width: islandW,
                height: islandH,
                borderRadius: islandH / 2,
                top: Math.round(width * 0.03),
                marginLeft: -Math.round(islandW / 2),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  frame: {
    backgroundColor: '#0E0E12',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#3A2A12',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 12,
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: BrandColors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  island: {
    position: 'absolute',
    left: '50%',
    backgroundColor: '#08080A',
  },
});
