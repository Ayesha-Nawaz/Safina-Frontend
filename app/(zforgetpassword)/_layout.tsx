import React from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons"; // Import Ionicons
import { LinearGradient } from "expo-linear-gradient";

export default function ForgetPasswordLayout() {
  const router = useRouter();

  function HeaderBackground() {
    return (
      <LinearGradient
        colors={["#86A8E7", "#D16BA5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject} // Fixed StyleSheet issue
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerBackground: () => <HeaderBackground />, // Apply gradient
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 16 }}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: "transparent", // Ensures gradient is visible
        },
        headerShadowVisible: false, // Removes the bottom shadow
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen name="EnterCode" options={{ headerShown: true }} />
      <Stack.Screen name="ResetPassword" options={{ headerShown: true }} />
    </Stack>
  );
}
