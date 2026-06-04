/**
 * query_budget — Giya's grounded tool for the Cebu City budget.
 *
 * It answers "how much goes to X?" straight from the budget-overview data the
 * Transparency screen renders, so chat figures match the on-screen donut /
 * allocation overview exactly. On a real answer it also returns a `link` the
 * chat surfaces as a tappable button to the full breakdown — it never navigates
 * on its own.
 *
 * GROUNDING RULE: every amount/share returned comes from budget-overview.json
 * via queryBudget — never fabricated.
 */

import type { AIFunctionHandler } from '@/core/ai-contract';

import { budgetOverviews } from '../data';
import { queryBudget } from '../domain/budgetQuery';

/** Domain instructions appended to Giya's system prompt while this is wired. */
export const TRANSPARENCY_PROMPT_FRAGMENT = `# City budget help (Transparency Tracker)
You can answer questions about the Cebu City budget using the query_budget tool — figures come from the same data the Transparency screen shows, so never recite budget numbers from memory.
- When a resident asks about the city budget, where the money goes, the total, or a specific sector's allocation, call query_budget. Pass \`sector\` with the name they used (e.g. "social services", "health", "MOOE") when they name one; omit it to get the full breakdown.
- Answer in the user's language with the exact peso amount and its share of the total (e.g. "₱3.96 billion, mga 29.4% sa tibuok badyet"). Keep it short.
- Only state amounts and shares returned by the tool. If the result has availableSectors (no match), ask the user which of those sectors they meant — do not guess a figure.
- After a successful answer the app automatically shows a tappable button linking to the full breakdown in the Transparency Tracker, so you do NOT need to call route_to_service or offer the link in words — just give the numbers.`;

export const queryBudgetHandler: AIFunctionHandler = {
  name: 'query_budget',

  description:
    'Get Cebu City budget figures (total and per-sector amounts with their ' +
    'share of the total) from the official budget overview. Pass a sector name ' +
    'to focus on one allocation, or omit it for the full breakdown.',

  promptFragment: TRANSPARENCY_PROMPT_FRAGMENT,

  parameters: {
    type: 'object',
    properties: {
      sector: {
        type: 'string',
        description:
          'Free-text sector/allocation name to look up, e.g. "social ' +
          'services", "health", "MOOE", "capital outlay". Omit for the total ' +
          'and full sector breakdown.',
      },
      year: {
        type: 'string',
        description: 'Budget year, e.g. "2026". Defaults to the latest available.',
      },
    },
    required: [],
  },

  async call(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const sector = typeof args.sector === 'string' ? args.sector : undefined;
    const year = typeof args.year === 'string' ? args.year : undefined;
    const result = queryBudget(budgetOverviews, { sector, year });

    // Only offer the "view breakdown" deep-link on an actual budget answer —
    // not on a no-match clarification or a missing overview.
    if (result.status === 'ok' && result.sectors && result.sectors.length > 0) {
      return {
        ...result,
        link: {
          label: result.year
            ? `View the ${result.year} budget breakdown`
            : 'View the full budget breakdown',
          serviceId: 'transparency',
          params: { section: 'annual-budget' },
          icon: 'budget',
        },
      };
    }

    return { ...result };
  },
};
