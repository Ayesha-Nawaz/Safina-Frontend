import React from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";

export default function UserLayout() {
  const colorScheme = useColorScheme();

  return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false, // Hide header globally
            gestureEnabled: false, // Disable back gesture
          }}
        >
          <Stack.Screen name="(appmain)" options={{ headerShown: false }} />
          <Stack.Screen name="(duas)" options={{ headerShown: false }} />
          <Stack.Screen name="(namaz)" options={{ headerShown: false }} />
          <Stack.Screen name="(stories)" options={{ headerShown: false }} />
          <Stack.Screen name="(wudu)" options={{ headerShown: false }} />
          <Stack.Screen name="(asamulhusna)" options={{ headerShown: false }} />
          <Stack.Screen name="(asmaulnabi)" options={{ headerShown: false }} />
          <Stack.Screen name="(kalma)" options={{ headerShown: false }} />
          <Stack.Screen name="(more)" options={{ headerShown: false }} />
          <Stack.Screen name="(editprofile)" options={{ headerShown: false }} />
          <Stack.Screen name="(notification)" options={{ headerShown: false }} />
          <Stack.Screen name="(detailsscreens)" options={{ headerShown: false }} />
          <Stack.Screen name="(icons)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
  );
}
