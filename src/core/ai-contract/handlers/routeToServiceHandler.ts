/**
 * route_to_service — the routing handler owned by core/routing.
 *
 * The AI dispatches this when it has identified which service the user needs.
 * The handler does NOT navigate — it resolves the destination and reports it
 * back so the chat can render a button the user taps to open it (no
 * auto-redirect). It also reports "coming soon" for services not yet built.
 *
 * GROUNDING RULE: this never invents routes — only the serviceIds in
 * SERVICE_CATALOG below are navigable; everything else returns available:false.
 */

import type { AIFunctionHandler } from '../types';
import { Routes, type RouteName } from '@/core/routing';

/**
 * The services the AI is allowed to route to, keyed by the stable `serviceId`
 * it passes. `route: null` means the screen exists in the product vision but
 * isn't built yet — the handler acknowledges it without navigating.
 */
interface ServiceEntry {
  /** Human label, surfaced back to the model for its confirmation message. */
  label: string;
  /** Navigation target, or null if not yet implemented. */
  route: RouteName | null;
}

export const SERVICE_CATALOG: Record<string, ServiceEntry> = {
  dashboard: { label: 'Home', route: Routes.DASHBOARD },
  transparency: { label: 'Transparency Tracker (city budget & projects)', route: Routes.TRANSPARENCY },
  permit: { label: 'Business Permit walkthrough', route: Routes.PERMIT },
  emergency: { label: 'Emergency Services & hotlines', route: Routes.EMERGENCY },

  // Known to the product but not yet built — acknowledged, never fabricated.
  tax: { label: 'Tax payment', route: null },
  report: { label: 'Report a problem', route: null },
  documents: { label: 'Civil documents (birth certificate, etc.)', route: null },
  news: { label: 'City news & announcements', route: null },
  booking: { label: 'Appointment booking', route: null },
  seniors: { label: 'Senior citizen services', route: null },
};

/** The serviceIds the model may choose from — kept in sync with the catalog. */
export const ROUTABLE_SERVICE_IDS = Object.keys(SERVICE_CATALOG);

export const routeToServiceHandler: AIFunctionHandler = {
  name: 'route_to_service',

  description:
    'Navigate the user to the in-app service that matches their need. Only call ' +
    'this once the intended service is clear; if the request is ambiguous, ask a ' +
    'clarifying question instead of calling this.',

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

    // No navigation here — the chat surfaces a button and navigates on tap.
    return {
      status: 'route_ready',
      serviceId,
      service: entry.label,
      route: entry.route,
      available: true,
    };
  },
};
