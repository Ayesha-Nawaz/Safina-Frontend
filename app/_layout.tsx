import React, { useState, useEffect, useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/components/useColorScheme";
import { fonts } from "@/assets/data/fonts";
import { UserContext, UserProvider } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "@/components/Loader";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

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
  const [hasSeenGuide, setHasSeenGuide] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Check if the user has seen the guide screens
  useEffect(() => {
    async function checkGuideStatus() {
      try {
        const seenGuide = await AsyncStorage.getItem("hasSeenGuide");
        setHasSeenGuide(seenGuide === "true");
      } catch (error) {
        console.error("Error reading hasSeenGuide from AsyncStorage:", error);
        setHasSeenGuide(false);
      }
    }
    checkGuideStatus();
  }, []);

  // Wait for all initialization to complete
  useEffect(() => {
    console.log("=== RootLayout State Check ===");
    console.log("fontsLoaded:", fontsLoaded);
    console.log("UserContext loading:", loading);
    console.log("hasSeenGuide:", hasSeenGuide);
    console.log("User authenticated:", user ? "YES" : "NO");
    console.log("================================");
    
    // Only set ready when ALL conditions are met
    if (fontsLoaded && !loading && hasSeenGuide !== null) {
      console.log("All conditions met, app is ready");
      setIsReady(true);
    }
  }, [fontsLoaded, loading, hasSeenGuide]);

  // Hide splash screen when everything is loaded
  useEffect(() => {
    if (isReady) {
      console.log("Hiding splash screen");
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Show loading indicator until everything is resolved
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Loader text = " Loading...."/>
      </View>
    );
  }

  // If the user hasn't seen the guide, show the guide screens
  if (!hasSeenGuide) {
    console.log("Showing guide screens - user hasn't seen guide");
    return <GuideLayoutNav colorScheme={colorScheme} setHasSeenGuide={setHasSeenGuide} />;
  }

  // If user is authenticated, show user layout; otherwise, show auth layout
  if (user) {
    console.log("User is authenticated, showing user layout");
    return <UserLayoutNav colorScheme={colorScheme} />;
  } else {
    console.log("User is NOT authenticated, showing auth layout");
    return <AuthLayoutNav colorScheme={colorScheme} />;
  }
}

function GuideLayoutNav({ colorScheme, setHasSeenGuide }) {
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
        initialRouteName="guide1"
      >
        <Stack.Screen name="guide1" options={{ headerShown: false }} />
        <Stack.Screen name="guide2" options={{ headerShown: false }} />
        <Stack.Screen name="guide3" options={{ 
          headerShown: false,
          // Mark guide as completed when reaching the last screen
          listeners: {
            focus: async () => {
              try {
                await AsyncStorage.setItem("hasSeenGuide", "true");
                setHasSeenGuide(true);
              } catch (error) {
                console.error("Error saving hasSeenGuide to AsyncStorage:", error);
              }
            }
          }
        }} />
      </Stack>
    </ThemeProvider>
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

function UserLayoutNav({ colorScheme }) {
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen
          name="(user)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(zadmin)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(zforgetpassword)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}