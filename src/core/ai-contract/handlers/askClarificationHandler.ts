/**
 * ask_clarification — a UI interaction primitive (not feature data).
 *
 * The model calls this when a request is vague or could map to more than one
 * service: it supplies ONE short question plus 2–4 tappable answer options. The
 * chat store renders the question as the assistant bubble with the options as
 * tappable chips; the handler itself has no side-effect and just echoes the args.
 */
import type { AIFunctionHandler } from '../types';

export const askClarificationHandler: AIFunctionHandler = {
  name: 'ask_clarification',

  description:
    'Ask the user ONE short clarifying question with 2–4 tappable answer options, ' +
    'when their request is vague or could map to more than one service. Prefer ' +
    'this over a free-text question. Do NOT call route_to_service in the same turn.',

  parameters: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 'One short question, in the user’s language.',
      },
      options: {
        type: 'array',
        items: { type: 'string' },
        description: '2–4 short tappable answer labels, in the user’s language.',
      },
    },
    required: ['question', 'options'],
  },

  async call(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const options = Array.isArray(args.options)
      ? args.options.map((o) => String(o)).filter((o) => o.length > 0)
      : [];
    return {
      status: 'ok',
      question: String(args.question ?? ''),
      options,
    };
  },
};
