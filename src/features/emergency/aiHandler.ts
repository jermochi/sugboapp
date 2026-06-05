import type { AIFunctionHandler } from '@/core/ai-contract';
import type { Contact, HotlineCategory } from '@/core/models';

import { emergencyHotlineData } from './data';

interface HotlineMatch {
  category: string;
  name: string;
  number: string;
  label?: string;
}

const BROAD_QUERIES = new Set([
  '',
  'hotline',
  'hotlines',
  'emergency',
  'emergency hotline',
  'emergency hotlines',
]);

function normalizeText(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeQuery(value: unknown): string {
  const query = normalizeText(value);
  return BROAD_QUERIES.has(query) ? '' : query;
}

function contactText(contact: Contact, category: HotlineCategory): string {
  return `${category.id} ${category.name} ${contact.name} ${contact.label ?? ''} ${contact.number}`.toLowerCase();
}

function matchesPrimary(query: string): boolean {
  if (!emergencyHotlineData.primary) return false;
  const primary = emergencyHotlineData.primary;
  const text =
    `${primary.name} ${primary.label ?? ''} ${primary.number} 911 emergency police`.toLowerCase();
  return !query || text.includes(query);
}

function matchesCategory(category: HotlineCategory, categoryId: string): boolean {
  if (!categoryId) return true;
  if (category.id === categoryId) return true;
  return categoryId === 'cdrrmo' && category.id === 'cdrmmo';
}

export function queryHotlines(
  args: Record<string, unknown>,
): Record<string, unknown> {
  const query = normalizeQuery(args.query);
  const categoryId = normalizeText(args.categoryId);
  const limit = Math.max(1, Math.min(Number(args.limit ?? 8) || 8, 12));
  const matches: HotlineMatch[] = [];

  if (matchesPrimary(query)) {
    const primary = emergencyHotlineData.primary;
    if (primary) {
      matches.push({
        category: 'Emergency',
        name: primary.name,
        number: primary.number,
        label: primary.label,
      });
    }
  }

  for (const category of emergencyHotlineData.categories) {
    if (!matchesCategory(category, categoryId)) continue;

    for (const contact of category.contacts) {
      if (query && !contactText(contact, category).includes(query)) continue;
      matches.push({
        category: category.name,
        name: contact.name,
        number: contact.number,
        label: contact.label,
      });
    }
  }

  const limited = matches.slice(0, limit);

  return {
    status: limited.length > 0 ? 'ok' : 'not_found',
    source: 'bundled_hotlines_json',
    count: limited.length,
    matches: limited,
    link: {
      label: 'Open Emergency Services',
      serviceId: 'emergency',
      icon: 'hotline',
    },
  };
}

export const queryHotlinesHandler: AIFunctionHandler = {
  name: 'query_hotlines',
  description:
    'Return emergency hotline numbers from the bundled offline hotline directory. ' +
    'Use this for questions asking for emergency, CDRMMO, hospital, medical, fire, or 911 numbers. ' +
    'Never invent numbers; only answer from the returned matches.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Search term such as "911", "cdrmmo", "hospital", "fire", "cebu city medical", or "sotto". Leave blank for all hotlines.',
      },
      categoryId: {
        type: 'string',
        enum: ['cdrmmo', 'medical', 'fire'],
        description: 'Optional category filter.',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of hotline matches to return.',
      },
    },
  },
  promptFragment: `# Emergency hotline rules
- If the user asks for emergency, CDRMMO, hospital, medical, fire, ambulance, or 911 phone numbers, call query_hotlines.
- Answer only with the hotline numbers returned by query_hotlines. Never invent, reformat, or add unsourced numbers.
- Keep hotline answers concise. If several matches are returned, list the most relevant names and numbers, then mention the Emergency Services link below.`,
  async call(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    return queryHotlines(args);
  },
};

export function registerEmergencyHandlers(registry: {
  has(name: string): boolean;
  register(handler: AIFunctionHandler): void;
}): void {
  if (!registry.has(queryHotlinesHandler.name)) {
    registry.register(queryHotlinesHandler);
  }
}
