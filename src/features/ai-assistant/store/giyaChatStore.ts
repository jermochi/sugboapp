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
 * Routing is grounded in the core SERVICE_CATALOG: route_to_service resolves a
 * destination, the store attaches it to the reply as a tappable button, and
 * navigation happens only when the user taps it — never automatically.
 */

import { create } from 'zustand';

import { aiFunctionRegistry } from '@/core/ai-contract';
import { connectivityService } from '@/core/services/connectivityService';
import type { RouteName } from '@/core/routing';

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

/** A navigable destination surfaced as a tappable button under a reply. */
export interface RouteAction {
  serviceId: string;
  /** Human label for the button text. */
  label: string;
  /** Concrete, navigable route (only set when the service is available). */
  route: RouteName;
  params?: Record<string, string>;
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
  /** A destination the user can open by tapping a button under the reply. */
  routeAction?: RouteAction;
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
  tapToOpen: (service: string) =>
    `I-tap ang button sa ubos para ablihan ang ${service}. · Tap the button below to open ${service}.`,
  ack: 'Naa pa koy ikatabang? · Anything else I can help with?',
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
    extra?: { options?: string[]; routeAction?: RouteAction },
  ) {
    set((s) => ({
      status: 'idle',
      messages: s.messages.map((m) =>
        m.id === pendingId
          ? {
              ...m,
              text,
              pending: false,
              options: extra?.options,
              routeAction: extra?.routeAction,
            }
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

  /** Gemini path: loop tool rounds → clarify chips OR route button, fallback on error. */
  async function runGemini(
    contents: GeminiContent[],
    pendingId: string,
    userText: string,
    voice: boolean,
  ) {
    try {
      const working = [...contents];
      let routeAction: RouteAction | undefined;
      let turn = await generateContent(working);

      // The model may take several tool rounds before it replies with text
      // (e.g. get_permit_path for the roadmap, then route_to_service for the
      // button). Loop until it stops calling functions, capturing any
      // destination along the way; the round cap guards against runaway loops.
      for (let round = 0; turn.functionCalls.length > 0 && round < 6; round += 1) {
        // Unsure → the model asks a question with tappable options. Render the
        // question + chips as the final bubble and stop the turn here.
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
            // Capture a resolved destination so the reply can offer a button.
            if (fc.name === 'route_to_service' && response.available && response.route) {
              routeAction = {
                serviceId: String(response.serviceId ?? ''),
                label: String(response.service ?? ''),
                route: response.route as RouteName,
                params: fc.args.params as Record<string, string> | undefined,
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

      // If the model ended a tool round with no text, prefer a "tap the button"
      // line when we captured a destination — never the opener clarify prompt,
      // which reads oddly after a real exchange.
      const text =
        turn.text || (routeAction ? FALLBACK.tapToOpen(routeAction.label) : FALLBACK.ack);
      resolveAssistant(pendingId, text, { routeAction });
    } catch (err) {
      if (__DEV__ && err instanceof GeminiError) {
        console.warn('[Giya] Gemini turn failed:', err.message);
      }
      await runFallback(pendingId, userText, voice);
    }
  }

  /** Offline / no-key / error path: keyword match → route button, else clarify chips. */
  async function runFallback(pendingId: string, userText: string, voice: boolean) {
    // Voice carries no text we can keyword-match offline.
    if (voice && !userText) {
      resolveAssistant(pendingId, FALLBACK.voiceOffline);
      return;
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
      if (result.available && result.route) {
        resolveAssistant(pendingId, FALLBACK.tapToOpen(service), {
          routeAction: {
            serviceId,
            label: service,
            route: result.route as RouteName,
          },
        });
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

    reset() {
      set({ messages: [], status: 'idle' });
    },
  };
});
