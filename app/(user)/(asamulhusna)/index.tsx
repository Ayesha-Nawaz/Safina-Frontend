import React from "react";
import { View, StyleSheet, Text, Button, ImageBackground } from "react-native";
import AsmaUlHusnaComp from "@/components/Asma-ul-HusnaComp";

export default function NamesHomeScreen() {

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/name.jpeg")}
        style={styles.background}
      >
        <AsmaUlHusnaComp />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  background: {
    flex: 1, 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
