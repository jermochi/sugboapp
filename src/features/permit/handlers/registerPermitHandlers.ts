/**
 * registerPermitHandlers — wires the permit-owned AI handlers into the registry
 * once at app startup. Idempotent (the registry throws on duplicates, so we
 * guard with `has`), which keeps Fast Refresh happy.
 */
import { aiFunctionRegistry } from '@/core/ai-contract';

import { explainHandler } from './explainHandler';
import { getPermitPathHandler } from './getPermitPathHandler';

export function registerPermitHandlers(): void {
  if (!aiFunctionRegistry.has(getPermitPathHandler.name)) {
    aiFunctionRegistry.register(getPermitPathHandler);
  }
  if (!aiFunctionRegistry.has(explainHandler.name)) {
    aiFunctionRegistry.register(explainHandler);
  }
}
