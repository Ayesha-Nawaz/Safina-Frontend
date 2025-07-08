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
  fetchUser: (userId?: string) => Promise<void>;
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

  const showAlert = (config) => {
    setAlertConfig({
      ...alertConfig,
      ...config,
      onConfirm: config.onConfirm || (() => setAlertVisible(false)),
      onCancel: config.onCancel || (() => setAlertVisible(false)),
    });
    setAlertVisible(true);
  };

  const clearUserData = async () => {
    console.log("Clearing user data completely");
    setUser(null);
    try {
      await AsyncStorage.multiRemove(["userToken", "userId", "userRole"]);
      console.log("AsyncStorage cleared");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const fetchUser = useCallback(async (userId?: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const storedUserId = userId || await AsyncStorage.getItem("userId");

      if (!token || !storedUserId) {
        console.log("No token or userId found, clearing user data");
        await clearUserData();
        return;
      }

      console.log("Fetching user data for userId:", storedUserId);
      const response = await axios.get(`${BASE_URL}/user/auser/${storedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (response.data) {
        console.log("Fresh user data fetched for userId:", storedUserId);
        setUser(response.data);
      } else {
        console.log("No user data returned, clearing user data");
        await clearUserData();
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      if (axios.isAxiosError(error)) {
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
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (userData: User, token: string) => {
    try {
      setLoading(true);
      console.log("LOGIN: Clearing all previous user data");
      await clearUserData();

      // Store new credentials
      console.log("LOGIN: Storing new credentials for userId:", userData._id);
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userId", userData._id);

      // Set user data immediately from login response
      console.log("LOGIN: Setting user data immediately");
      setUser(userData);

      // Fetch fresh user data in background for any updates
      console.log("LOGIN: Fetching fresh user data for:", userData._id);
      await fetchUser(userData._id);
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
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log("LOGOUT: Clearing all user data");
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
        onClose={() => setAlertVisible(false)}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </UserContext.Provider>
  );
};