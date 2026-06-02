/**
 * SurveyCta — the full-width feedback/survey gradient banner.
 *
 * Garnet→crimson gradient with a clipped gold glow, an icon chip, a two-line
 * heading/subline, and a trailing chevron.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';
import { RadialGlow } from './RadialGlow';

interface SurveyCtaProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export function SurveyCta({ title, subtitle, onPress }: SurveyCtaProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <LinearGradient
        colors={[BrandColors.garnet, BrandColors.crimson]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <RadialGlow
          size={130}
          color={BrandColors.gold}
          innerOpacity={0.3}
          edge={0.65}
          style={{ right: -28, top: -38 }}
        />
        <View style={styles.iconChip}>
          <Icon name="permit" size={22} color="#FCE9B6" strokeWidth={1.8} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Icon name="chevron" size={18} color="rgba(255,255,255,0.8)" strokeWidth={2.4} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginTop: 18,
    borderRadius: 18,
    overflow: 'hidden',
  },
  iconChip: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 14.5,
    lineHeight: 18,
    color: '#fff',
  },
  subtitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    marginTop: 3,
    color: BrandColors.softGold,
  },
});
