import React from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";

export default function UserLayout() {
  const colorScheme = useColorScheme();

  return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
          <Stack.Screen name="(manageuser)" options={{ headerShown: false }} />
          <Stack.Screen name="(manageContent)" options={{ headerShown: false }} />
          <Stack.Screen name="(manageStories)" options={{ headerShown: false }} />
          <Stack.Screen name="(manageKalma)" options={{ headerShown: false }} />
          <Stack.Screen name="(manageNamaz)" options={{ headerShown: false }} />
          <Stack.Screen name="(manageWudu)" options={{ headerShown: false }} />
          <Stack.Screen name="(manageasmaulhusna)" options={{ headerShown: false }} />
          <Stack.Screen name="(manageasmaulnabi)" options={{ headerShown: false }} />
          <Stack.Screen name="(managedua)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
  );
}
