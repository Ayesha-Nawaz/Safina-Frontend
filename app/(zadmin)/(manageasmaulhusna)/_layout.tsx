import React from "react";
import { Stack } from "expo-router";

export default function Dashboard() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Asmaulhusna Content",
          headerStyle: { backgroundColor: "#333333" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="EditName"
        options={{
          title: "Edit Content",
          headerStyle: { backgroundColor: "#333333" },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
