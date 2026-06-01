/**
 * useAppTheme — returns the current color set based on the device color scheme.
 */

import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, type ThemeColors } from '@/core/theme/colors';

export function useAppTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DarkColors : LightColors;
}

