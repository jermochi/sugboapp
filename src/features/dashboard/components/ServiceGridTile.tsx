/**
 * ServiceGridTile — a vertical icon button in the service quick-link grid.
 *
 * A 60×60 rounded chip holding a crimson icon, with a label below. The design's
 * hover state becomes the press state on touch: the chip fills crimson, the icon
 * turns white, and the shadow lifts.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';

interface ServiceGridTileProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
}

export function ServiceGridTile({ icon, label, onPress }: ServiceGridTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.tile}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.chip, pressed && styles.chipPressed]}>
            <Icon
              name={icon}
              size={26}
              color={pressed ? '#fff' : BrandColors.crimson}
              strokeWidth={1.8}
            />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  chip: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BrandColors.warmGray,
    // resting: 0 2px 8px rgba(91,72,46,0.06)
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chipPressed: {
    backgroundColor: BrandColors.crimson,
    borderColor: BrandColors.crimson,
    // lifted: 0 8px 18px rgba(153,0,0,0.18)
    shadowColor: BrandColors.crimson,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12.5,
    lineHeight: 15,
    color: BrandColors.charcoal,
    textAlign: 'center',
  },
});
