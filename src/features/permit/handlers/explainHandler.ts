/**
 * explain — explains one permit step in plain terms, grounded in its JSON data.
 *
 * GROUNDING RULE: returns only data from permit_steps.json — never invents.
 */
import type { AIFunctionHandler } from '@/core/ai-contract';

import { permitSteps } from '../data';
import { addOnReason, isAddOn } from '../domain/permitPath';

const STEP_IDS = permitSteps.map((step) => step.id);

export const explainHandler: AIFunctionHandler = {
  name: 'explain',
  description:
    'Explain a single business-permit step in plain language, grounded in its ' +
    'official details. Call with the step id the user is asking about.',
  parameters: {
    type: 'object',
    properties: {
      stepId: {
        type: 'string',
        enum: STEP_IDS,
        description: 'The permit step to explain.',
      },
    },
    required: ['stepId'],
  },

  async call(args) {
    const stepId = String(args.stepId ?? '');
    const step = permitSteps.find((item) => item.id === stepId);
    if (!step) {
      return { status: 'unknown_step', stepId };
    }
    return {
      status: 'ok',
      id: step.id,
      title: step.title,
      office: step.office,
      address: step.address,
      requirements: step.requirements,
      fee: step.fee,
      processingTime: step.processingTime,
      notes: step.notes,
      why: isAddOn(step) ? addOnReason(step) : 'Required for all businesses.',
    };
  },
};
