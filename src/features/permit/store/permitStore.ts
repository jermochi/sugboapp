/**
 * permitStore — the citizen's in-progress permit application.
 *
 * Persisted to AsyncStorage so progress survives restarts and works fully
 * offline. Holds the profile that drives the roadmap, per-step requirement
 * ticks, and which steps are marked done. `hasHydrated` gates first render so a
 * saved roadmap never flashes the intake first.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PermitProfile } from '@/core/models/permit';

interface PermitState {
  profile: PermitProfile | null;
  /** step id → indices of ticked requirement items */
  checkedRequirements: Record<string, number[]>;
  /** step ids marked done */
  doneSteps: string[];
  /** True once the persisted state has rehydrated. */
  hasHydrated: boolean;

  setProfile: (profile: PermitProfile) => void;
  toggleRequirement: (stepId: string, index: number) => void;
  toggleStepDone: (stepId: string) => void;
  startOver: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const usePermitStore = create<PermitState>()(
  persist(
    (set) => ({
      profile: null,
      checkedRequirements: {},
      doneSteps: [],
      hasHydrated: false,

      setProfile: (profile) => set({ profile }),

      toggleRequirement: (stepId, index) =>
        set((state) => {
          const current = state.checkedRequirements[stepId] ?? [];
          const next = current.includes(index)
            ? current.filter((i) => i !== index)
            : [...current, index];
          return {
            checkedRequirements: {
              ...state.checkedRequirements,
              [stepId]: next,
            },
          };
        }),

      toggleStepDone: (stepId) =>
        set((state) => ({
          doneSteps: state.doneSteps.includes(stepId)
            ? state.doneSteps.filter((id) => id !== stepId)
            : [...state.doneSteps, stepId],
        })),

      startOver: () =>
        set({ profile: null, checkedRequirements: {}, doneSteps: [] }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'sugbo-permit-progress',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        checkedRequirements: state.checkedRequirements,
        doneSteps: state.doneSteps,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
