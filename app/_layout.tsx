// RootLayout.tsx
import React, { useEffect, useContext } from "react";
import { StyleSheet, Dimensions } from "react-native";
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
  const { user, loading } = useContext(UserContext);
  const [fontsLoaded] = useFonts(fonts);
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    console.log("AppContent useEffect: checking initialization state", {
      user: !!user,
      loading,
      fontsLoaded,
    });

    if (!loading && fontsLoaded) {
      console.log("Ready to navigate");
      SplashScreen.hideAsync();
      router.replace(user ? "/(user)" : "/(authentication)");
    }
  }, [loading, fontsLoaded, user, router]);

  if (!fontsLoaded || loading) {
    console.log("Rendering AppLoader", { fontsLoaded, loading });
    return <AppLoader />;
  }

  console.log("Rendering Stack navigation");
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="(authentication)" options={{ headerShown: false }} />
        <Stack.Screen name="(user)" options={{ headerShown: false }} />
        <Stack.Screen name="(zadmin)" options={{ headerShown: false }} />
        <Stack.Screen name="(zforgetpassword)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}