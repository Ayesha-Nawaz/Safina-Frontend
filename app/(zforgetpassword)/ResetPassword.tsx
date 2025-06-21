import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigation = useNavigation();
  const { verificationCode } = useLocalSearchParams();

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValidPassword = (password: string) => {
      return password.length >= 6 && password.length <= 15;
    };
    if (!isValidPassword(password)) {
      showError("Password Error", "Password must be between 6 and 15 characters long.");
      return false;
    }
    
    return null;
  };

  const handleResetPassword = async () => {
    // Clear previous messages
    setError("");
    setSuccessMessage("");

    // Input validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }

    // Password matching validation
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password strength validation
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }

    // Verification code validation
    if (!verificationCode) {
      setError("Verification code is missing");
      return;
    }

    setLoading(true);

    try {
      console.log("Verification Code:", verificationCode);

      const response = await axios.post(
        `${BASE_URL}/user/resetpassword`,
        {
          verificationCode,
          newPassword,
        }
      );

      console.log("Response data:", response.data);

      if (response.status === 200) {
        setSuccessMessage("Password has been reset successfully");
        // Clear form fields
        setNewPassword("");
        setConfirmPassword("");
        
        // Navigate after a brief delay to allow the user to see the success message
        setTimeout(() => {
          navigation.navigate("(authentication)");
        }, 2000);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      
      // Handle different error scenarios
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        switch (error.response.status) {
          case 400:
            setError(error.response.data.message || "Invalid verification code or password format");
            break;
          case 401:
            setError("Verification code has expired. Please request a new one");
            break;
          case 404:
            setError("Verification code not found");
            break;
          case 500:
            setError("Server error. Please try again later");
            break;
          default:
            setError("Failed to reset password. Please try again");
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your internet connection");
      } else {
        // Something happened in setting up the request
        setError("Error setting up request. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appNameContainer}>
          <Text style={styles.appName}>Safina</Text>
        </View>
        
        {/* Background decorative elements */}
        <LinearGradient
          colors={["#FCE38A", "#F38181"]}
          style={styles.decorativeCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={["#EAFFD0", "#45A29E"]}
          style={styles.decorativeCircle2}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={["#86A8E7", "#D16BA5"]}
          style={styles.decorativeCircle3}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={["#FFD3A5", "#FD6585"]}
          style={styles.decorativeCircle4}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={["#D4FC79", "#96E6A1"]}
          style={styles.decorativeCircle5}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.card}>
          <Text style={styles.heading}>Reset Password</Text>

          {/* Error message display */}
          {error ? (
            <View style={styles.alertError}>
              <FontAwesome name="exclamation-circle" size={20} color="#fff" style={styles.alertIcon} />
              <Text style={styles.alertText}>{error}</Text>
            </View>
          ) : null}

          {/* Success message display */}
          {successMessage ? (
            <View style={styles.alertSuccess}>
              <FontAwesome name="check-circle" size={20} color="#fff" style={styles.alertIcon} />
              <Text style={styles.alertText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome
                name={showNewPassword ? "eye-slash" : "eye"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome
                name={showConfirmPassword ? "eye-slash" : "eye"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Password requirements hint */}
          <Text style={styles.passwordHint}>
            Password must be at least 6 characters and should not more than 15 characters
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading}
            onPress={handleResetPassword}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
          
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
    paddingVertical: 40,
  },
  appNameContainer: {
    alignItems: "center",
    marginBottom: 40,
    width: 200,
  },
  appName: {
    fontSize: 50,
    color: "#FF1493",
    fontFamily: "Airtravelers",
    textShadowColor: "rgba(216, 140, 181, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  // Background decorative elements
  decorativeCircle: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.8,
  },
  decorativeCircle3: {
    position: "absolute",
    top: 100,
    left: -70,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.8,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: 100,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.8,
  },
  decorativeCircle4: {
    position: "absolute",
    bottom: -80,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.8,
  },
  decorativeCircle5: {
    position: "absolute",
    bottom: 250,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.8,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignSelf: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  heading: {
    fontSize: 25,
    fontFamily: "Poppins-Bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#FF69B4",
  },
  // Alert styles
  alertError: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertSuccess: {
    backgroundColor: "#4BB543",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertIcon: {
    marginRight: 10,
  },
  alertText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    marginBottom: 15,
    height: 60,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#FFB6C1",
  },
  input: {
    flex: 1,
    fontFamily: "Poppins-SemiBold",
    height: "100%",
    color: "#333",
  },
  eyeIcon: {
    padding: 10,
  },
  passwordHint: {
    fontSize: 12,
    color: "#888",
    marginBottom: 20,
    textAlign: "left",
    fontFamily: "Poppins-Regular",
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#FF69B4",
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#FFADD6",
    shadowOpacity: 0.1,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  backButton: {
    marginTop: 15,
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#888",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
});

export default ResetPassword;