import React, { useContext, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { StyleSheet, TextStyle, TouchableOpacity, View, Platform, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "@/context/UserContext";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconContainer, props.focused && styles.iconContainerFocused]}>
      <FontAwesome size={24} style={styles.icon} {...props} />
    </View>
  );
}

function BackButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color="#ffffff" />
    </TouchableOpacity>
  );
}

function CustomHeaderTitle({ route }) {
  const { user } = useContext(UserContext);

  useEffect(() => {
    console.log("user at home", user);
  }, [user]);

  if (route.name === "index") {
    return (
      <View style={styles.homeHeaderContainer} key={user?.user?._id || "no-user"}>
        <Text style={styles.usernameText}>Welcome {user?.user?.username || ""}</Text>
      </View>
    );
  }

  return <Text style={styles.headerTitle}>{route.params?.title || route.name}</Text>;
}

function HeaderBackground() {
  return (
    <LinearGradient
      colors={["#614385", "#516395"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

function TabBar({ state, descriptors, navigation }) {
  return (
    <LinearGradient
      colors={["#614385", "#516395"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.tabBar}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }

          // ❌ Removed fetchUser call from Home tab
        };

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabButton}>
            <View style={[styles.tabContent, isFocused && styles.focusedTabContent]}>
              {options.tabBarIcon &&
                options.tabBarIcon({
                  color: isFocused ? "#ffffff" : "rgba(255,255,255,0.52)",
                  focused: isFocused,
                  size: 24,
                })}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? "#ffffff" : "rgba(255, 255, 255, 0.52)",
                    opacity: isFocused ? 1 : 0.9,
                  },
                ]}
              >
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}


export default function AppMain() {
  const colorScheme = useColorScheme();
  const { user } = useContext(UserContext);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.7)",
        headerShown: true,
        headerStyle: styles.header,
        headerTitle: () => <CustomHeaderTitle route={route} />,
        headerBackground: () => <HeaderBackground />,
        headerShadowVisible: false,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
          headerLeft: undefined,
        }}
      />
      <Tabs.Screen
        name="Bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="bookmark" color={color} focused={focused} />
          ),
          headerLeft: () => <BackButton />,
        }}
      />
      <Tabs.Screen
        name="Quizzes"
        options={{
          title: "Quizzes",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="question-circle" color={color} focused={focused} />
          ),
          headerLeft: () => <BackButton />,
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="user" color={color} focused={focused} />
          ),
          headerLeft: () => <BackButton />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  homeHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  usernameText: {
    fontSize: 17,
    color: "#ffffff",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    textShadowColor: "rgba(5, 0, 0, 0.97)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabBar: {
    height: Platform.OS === "ios" ? 85 : 70,
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  iconContainerFocused: {
    transform: [{ scale: 1.4 }],
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  backButton: {
    marginLeft: 15,
  },
  header: {
    height: Platform.OS === "ios" ? 96 : 90,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});