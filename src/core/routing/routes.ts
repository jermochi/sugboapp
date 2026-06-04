/**
 * Route name constants — the single source of truth for navigation paths.
 * Maps to files in src/app/.
 * Use these constants everywhere — never hardcode a path string.
 */

export const Routes = {
  DASHBOARD: '/' as const,
  GIYA_CHAT: '/giya-chat' as const,
  ONBOARDING: '/onboarding' as const,
  TRANSPARENCY: '/transparency' as const,
  PERMIT: '/permit' as const,
  EMERGENCY: '/emergency' as const,
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];

/**
 * Optional params accepted by each route.
 */
export interface RouteParams {
  '/': undefined;
  '/giya-chat': undefined;
  '/onboarding': undefined;
  '/transparency': {
    sectorId?: string;
    barangay?: string;
    /** TransparencyCategory id to open on mount, e.g. "annual-budget". */
    section?: string;
  };
  '/permit': {
    /** JSON-encoded PermitProfile */
    profile?: string;
  };
  '/emergency': undefined;
}
