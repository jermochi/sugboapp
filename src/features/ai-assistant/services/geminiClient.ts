/**
 * geminiClient — a thin fetch wrapper over the Gemini REST API.
 *
 * We call REST directly (rather than @google/genai) because it has zero Node
 * polyfill needs and runs cleanly in Expo Go. The client is intentionally
 * low-level: it sends one generateContent request and returns the parsed parts.
 * The turn orchestration (function-call loop, dispatch, retries) lives in the
 * chat store.
 */

import { aiFunctionRegistry } from '@/core/ai-contract';
import { GEMINI_MODEL, GIYA_SYSTEM_PROMPT } from '../data/systemPrompt';
import type { AudioPayload } from './audioRecorder';

/** System instruction for the transcription-only pass (no tools, verbatim). */
const TRANSCRIBE_PROMPT =
  "Transcribe the user's spoken audio verbatim. Output ONLY the transcription " +
  'text, in the language actually spoken (Cebuano/Bisaya, Tagalog, or English). ' +
  'Do not translate, add quotes, or comment. If nothing intelligible is heard, ' +
  'output an empty string.';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Whether a key is configured — the UI falls back to keyword routing if not. */
export const isGeminiConfigured = Boolean(API_KEY);

// --- Wire types (subset of the Gemini REST schema we use) -------------------

export interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: {
    name: string;
    response: Record<string, unknown>;
  };
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

/** Parsed result of a single model turn. */
export interface GeminiTurn {
  /** Concatenated text parts, if any. */
  text: string;
  /** Function calls the model requested this turn, if any. */
  functionCalls: GeminiFunctionCall[];
  /** The raw model content, for appending to history on a function-call loop. */
  raw: GeminiContent;
}

/** Build the tools block from every handler registered in the AI registry. */
function buildTools() {
  const declarations = aiFunctionRegistry.getHandlers().map((h) => ({
    name: h.name,
    description: h.description,
    parameters: h.parameters,
  }));
  return declarations.length ? [{ functionDeclarations: declarations }] : undefined;
}

export class GeminiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'GeminiError';
  }
}

/** POST a request body to generateContent and parse the first candidate. */
async function postGenerateContent(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<GeminiTurn> {
  if (!API_KEY) {
    throw new GeminiError('EXPO_PUBLIC_GEMINI_API_KEY is not set.');
  }

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new GeminiError(
      err instanceof Error ? err.message : 'Network request failed',
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new GeminiError(
      `Gemini request failed (${res.status}). ${detail}`.trim(),
      res.status,
    );
  }

  const json = (await res.json()) as {
    candidates?: { content?: GeminiContent }[];
  };

  const content = json.candidates?.[0]?.content;
  const parts = content?.parts ?? [];

  const text = parts
    .map((p) => p.text ?? '')
    .join('')
    .trim();
  const functionCalls = parts
    .filter((p): p is GeminiPart & { functionCall: GeminiFunctionCall } =>
      Boolean(p.functionCall),
    )
    .map((p) => p.functionCall);

  return {
    text,
    functionCalls,
    raw: content ?? { role: 'model', parts },
  };
}

/**
 * Run a routing turn: Giya system prompt + the route_to_service tool.
 * Throws GeminiError on a missing key, network failure, or non-200 response.
 */
export async function generateContent(
  contents: GeminiContent[],
  signal?: AbortSignal,
): Promise<GeminiTurn> {
  return postGenerateContent(
    {
      systemInstruction: { parts: [{ text: GIYA_SYSTEM_PROMPT }] },
      contents,
      tools: buildTools(),
      generationConfig: {
        temperature: 0.4,
        // Thinking budget off (SDD): keep replies fast for a routing task.
        thinkingConfig: { thinkingBudget: 0 },
      },
    },
    signal,
  );
}

/**
 * Generate a plain-text answer under a caller-supplied system instruction, with
 * NO tools. Used by in-context helpers (e.g. the permit helper) that need a
 * grounded explanation rather than routing. Throws GeminiError on failure.
 */
export async function generateGroundedText(
  systemInstruction: string,
  contents: GeminiContent[],
  signal?: AbortSignal,
): Promise<string> {
  const turn = await postGenerateContent(
    {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature: 0.4,
        thinkingConfig: { thinkingBudget: 0 },
      },
    },
    signal,
  );
  return turn.text;
}

/**
 * Transcribe a recorded clip to text (no tools, verbatim, language preserved).
 * Returns '' when nothing intelligible was heard.
 */
export async function transcribeAudio(
  payload: AudioPayload,
  signal?: AbortSignal,
): Promise<string> {
  const turn = await postGenerateContent(
    {
      systemInstruction: { parts: [{ text: TRANSCRIBE_PROMPT }] },
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: payload.mimeType, data: payload.data } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        thinkingConfig: { thinkingBudget: 0 },
      },
    },
    signal,
  );
  return turn.text;
}
