/**
 * tourStore — persistent walkthrough state.
 *
 * Tracks which guided tours the user has already completed (so each auto-runs
 * only once) and a global "walkthroughs disabled" opt-out for experienced
 * users. Persisted to AsyncStorage via zustand's `persist`, which rehydrates
 * outside React's effect cycle — so first-open trigger logic can rely on
 * `hasHydrated` without racing screen mounts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TourState {
  /** Tour ids the user has finished or skipped. */
  completedTours: string[];
  /** When true, no walkthrough auto-runs (manual replay still works). */
  walkthroughsDisabled: boolean;
  /** True once persisted state has rehydrated. */
  hasHydrated: boolean;

  markComplete: (tourId: string) => void;
  hasCompleted: (tourId: string) => boolean;
  setWalkthroughsDisabled: (disabled: boolean) => void;
  /** Dev / re-onboarding: clear completion + re-enable walkthroughs. */
  resetTours: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      completedTours: [],
      walkthroughsDisabled: false,
      hasHydrated: false,

      markComplete: (tourId) =>
        set((s) =>
          s.completedTours.includes(tourId)
            ? s
            : { completedTours: [...s.completedTours, tourId] },
        ),

      hasCompleted: (tourId) => get().completedTours.includes(tourId),

      setWalkthroughsDisabled: (walkthroughsDisabled) => set({ walkthroughsDisabled }),

      resetTours: () => set({ completedTours: [], walkthroughsDisabled: false }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: '@sugbo/tours',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        completedTours: s.completedTours,
        walkthroughsDisabled: s.walkthroughsDisabled,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
