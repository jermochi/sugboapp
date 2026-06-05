/**
 * index — the launch gate.
 *
 * On a fresh install we show the onboarding walkthrough once; afterwards (flag
 * persisted in AsyncStorage) this is the Dashboard. We render onboarding inline
 * rather than redirecting so the first frame doesn't fire a navigation that
 * races expo-router's initial-URL resolution. The walkthrough also stays
 * reachable at `/onboarding` for replay.
 */

import { useEffect, useState } from 'react';

import DashboardScreen from '@/features/dashboard/DashboardScreen';
import OnboardingScreen from '@/features/onboarding/OnboardingScreen';
import { hasSeenOnboarding } from '@/features/onboarding/storage';

export default function Index() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    hasSeenOnboarding().then((value) => {
      if (active) setSeen(value);
    });
    return () => {
      active = false;
    };
  }, []);

  // Still reading the flag — hold on the splash-colored void, no flash.
  if (seen === null) return null;

  if (!seen) return <OnboardingScreen onComplete={() => setSeen(true)} />;

  return <DashboardScreen />;
}
