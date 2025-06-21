import React from "react";
import { Stack } from "expo-router";

export default function Dashboard() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Namaz Content",
          headerStyle: { backgroundColor: "#333333" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="editNamaz"
        options={{
          title: "namaz Content",
          headerStyle: { backgroundColor: "#333333" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
