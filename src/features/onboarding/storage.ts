/**
 * Onboarding persistence — a single AsyncStorage flag that records whether the
 * first-launch walkthrough has been completed (or skipped).
 *
 * `index` reads {@link hasSeenOnboarding} to decide whether to gate a fresh
 * install into the walkthrough; the walkthrough calls {@link setOnboardingSeen}
 * on finish/skip. {@link resetOnboarding} clears the flag so a future
 * Account/Settings entry can replay the tour ("re-openable" requirement).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@sugbo/onboarding-seen';

/** True once the user has finished or skipped onboarding at least once. */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
  } catch {
    // If storage is unreadable, don't trap the user on the splash — let them in.
    return true;
  }
}

/** Mark onboarding complete so it never auto-shows again. */
export async function setOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Non-fatal: worst case the tour shows again next launch.
  }
}

/** Clear the flag so onboarding auto-shows / can be replayed. */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // Non-fatal.
  }
}
