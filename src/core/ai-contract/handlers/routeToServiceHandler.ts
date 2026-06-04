/**
 * route_to_service — resolves a user need to an in-app service and returns a
 * tappable LINK (it does not navigate). The AI dispatches this when it has
 * identified which service the user needs; the chat store renders the returned
 * `link` as a button and only navigates (via navigateToService) when tapped.
 * For not-yet-built services it reports available:false so Giya can say "coming
 * soon" instead of fabricating a destination.
 *
 * GROUNDING RULE: this never invents routes — only the serviceIds in
 * SERVICE_CATALOG below are real; everything else returns available:false.
 */

import type { AIFunctionHandler } from '../types';
import type { IconName } from '@/core/components';
import { navigateTo, Routes, type RouteName } from '@/core/routing';

/**
 * The services the AI is allowed to route to, keyed by the stable `serviceId`
 * it passes. `route: null` means the screen exists in the product vision but
 * isn't built yet — the handler acknowledges it without offering a link.
 */
interface ServiceEntry {
  /** Human label, surfaced back to the model (e.g. in tool results). */
  label: string;
  /** Short label for the tappable link button shown to the user. */
  linkLabel: string;
  /** Optional leading icon for the link button. */
  icon?: IconName;
  /** Navigation target, or null if not yet implemented. */
  route: RouteName | null;
}

export const SERVICE_CATALOG: Record<string, ServiceEntry> = {
  dashboard: { label: 'Home', linkLabel: 'Go to Home', icon: 'home', route: Routes.DASHBOARD },
  transparency: { label: 'Transparency Tracker (city budget & projects)', linkLabel: 'Open Transparency Tracker', icon: 'budget', route: Routes.TRANSPARENCY },
  permit: { label: 'Business Permit walkthrough', linkLabel: 'Open Business Permit guide', icon: 'permit', route: Routes.PERMIT },
  emergency: { label: 'Emergency Services & hotlines', linkLabel: 'Open Emergency Services', icon: 'hotline', route: Routes.EMERGENCY },

  // Known to the product but not yet built — acknowledged, never fabricated.
  tax: { label: 'Tax payment', linkLabel: 'Open Tax payment', icon: 'tax', route: null },
  report: { label: 'Report a problem', linkLabel: 'Open Report a problem', icon: 'report', route: null },
  documents: { label: 'Civil documents (birth certificate, etc.)', linkLabel: 'Open Civil documents', icon: 'document', route: null },
  news: { label: 'City news & announcements', linkLabel: 'Open City news', icon: 'news', route: null },
  booking: { label: 'Appointment booking', linkLabel: 'Open Appointment booking', icon: 'calendar', route: null },
  seniors: { label: 'Senior citizen services', linkLabel: 'Open Senior citizen services', icon: 'seniors', route: null },
};

/** The serviceIds the model may choose from — kept in sync with the catalog. */
export const ROUTABLE_SERVICE_IDS = Object.keys(SERVICE_CATALOG);

/**
 * Actually navigate to a service. The AI tool only *suggests* links and never
 * navigates on its own; navigation happens here when the user taps a Giya link
 * (called from the chat store's followAction).
 */
export function navigateToService(
  serviceId: string,
  params?: Record<string, string>,
): { status: string; service?: string; available: boolean } {
  const entry = SERVICE_CATALOG[serviceId];
  if (!entry) return { status: 'unknown_service', available: false };
  if (!entry.route) {
    return { status: 'not_implemented', service: entry.label, available: false };
  }
  const navigate = navigateTo as (
    route: RouteName,
    params?: Record<string, string>,
  ) => void;
  navigate(entry.route, params);
  return { status: 'navigated', service: entry.label, available: true };
}

export const routeToServiceHandler: AIFunctionHandler = {
  name: 'route_to_service',

  description:
    "Resolve the in-app service that matches the user's need and surface a " +
    'tappable link to it. This does NOT open or navigate to the screen — the ' +
    'user taps the link themselves. Only call this once the intended service is ' +
    'clear; if the request is ambiguous, ask a clarifying question instead.',

  parameters: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'string',
        enum: ROUTABLE_SERVICE_IDS,
        description: 'The service to open.',
      },
      params: {
        type: 'object',
        description:
          'Optional route parameters, e.g. { sectorId, barangay } for transparency.',
      },
    },
    required: ['serviceId'],
  },

  async call(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const serviceId = String(args.serviceId ?? '');
    const entry = SERVICE_CATALOG[serviceId];

    if (!entry) {
      return { status: 'unknown_service', serviceId, available: false };
    }

    if (!entry.route) {
      return {
        status: 'not_implemented',
        serviceId,
        service: entry.label,
        available: false,
      };
    }

    const params = (args.params ?? undefined) as
      | Record<string, string>
      | undefined;

    // Do NOT navigate here. Return a link the chat store renders as a tappable
    // button; navigation runs only when the user taps it (via navigateToService).
    return {
      status: 'link_suggested',
      serviceId,
      service: entry.label,
      available: true,
      link: {
        label: entry.linkLabel,
        serviceId,
        ...(params ? { params } : {}),
        ...(entry.icon ? { icon: entry.icon } : {}),
      },
    };
  },
};
