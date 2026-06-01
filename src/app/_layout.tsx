/**
 * Root layout — Stack navigator + ThemeProvider.
 *
 * Thin route file: only declares navigation structure and providers.
 * All screen logic lives in src/features/.
 */

import React, { useEffect } from 'react';
import { Stack, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useConnectivityStore } from '@/core/services/connectivityService';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const startListening = useConnectivityStore((s) => s.startListening);

  // Initialize connectivity listener once at app startup
  useEffect(() => {
    const unsubscribe = startListening();
    return unsubscribe;
  }, [startListening]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="transparency"
          options={{ headerShown: true, title: 'Transparency Tracker' }}
        />
        <Stack.Screen
          name="permit"
          options={{ headerShown: true, title: 'Business Permit' }}
        />
        <Stack.Screen
          name="emergency"
          options={{ headerShown: true, title: 'Emergency Services' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
