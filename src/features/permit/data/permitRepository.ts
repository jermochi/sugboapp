/**
 * PermitRepository — offline-first loader for the Cebu City business-permit
 * steps (assets/data/permit_steps.json).
 *
 * Thin subclass of BaseRepository: it only declares the asset + cache keys; the
 * cache-first load flow lives in core. This is the single source of truth the
 * permit AI handlers read from — they never invent steps, fees, or offices.
 */

import { BaseRepository } from '@/core/data';
import type { PermitData } from '@/core/models';

class PermitRepository extends BaseRepository<PermitData> {
  protected get assetKey(): string {
    return 'permit_steps';
  }

  protected get cacheKey(): string {
    return 'permit_steps_v1';
  }
}

/** Singleton — handlers share one cached load. */
export const permitRepository = new PermitRepository();
