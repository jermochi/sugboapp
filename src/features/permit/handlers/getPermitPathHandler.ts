/**
 * get_permit_path — returns the ordered, profile-filtered permit roadmap.
 *
 * Shares filterSteps/computeTotals with the screen so the in-chat path and the
 * on-screen roadmap can never disagree.
 *
 * GROUNDING RULE: returns only data from permit_steps.json — never invents.
 */
import type { AIFunctionHandler } from '@/core/ai-contract';
import type {
  ApplicationType,
  BusinessType,
  LegalStructure,
  PermitProfile,
} from '@/core/models/permit';
import { Routes } from '@/core/routing';

import {
  addOnReason,
  computeTotals,
  filterSteps,
  formatEstimatedFees,
  isAddOn,
} from '../domain/permitPath';

const APPLICATION_VALUES: ApplicationType[] = ['new', 'renewal'];
const BUSINESS_TYPE_VALUES: BusinessType[] = [
  'sari-sari',
  'food',
  'services',
  'bar',
  'other',
];
const LEGAL_STRUCTURE_VALUES: LegalStructure[] = [
  'sole',
  'corporation',
  'cooperative',
];

function coerce<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export const getPermitPathHandler: AIFunctionHandler = {
  name: 'get_permit_path',
  description:
    'Return the ordered list of business-permit steps for a given business ' +
    'profile. REQUIRES application, businessType, and legalStructure — do NOT ' +
    'call this until you already know all three. To collect any missing field, ' +
    'do NOT ask for it in plain text: call ask_clarification with that field’s ' +
    'choices as tappable options (translate the labels to the user’s language). ' +
    'Choices — application: ["New business", "Renewal"]; businessType: ' +
    '["Sari-sari store", "Food / Carinderia / Restaurant", "Services", ' +
    '"Bar / Videoke", "Other"]; legalStructure: ["Sole proprietor", ' +
    '"Corporation / Partnership", "Cooperative"]. Ask one field per turn.',
  parameters: {
    type: 'object',
    properties: {
      application: {
        type: 'string',
        enum: APPLICATION_VALUES,
        description: 'new or renewal',
      },
      businessType: {
        type: 'string',
        enum: BUSINESS_TYPE_VALUES,
        description: 'kind of business',
      },
      legalStructure: {
        type: 'string',
        enum: LEGAL_STRUCTURE_VALUES,
        description: 'sole, corporation, or cooperative',
      },
    },
    required: ['application', 'businessType', 'legalStructure'],
  },

  async call(args) {
    const profile: PermitProfile = {
      application: coerce(args.application, APPLICATION_VALUES, 'new'),
      businessType: coerce(args.businessType, BUSINESS_TYPE_VALUES, 'other'),
      legalStructure: coerce(args.legalStructure, LEGAL_STRUCTURE_VALUES, 'sole'),
    };

    if (profile.application === 'renewal') {
      return {
        status: 'renewal_not_available',
        message:
          'Business permit renewals run January 1–20 each year. The in-app ' +
          'renewal walkthrough is coming soon — please confirm with BPLO.',
        steps: [],
      };
    }

    const steps = filterSteps(profile);
    const totals = computeTotals(steps);

    return {
      status: 'ok',
      profile,
      totalSteps: steps.length,
      estimatedFees: formatEstimatedFees(totals),
      steps: steps.map((step) => ({
        id: step.id,
        order: step.order,
        title: step.title,
        office: step.office,
        fee: step.fee,
        processingTime: step.processingTime,
        isAddOn: isAddOn(step),
        addOnReason: addOnReason(step),
      })),
      // Surface a navigable destination so the chat renders a tap-to-open button
      // (opening the permit screen pre-seeded with this profile) without relying
      // on the model to separately call route_to_service.
      available: true,
      serviceId: 'permit',
      service: 'Business Permit walkthrough',
      route: Routes.PERMIT,
      params: { profile: JSON.stringify(profile) },
    };
  },
};
