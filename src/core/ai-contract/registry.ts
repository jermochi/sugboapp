/**
 * AIFunctionRegistry — the dispatcher that decouples AI from features.
 *
 * Features register handlers at app startup.
 * The AI module dispatches by function name through this singleton.
 */

import type { AIFunctionHandler } from './types';

export class AIFunctionRegistry {
  private handlers = new Map<string, AIFunctionHandler>();

  /**
   * Register a handler. Throws if the name is already taken.
   */
  register(handler: AIFunctionHandler): void {
    if (this.handlers.has(handler.name)) {
      throw new Error(
        `AIFunctionRegistry: handler "${handler.name}" is already registered.`,
      );
    }
    this.handlers.set(handler.name, handler);
  }

  /**
   * Unregister a handler by name.
   */
  unregister(name: string): void {
    this.handlers.delete(name);
  }

  /**
   * Dispatch a function call to the registered handler.
   * Throws if no handler is registered for the given name.
   */
  async dispatch(
    name: string,
    args: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new Error(
        `AIFunctionRegistry: no handler registered for "${name}".`,
      );
    }
    return handler.call(args);
  }

  /**
   * List all registered function names (for building Gemini tool declarations).
   */
  getRegisteredNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get all handlers (for building Gemini function declarations).
   */
  getHandlers(): AIFunctionHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Check if a handler is registered.
   */
  has(name: string): boolean {
    return this.handlers.has(name);
  }
}

/** Singleton registry instance */
export const aiFunctionRegistry = new AIFunctionRegistry();
