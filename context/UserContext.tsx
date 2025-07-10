// UserContext.tsx
import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import CustomAlert from "@/components/CustomAlert";
import { useNavigation } from "expo-router";

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
  const navigation = useNavigation();
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
    await AsyncStorage.multiRemove(["userToken", "userId", "userRole"]);
    console.log("User data cleared");
  };

  const fetchUser = useCallback(async (userId?: string): Promise<User | null> => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const storedUserId = userId || (await AsyncStorage.getItem("userId"));

      console.log("fetchUser called with:", { userId, token: !!token, storedUserId });

      if (!token || !storedUserId) {
        console.log("No token or user ID found");
        setUser(null);
        return null;
      }

      const response = await axios.get(`${BASE_URL}/user/auser/${storedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.user;
      setUser(userData);
      console.log("User data fetched successfully in context:", userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      await clearUserData();
      showAlert({
        title: "Error",
        message: "No token or user ID found. Please log in.",
        type: "error",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (userData: User, token: string) => {
    try {
      console.log("Logging in user:", userData);
      setLoading(true);

      // Store credentials in AsyncStorage
      await AsyncStorage.multiSet([
        ["userToken", token],
        ["userId", userData._id],
        ["userRole", userData.role || "user"],
      ]);

      console.log("Credentials stored successfully");

      // Fetch full user data from API
      const fetchedUser = await fetchUser(userData._id);
      if (!fetchedUser) {
        throw new Error("Failed to fetch user data after login");
      }

      console.log("User logged in successfully:", fetchedUser);

      // Navigate based on user role
      navigation.reset({
        index: 0,
        routes: [{ name: userData.role === "admin" ? "(zadmin)" : "(user)" }],
      });
    } catch (error) {
      console.error("Login failed:", error);
      await clearUserData();
      showAlert({
        title: "Login Error",
        message: "Failed to log in. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("Logout called");
    try {
      setLoading(true);
      await clearUserData();
      showAlert({
        title: "Success",
        message: "Logged out successfully",
        type: "success",
        onConfirm: () => {
          setAlertVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "(authentication)" }],
          });
        },
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
    let isMounted = true;
    const initializeUser = async () => {
      console.log("Initializing user context");
      if (isMounted) {
        await fetchUser();
      }
    };
    initializeUser();
    return () => {
      isMounted = false;
    };
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