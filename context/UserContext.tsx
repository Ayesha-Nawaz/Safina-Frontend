import React, { createContext, useState, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import CustomAlert from "@/components/CustomAlert";

interface User {
  _id: string;
  age?: number;
  email?: string;
  gender?: string;
  isActive?: boolean;
  role?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  fetchUser: (userId?: string) => Promise<User | null>;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  showAlert: (config: {
    title: string;
    message: string;
    type?: string;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
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
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New flag to prevent fetchUser during login

  const showAlert = (config) => {
    console.log("Showing alert:", config);
    setAlertConfig({
      ...alertConfig,
      ...config,
      onConfirm: config.onConfirm || (() => setAlertVisible(false)),
      onCancel: config.onCancel || (() => setAlertVisible(false)),
    });
    setAlertVisible(true);
  };

  const clearUserData = async () => {
    console.log("Clearing user data");
    setUser(null);
    try {
      await AsyncStorage.multiRemove(["userToken", "userId", "userRole"]);
      console.log("AsyncStorage cleared successfully");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
      showAlert({
        title: "Error",
        message: "Failed to clear user data.",
        type: "error",
      });
    }
  };

  const fetchUser = useCallback(async (userId?: string): Promise<User | null> => {
    if (isLoggingIn) {
      console.log("fetchUser skipped: login in progress");
      return user;
    }
    if (user) {
      console.log("fetchUser skipped: user already exists in state", user);
      return user;
    }
    console.log("fetchUser called with userId:", userId);
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const storedUserId = userId || (await AsyncStorage.getItem("userId"));

      if (!token || !storedUserId) {
        console.log("No token or userId found");
        await clearUserData();
        return null;
      }

      console.log("Fetching user data from API for userId:", storedUserId);
      const response = await axios.get(`${BASE_URL}/user/auser/${storedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (response.data) {
        console.log("User data fetched successfully:", response.data);
        setUser(response.data);
        return response.data;
      } else {
        console.log("No user data returned from API");
        await clearUserData();
        return null;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      if (axios.isAxiosError(error)) {
        console.log("Axios error status:", error.response?.status);
        if (error.response?.status === 401 || error.response?.status === 404) {
          console.log("Unauthorized or user not found, clearing user data");
          await clearUserData();
        }
      }
      showAlert({
        title: "Error",
        message: "Failed to fetch user data. Please try logging in again.",
        type: "error",
      });
      return null;
    } finally {
      setLoading(false);
      console.log("fetchUser completed, loading set to false, user:", user);
    }
  }, [isLoggingIn, user]);

  const login = async (userData: User, token: string) => {
    console.log("login called with userData:", userData, "token:", token);
    try {
      setLoading(true);
      setIsLoggingIn(true); // Set flag to prevent fetchUser
      console.log("Clearing previous user data before login");
      await clearUserData();

      console.log("Storing new credentials");
      await AsyncStorage.multiSet([
        ["userToken", token],
        ["userId", userData._id],
        ["userRole", userData.role || ""],
      ]);
      console.log("Credentials stored successfully");

      console.log("Setting user data:", userData);
      setUser(userData); // Set user data immediately
      console.log("User state set to:", userData);
    } catch (error) {
      console.error("Login failed:", error);
      showAlert({
        title: "Login Error",
        message: "Failed to log in. Please try again.",
        type: "error",
      });
      await clearUserData();
    } finally {
      setLoading(false);
      setIsLoggingIn(false);
      console.log("login completed, loading set to false, isLoggingIn:", false, "user:", userData);
    }
  };

  const logout = async () => {
    console.log("logout called");
    try {
      setLoading(true);
      await clearUserData();
      showAlert({
        title: "Success",
        message: "Logged out successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Logout error:", error);
      showAlert({
        title: "Logout Error",
        message: "Failed to log out. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
      console.log("logout completed, loading set to false, user:", null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        fetchUser,
        login,
        logout,
        showAlert,
      }}
    >
      {children}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onClose={() => {
          console.log("Closing alert");
          setAlertVisible(false);
        }}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </UserContext.Provider>
  );
};