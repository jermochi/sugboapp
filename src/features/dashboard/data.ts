/**
 * Static content for the "Meet Giya" home screen.
 *
 * Mirrors the design handoff's `SERVICES_V2` / `NEWS_V2`. Copy is in
 * Cebuano/Bisaya and preserved verbatim. In production the service list and
 * news items would come from the backend; the gradient "washes" stand in for
 * real article images.
 */

import type { IconName } from '@/core/components';
import { Routes, type RouteName } from '@/core/routing';

/** A one-word quick-link tile in the "What would you like to do?" grid. */
export interface ServiceQuickLink {
  icon: IconName;
  label: string;
  /** Deep-link target. Undefined until that service screen exists. */
  route?: RouteName;
}

export const SERVICES_V2: ServiceQuickLink[] = [
  { icon: 'tax', label: 'Tax' },
  { icon: 'permit', label: 'Permits', route: Routes.PERMIT },
  { icon: 'report', label: 'Report' },
  { icon: 'medical', label: 'Medical' },
  { icon: 'seniors', label: 'Seniors' },
  { icon: 'document', label: 'Documents' },
  { icon: 'budget', label: 'Budget', route: Routes.TRANSPARENCY },
  { icon: 'calendar', label: 'Book' },
];

/** A Featured-News carousel card. */
export interface NewsItem {
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  /** Two-stop linear gradient (~140°) standing in for the article image. */
  wash: readonly [string, string];
}

export const NEWS_V2: NewsItem[] = [
  {
    wash: ['#8a2b1c', '#c0392b'],
    tag: 'Events',
    date: 'Mayo 29',
    title: 'Sinulog 2027: sayo nga paghan-ay sa ruta',
    excerpt:
      'Gipagawas na sa Sugbo ang draft nga ruta ug schedule alang sa sunod tuig nga selebrasyon.',
  },
  {
    wash: ['#1f6f4a', '#2E7D32'],
    tag: 'Advisory',
    date: 'Mayo 28',
    title: 'Bag-ong iskedyul sa basura sugod Hunyo',
    excerpt:
      'Tan-awa ang bag-ong collection days para sa imong barangay sa dili pa magsugod ang Hunyo.',
  },
  {
    wash: ['#1d4e74', '#2877b0'],
    tag: 'Advisory',
    date: 'Mayo 27',
    title: 'Road rehab sa V. Rama Ave, Hunyo 2–8',
    excerpt:
      'Naay alternroute samtang gipahigayon ang re-blocking — tan-awa ang detour map.',
  },
  {
    wash: ['#6B2E1E', '#DAA520'],
    tag: 'Health',
    date: 'Mayo 26',
    title: 'Libreng medical mission sa 30 ka barangay',
    excerpt:
      'Check-up, tambal, ug konsultasyon nga walay bayad — tan-awa kung kanus-a moabot sa inyoha.',
  },
];
