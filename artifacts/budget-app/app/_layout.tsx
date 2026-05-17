import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Updates from "expo-updates";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

function AppUpdater() {
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (Updates.isEnabled) {
      Updates.checkForUpdateAsync().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isUpdateAvailable) {
      Updates.fetchUpdateAsync().catch(() => {});
    }
  }, [isUpdateAvailable]);

  useEffect(() => {
    if (isUpdatePending) {
      Alert.alert(
        "Update Ready",
        "A new version of Peso Tracker has been downloaded. Restart now to apply it.",
        [
          { text: "Later", style: "cancel" },
          { text: "Restart Now", onPress: () => Updates.reloadAsync() },
        ]
      );
    }
  }, [isUpdatePending]);

  return null;
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="transaction/new" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="transaction/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="savings/new" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="savings/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="roi/new" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="roi/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="subscription/new" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="subscription/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="theme-picker" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Feather.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <AppUpdater />
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </AppProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
