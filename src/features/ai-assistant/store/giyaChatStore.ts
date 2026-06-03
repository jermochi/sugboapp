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
 *   2. If online + a key is configured, ask Gemini with the route_to_service
 *      tool. If the model calls it, dispatch through the registry (which
 *      navigates), feed the result back, and let the model confirm in the
 *      user's own language.
 *   3. If Gemini is unavailable or errors, fall back to keyword routing.
 *
 * Navigation only ever happens via the route_to_service handler, grounded in
 * the core SERVICE_CATALOG — the store never invents a destination.
 */

import { create } from 'zustand';

import { aiFunctionRegistry } from '@/core/ai-contract';
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
}

export type ChatStatus = 'idle' | 'thinking';

interface GiyaChatState {
  messages: ChatMessage[];
  status: ChatStatus;
  sendText: (text: string) => Promise<void>;
  sendAudio: (payload: AudioPayload) => Promise<void>;
  reset: () => void;
}

/** Bilingual canned lines for the offline / no-Gemini fallback path. */
const FALLBACK = {
  navigated: (service: string) =>
    `Sige! Giablihan nako ang ${service} para nimo. · Opening ${service} for you.`,
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
        working.push({
          role: 'user',
          parts: responses.map((r) => ({ functionResponse: r })),
        });
        turn = await generateContent(working);
      }

      resolveAssistant(pendingId, turn.text || FALLBACK.clarify);
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
      resolveAssistant(
        pendingId,
        result.available
          ? FALLBACK.navigated(service)
          : FALLBACK.comingSoon(service),
      );
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

    reset() {
      set({ messages: [], status: 'idle' });
    },
  };
});
