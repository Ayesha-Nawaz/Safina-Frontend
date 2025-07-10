import React, { useState, useCallback, useContext } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import ProgressOverview from "@/components/ProgressOverview";
import ProfileHead from "@/components/ProfileHead";
import SettingsModal from "@/components/SettingModal";
import CustomAlert from "@/components/CustomAlert";
import { useNavigation } from "expo-router";
import { BASE_URL } from "@/Ipconfig/ipconfig";

import { UserContext } from "@/context/UserContext";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { logout, showAlert } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info",
    showCancel: false,
    confirmText: "OK",
    cancelText: "Cancel",
    onConfirm: null,
    onCancel: null,
  });

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const storedUserId = await AsyncStorage.getItem("userId");
      if (!token || !storedUserId) {
        showAlert({
          title: "Error",
          message: "No token or user ID found. Please log in.",
          type: "error",
          onConfirm: () => {
            setAlertVisible(false);
            navigation.navigate("(authentication)");
          },
        });
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/user/auser/${storedUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      console.log("User data fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // showAlert({
      //   title: "Error",
      //   message: "Failed to fetch user data. Please try again later.",
      //   type: "error",
      //   onConfirm: () => setAlertVisible(false),
      // });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setIsRefreshing(false);
  };

  const handleEditProfile = () => {
    navigation.navigate("(editprofile)");
  };

  const handleSignOut = () => {
    localShowAlert({
      title: "Confirm Sign Out",
      message: "Are you sure you want to sign out?",
      type: "info",
      showCancel: true,
      confirmText: "Sign Out",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await logout();
          setAlertVisible(false);
          navigation.navigate("(authentication)");
        } catch (error) {
          console.error("Error signing out:", error);
         
        }
      },
      onCancel: () => setAlertVisible(false),
    });
  };
   const localShowAlert = (config) => {
    setAlertConfig({
      ...alertConfig,
      ...config,
      onConfirm: config.onConfirm || (() => setAlertVisible(false)),
      onCancel: config.onCancel || (() => setAlertVisible(false)),
    });
    setAlertVisible(true);
  };


  const handleDeleteAccount = async () => {
    showAlert({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete your account? This action cannot be undone.",
      type: "error",
      showCancel: true,
      confirmText: "Delete",
      cancelText: "Cancel",
      onCancel: () => setAlertVisible(false),
      onConfirm: async () => {
        try {
          const token = await AsyncStorage.getItem("userToken");
          const storedUserId = await AsyncStorage.getItem("userId");
          if (!token || !storedUserId) {
            showAlert({
              title: "Error",
              message: "You need to log in first.",
              type: "error",
              onConfirm: () => {
                setAlertVisible(false);
                navigation.navigate("(authentication)");
              },
            });
            return;
          }

          await axios.delete(`${BASE_URL}/user/delete/${storedUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userId");
          showAlert({
            title: "Success",
            message: "Account deleted successfully.",
            type: "success",
            onConfirm: () => {
              setAlertVisible(false);
              navigation.navigate("(authentication)");
            },
          });
        } catch (error) {
          console.error("Error deleting account:", error);
          showAlert({
            title: "Error",
            message:
              error.response?.data?.message ||
              "Failed to delete account. Please check your connection.",
            type: "error",
            onConfirm: () => setAlertVisible(false),
          });
        }
      },
    });
  };

  const handleNotifications = () => {
    navigation.navigate("(notification)");
  };

  if (isLoading) {
    return (
      <ImageBackground
        source={require("@/assets/images/profile2.jpeg")}
        style={styles.background}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A0DAD" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/profile2.jpeg")}
      style={styles.background}
      imageStyle={styles.imageStyle}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <ProfileHead
          user={user}
          onEditProfile={handleEditProfile}
          onSignOut={handleSignOut}
          onOpenSettings={() => setIsModalVisible(true)}
        />
        <ProgressOverview
          onViewDetails={() => navigation.navigate("(progress)")}
        />
      </ScrollView>
      <SettingsModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onNotifications={handleNotifications}
        onDeleteAccount={handleDeleteAccount}
      />
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onClose={() => setAlertVisible(false)}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  imageStyle: { opacity: 0.9 },
  container: { flexGrow: 1, alignItems: "center", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default ProfileScreen;