import React from "react";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Custom Gradient Header Component
const GradientHeader = () => (
  <LinearGradient
    colors={['#FF9A9E', '#FAD0C4']} // Gradient colors
    start={{ x: 0, y: 0 }} // Gradient start point
    end={{ x: 1, y: 0 }} // Gradient end point
    style={{ flex: 1 }}
  />
);

export default function iconLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "",
          headerTintColor: "#fff", // Text color for the header
          headerTitleStyle: {
            fontWeight: "bold", // Make the title text bold
          },
          headerBackground: () => <GradientHeader />, // Use the custom gradient header
        }}
      />
    </Stack>
  );
}