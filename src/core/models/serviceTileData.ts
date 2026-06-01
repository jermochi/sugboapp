/**
 * ServiceTileData — the model for a single dashboard tile.
 */
export interface ServiceTileData {
  id: string;
  label: string;
  /** SF Symbol name (iOS) or material icon name */
  icon: string;
  /** Route to navigate to when tapped */
  route: string;
  /** Optional accent color override */
  color?: string;
}
