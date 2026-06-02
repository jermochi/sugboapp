/**
 * SearchBar — the translucent pill search button at the top of the header.
 *
 * Matches the design's "pressed pad" look: a rounded-pill with a 1px top/side
 * border and a heavier 5px bottom border, over a 78%-white ground.
 */

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Icon } from '@/core/components';
import { BrandColors, Fonts } from '@/core/theme';

interface SearchBarProps {
  placeholder: string;
  onPress?: () => void;
}

export function SearchBar({ placeholder, onPress }: SearchBarProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel={placeholder}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
    >
      <Icon name="search" size={19} color={BrandColors.muted} strokeWidth={2} />
      <Text style={styles.placeholder} numberOfLines={1}>
        {placeholder}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 13,
    paddingHorizontal: 17,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: 'rgb(230, 223, 211)',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 5,
    // soft warm shadow: 0 3px 10px rgba(91,72,46,0.07)
    shadowColor: '#5B482E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  placeholder: {
    flex: 1,
    fontFamily: Fonts.bodyMedium,
    fontSize: 14.5,
    color: BrandColors.muted,
  },
});
