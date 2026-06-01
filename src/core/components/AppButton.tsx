/**
 * AppButton — primary/secondary button with loading state.
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { AppColors, Spacing, BorderRadius } from '@/core/theme';
import { useAppTheme } from '@/core/hooks/useAppTheme';

interface AppButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export function AppButton({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;

  const bgColor =
    variant === 'primary'
      ? AppColors.primary
      : variant === 'secondary'
        ? theme.surface
        : 'transparent';

  const textColor =
    variant === 'primary'
      ? '#FFFFFF'
      : AppColors.primary;

  const borderColor =
    variant === 'outline'
      ? AppColors.primary
      : variant === 'secondary'
        ? theme.border
        : 'transparent';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style as object,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <ThemedText type="button" color={textColor}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
