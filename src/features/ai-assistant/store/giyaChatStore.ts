/**
 * giyaChatStore — conversation state + turn orchestration for the Giya chat.
 *
 * Two inputs, one routing turn:
 *   - sendText sends a typed message.
 *   - sendAudio sends a recorded clip; Gemini transcribes and routes it. (No
 *     live captioning — kept simple so the app runs in Expo Go.)
 *
 * Turn flow:
 *   1. The user's message (text, or a voice placeholder) is added.
 *   2. If online + a key is configured, ask Gemini with the registered tools.
 *      If the model calls one, dispatch through the registry, feed the result
 *      back, and let the model reply in the user's own language.
 *   3. If Gemini is unavailable or errors, fall back to keyword routing.
 *
 * Giya never navigates the user automatically: when a destination is relevant a
 * handler returns a `link`, which is surfaced as a tappable button. Actual
 * navigation happens only on tap (followAction → navigateToService), grounded
 * in the core SERVICE_CATALOG — the store never invents a destination.
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
 * A tappable "go deeper" link surfaced as its own button-styled message. A
 * handler emits this (via a `link` field on its response) when it can point the
 * user at the exact place in-app for more on their query; the store renders it
 * as a chip and navigates (navigateToService) only when the user taps it.
 */
export interface ChatAction {
  /** Button label, e.g. "View the 2026 budget breakdown". */
  label: string;
  /** A SERVICE_CATALOG serviceId the tap navigates to (via navigateToService). */
  serviceId: string;
  /** Optional route params, e.g. { section: "annual-budget" }. */
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
 * Pull a deep-link action out of this turn's function responses. A handler
 * opts in by returning a `link: { label, serviceId, params?, icon? }`; we only
 * surface a button when those required fields are present (so it appears only
 * where the handler deemed it reasonable — e.g. a real budget answer).
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
    'Aron matabangan tika, unsa gyud imong kinahanglan? Pananglitan: business permit, hotlines, o budget. · Tell me a bit more — e.g. business permit, hotlines, or budget.',
  voiceOffline:
    "Kinahanglan ko og koneksyon para madungog ang voice. Palihug i-type lang sa karon. · I need a connection to understand voice — please type for now.",
  voiceUnclear:
    "Pasensya, wala nako nadungog og klaro. Palihug sulayi pag-usab o i-type. · Sorry, I didn't catch that — please try again or type it.",
  voiceError:
    'Naglisod ko pag-process sa imong voice. Palihug sulayi pag-usab o i-type. · I had trouble with that voice clip — please try again or type it.',
  error:
    'Naa koy nasugatan nga problema. Palihug sulayi pag-usab. · Something went wrong — please try again.',
};

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
  function resolveAssistant(pendingId: string, text: string) {
    set((s) => ({
      status: 'idle',
      messages: s.messages.map((m) =>
        m.id === pendingId ? { ...m, text, pending: false } : m,
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

  /** Gemini path: tool call → dispatch → confirmation, with fallback on error. */
  async function runGemini(
    contents: GeminiContent[],
    pendingId: string,
    userText: string,
    voice: boolean,
  ) {
    try {
      let turn = await generateContent(contents);
      const working = [...contents];
      let pendingAction: ChatAction | null = null;

      if (turn.functionCalls.length > 0) {
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
        // A handler may attach a deep-link the user can tap for more detail.
        pendingAction = actionFromResponses(responses);
        working.push({
          role: 'user',
          parts: responses.map((r) => ({ functionResponse: r })),
        });
        turn = await generateContent(working);
      }

      resolveAssistant(pendingId, turn.text || FALLBACK.clarify);
      if (pendingAction) appendAction(pendingAction);
    } catch (err) {
      if (__DEV__ && err instanceof GeminiError) {
        console.warn('[Giya] Gemini turn failed:', err.message);
      }
      await runFallback(pendingId, userText, voice);
    }
  }

  /** Offline / no-key / error path: keyword match → dispatch → canned line. */
  async function runFallback(pendingId: string, userText: string, voice: boolean) {
    // Voice carries no text we can keyword-match offline.
    if (voice && !userText) {
      resolveAssistant(pendingId, FALLBACK.voiceOffline);
      return;
    }
    const serviceId = userText ? matchIntent(userText) : null;
    if (!serviceId) {
      resolveAssistant(pendingId, FALLBACK.clarify);
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
