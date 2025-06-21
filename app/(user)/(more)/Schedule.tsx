import EventsComponent from "@/components/EventsComponent";
import Schedule from "@/components/Schedulecomponent";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";

export default function ScheduleHomeScreen() {
  return (
    <ImageBackground
      source={require("@/assets/images/s5.png")}
      style={styles.background}
    >
      <Schedule />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    padding: 10,
  },
});
