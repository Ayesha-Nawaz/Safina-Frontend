import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProgressBar = ({ label, progressPercentage, color }) => {
  // Ensure the percentage is formatted to 2 decimal places
  const formattedPercentage = parseFloat(progressPercentage).toFixed(2);

  return (
    <View style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressPercentage}>{formattedPercentage}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${formattedPercentage}%` },
            { backgroundColor: color },
          ]}
        >
          <View style={styles.progressGlow} />
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#424242",
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
    position: "relative",
  },
  progressGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#757575",
  },
});

export default ProgressBar;