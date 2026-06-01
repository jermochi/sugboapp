/**
 * ThemedText — text component that respects the current color scheme.
 *
 * Migrated from src/components/themed-text.tsx and updated to use
 * the new core theme system.
 */

import React from 'react';
import { Platform, StyleSheet, Text, type TextProps } from 'react-native';
import { TextStyles, type TextStyleName } from '@/core/theme/typography';
import { useAppTheme } from '@/core/hooks/useAppTheme';

export type ThemedTextProps = TextProps & {
  type?: TextStyleName;
  /** Override the default text color */
  color?: string;
  /** Use secondary text color */
  secondary?: boolean;
};

export function ThemedText({
  style,
  type = 'body',
  color,
  secondary = false,
  ...rest
}: ThemedTextProps) {
  const theme = useAppTheme();

  const textColor = color ?? (secondary ? theme.textSecondary : theme.text);

  return (
    <Text
      style={[
        { color: textColor },
        TextStyles[type],
        style,
      ]}
      {...rest}
    />
  );
}
