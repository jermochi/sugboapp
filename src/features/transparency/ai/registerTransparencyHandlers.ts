/**
 * registerTransparencyHandlers — wires the transparency feature's AI handler
 * (query_budget) into the shared registry. Called once at app startup from
 * app/_layout, alongside the core and permit registrations.
 *
 * Idempotent: guarded with has() so it survives Fast Refresh without tripping
 * the registry's duplicate check.
 */

import { aiFunctionRegistry } from '@/core/ai-contract';

import { queryBudgetHandler } from './queryBudgetHandler';

export function registerTransparencyHandlers(): void {
  if (!aiFunctionRegistry.has(queryBudgetHandler.name)) {
    aiFunctionRegistry.register(queryBudgetHandler);
  }
}
