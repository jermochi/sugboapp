/**
 * get_permit_step — grounded detail for one Cebu City permit step.
 *
 * Lets Giya answer pinpoint questions ("what do I need for the fire safety
 * cert?", "asa ang BFP?", "pila ang bayad sa zoning?") by returning the exact
 * fields from permit_steps.json for a single stepId. Returns unknown_step
 * rather than guessing when the id isn't in the data.
 */

import type { AIFunctionHandler } from '@/core/ai-contract';

import { permitRepository } from '../data/permitRepository';

export const getPermitStepHandler: AIFunctionHandler = {
  name: 'get_permit_step',

  description:
    'Get full detail (office, address, requirements, fee, processing time, ' +
    'notes) for a single Cebu City business-permit step by its stepId, as ' +
    'returned in get_permit_path results (e.g. "fire", "zoning", "bplo").',

  parameters: {
    type: 'object',
    properties: {
      stepId: {
        type: 'string',
        description: 'The id of the step, e.g. "barangay", "sanitary", "treasury".',
      },
    },
    required: ['stepId'],
  },

  async call(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const stepId = String(args.stepId ?? '');
    const data = await permitRepository.load();
    const step = data.steps.find((s) => s.id === stepId);

    if (!step) {
      return { status: 'unknown_step', stepId };
    }

    return { status: 'ok', step };
  },
};
