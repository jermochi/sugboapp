/**
 * AskGiyaButton — the fixed-size crimson→gold "Ask Giya" CTA pill.
 *
 * Same warm maroon→gold gradient as the "Ask Sugbo AI" front door, with a gold
 * hairline ring, a warm drop shadow, and a decorative gold glow clipped to the
 * top-right. Fixed 200×36 per the spec.
 */

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';
import { RadialGlow } from './RadialGlow';

interface AskGiyaButtonProps {
  label: string;
  onPress?: () => void;
}

export function AskGiyaButton({ label, onPress }: AskGiyaButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.shadow, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[BrandColors.crimsonBright, BrandColors.crimson, BrandColors.crimsonDeep]}
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <RadialGlow
          size={110}
          color={BrandColors.gold}
          innerOpacity={0.55}
          edge={0.66}
          style={{ right: -10, top: -34 }}
        />
        <Icon name="mic" size={18} color="#fff" strokeWidth={2} />
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    width: 200,
    height: 36,
    marginTop: 13,
    marginLeft: 32,
    borderRadius: 999,
    // warm crimson drop: 0 12px 30px rgba(153,0,0,0.40)
    shadowColor: BrandColors.crimson,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  pressed: {
    opacity: 0.92,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 999,
    overflow: 'hidden',
    // gold hairline ring: 0 0 0 1.5px rgba(218,165,32,0.40)
    borderWidth: 1.5,
    borderColor: 'rgba(218,165,32,0.40)',
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15.5,
    color: '#fff',
    letterSpacing: -0.2,
  },
});
