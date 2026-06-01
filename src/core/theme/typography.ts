/**
 * Typography presets — text styles used across the app.
 * Uses system fonts (no custom font loading needed for the skeleton).
 */

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const TextStyles = {
  /** Large screen titles */
  hero: {
    fontFamily,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  } satisfies TextStyle,

  /** Screen titles */
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  } satisfies TextStyle,

  /** Section headers */
  subtitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } satisfies TextStyle,

  /** Default body text */
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } satisfies TextStyle,

  /** Secondary / supporting text */
  bodySmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } satisfies TextStyle,

  /** Captions, labels, timestamps */
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } satisfies TextStyle,

  /** Inline code / monospace */
  code: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } satisfies TextStyle,

  /** Button text */
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } satisfies TextStyle,
} as const;

export type TextStyleName = keyof typeof TextStyles;
