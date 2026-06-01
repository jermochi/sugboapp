/**
 * Root layout — Stack navigator + ThemeProvider.
 *
 * Thin route file: only declares navigation structure and providers.
 * All screen logic lives in src/features/.
 */

import { useConnectivityStore } from '@/core/services/connectivityService';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

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
