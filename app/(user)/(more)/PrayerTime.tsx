import PrayerTimeComponent from "@/components/PrayerTimeComponent";
import SignInComponent from "@/components/SignInComponent";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, StyleSheet } from "react-native";

export default function PrayerTimeHomeScreen() {
  return (
    <View style={styles.container}>
       <LinearGradient
           colors={["#FCE38A", "#F38181"]} // Soft yellow to coral pink
           style={styles.decorativeCircle}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 1 }}
         />
         <LinearGradient
           colors={["#EAFFD0", "#45A29E"]} // Pastel green to teal
           style={styles.decorativeCircle2}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 1 }}
         />
         <LinearGradient
           colors={["#86A8E7", "#D16BA5"]} // Soft blue to pinkish-purple
           style={styles.decorativeCircle3}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 1 }}
         />
         <LinearGradient
           colors={["#FFD3A5", "#FD6585"]} // Peach to soft red
           style={styles.decorativeCircle4}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 1 }}
         />
         <LinearGradient
           colors={["#D4FC79", "#96E6A1"]} // Soft lime green to mint
           style={styles.decorativeCircle5}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 1 }}
         />
      
      {/* Sign In Component */}
      <PrayerTimeComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ddfbec", 
  },
  decorativeCircle: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  decorativeCircle3: {
    position: "absolute",
    top: 100,
    left: -70,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: 100,
    left: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  decorativeCircle4: {
    position: "absolute",
    bottom: -80,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  decorativeCircle5: {
    position: "absolute",
    bottom: 290,
    right: 10,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});