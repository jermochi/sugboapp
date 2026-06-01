/**
 * BaseRepository — abstract offline-first data loading pattern.
 *
 * Flow: try cache → if miss, load from asset → cache result → return.
 * Subclasses only need to specify the asset key and cache key.
 */

import { assetDataSource, type DataSource } from './assetDataSource';
import { cacheStore, type CacheStore } from './cacheStore';

export abstract class BaseRepository<T> {
  protected dataSource: DataSource;
  protected cache: CacheStore;

  constructor(
    dataSource: DataSource = assetDataSource,
    cache: CacheStore = cacheStore,
  ) {
    this.dataSource = dataSource;
    this.cache = cache;
  }

  /** The key used to load from assets/data/ */
  protected abstract get assetKey(): string;

  /** The key used for AsyncStorage caching */
  protected abstract get cacheKey(): string;

  /**
   * Load data: cache-first, then asset, then cache the result.
   */
  async load(): Promise<T> {
    // Try cache first
    const cached = await this.cache.get<T>(this.cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Load from bundled asset
    const data = await this.dataSource.loadJson<T>(this.assetKey);

    // Cache for next time
    await this.cache.put(this.cacheKey, data);

    return data;
  }

  /**
   * Force refresh from asset (bypass cache).
   */
  async refresh(): Promise<T> {
    const data = await this.dataSource.loadJson<T>(this.assetKey);
    await this.cache.put(this.cacheKey, data);
    return data;
  }

  /**
   * Clear cached data.
   */
  async clearCache(): Promise<void> {
    await this.cache.remove(this.cacheKey);
  }
}
