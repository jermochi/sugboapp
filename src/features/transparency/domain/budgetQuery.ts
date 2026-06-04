/**
 * budgetQuery — the pure, grounded slice behind Giya's query_budget tool.
 *
 * It reads the SAME budget-overview data the Transparency screen renders, so an
 * answer Giya gives in chat matches the on-screen donut / allocation overview
 * exactly. No I/O, no fabrication: every figure returned comes from the passed
 * BudgetOverview[] (assets/data/transparency/budget-overview.json).
 */

import type { BudgetOverview } from '../data';

/** A single sector's grounded numbers, surfaced back to the model. */
export interface BudgetSectorSlice {
  id: string;
  label: string;
  amount: number;
  /** Percentage share of the overview total, as stored in the data. */
  share?: number;
}

export interface BudgetQueryArgs {
  /** Budget year, e.g. "2026". Defaults to the latest available overview. */
  year?: string;
  /** Free-text sector name/id to match (e.g. "social services", "mooe"). */
  sector?: string;
}

export interface BudgetQueryResult {
  status: 'ok' | 'no_overview';
  year?: string;
  title?: string;
  totalAmount?: number | null;
  currency?: string;
  /** Sectors matching the query (all sectors when no `sector` was given). */
  sectors?: BudgetSectorSlice[];
  /**
   * Present only when a `sector` was requested but nothing matched — the full
   * list of real sector labels so Giya can ask which one, never invent.
   */
  availableSectors?: string[];
}

function toSlice(sector: BudgetOverview['sectors'][number]): BudgetSectorSlice {
  return {
    id: sector.id,
    label: sector.label,
    amount: sector.amount,
    share: sector.share,
  };
}

/** Pick the requested year, or the most recent overview by year descending. */
function selectOverview(
  overviews: BudgetOverview[],
  year?: string,
): BudgetOverview | undefined {
  if (year) {
    const match = overviews.find((o) => o.year === year);
    if (match) return match;
  }
  return [...overviews].sort((a, b) => Number(b.year) - Number(a.year))[0];
}

export function queryBudget(
  overviews: BudgetOverview[],
  { year, sector }: BudgetQueryArgs = {},
): BudgetQueryResult {
  const overview = selectOverview(overviews, year);
  if (!overview) return { status: 'no_overview' };

  const base = {
    status: 'ok' as const,
    year: overview.year,
    title: overview.title,
    totalAmount: overview.totalAmount,
    currency: 'PHP',
  };

  if (!sector?.trim()) {
    return { ...base, sectors: overview.sectors.map(toSlice) };
  }

  const needle = sector.trim().toLowerCase();
  const matches = overview.sectors.filter(
    (s) =>
      s.id.toLowerCase().includes(needle) ||
      s.label.toLowerCase().includes(needle),
  );

  if (matches.length === 0) {
    return { ...base, availableSectors: overview.sectors.map((s) => s.label) };
  }

  return { ...base, sectors: matches.map(toSlice) };
}
