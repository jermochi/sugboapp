/**
 * giyaChatStore — conversation state + turn orchestration for the Giya chat.
 *
 * Two inputs:
 *   - sendText sends a typed message (also used when a user taps a choice chip).
 *   - sendAudio sends a recorded clip; Gemini transcribes and routes it. (No
 *     live captioning — kept simple so the app runs in Expo Go.)
 *
 * Turn flow:
 *   1. The user's message (text, or a voice placeholder) is added.
 *   2. If online + a key is configured, ask Gemini with the registered tools and
 *      loop tool rounds: the model may call ask_clarification (→ render a
 *      question with tappable option chips and stop), or data/route tools whose
 *      results feed back until it replies with text.
 *   3. If Gemini is unavailable or errors, fall back to keyword routing.
 *
 * Giya never navigates automatically: when a destination is relevant a handler
 * surfaces it (a `link` object, or an inline available+serviceId), and the store
 * renders a tappable button. Navigation happens only on tap (followAction →
 * navigateToService), grounded in the core SERVICE_CATALOG.
 */

import { create } from 'zustand';

import { aiFunctionRegistry, navigateToService } from '@/core/ai-contract';
import type { IconName } from '@/core/components';
import { connectivityService } from '@/core/services/connectivityService';

import type { AudioPayload } from '../services/audioRecorder';
import {
  GeminiError,
  generateContent,
  isGeminiConfigured,
  transcribeAudio,
  type GeminiContent,
} from '../services/geminiClient';
import { matchIntent } from '../services/intentFallback';

export type ChatRole = 'user' | 'assistant';

/**
 * A tappable "go there" button surfaced under a reply. A handler opts in by
 * returning either a `link: { label, serviceId, params?, icon? }` (route_to_service,
 * query_budget) or an inline navigable destination (`available` + `serviceId`
 * (+ `service`/`params`), e.g. get_permit_path). The store renders it as a chip
 * and navigates (navigateToService) only when the user taps it.
 */
export interface ChatAction {
  /** Button label, e.g. "View the 2026 budget breakdown". */
  label: string;
  /** A SERVICE_CATALOG serviceId the tap navigates to (via navigateToService). */
  serviceId: string;
  /** Optional route params, e.g. { section: "annual-budget" } or { profile }. */
  params?: Record<string, string>;
  /** Optional leading icon for the chip. */
  icon?: IconName;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  /** True while the assistant reply is still being generated. */
  pending?: boolean;
  /** True if this user message was spoken rather than typed. */
  voice?: boolean;
  /** True while the spoken clip is still being transcribed. */
  transcribing?: boolean;
  /** Tappable clarification choices — tapping one sends it as a user message. */
  options?: string[];
  /** When set, this message renders as a tappable deep-link button. */
  action?: ChatAction;
}

export type ChatStatus = 'idle' | 'thinking';

interface GiyaChatState {
  messages: ChatMessage[];
  status: ChatStatus;
  sendText: (text: string) => Promise<void>;
  sendAudio: (payload: AudioPayload) => Promise<void>;
  followAction: (action: ChatAction) => Promise<void>;
  reset: () => void;
}

/**
 * Pull a tappable destination out of this turn's function responses. Supports
 * two handler shapes:
 *   - an explicit `link: { label, serviceId, params?, icon? }` (route_to_service,
 *     query_budget) — preferred, carries a nice label + icon;
 *   - an inline destination (`available` + `serviceId`, optional `service`/`params`),
 *     e.g. get_permit_path returning the permit screen seeded with the profile.
 * Only surfaces a button when a serviceId is present, so it appears only where a
 * handler deemed it reasonable.
 */
function actionFromResponses(
  responses: { name: string; response: Record<string, unknown> }[],
): ChatAction | null {
  for (const { response } of responses) {
    const link = response.link as Partial<ChatAction> | undefined;
    if (link && typeof link.label === 'string' && typeof link.serviceId === 'string') {
      return {
        label: link.label,
        serviceId: link.serviceId,
        params: link.params,
        icon: link.icon,
      };
    }
    if (response.available && typeof response.serviceId === 'string' && response.serviceId) {
      return {
        label: String(response.service ?? 'Open'),
        serviceId: response.serviceId,
        params: response.params as Record<string, string> | undefined,
      };
    }
  }
  return null;
}

/** Bilingual canned lines for the offline / no-Gemini fallback path. */
const FALLBACK = {
  linked: (service: string) =>
    `Ania ang link sa ${service} para nimo — i-tap lang. · Here's the link to ${service} — just tap it.`,
  comingSoon: (service: string) =>
    `Pasensya, wala pa andam ang ${service} — hapit na ni! · ${service} isn't ready yet — coming soon!`,
  clarify:
    'Aron matabangan tika, unsa gyud imong kinahanglan? · Tell me a bit more about what you need.',
  tapToOpen: (service: string) =>
    `I-tap ang button sa ubos para ablihan ang ${service}. · Tap the button below to open ${service}.`,
  voiceOffline:
    "Kinahanglan ko og koneksyon para madungog ang voice. Palihug i-type lang sa karon. · I need a connection to understand voice — please type for now.",
  voiceUnclear:
    "Pasensya, wala nako nadungog og klaro. Palihug sulayi pag-usab o i-type. · Sorry, I didn't catch that — please try again or type it.",
  voiceError:
    'Naglisod ko pag-process sa imong voice. Palihug sulayi pag-usab o i-type. · I had trouble with that voice clip — please try again or type it.',
  error:
    'Naa koy nasugatan nga problema. Palihug sulayi pag-usab. · Something went wrong — please try again.',
};

/** Offline clarify chips — labels chosen so matchIntent resolves them when tapped. */
const FALLBACK_OPTIONS = ['Business permit', 'City budget', 'Emergency hotlines'];

function wantsHotlineData(text: string): boolean {
  return /\b(911|hotline|hotlines|emergency|cdrmmo|cdrrmo|fire|sunog|hospital|medical|ambulance|ambulansya|sotto|chong hua|cebu doctors|cebu city medical)\b/i.test(
    text,
  );
}

function hotlineQueryFor(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('911')) return '911';
  if (lower.includes('cdrmmo') || lower.includes('cdrrmo')) return 'cdrmmo';
  if (lower.includes('fire') || lower.includes('sunog')) return 'fire';
  if (lower.includes('sotto')) return 'sotto';
  if (lower.includes('chong hua')) return 'chong hua';
  if (lower.includes('cebu doctors')) return 'cebu doctors';
  if (lower.includes('cebu city medical')) return 'cebu city medical';
  if (
    lower.includes('hospital') ||
    lower.includes('medical') ||
    lower.includes('ambulance') ||
    lower.includes('ambulansya')
  ) {
    return 'hospital';
  }
  if (lower.includes('hotline') || lower.includes('emergency')) return '';
  return text;
}

function formatHotlineMatches(result: Record<string, unknown>): string {
  const matches = Array.isArray(result.matches) ? result.matches : [];
  if (matches.length === 0) {
    return 'Wala koy nakit-an nga hotline sa offline list. I-tap ang Emergency Services link para tan-awon ang saved directory. · I could not find that hotline in the offline list. Tap Emergency Services to view the saved directory.';
  }

  const lines = matches.slice(0, 6).map((item) => {
    const match = item as {
      name?: unknown;
      number?: unknown;
      label?: unknown;
    };
    const label = match.label ? ` (${String(match.label)})` : '';
    return `- ${String(match.name)}${label}: ${String(match.number)}`;
  });

  return `Here are the saved emergency hotlines:\n${lines.join('\n')}`;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `m${Date.now()}_${idCounter}`;
}

/** Build the Gemini history from finalized messages (excludes pending bubbles). */
function toContents(messages: ChatMessage[]): GeminiContent[] {
  return messages
    .filter((m) => !m.pending && m.text.length > 0)
    .map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.text }],
    }));
}

export const useGiyaChatStore = create<GiyaChatState>((set, get) => {
  /** Replace the trailing pending assistant bubble with a final reply. */
  function resolveAssistant(
    pendingId: string,
    text: string,
    extra?: { options?: string[] },
  ) {
    set((s) => ({
      status: 'idle',
      messages: s.messages.map((m) =>
        m.id === pendingId
          ? { ...m, text, pending: false, options: extra?.options }
          : m,
      ),
    }));
  }

  /** Fill in a voice bubble's transcript and clear its transcribing state. */
  function finalizeVoiceBubble(id: string, text: string) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, text, transcribing: false } : m,
      ),
    }));
  }

  /** Append a standalone finalized assistant message (for voice edge cases). */
  function pushAssistant(text: string) {
    set((s) => ({
      status: 'idle',
      messages: [...s.messages, { id: nextId(), role: 'assistant', text }],
    }));
  }

  /** Append a button-styled deep-link message after the assistant's reply. */
  function appendAction(action: ChatAction) {
    set((s) => ({
      messages: [...s.messages, { id: nextId(), role: 'assistant', text: '', action }],
    }));
  }

  /** Gemini path: loop tool rounds → clarify chips OR a tap-to-open button. */
  async function runGemini(
    contents: GeminiContent[],
    pendingId: string,
    userText: string,
    voice: boolean,
  ) {
    try {
      const working = [...contents];
      let pendingAction: ChatAction | null = null;
      let turn = await generateContent(working);

      // The model may take several tool rounds before it replies with text
      // (e.g. ask one field per turn, then get_permit_path, then a route link).
      // Loop until it stops calling functions; the round cap guards runaways.
      for (let round = 0; turn.functionCalls.length > 0 && round < 6; round += 1) {
        // Unsure → the model asks with tappable options. Render the question +
        // chips as the final bubble and stop the turn here.
        const clarify = turn.functionCalls.find((fc) => fc.name === 'ask_clarification');
        if (clarify) {
          const question = String(clarify.args.question ?? '') || FALLBACK.clarify;
          const options = Array.isArray(clarify.args.options)
            ? clarify.args.options.map((o) => String(o)).filter((o) => o.length > 0)
            : [];
          resolveAssistant(pendingId, question, { options });
          return;
        }

        working.push(turn.raw);
        const responses = await Promise.all(
          turn.functionCalls.map(async (fc) => {
            let response: Record<string, unknown>;
            try {
              response = await aiFunctionRegistry.dispatch(fc.name, fc.args);
            } catch (err) {
              response = {
                status: 'error',
                error: err instanceof Error ? err.message : 'dispatch failed',
              };
            }
            return { name: fc.name, response };
          }),
        );
        // A handler may surface a tappable destination for the reply.
        const found = actionFromResponses(responses);
        if (found) pendingAction = found;
        working.push({
          role: 'user',
          parts: responses.map((r) => ({ functionResponse: r })),
        });
        turn = await generateContent(working);
      }

      // If the model ended with no text but we captured a destination, prefer a
      // "tap the button" line over the opener clarify prompt.
      const text =
        turn.text ||
        (pendingAction ? FALLBACK.tapToOpen(pendingAction.label) : FALLBACK.clarify);
      resolveAssistant(pendingId, text);
      if (pendingAction) appendAction(pendingAction);
    } catch (err) {
      if (__DEV__ && err instanceof GeminiError) {
        console.warn('[Giya] Gemini turn failed:', err.message);
      }
      await runFallback(pendingId, userText, voice);
    }
  }

  /** Offline / no-key / error path: keyword match → link button, else clarify chips. */
  async function runFallback(pendingId: string, userText: string, voice: boolean) {
    // Voice carries no text we can keyword-match offline.
    if (voice && !userText) {
      resolveAssistant(pendingId, FALLBACK.voiceOffline);
      return;
    }
    if (
      userText &&
      wantsHotlineData(userText) &&
      aiFunctionRegistry.has('query_hotlines')
    ) {
      try {
        const result = await aiFunctionRegistry.dispatch('query_hotlines', {
          query: hotlineQueryFor(userText),
          limit: 6,
        });
        resolveAssistant(pendingId, formatHotlineMatches(result));
        const action = actionFromResponses([
          { name: 'query_hotlines', response: result },
        ]);
        if (action) appendAction(action);
        return;
      } catch {
        // Fall through to service routing if hotline lookup is unavailable.
      }
    }
    const serviceId = userText ? matchIntent(userText) : null;
    if (!serviceId) {
      resolveAssistant(pendingId, FALLBACK.clarify, { options: FALLBACK_OPTIONS });
      return;
    }
    try {
      const result = await aiFunctionRegistry.dispatch('route_to_service', {
        serviceId,
      });
      const service = String(result.service ?? serviceId);
      if (result.available) {
        // Surface the link button instead of navigating — same as the online path.
        resolveAssistant(pendingId, FALLBACK.linked(service));
        const action = actionFromResponses([
          { name: 'route_to_service', response: result },
        ]);
        if (action) appendAction(action);
      } else {
        resolveAssistant(pendingId, FALLBACK.comingSoon(service));
      }
    } catch {
      resolveAssistant(pendingId, FALLBACK.error);
    }
  }

  /** Append a pending assistant bubble and run the turn. */
  async function execute(
    contents: GeminiContent[],
    userText: string,
    voice: boolean,
  ) {
    const pendingId = nextId();
    set((s) => ({
      status: 'thinking',
      messages: [
        ...s.messages,
        { id: pendingId, role: 'assistant', text: '', pending: true },
      ],
    }));

    if (connectivityService.isOnline && isGeminiConfigured) {
      await runGemini(contents, pendingId, userText, voice);
    } else {
      await runFallback(pendingId, userText, voice);
    }
  }

  return {
    messages: [],
    status: 'idle',

    async sendText(text: string) {
      const trimmed = text.trim();
      if (!trimmed || get().status !== 'idle') return;

      const history = get().messages;
      set({
        messages: [...history, { id: nextId(), role: 'user', text: trimmed }],
      });

      const contents: GeminiContent[] = [
        ...toContents(history),
        { role: 'user', parts: [{ text: trimmed }] },
      ];
      await execute(contents, trimmed, false);
    },

    async sendAudio(payload: AudioPayload) {
      if (get().status !== 'idle') return;

      // Show the spoken bubble immediately with a transcribing indicator.
      const voiceId = nextId();
      set((s) => ({
        messages: [
          ...s.messages,
          { id: voiceId, role: 'user', text: '', voice: true, transcribing: true },
        ],
      }));

      // Transcription needs the network; offline can't recover the words.
      if (!connectivityService.isOnline || !isGeminiConfigured) {
        finalizeVoiceBubble(voiceId, '🎙️ Voice message');
        pushAssistant(FALLBACK.voiceOffline);
        return;
      }

      let transcript: string;
      try {
        transcript = (await transcribeAudio(payload)).trim();
      } catch (err) {
        if (__DEV__ && err instanceof GeminiError) {
          console.warn('[Giya] transcription failed:', err.message);
        }
        finalizeVoiceBubble(voiceId, '🎙️ Voice message');
        pushAssistant(FALLBACK.voiceError);
        return;
      }

      if (!transcript) {
        finalizeVoiceBubble(voiceId, '🎙️ …');
        pushAssistant(FALLBACK.voiceUnclear);
        return;
      }

      // Show what was heard, then route it exactly like a typed message.
      finalizeVoiceBubble(voiceId, transcript);
      await execute(toContents(get().messages), transcript, true);
    },

    async followAction(action: ChatAction) {
      // The only place navigation actually happens — when the user taps a link.
      navigateToService(action.serviceId, action.params);
    },

    reset() {
      set({ messages: [], status: 'idle' });
    },
  };
});
