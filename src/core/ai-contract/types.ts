/**
 * AI Function-Calling Contract — the decoupling layer.
 *
 * Feature modules implement AIFunctionHandler and register it with the registry.
 * The AI module dispatches by function name without importing any feature.
 *
 * GROUNDING RULE: handlers return only data sourced from JSON. Never fabricate.
 */

export interface AIFunctionHandler {
  /** Unique function name, e.g. "query_budget" */
  readonly name: string;

  /** Human-readable description for Gemini function declarations */
  readonly description: string;

  /** JSON Schema of the function parameters (for Gemini) */
  readonly parameters: Record<string, unknown>;

  /**
   * Optional domain instructions appended to Giya's system prompt when this
   * handler is registered. Lets a feature ship its tools AND the guidance on
   * how/when Giya should use them, so the AI module needs no per-domain edits.
   * Omit it for plain routing/data handlers that need no special behavior.
   */
  readonly promptFragment?: string;

  /**
   * Execute the function with the given args.
   * Must return only data sourced from bundled JSON — never invent.
   */
  call(args: Record<string, unknown>): Promise<Record<string, unknown>>;
}
