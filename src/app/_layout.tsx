/**
 * Root layout — Stack navigator + ThemeProvider.
 *
 * Thin route file: only declares navigation structure and providers.
 * All screen logic lives in src/features/.
 */

import { registerCoreHandlers } from '@/core/ai-contract';
import { registerPermitHandlers } from '@/features/permit/handlers/registerPermitHandlers';
import { registerTransparencyHandlers } from '@/features/transparency/ai/registerTransparencyHandlers';
import { useConnectivityStore } from '@/core/services/connectivityService';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Lato_700Bold, Lato_900Black } from '@expo-google-fonts/lato';
import {
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Keep the splash screen up until the brand fonts are ready.
SplashScreen.preventAutoHideAsync();

// Wire AI function handlers into the registry once. Core owns route_to_service +
// ask_clarification; each feature registers its own (permit: get_permit_path,
// explain; transparency: query_budget).
registerCoreHandlers();
registerPermitHandlers();
registerTransparencyHandlers();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const startListening = useConnectivityStore((s) => s.startListening);

  const [fontsLoaded, fontError] = useFonts({
    Lato_700Bold,
    Lato_900Black,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  // Initialize connectivity listener once at app startup
  useEffect(() => {
    const unsubscribe = startListening();
    return unsubscribe;
  }, [startListening]);

  // Hide the splash once fonts resolve (or fail — don't block the app on a font error).
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="giya-chat" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="transparency"
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
            statusBarBackgroundColor: '#FFFFFF',
            statusBarStyle: 'dark',
          }}
        />
        <Stack.Screen
          name="permit"
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
            statusBarBackgroundColor: '#FFFFFF',
            statusBarStyle: 'dark',
          }}
        />
        <Stack.Screen
          name="emergency"
          options={{ headerShown: true, title: 'Emergency Services' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
