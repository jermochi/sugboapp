/**
 * TourContext — runtime state for the active walkthrough.
 *
 * Holds a registry of on-screen targets (id → measure fn), the active tour and
 * step, and the controls to drive it (next / back / skip / disable). Screens
 * register targets via {@link useTourTarget} / `<TourSpot>`, kick off a tour via
 * {@link useAutoTour} or a replay button, and {@link TourOverlay} consumes this
 * to paint the spotlight + tooltip.
 */
import { useIsFocused } from '@react-navigation/native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';

import { navigateTo } from '@/core/routing';
import { TOURS } from './tours';
import { useTourStore } from './tourStore';
import type { MeasureFn, TourDef, TourStep } from './types';

interface TourContextValue {
  register: (id: string, fn: MeasureFn) => void;
  unregister: (id: string) => void;
  measure: (id: string, cb: Parameters<MeasureFn>[0]) => void;

  activeTour: TourDef | null;
  step: TourStep | null;
  stepIndex: number;
  stepCount: number;
  isActive: boolean;

  startTour: (tourId: string) => void;
  next: () => void;
  back: () => void;
  /** End the current tour, marking it seen so it won't auto-run again. */
  skip: () => void;
  /** Turn off all future auto walkthroughs (and end the current one). */
  disableAll: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const registry = useRef(new Map<string, MeasureFn>());
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const markComplete = useTourStore((s) => s.markComplete);
  const setWalkthroughsDisabled = useTourStore((s) => s.setWalkthroughsDisabled);

  const register = useCallback((id: string, fn: MeasureFn) => {
    registry.current.set(id, fn);
  }, []);

  const unregister = useCallback((id: string) => {
    registry.current.delete(id);
  }, []);

  const measure = useCallback<TourContextValue['measure']>((id, cb) => {
    const fn = registry.current.get(id);
    if (fn) fn(cb);
    else cb(null);
  }, []);

  const activeTour = activeTourId ? (TOURS[activeTourId] ?? null) : null;
  const stepCount = activeTour?.steps.length ?? 0;
  const step = activeTour ? (activeTour.steps[stepIndex] ?? null) : null;

  const endTour = useCallback(
    (completed: boolean) => {
      setActiveTourId((current) => {
        if (current && completed) markComplete(current);
        return null;
      });
      setStepIndex(0);
    },
    [markComplete],
  );

  const startTour = useCallback((tourId: string) => {
    if (!TOURS[tourId]) return;
    setStepIndex(0);
    setActiveTourId(tourId);
  }, []);

  const next = useCallback(() => {
    if (!activeTour) return;
    const current = activeTour.steps[stepIndex];
    if (current?.route) {
      endTour(true);
      navigateTo(current.route);
      return;
    }
    if (stepIndex >= activeTour.steps.length - 1) {
      endTour(true);
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [activeTour, stepIndex, endTour]);

  const back = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const skip = useCallback(() => endTour(true), [endTour]);

  const disableAll = useCallback(() => {
    setWalkthroughsDisabled(true);
    endTour(true);
  }, [setWalkthroughsDisabled, endTour]);

  const value = useMemo<TourContextValue>(
    () => ({
      register,
      unregister,
      measure,
      activeTour,
      step,
      stepIndex,
      stepCount,
      isActive: Boolean(activeTour),
      startTour,
      next,
      back,
      skip,
      disableAll,
    }),
    [
      register,
      unregister,
      measure,
      activeTour,
      step,
      stepIndex,
      stepCount,
      startTour,
      next,
      back,
      skip,
      disableAll,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within a TourProvider');
  return ctx;
}

/**
 * Register an on-screen target for spotlighting. Spread the returned ref onto a
 * host `View` (or use the `<TourSpot>` wrapper, which does this for you).
 */
export function useTourTarget(id: string) {
  const { register, unregister } = useTour();
  const ref = useRef<View>(null);

  useEffect(() => {
    if (!id) return;
    const measure: MeasureFn = (cb) => {
      const node = ref.current;
      if (!node) {
        cb(null);
        return;
      }
      node.measureInWindow((x, y, width, height) => {
        if (width === 0 && height === 0) cb(null);
        else cb({ x, y, width, height });
      });
    };
    register(id, measure);
    return () => unregister(id);
  }, [id, register, unregister]);

  return ref;
}

/**
 * Auto-start a tour the first time `enabled` is true on a fresh screen — once
 * per tour, unless the user has globally disabled walkthroughs. A small delay
 * lets targets mount and measure before the spotlight appears.
 */
export function useAutoTour(tourId: string, enabled: boolean = true) {
  const { startTour, isActive } = useTour();
  const isFocused = useIsFocused();
  const hasHydrated = useTourStore((s) => s.hasHydrated);
  const disabled = useTourStore((s) => s.walkthroughsDisabled);
  const completed = useTourStore((s) => s.completedTours.includes(tourId));

  useEffect(() => {
    // Only auto-run when this screen is actually focused — otherwise a tour can
    // fire while its screen sits mounted underneath another route (e.g. the
    // dashboard under the onboarding screen after a reset).
    if (!enabled || !isFocused || !hasHydrated || disabled || completed || isActive) return;
    // No started-ref guard: it would survive StrictMode's mount→unmount→mount
    // (clearing the timer, then bailing) and the tour would never fire. The
    // isActive/completed deps already prevent re-running once it starts/ends.
    const timer = setTimeout(() => startTour(tourId), 500);
    return () => clearTimeout(timer);
  }, [enabled, isFocused, hasHydrated, disabled, completed, isActive, tourId, startTour]);
}
