/**
 * CacheStore — typed AsyncStorage wrapper.
 *
 * Provides get/put/has with JSON serialization.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheStore {
  put(key: string, value: unknown): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  has(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}

const CACHE_PREFIX = '@sugboapp:';

class AsyncStorageCacheStore implements CacheStore {
  private prefixKey(key: string): string {
    return `${CACHE_PREFIX}${key}`;
  }

  async put(key: string, value: unknown): Promise<void> {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(this.prefixKey(key), serialized);
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(this.prefixKey(key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async has(key: string): Promise<boolean> {
    const raw = await AsyncStorage.getItem(this.prefixKey(key));
    return raw !== null;
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(this.prefixKey(key));
  }
}

/** Singleton instance */
export const cacheStore: CacheStore = new AsyncStorageCacheStore();
