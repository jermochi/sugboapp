/**
 * get_permit_path — Giya's grounded tool for the Cebu City business-permit
 * roadmap. Given a (possibly partial) business profile, it returns the ordered
 * list of steps that actually apply, computed from permit_steps.json.
 *
 * GROUNDING RULE: every field returned comes straight from the JSON via
 * computePath — no fabricated steps, fees, or offices. When the profile is
 * incomplete, `pendingProfileFields` tells Giya exactly what to ask next.
 */

import type { AIFunctionHandler } from '@/core/ai-contract';
import type { PermitProfile } from '@/core/models';

import { permitRepository } from '../data/permitRepository';
import { computePath } from '../domain/permitPath';

/** Domain instructions appended to Giya's system prompt while permits are wired. */
export const PERMIT_PROMPT_FRAGMENT = `# Business permit help (Cebu City)
You can now actively HELP residents apply for or renew a Cebu City business permit — not just route them. Use the permit tools below; never recite steps, fees, or offices from memory.
- Gather the profile conversationally, asking ONLY for what's still missing: application (new or renewal), legalStructure (sole, corporation, or cooperative), and businessType (sari-sari, food, services, bar, or other).
- Call get_permit_path with whatever you know so far. If it returns pendingProfileFields, ask the user for exactly those fields, then call it again before presenting a list.
- Present the returned steps in order, in the user's language, with the fee, office, and processing time for each. Use a step's appliesBecause to explain why a conditional step applies (e.g. health cards because it's a food business).
- For a pinpoint question about one step (requirements, exact fee, office address), call get_permit_step with its stepId.
- Only state fees, steps, requirements, and offices returned by these tools. If asked for something the data doesn't cover (e.g. an online portal link or current queue time), say it isn't available here and offer to open the full walkthrough via route_to_service('permit').`;

const PROFILE_ENUMS = {
  application: ['new', 'renewal'],
  legalStructure: ['sole', 'corporation', 'cooperative'],
  businessType: ['sari-sari', 'food', 'services', 'bar', 'other'],
} as const;

/** Pick only the known profile keys from loosely-typed tool args. */
function readProfile(args: Record<string, unknown>): Partial<PermitProfile> {
  const profile: Partial<PermitProfile> = {};
  for (const key of Object.keys(PROFILE_ENUMS) as (keyof typeof PROFILE_ENUMS)[]) {
    const value = args[key];
    if (typeof value === 'string' && (PROFILE_ENUMS[key] as readonly string[]).includes(value)) {
      // Each enum is the exact value-union for its field.
      (profile as Record<string, string>)[key] = value;
    }
  }
  return profile;
}

export const getPermitPathHandler: AIFunctionHandler = {
  name: 'get_permit_path',

  description:
    'Get the ordered Cebu City business-permit steps that apply to a business ' +
    'profile. Pass whatever profile fields you know (all optional). If the ' +
    'result has pendingProfileFields, ask the user for those, then call again.',

  promptFragment: PERMIT_PROMPT_FRAGMENT,

  parameters: {
    type: 'object',
    properties: {
      application: {
        type: 'string',
        enum: PROFILE_ENUMS.application,
        description: 'Whether this is a new permit or a renewal.',
      },
      legalStructure: {
        type: 'string',
        enum: PROFILE_ENUMS.legalStructure,
        description: 'The business legal structure (drives the registration step).',
      },
      businessType: {
        type: 'string',
        enum: PROFILE_ENUMS.businessType,
        description: 'The kind of business (drives conditional health/STD steps).',
      },
    },
    required: [],
  },

  async call(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const data = await permitRepository.load();
    const result = computePath(data, readProfile(args));
    return { status: 'ok', ...result };
  },
};
