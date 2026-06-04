/**
 * registerPermitHandlers — wires the permit feature's AI handlers into the
 * shared registry. Called once at app startup (from app/_layout) alongside the
 * other feature/core registrations.
 *
 * Idempotent: guarded with has() so it survives Fast Refresh without throwing
 * on the registry's duplicate check.
 */

import { aiFunctionRegistry } from '@/core/ai-contract';

import { getPermitPathHandler } from './getPermitPathHandler';
import { getPermitStepHandler } from './getPermitStepHandler';

export function registerPermitHandlers(): void {
  for (const handler of [getPermitPathHandler, getPermitStepHandler]) {
    if (!aiFunctionRegistry.has(handler.name)) {
      aiFunctionRegistry.register(handler);
    }
  }
}
