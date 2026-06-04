/**
 * registerCoreHandlers — wires the core-owned AI function handlers into the
 * registry once at app startup. Feature modules register their own handlers
 * (query_budget, get_permit_path, …) separately; this covers core/routing +
 * the ask_clarification interaction primitive.
 *
 * Safe to call more than once (e.g. across Fast Refresh) — registration is
 * idempotent here because the registry throws on duplicates.
 */

import { aiFunctionRegistry } from './registry';
import { askClarificationHandler } from './handlers/askClarificationHandler';
import { routeToServiceHandler } from './handlers/routeToServiceHandler';

export function registerCoreHandlers(): void {
  if (!aiFunctionRegistry.has(routeToServiceHandler.name)) {
    aiFunctionRegistry.register(routeToServiceHandler);
  }
  if (!aiFunctionRegistry.has(askClarificationHandler.name)) {
    aiFunctionRegistry.register(askClarificationHandler);
  }
}
