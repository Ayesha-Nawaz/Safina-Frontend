import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const SignInComponent: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [errorVisible, setErrorVisible] = useState<boolean>(false);
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigation = useNavigation();

  // Function to reset form states
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setIsPasswordVisible(false);
    setErrorVisible(false);
    setErrorTitle("");
    setErrorMessage("");
  };

  // Reset form when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetForm();
    }, [])
  );

  // Function to show error modal with specific title and message
  const showError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorVisible(true);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const signIn = async () => {
    // Form validation
    if (!email && !password) {
      showError("Missing Information", "Please enter both email and password.");
      return;
    }
    
    if (!email) {
      showError("Email Required", "Please enter your email address.");
      return;
    }
    
    if (!validateEmail(email)) {
      showError("Invalid Email", "Please enter a valid email address.");
      return;
    }
    
    if (!password) {
      showError("Password Required", "Please enter your password.");
      return;
    }
  
    setLoading(true);
    setIsModalVisible(true);
  
    try {
      const response = await axios.post(
        `${BASE_URL}/user/login`,
        {
          email,
          password,
        }
      );
  
      const { token, userId } = response.data;
      console.log("Response data:", response.data);
      console.log("User signed in:", token, userId);
  
      const adminEmails = [
        "ayeshanawaz211288@gmail.com",
        "avae1856@gmail.com",
        "arhamaleem103@gmail.com",
      ];
  
      const isAdmin = adminEmails.includes(email);
      const userRole = isAdmin ? "admin" : "user";
  
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userId", userId);
      await AsyncStorage.setItem("userRole", userRole);
  
      navigation.navigate(isAdmin ? "(zadmin)" : "(user)");
  
    } catch (error) {
      console.error("Login error:", error);
      
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          showError(
            "Connection Error", 
            "Unable to connect to the server. Please check your internet connection and try again."
          );
        } else {
          const status = error.response.status;
          
          switch (status) {
            case 401:
              showError(
                "Authentication Failed", 
                "Invalid email or password. Please check your credentials and try again."
              );
              break;
            case 404:
              showError(
                "User Not Found", 
                "No account found with this email address. Please sign up first."
              );
              break;
            case 403:
              showError(
                "Account Locked", 
                "Your account has been temporarily locked due to multiple failed login attempts. Please try again later."
              );
              break;
            case 500:
              showError(
                "Server Error", 
                "Our servers are experiencing issues. Please try again later."
              );
              break;
            default:
              showError(
                "Login Failed", 
                "An unexpected error occurred. Please try again later."
              );
          }
        }
      } else {
        showError(
          "Login Failed", 
          "An unexpected error occurred. Please try again later."
        );
      }
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  return (
    <ScrollView style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.appNameContainer}>
          <Text style={styles.appName}>Safina </Text>
          <Text style={styles.appTagline}>A Vessel of Knowledge</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome!</Text>
          <Text style={styles.subheading}>
            Sign in to continue your journey
          </Text>

          <View style={styles.inputContainer}>
            <FontAwesome
              name="envelope"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome
              name="lock"
              size={24}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <FontAwesome
                name={isPasswordVisible ? "eye-slash" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Text
              style={styles.forgotPasswordText}
              onPress={() => navigation.navigate("(zforgetpassword)")}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={signIn}
            style={styles.button}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Signing In..." : "Sign In"}
            </Text>
            {!loading && (
              <FontAwesome
                name="arrow-right"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchText}>
            Don't have an account?{" "}
            <Text
              style={styles.switchLink}
              onPress={() => navigation.navigate("signup")}
            >
              Sign Up
            </Text>
          </Text>
        </View>
        
        <Modal
          transparent={true}
          animationType="fade"
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#FF69B4" />
              <Text style={styles.modalText}>Logging in, please wait...</Text>
            </View>
          </View>
        </Modal>
        
        <Modal
          transparent={true}
          animationType="fade"
          visible={errorVisible}
          onRequestClose={() => setErrorVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.errorModalContent}>
              <View style={styles.errorIconContainer}>
                <FontAwesome name="exclamation-circle" size={40} color="#FF69B4" />
              </View>
              <Text style={styles.errorTitle}>{errorTitle}</Text>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
              <TouchableOpacity 
                style={styles.errorButton}
                onPress={() => setErrorVisible(false)}
              >
                <Text style={styles.errorButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingTop: 50,
    padding: 20
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appNameContainer: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  appName: {
    fontSize: 50,
    color: "#FF1493",
    fontFamily: "Airtravelers",
    textShadowColor: "rgba(216, 140, 181, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  appTagline: {
    fontSize: 18,
    color: "#666",
    marginTop: 5,
    fontFamily: "Poppins-SemiBold",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  heading: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: "#FF69B4",
    textAlign: "center",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#FFB6C1",
    position: "relative", // Ensures proper alignment
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingTop: 18,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  passwordInput: {
    paddingRight: 40, // Adds space for the eye icon
  },
  eyeIcon: {
    position: "absolute",
    right: 15, // Positions it inside the inputContainer at the right
    padding: 10,
  },
  button: {
    backgroundColor: "#FF69B4",
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Bold",
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  forgotPasswordText: {
    color: "#FF69B4",
    fontFamily: "Poppins-SemiBold",
    textDecorationLine: "underline",
    textAlign: "right",
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginTop: 15,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },
  switchTextContainer: {
    marginTop: 20,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 15,
    borderRadius: 20,
  },
  switchText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  switchLink: {
    color: "#FF69B4",
    fontFamily: "Poppins-Bold",
    textDecorationLine: "underline",
  },
  
  // Error modal styles
  errorModalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorIconContainer: {
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#FF69B4",
    marginBottom: 10,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: "#FF69B4",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 5,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});

export default SignInComponent;