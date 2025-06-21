import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const ProfileHead = ({ user, onEditProfile, onSignOut, onOpenSettings }) => {
  const getAvatar = () => {
    const gender = user?.user?.gender?.toLowerCase();
    if (gender === "male") {
      return require("@/assets/images/boy.png");
    } else if (gender === "female") {
      return require("@/assets/images/girl.jpg");
    } else {
      return require("@/assets/images/user.jpg");
    }
  };

  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileInfo}>
        <Image source={getAvatar()} style={styles.avatar} />
        <Text style={styles.name}>{user?.user?.username || "Username"}</Text>
        <Text style={styles.subtitle}>{user?.user?.email || "user@gmail.com"}</Text>
        <Text style={styles.subtitle}>Age: {user?.user?.age || " "}</Text>
      </View>

      <View style={styles.headerIcons}>
        <TouchableOpacity style={[styles.iconButton, styles.editButton]} onPress={onEditProfile}>
          <FontAwesome name="edit" size={24} color="#fff" />
          <Text style={styles.iconText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, styles.logoutButton]} onPress={onSignOut}>
          <FontAwesome name="sign-out" size={24} color="#fff" />
          <Text style={styles.iconText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, styles.settingsButton]} onPress={onOpenSettings}>
          <FontAwesome name="cogs" size={24} color="#fff" />
          <Text style={styles.iconText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 40,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#68007e",
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#68007e",
  },
  subtitle: {
    fontSize: 14,
    color: "#424242",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 5,
  },
  headerIcons: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginLeft: 15,
  },
  iconButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: 125,
  },
  editButton: {
    backgroundColor: "#68007e", // Purple, matching avatar border and name
  },
  logoutButton: {
    backgroundColor: "#d32f2f", // Red for logout
  },
  settingsButton: {
    backgroundColor: "#0288d1", // Blue for settings
  },
  iconText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    marginLeft: 5,
    textAlign: "center",
  },
});

export default ProfileHead;