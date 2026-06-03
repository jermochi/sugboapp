/**
 * intentFallback — a tiny keyword→serviceId router used when Gemini is
 * unavailable (offline, no API key, or a request error).
 *
 * It is deliberately dumb: it scans the message for known terms in Cebuano,
 * Tagalog, and English. A hit routes through the same route_to_service handler
 * the AI uses; a miss yields a clarifying prompt instead of a wrong guess.
 */

/** Ordered so more specific intents win over generic ones. */
const KEYWORD_MAP: { serviceId: string; terms: string[] }[] = [
  {
    serviceId: 'emergency',
    terms: [
      'emergency', 'hotline', 'tabang', 'sunog', 'fire', 'pulis', 'police',
      'ambulance', 'ambulansya', 'hospital', 'ospital', 'medical', 'rescue',
      '911', 'aksidente', 'accident',
    ],
  },
  {
    serviceId: 'permit',
    terms: [
      'permit', 'business', 'negosyo', 'negosyante', 'dti', "mayor's permit",
      'mayors permit', 'tindahan', 'tinda', 'sari-sari',
    ],
  },
  {
    serviceId: 'transparency',
    terms: [
      'budget', 'badyet', 'gasto', 'pondo', 'proyekto', 'project',
      'transparency', 'spending', 'allocation', 'kwarta sa siyudad',
    ],
  },
  {
    serviceId: 'tax',
    terms: ['tax', 'buhis', 'amilyar', 'real property', 'amelyar'],
  },
  {
    serviceId: 'report',
    terms: ['report', 'reklamo', 'sumbong', 'i-report', 'ireport', 'complaint'],
  },
  {
    serviceId: 'documents',
    terms: [
      'birth certificate', 'certificate', 'sertipiko', 'dokumento', 'document',
      'cedula', 'clearance',
    ],
  },
  {
    serviceId: 'news',
    terms: ['news', 'balita', 'announcement', 'advisory', 'pahibalo', 'okasyon', 'event'],
  },
  {
    serviceId: 'booking',
    terms: ['appointment', 'book', 'schedule', 'iskedyul', 'pa-schedule', 'reserba'],
  },
];

/**
 * Returns the best-matching serviceId for a free-text message, or null if
 * nothing matches confidently.
 */
export function matchIntent(text: string): string | null {
  const haystack = ` ${text.toLowerCase()} `;
  for (const { serviceId, terms } of KEYWORD_MAP) {
    if (terms.some((t) => haystack.includes(t))) {
      return serviceId;
    }
  }
  return null;
}
