/**
 * permitPath — pure functions over the permit steps. The single source of
 * truth shared by the screen and the get_permit_path handler, so the in-chat
 * path and the on-screen roadmap can never disagree.
 */
import type { PermitProfile, PermitStep } from '@/core/models/permit';
import { permitSteps } from '../data';

/**
 * Steps visible for a profile: included when the step has no condition, or when
 * every key in its condition matches the profile. Sorted ascending by `order`.
 */
export function filterSteps(profile: PermitProfile): PermitStep[] {
  return permitSteps
    .filter((step) => matchesProfile(step, profile))
    .sort((a, b) => a.order - b.order);
}

function matchesProfile(step: PermitStep, profile: PermitProfile): boolean {
  if (step.condition === null) {
    return true;
  }
  const profileRecord = profile as unknown as Record<string, string | undefined>;
  return Object.entries(step.condition).every(
    ([key, value]) => profileRecord[key] === value,
  );
}

/**
 * A step is a tagged "add-on" when its inclusion is driven by the business type
 * (food, bar) rather than the legal structure. The DTI/SEC/CDA prerequisite is
 * legal-structure-conditioned and stays part of the backbone (not tagged).
 */
export function isAddOn(step: PermitStep): boolean {
  if (step.condition === null) {
    return false;
  }
  return Object.keys(step.condition).some((key) => key !== 'legalStructure');
}

/** Human reason a tagged add-on appears, derived from the matched condition. */
export function addOnReason(step: PermitStep): string | null {
  if (!isAddOn(step) || step.condition === null) {
    return null;
  }
  const businessType = step.condition.businessType;
  if (businessType === 'food') {
    return 'Because you chose a food business';
  }
  if (businessType === 'bar') {
    return 'Because you chose a bar / videoke';
  }
  return businessType ? `Because you chose ${businessType}` : null;
}

/**
 * Parse a fee string into a peso range. Handles "₱200–₱2,000", "₱100 per
 * employee", and "None"; returns null for non-numeric fees like "Varies by
 * capitalization" or "Based on BPLO assessment".
 */
export function parseFee(fee: string): { min: number; max: number } | null {
  if (fee.toLowerCase().includes('none')) {
    return { min: 0, max: 0 };
  }
  const numbers = fee.replace(/,/g, '').match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length === 0) {
    return null;
  }
  const values = numbers.map(Number);
  return { min: Math.min(...values), max: Math.max(...values) };
}

export interface PermitTotals {
  /** Sum of the low end of every parseable fee, in pesos. */
  feeMin: number;
  /** Sum of the high end of every parseable fee, in pesos. */
  feeMax: number;
  /** True when at least one step's fee could not be parsed to a number. */
  hasVariableFees: boolean;
  /** Number of steps in the path. */
  stepCount: number;
}

/** Aggregate the fee range across the visible steps for the roadmap header. */
export function computeTotals(steps: PermitStep[]): PermitTotals {
  let feeMin = 0;
  let feeMax = 0;
  let hasVariableFees = false;

  for (const step of steps) {
    const parsed = parseFee(step.fee);
    if (!parsed) {
      hasVariableFees = true;
      continue;
    }
    feeMin += parsed.min;
    feeMax += parsed.max;
  }

  return { feeMin, feeMax, hasVariableFees, stepCount: steps.length };
}

/** Format the estimated total fee range for display (used by screen + handler). */
export function formatEstimatedFees(totals: PermitTotals): string {
  const range = `₱${totals.feeMin.toLocaleString()}–₱${totals.feeMax.toLocaleString()}`;
  return totals.hasVariableFees ? `${range}+ (some fees vary)` : range;
}
