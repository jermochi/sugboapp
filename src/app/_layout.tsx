/**
 * Root layout — Stack navigator + ThemeProvider.
 *
 * Thin route file: only declares navigation structure and providers.
 * All screen logic lives in src/features/.
 */

import { aiFunctionRegistry, registerCoreHandlers } from '@/core/ai-contract';
import { registerEmergencyHandlers } from '@/features/emergency/aiHandler';
import { registerPermitHandlers } from '@/features/permit/handlers/registerPermitHandlers';
import { registerTransparencyHandlers } from '@/features/transparency/ai/registerTransparencyHandlers';
import { useConnectivityStore } from '@/core/services/connectivityService';
import { TourProvider, TourOverlay } from '@/core/tour';
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
import { useColorScheme, View } from 'react-native';

// Keep the splash screen up until the brand fonts are ready.
SplashScreen.preventAutoHideAsync();

// Wire AI function handlers into the registry once. Core owns route_to_service +
// ask_clarification; each feature registers its own (emergency: query_hotlines,
// permit: get_permit_path/explain; transparency: query_budget).
registerCoreHandlers();
registerEmergencyHandlers(aiFunctionRegistry);
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
      <TourProvider>
        <View style={{ flex: 1 }}>
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
              }}
            />
            <Stack.Screen
              name="permit"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' },
                statusBarBackgroundColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="emergency"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' },
                statusBarBackgroundColor: '#FFFFFF',
              }}
            />
          </Stack>
          {/* Spotlight walkthrough overlay — sits above every screen. */}
          <TourOverlay />
        </View>
      </TourProvider>
    </ThemeProvider>
  );
}
