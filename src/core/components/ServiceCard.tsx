/**
 * ServiceCard — a generic elevated card container.
 *
 * Use as a wrapper for content sections with consistent elevation.
 */

import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useAppTheme } from '@/core/hooks/useAppTheme';
import { Spacing, BorderRadius } from '@/core/theme';

export type ServiceCardProps = ViewProps & {
  /** Use elevated surface color */
  elevated?: boolean;
};

export function ServiceCard({
  style,
  elevated = false,
  children,
  ...otherProps
}: ServiceCardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? theme.surfaceElevated : theme.surface,
          borderColor: theme.border,
        },
        style,
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
});
