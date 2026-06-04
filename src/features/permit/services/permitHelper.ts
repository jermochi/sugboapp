/**
 * permitHelper — the in-context "?" helper's answer logic.
 *
 * Online: ask Gemini under a permit-specific, grounded system instruction with
 * the relevant step + profile injected as facts. Offline / no key / error: a
 * grounded fallback built straight from the step's own data. Never invents —
 * online answers are constrained to the injected facts.
 */
import type { PermitProfile, PermitStep } from '@/core/models/permit';
import { connectivityService } from '@/core/services/connectivityService';
import {
  generateGroundedText,
  isGeminiConfigured,
  type GeminiContent,
} from '@/features/ai-assistant/services/geminiClient';

import { addOnReason } from '../domain/permitPath';

const SYSTEM_INSTRUCTION = `You are Giya, the helper inside SugboApp's Business Permit walkthrough.
Answer the user's question about THIS permit step using ONLY the facts provided in the message.
- Keep it short and plain — two or three sentences.
- LANGUAGE MIRRORING: reply in the same language the user asked in (Cebuano/Bisaya, Tagalog, or English). Mirror a mix.
- Never invent fees, offices, requirements, or steps beyond the provided facts.
- If the facts don't answer the question, say so briefly and suggest confirming with the office (BPLO).`;

function buildFacts(step: PermitStep | null, profile: PermitProfile): string {
  const profileLine = `Business profile: ${profile.application} application, ${profile.businessType} business, ${profile.legalStructure} legal structure.`;
  if (!step) {
    return profileLine;
  }
  const reason = addOnReason(step) ?? 'Required for all businesses.';
  return [
    profileLine,
    `Step: ${step.title}`,
    `Office: ${step.office} (${step.address})`,
    `Requirements: ${step.requirements.join('; ')}`,
    `Fee: ${step.fee}`,
    `Processing time: ${step.processingTime}`,
    `Notes: ${step.notes}`,
    `Why this step applies: ${reason}`,
  ].join('\n');
}

/** Grounded offline answer assembled from the step's own data. */
export function offlineAnswer(
  step: PermitStep | null,
  profile: PermitProfile,
): string {
  if (!step) {
    return `This walkthrough lists the permit steps for your ${profile.businessType} business. Tap any step to see its requirements, fees, and office.`;
  }
  const reason = addOnReason(step);
  const why = reason ? ` ${reason}.` : ' This step is required for all businesses.';
  return `${step.title}: ${step.notes}${why} Bring: ${step.requirements.join(', ')}. Fee: ${step.fee}. (Offline — confirm final details with ${step.office}.)`;
}

/** Answer a helper question — Gemini when online, grounded fallback otherwise. */
export async function askPermitHelper(
  question: string,
  step: PermitStep | null,
  profile: PermitProfile,
): Promise<string> {
  if (!connectivityService.isOnline || !isGeminiConfigured) {
    return offlineAnswer(step, profile);
  }
  const contents: GeminiContent[] = [
    {
      role: 'user',
      parts: [
        { text: `Facts:\n${buildFacts(step, profile)}\n\nQuestion: ${question}` },
      ],
    },
  ];
  try {
    const text = await generateGroundedText(SYSTEM_INSTRUCTION, contents);
    return text || offlineAnswer(step, profile);
  } catch {
    return offlineAnswer(step, profile);
  }
}
