import NamazComponent from "@/components/NamazComponent";
import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";

export default function NamazHomeScreen() {
  return (
    <ImageBackground
      source={require("@/assets/images/s5.png")}
      style={styles.background}
      blurRadius={6} // Adjust this value to control blur intensity
    >
      <NamazComponent />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
});