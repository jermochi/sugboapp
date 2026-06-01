/**
 * Trilingual hero strings and shared UI copy.
 * Light hardcoded approach — no full i18n system.
 */

/** The rotating AI bar prompt in three languages */
export const AI_BAR_PROMPTS = [
  'Unsa imong kinahanglan?',
  'Ano ang kailangan mo?',
  'What do you need?',
] as const;

/** Combined display string for the AI bar */
export const AI_BAR_HERO =
  'Unsa imong kinahanglan? / Ano ang kailangan mo? / What do you need?';

/** Offline fallback message */
export const AI_OFFLINE_MESSAGE =
  'AI assistant is offline. Tap to browse services instead.';

/** App name */
export const APP_NAME = 'SugboApp';

/** App tagline */
export const APP_TAGLINE = 'Your Cebu City in one app';
