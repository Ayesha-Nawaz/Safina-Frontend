import React, { useState, useEffect, useContext } from "react";
import { View, ActivityIndicator, Animated, Text, StyleSheet, Dimensions } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/components/useColorScheme";
import { fonts } from "@/assets/data/fonts";
import { UserContext, UserProvider } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import AppLoader from "@/components/AppLoader";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get("window");

export default function RootLayout() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

function AppContent() {
  const { user, loading, fetchUser } = useContext(UserContext);
  const [fontsLoaded] = useFonts(fonts);
  const colorScheme = useColorScheme();

  // Fetch user data on mount to check login status
  useEffect(() => {
    const loadUser = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error("Error fetching user on mount:", error);
      }
    };
    loadUser();
  }, [fetchUser]);

  // Hide splash screen when fonts and user data are loaded
  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return <AppLoader />;
  }

  // Navigate to user layout (home screen) if user exists, otherwise auth layout
  return user ? (
    <UserLayoutNav colorScheme={colorScheme} initialRouteName="(user)" />
  ) : (
    <AuthLayoutNav colorScheme={colorScheme} />
  );
}

function AuthLayoutNav({ colorScheme }) {
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen
          name="(authentication)"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

function UserLayoutNav({ colorScheme, initialRouteName }) {
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
        initialRouteName={initialRouteName}
      >
        <Stack.Screen name="(user)" options={{ headerShown: false }} />
        <Stack.Screen name="(zadmin)" options={{ headerShown: false }} />
        <Stack.Screen name="(zforgetpassword)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}