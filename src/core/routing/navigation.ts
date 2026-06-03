/**
 * Typed navigation helpers — thin wrappers around expo-router.
 */

import { router, type Href } from 'expo-router';
import { Routes, type RouteParams } from './routes';

/**
 * Navigate to a route with typed params.
 */
export function navigateTo<T extends keyof RouteParams>(
  route: T,
  params?: RouteParams[T],
): void {
  if (params) {
    router.push({ pathname: route, params: params as Record<string, string> } as Href);
  } else {
    router.push(route as Href);
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
    router.replace({ pathname: route, params: params as Record<string, string> } as Href);
  } else {
    router.replace(route as Href);
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
