import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/components/useColorScheme";
import { fonts } from "@/assets/data/fonts";
import { UserContext, UserProvider } from "@/context/UserContext";
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
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  // Fetch user data on mount to check login status
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log("Starting user fetch in AppContent...");
        const fetchedUser = await fetchUser();
        console.log("Fetched user in AppContent:", fetchedUser);
      } catch (error) {
        console.error("Error fetching user in AppContent:", error);
      } finally {
        setInitializing(false);
      }
    };
    loadUser();
  }, [fetchUser]);

  // Navigate when user state changes
  useEffect(() => {
    console.log("User state in AppContent:", user);
    if (!loading && !initializing && fontsLoaded) {
      if (user && user.user) {
        console.log("Navigating to (user) due to user state update, userId:", user.user._id);
        router.replace("/(user)");
      } else {
        console.log("Navigating to (authentication) due to no user");
        router.replace("/(authentication)");
      }
    }
  }, [user, loading, initializing, fontsLoaded, router]);

  // Hide splash screen when fonts are loaded and user data is initialized
  useEffect(() => {
    if (fontsLoaded && !loading && !initializing) {
      console.log("Hiding splash screen, user:", user);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading, initializing, user]);

  if (!fontsLoaded || loading || initializing) {
    console.log("Showing AppLoader, fontsLoaded:", fontsLoaded, "loading:", loading, "initializing:", initializing);
    return <AppLoader />;
  }

  console.log("Rendering navigation, user:", user);
  return user && user.user ? (
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