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
    console.log("AppContent useEffect: Initial user check, user:", user);
    const loadUser = async () => {
      try {
        if (user) {
          console.log("User already exists, skipping fetchUser, user:", user);
          setInitializing(false);
          return;
        }
        console.log("No user, fetching user data");
        const fetchedUser = await fetchUser();
        console.log("Fetched user:", fetchedUser);
      } catch (error) {
        console.error("Error fetching user in AppContent:", error);
      } finally {
        console.log("Setting initializing to false, user:", user);
        setInitializing(false);
      }
    };

    loadUser();
  }, [fetchUser]); // Only depend on fetchUser

  // Navigate when user state changes
  useEffect(() => {
    console.log(
      "Navigation useEffect triggered, user:",
      user,
      "loading:",
      loading,
      "initializing:",
      initializing,
      "fontsLoaded:",
      fontsLoaded
    );
    if (!loading && !initializing && fontsLoaded) {
      if (user) {
        console.log("User exists, navigating to (user), userId:", user._id);
        router.replace("/(user)");
      } else {
        console.log("No user, navigating to (authentication)");
        router.replace("/(authentication)");
      }
    } else {
      console.log("Navigation skipped: loading=", loading, "initializing=", initializing, "fontsLoaded=", fontsLoaded);
    }
  }, [user, loading, initializing, fontsLoaded, router]);

  // Hide splash screen when ready
  useEffect(() => {
    if (fontsLoaded && !loading && !initializing) {
      console.log("Hiding splash screen, user:", user);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading, initializing]);

  if (!fontsLoaded || loading || initializing) {
    console.log("Rendering AppLoader, fontsLoaded:", fontsLoaded, "loading:", loading, "initializing:", initializing);
    return <AppLoader />;
  }

  console.log("Rendering navigation, user:", user);
  return user ? (
    <UserLayoutNav colorScheme={colorScheme} initialRouteName="(user)" />
  ) : (
    <AuthLayoutNav colorScheme={colorScheme} />
  );
}

function AuthLayoutNav({ colorScheme }) {
  console.log("Rendering AuthLayoutNav");
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
  console.log("Rendering UserLayoutNav, initialRouteName:", initialRouteName);
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