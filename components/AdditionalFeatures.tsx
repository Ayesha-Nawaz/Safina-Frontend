import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { Link } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const AdditionalFeatures = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const features = [
    {
      href: "(more)/Events",
      iconName: "calendar-star",
      text: "Events",
      colors: ["#FF61D2", "#FE9090"],
      animation: scaleAnim,
      transform: [
        {
          scale: scaleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }),
        },
      ],
    },
    {
      href: "(more)/Schedule",
      iconName: "clock-time-four",
      text: "Schedule", 
      colors: ["#4E65FF", "#92EFFD"],
      animation: rotateAnim,
      transform: [
        {
          rotate: rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "360deg"],
          }),
        },
      ],
    },
    {
      href: "(more)/PrayerTime",
      iconName: "mosque",
      text: "Prayer Time",
      colors: ["#84FAB0", "#8FD3F4"],
      animation: fadeAnim,
      transform: [{ scale: fadeAnim }],
    },
  ];

  useEffect(() => {
    const animations = features.map((feature) =>
      Animated.timing(feature.animation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    Animated.stagger(200, animations).start();
  }, []);

  const FeatureButton = ({ href, iconName, text, colors, animatedStyle }) => (
    <Link href={href} style={styles.linkContainer}>
      <Animated.View style={[styles.buttonContainer, animatedStyle]}>
        <LinearGradient
          colors={colors}
          style={styles.featureButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name={iconName} size={40} color="#fff" style={styles.icon} />
          <Text style={styles.featureText}>{text}</Text>
        </LinearGradient>
      </Animated.View>
    </Link>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuresContainer}
      >
        {features.map((feature, index) => (
          <FeatureButton
            key={index}
            href={feature.href}
            iconName={feature.iconName}
            text={feature.text}
            colors={feature.colors}
            animatedStyle={{ transform: feature.transform }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  featuresContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  linkContainer: {
    marginHorizontal: 8,
  },
  buttonContainer: {
    borderRadius: 15,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  featureButton: {
    width: 130,
    height: 80,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  featureText: {
    color: "#ffffff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    textShadowColor: "rgba(84, 84, 193, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  icon: {
    marginBottom: 1,
    textAlign: "center",
  },
});

export default AdditionalFeatures;
