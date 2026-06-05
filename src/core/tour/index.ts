/**
 * Tour module — in-app guided walkthroughs (spotlight coachmarks).
 */
export { TourProvider, useTour, useTourTarget, useAutoTour } from './TourContext';
export { TourOverlay } from './TourOverlay';
export { TourSpot } from './TourSpot';
export { ShowMeAround } from './ShowMeAround';
export { useTourStore } from './tourStore';
export {
  TourTargets,
  TOURS,
  DASHBOARD_TOUR,
  PERMIT_TOUR,
  GIYA_TOUR,
  TRANSPARENCY_TOUR,
  EMERGENCY_TOUR,
} from './tours';
export type { TourDef, TourStep, TargetRect } from './types';
