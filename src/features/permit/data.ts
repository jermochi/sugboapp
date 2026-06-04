/**
 * Permit data — loads the bundled permit_steps.json and exposes typed steps,
 * plus the intake chip configuration that drives the wizard.
 */
import permitStepsJson from '@/../assets/data/permit_steps.json';
import type { PermitData, PermitStep } from '@/core/models/permit';

const data = permitStepsJson as PermitData;

/** All permit steps from the bundled JSON, sorted by their `order`. */
export const permitSteps: PermitStep[] = [...data.steps].sort(
  (a, b) => a.order - b.order,
);

/** One selectable chip option in the intake wizard. */
export interface IntakeOption {
  value: string;
  label: string;
  hint?: string;
}

/** One question in the intake wizard. */
export interface IntakeQuestion {
  /** Maps to a PermitProfile field. */
  key: 'application' | 'businessType' | 'legalStructure';
  prompt: string;
  options: IntakeOption[];
}

/**
 * The intake questions, in order. The `size`/capitalization dimension from the
 * model is intentionally omitted — no step in the JSON is conditioned on it.
 */
export const intakeQuestions: IntakeQuestion[] = [
  {
    key: 'application',
    prompt: 'Are you applying for a new permit or renewing?',
    options: [
      { value: 'new', label: 'New business', hint: 'First-time permit' },
      { value: 'renewal', label: 'Renewal', hint: 'Renewing an existing permit' },
    ],
  },
  {
    key: 'businessType',
    prompt: 'What kind of business is it?',
    options: [
      { value: 'sari-sari', label: 'Sari-sari store' },
      { value: 'food', label: 'Food · Carinderia · Restaurant' },
      { value: 'services', label: 'Services' },
      { value: 'bar', label: 'Bar · Videoke' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'legalStructure',
    prompt: 'How is the business registered?',
    options: [
      { value: 'sole', label: 'Sole proprietor', hint: 'Registers with DTI' },
      { value: 'corporation', label: 'Corporation · Partnership', hint: 'Registers with SEC' },
      { value: 'cooperative', label: 'Cooperative', hint: 'Registers with CDA' },
    ],
  },
];
