import React from "react";
import { View, StyleSheet, Text, Button, ImageBackground } from "react-native";
import AsmaUlNabiComp from "@/components/Asma-ul-Nabicomp";

export default function NamesHomeScreen() {

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/name.jpeg")}
        style={styles.background}
      >
        <AsmaUlNabiComp />
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
