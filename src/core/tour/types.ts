/**
 * Tour type definitions — the shape of a guided walkthrough and its steps.
 */
import type { RouteName } from '@/core/routing';

/** A measured target rectangle in window coordinates. */
export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Callback form used by registered targets to report their window rect. */
export type MeasureFn = (cb: (rect: TargetRect | null) => void) => void;

export interface TourStep {
  /** Id of the {@link TourSpot} to spotlight. Empty → a centered, target-less step. */
  targetId?: string;
  /** Short heading shown in the tooltip. */
  title: string;
  /** One or two sentences of guidance. */
  body: string;
  /** Preferred tooltip side relative to the target. Defaults to auto. */
  placement?: 'top' | 'bottom';
  /** Extra px of breathing room around the spotlight cutout. */
  padding?: number;
  /**
   * If set, advancing this step (via Next or by tapping the target) navigates
   * here and ends the tour — used to hand off to another screen's own tour.
   */
  route?: RouteName;
}

export interface TourDef {
  /** Stable id used for persistence + lookup. */
  id: string;
  /** Friendly feature name shown in the tour chrome ("Permits walkthrough"). */
  name: string;
  steps: TourStep[];
}
