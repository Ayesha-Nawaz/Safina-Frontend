import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false  // Explicitly hide header
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: false  // Explicitly hide header
        }}
      />
    </Stack>
  );
}