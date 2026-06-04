/**
 * permitPath — the pure, grounded filter that turns a (possibly partial)
 * business profile into the visible Cebu City permit roadmap.
 *
 * No I/O, no fabrication: it only ever returns steps that exist in
 * permit_steps.json, decided solely by each step's `condition` matcher. This is
 * what keeps Giya honest — the JSON drives the list, not the model.
 */

import type {
  PermitCondition,
  PermitData,
  PermitProfile,
  PermitStep,
} from '@/core/models';

/**
 * How a single step's condition relates to the profile we have so far:
 * - always:   condition is null — shown to everyone (the backbone).
 * - match:    every condition field is present in the profile and equal.
 * - no-match: a condition field is present but disagrees — hide it.
 * - pending:  a condition field hasn't been provided yet — can't decide.
 */
export type Verdict = 'always' | 'match' | 'no-match' | 'pending';

export function evaluate(
  condition: PermitCondition | null,
  profile: Partial<PermitProfile>,
): Verdict {
  if (condition === null) return 'always';

  const lookup = profile as Record<string, string | undefined>;
  let pending = false;

  for (const [key, expected] of Object.entries(condition)) {
    const provided = lookup[key];
    if (provided === undefined) {
      pending = true;
      continue;
    }
    if (provided !== expected) return 'no-match';
  }

  return pending ? 'pending' : 'match';
}

/** One step in the computed roadmap, with the reason it was included. */
export interface PermitPathStep {
  order: number;
  id: string;
  title: string;
  office: string;
  address: string;
  requirements: string[];
  fee: string;
  processingTime: string;
  notes: string;
  /** null for backbone steps; the matched condition for conditional ones. */
  appliesBecause: PermitCondition | null;
}

export interface PermitPathResult {
  /** Backbone + matched conditional steps, sorted by order. */
  steps: PermitPathStep[];
  /**
   * Distinct profile fields referenced by still-undecided conditional steps.
   * Non-empty means Giya should ask for these before presenting a final list.
   */
  pendingProfileFields: string[];
  /** Echo of the profile actually applied, for transparency. */
  profileUsed: Partial<PermitProfile>;
}

function toPathStep(step: PermitStep, verdict: Verdict): PermitPathStep {
  return {
    order: step.order,
    id: step.id,
    title: step.title,
    office: step.office,
    address: step.address,
    requirements: step.requirements,
    fee: step.fee,
    processingTime: step.processingTime,
    notes: step.notes,
    appliesBecause: verdict === 'match' ? step.condition : null,
  };
}

/**
 * Compute the visible roadmap for a (partial) profile. Conditional steps whose
 * deciding field is still missing are NOT included, but their fields surface in
 * `pendingProfileFields` so Giya knows exactly what to ask next.
 */
export function computePath(
  data: PermitData,
  profile: Partial<PermitProfile>,
): PermitPathResult {
  const steps: PermitPathStep[] = [];
  const pending = new Set<string>();

  for (const step of data.steps) {
    const verdict = evaluate(step.condition, profile);
    if (verdict === 'always' || verdict === 'match') {
      steps.push(toPathStep(step, verdict));
    } else if (verdict === 'pending' && step.condition) {
      for (const key of Object.keys(step.condition)) {
        if ((profile as Record<string, unknown>)[key] === undefined) {
          pending.add(key);
        }
      }
    }
  }

  steps.sort((a, b) => a.order - b.order);

  return {
    steps,
    pendingProfileFields: Array.from(pending),
    profileUsed: profile,
  };
}
