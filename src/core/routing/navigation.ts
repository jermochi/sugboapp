/**
 * Typed navigation helpers — thin wrappers around expo-router.
 */

import { router } from 'expo-router';
import { Routes, type RouteParams } from './routes';

/**
 * Navigate to a route with typed params.
 */
export function navigateTo<T extends keyof RouteParams>(
  route: T,
  params?: RouteParams[T],
): void {
  if (params) {
    router.push({ pathname: route, params: params as Record<string, string> });
  } else {
    router.push(route as `/${string}`);
  }
}

/**
 * Replace the current screen (no back).
 */
export function replaceTo<T extends keyof RouteParams>(
  route: T,
  params?: RouteParams[T],
): void {
  if (params) {
    router.replace({ pathname: route, params: params as Record<string, string> });
  } else {
    router.replace(route as `/${string}`);
  }
}

/**
 * Go back to the previous screen.
 */
export function goBack(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    navigateTo(Routes.DASHBOARD);
  }
}
