/**
 * ThemedView — view component that respects the current color scheme.
 *
 * Migrated from src/components/themed-view.tsx and updated to use
 * the new core theme system.
 */

import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useAppTheme } from '@/core/hooks/useAppTheme';

export type ThemedViewProps = ViewProps & {
  /** Which background color to use */
  variant?: 'background' | 'surface' | 'surfaceElevated';
};

export function ThemedView({
  style,
  variant = 'background',
  ...otherProps
}: ThemedViewProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[{ backgroundColor: theme[variant] }, style]}
      {...otherProps}
    />
  );
}
