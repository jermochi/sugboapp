/**
 * ConnectivityService — Zustand store wrapping @react-native-community/netinfo.
 *
 * Provides reactive online/offline state for the AI bar and offline degradation.
 */

import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { create } from 'zustand';

export interface ConnectivityState {
  isOnline: boolean;
  isChecking: boolean;
}

interface ConnectivityActions {
  /** Initialize the listener — call once at app startup */
  startListening: () => () => void;
  /** Manually refresh connectivity status */
  refresh: () => Promise<void>;
}

type ConnectivityStore = ConnectivityState & ConnectivityActions;

export const useConnectivityStore = create<ConnectivityStore>((set) => ({
  isOnline: true, // optimistic default
  isChecking: true,

  startListening: () => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      set({
        isOnline: state.isConnected === true && state.isInternetReachable !== false,
        isChecking: false,
      });
    });
    return unsubscribe;
  },

  refresh: async () => {
    set({ isChecking: true });
    const state = await NetInfo.fetch();
    set({
      isOnline: state.isConnected === true && state.isInternetReachable !== false,
      isChecking: false,
    });
  },
}));

/**
 * ConnectivityService interface for non-React consumers.
 */
export interface ConnectivityService {
  readonly isOnline: boolean;
  subscribe(listener: (online: boolean) => void): () => void;
}

/**
 * Imperative connectivity service that wraps the Zustand store.
 */
class ConnectivityServiceImpl implements ConnectivityService {
  get isOnline(): boolean {
    return useConnectivityStore.getState().isOnline;
  }

  subscribe(listener: (online: boolean) => void): () => void {
    return useConnectivityStore.subscribe((state) => {
      listener(state.isOnline);
    });
  }
}

/** Singleton instance */
export const connectivityService: ConnectivityService =
  new ConnectivityServiceImpl();
