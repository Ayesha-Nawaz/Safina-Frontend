import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  Alert,
  ImageBackground,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useNotificationService } from "./useNotificationservice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Loader from "@/components/Loader";

export default function NotificationScreen() {
  const [preferences, setPreferences] = useState({
    prayerTime: false,
    storyTime: false,
    tasks: false,
    events: false,
  });

  const [scaleAnims] = useState(() => ({
    prayerTime: new Animated.Value(1),
    storyTime: new Animated.Value(1),
    tasks: new Animated.Value(1),
    events: new Animated.Value(1),
  }));

  // Default location - no need to change
  const city = "Lahore";
  const country = "Pakistan";

  const {
    requestPermissions,
    hasPermission,
    toggleNotificationService,
    loading,
  } = useNotificationService(city, country);

  useEffect(() => {
    loadSavedPreferences();
    checkPermissions();
  }, []);

  const loadSavedPreferences = async () => {
    try {
      const keys = ["prayerTime", "storyTime", "tasks", "events"];
      const savedPreferences = {};

      for (const key of keys) {
        const value = await AsyncStorage.getItem(`notification_${key}`);
        savedPreferences[key] = value === "true";
      }

      setPreferences(savedPreferences);
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const checkPermissions = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        "Permissions Required",
        "Please enable notifications to receive updates.",
        [{ text: "OK" }]
      );
    }
  };

  const animateScale = (key) => {
    Animated.sequence([
      Animated.timing(scaleAnims[key], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[key], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggle = async (key) => {
    try {
      animateScale(key);

      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            "Permission Denied",
            "Please enable notifications in your device settings.",
            [{ text: "OK" }]
          );
          return;
        }
      }

      const newValue = !preferences[key];
      
      // Directly toggle the notification without showing modal
      await toggleNotificationService(key, newValue);
      setPreferences((prev) => ({ ...prev, [key]: newValue }));
      await AsyncStorage.setItem(`notification_${key}`, String(newValue));
    } catch (error) {
      console.error("Error toggling notification:", error);
      Alert.alert(
        "Error",
        "Failed to update notification settings. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('@/assets/images/profile.jpeg')}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        resizeMode="cover"
        blurRadius={10} // Adjust the value for stronger or lighter blur
      >
        <Loader text="Loading Prefrences..." />
      </ImageBackground>
    );
  }

  const notificationOptions = [
    {
      key: "prayerTime",
      title: "Prayer Time",
      description: "Get notified for daily prayer times",
      icon: "🕌",
      gradient: ["#FF6B6B", "#FF8E53"],
    },
    {
      key: "storyTime",
      title: "Story Time",
      description: "Receive inspiring stories and lessons",
      icon: "📚",
      gradient: ["#43e97b", "#38f9d7"],
    },
    {
      key: "tasks",
      title: "Task Reminders",
      description: "Reminders for your pending tasks",
      icon: "✅",
      gradient: ["#fa709a", "#fee140"],
    },
    {
      key: "events",
      title: "Special Events",
      description: "Receive notifications for upcoming special Islamic events",
      icon: "🤲",
      gradient: ["#4facfe", "#00f2fe"],
    },
  ];
  
  return (
    <ImageBackground
      source={require("@/assets/images/profile.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(252, 245, 245, 0.82)"]}
        style={styles.overlay}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Notification Settings</Text>
          </View>

          {notificationOptions.map(
            ({ key, title, description, icon, gradient }) => (
              <Animated.View
                key={key}
                style={[
                  styles.preferenceItem,
                  { transform: [{ scale: scaleAnims[key] }] },
                ]}
              >
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientCard}
                >
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{icon}</Text>
                  </View>
                  <View style={styles.preferenceText}>
                    <Text style={styles.label}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                    {key === "prayerTime" && preferences[key] && (
                      <Text style={styles.locationText}>
                        Location: {city}, {country}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={preferences[key]}
                    onValueChange={() => handleToggle(key)}
                    trackColor={{ false: "#767577", true: "#2ECC71" }}
                    thumbColor={preferences[key] ? "#fff" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    style={styles.switch}
                  />
                </LinearGradient>
              </Animated.View>
            )
          )}
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );                                       
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontFamily: "Poppins-ExtraBold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  preferenceItem: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  preferenceText: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#FFFFFF",
    marginTop: 4,
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
});