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
    router.push({
      pathname: route as `/${string}`,
      params: params as Record<string, string>,
    } as never);
  } else {
    router.push(route as never);
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
    router.replace({
      pathname: route as `/${string}`,
      params: params as Record<string, string>,
    } as never);
  } else {
    router.replace(route as never);
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
