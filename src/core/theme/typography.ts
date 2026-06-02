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

/**
 * Brand font families — loaded at startup in `app/_layout.tsx` via
 * `@expo-google-fonts/{lato,open-sans}`. Lato (headings) ships 100/300/400/
 * 700/900 in this build, so the design's weight-800 title maps to the nearest
 * heavy face (`Lato_900Black`). RN does not synthesize weights, so each entry
 * points at an explicit font file name.
 */
export const Fonts = {
  /** Lato 700 — section headers, news titles, button labels */
  heading: 'Lato_700Bold',
  /** Lato 900 — the heavy "Meet Giya" hero title (design weight 800) */
  headingBlack: 'Lato_900Black',
  /** Open Sans 400 — default body */
  body: 'OpenSans_400Regular',
  /** Open Sans 500 — search placeholder */
  bodyMedium: 'OpenSans_500Medium',
  /** Open Sans 600 — tile labels, captions */
  bodySemiBold: 'OpenSans_600SemiBold',
  /** Open Sans 700 — emphasized body */
  bodyBold: 'OpenSans_700Bold',
} as const;

export type FontName = (typeof Fonts)[keyof typeof Fonts];

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
