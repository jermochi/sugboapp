/**
 * DataSource — loads JSON from bundled assets.
 *
 * Uses require() for static asset bundling.
 * The assetKey maps to a file in assets/data/.
 */

/** Asset registry — maps keys to require() calls */
const assetMap: Record<string, unknown> = {
  budget: require('@/assets/data/budget.json'),
  permit_steps: require('@/assets/data/permit_steps.json'),
  hotlines: require('@/assets/data/hotlines.json'),
};

export interface DataSource {
  loadJson<T>(assetKey: string): Promise<T>;
}

/**
 * Concrete implementation that loads from bundled assets.
 */
class AssetDataSource implements DataSource {
  async loadJson<T>(assetKey: string): Promise<T> {
    const data = assetMap[assetKey];
    if (!data) {
      throw new Error(`AssetDataSource: unknown asset key "${assetKey}".`);
    }
    // require() returns the parsed JSON object directly in RN/Metro
    return data as T;
  }
}

/** Singleton instance */
export const assetDataSource: DataSource = new AssetDataSource();
