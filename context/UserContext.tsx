import React, { createContext, useState, useEffect, useCallback } from "react";
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
  fetchUser: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
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
    await AsyncStorage.multiRemove(["userToken", "userId", "userRole"]);
  };

  const fetchUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const storedUserId = await AsyncStorage.getItem("userId");

      if (!token || !storedUserId) {
        console.log("No token or userId found, clearing user data");
        await clearUserData();
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/user/auser/${storedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (response.data) {
        console.log("Fresh user data fetched for userId:", storedUserId);
        setUser(response.data);
      } else {
        await clearUserData();
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          await clearUserData();
        }
      }
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
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userId", userData._id);

      // Fetch fresh user data
      console.log("LOGIN: Fetching fresh user data for:", userData._id);
      await fetchUser();
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

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("INIT: Checking stored credentials");
        const token = await AsyncStorage.getItem("userToken");
        const storedUserId = await AsyncStorage.getItem("userId");

        if (token && storedUserId) {
          console.log("INIT: Found credentials, fetching user data");
          await fetchUser();
        } else {
          console.log("INIT: No credentials found");
          await clearUserData();
        }
      } catch (error) {
        console.error("Initialization error:", error);
        await clearUserData();
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [fetchUser]);

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