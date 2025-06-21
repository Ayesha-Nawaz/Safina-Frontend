import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import CustomAlert from "@/components/CustomAlert";

interface User {
  _id: string;
  // Add other user properties here
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

  const fetchUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const storedUserId = await AsyncStorage.getItem("userId");

      console.log("Fetching user with token:", token);
      console.log("Fetching user with ID:", storedUserId);

      if (!token || !storedUserId) {
        console.log("No token or userId found in storage");
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/user/auser/${storedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      console.log("API Response:", response.data);

      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // showAlert({
      //   title: "Error",
      //   message: error.response?.data?.message || "Failed to fetch user data",
      //   type: "error",
      // });
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (userData: User, token: string) => {
    try {
      // Save token and userId to AsyncStorage
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userId", userData._id);
      
      // Immediately set the user state
      setUser(userData);
      
      // Fetch the latest user data from the API to ensure consistency
      await fetchUser();
      
      console.log("Login successful. User data:", userData);
    } catch (error) {
      console.error("Error saving auth data:", error);
      // showAlert({
      //   title: "Error",
      //   message: "Failed to save authentication data",
      //   type: "error",
      // });
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
      setUser(null);
      console.log("Logout successful");
      // showAlert({
      //   title: "Success",
      //   message: "Logged out successfully",
      //   type: "success",
      // });
    } catch (error) {
      console.error("Error during logout:", error);
      // showAlert({
      //   title: "Error",
      //   message: "Failed to logout properly",
      //   type: "error",
      // });
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const storedUserId = await AsyncStorage.getItem("userId");

        console.log("Initial token:", token);
        console.log("Initial userId:", storedUserId);

        if (token && storedUserId) {
          await fetchUser();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        // showAlert({
        //   title: "Error",
        //   message: "Failed to initialize user data",
        //   type: "error",
        // });
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