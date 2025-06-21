import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation } from "expo-router";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const { width } = Dimensions.get("window");

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    isSuccess: false,
  });
  const navigation = useNavigation();

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Show custom modal
  const showModal = (title, message, isSuccess = false) => {
    setModalContent({
      title,
      message,
      isSuccess,
    });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalContent.isSuccess) {
      navigation.navigate("EnterCode", { email });
    }
  };

  const handleForgotPassword = async () => {
    // Input validation
    if (!email.trim()) {
      showModal("Missing Information", "Please enter your email address to continue.");
      return;
    }

    if (!isValidEmail(email)) {
      showModal("Invalid Email", "Please enter a valid email address in the format: example@domain.com");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/user/forgotpassword`,
        {
          email,
        }
      );

      if (response.status === 200) {
        showModal(
          "Success",
          "A password reset code has been sent to your email address.",
          true
        );
      }
    } catch (error) {
      console.error("Error sending reset link:", error);
      
      // Handle specific error cases
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        switch (error.response.status) {
          case 400:
            showModal(
              "Invalid Request",
              "Please check your email address and try again."
            );
            break;
          case 404:
            showModal(
              "Account Not Found",
              "No account was found with this email address. Please check and try again."
            );
            break;
          case 429:
            showModal(
              "Too Many Attempts",
              "You've made too many password reset requests. Please wait a while before trying again."
            );
            break;
          case 500:
            showModal(
              "Server Error",
              "We're experiencing technical difficulties. Please try again later."
            );
            break;
          default:
            showModal(
              "Request Failed",
              "Failed to send reset code. Please try again later."
            );
        }
      } else if (error.request) {
        // The request was made but no response was received
        showModal(
          "Connection Error",
          "Unable to connect to our servers. Please check your internet connection and try again."
        );
      } else {
        // Something happened in setting up the request
        showModal(
          "Error",
          "An unexpected error occurred. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={["#FCE38A", "#F38181"]} // Soft yellow to coral pink
        style={styles.decorativeCircle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={["#EAFFD0", "#45A29E"]} // Pastel green to teal
        style={styles.decorativeCircle2}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={["#86A8E7", "#D16BA5"]} // Soft blue to pinkish-purple
        style={styles.decorativeCircle3}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={["#FFD3A5", "#FD6585"]} // Peach to soft red
        style={styles.decorativeCircle4}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={["#D4FC79", "#96E6A1"]} // Soft lime green to mint
        style={styles.decorativeCircle5}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.appNameContainer}>
        <Text style={styles.appName}>Safina </Text>
      </View>
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Reset Password</Text>
          <Text style={styles.subheading}>
            Enter your email address to receive a code for password
            reset.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
          onPress={handleForgotPassword}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Send Code</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Modal Alert */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={modalContent.isSuccess ? ["#86A8E7", "#D16BA5"] : ["#FFD3A5", "#FD6585"]}
              style={styles.modalHeaderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
            </LinearGradient>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>{modalContent.message}</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.modalButton,
                modalContent.isSuccess ? styles.successButton : styles.errorButton
              ]}
              onPress={handleModalClose}
            >
              <Text style={styles.modalButtonText}>
                {modalContent.isSuccess ? "Continue" : "OK"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
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
  decorativeCircle: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  decorativeCircle3: {
    position: "absolute",
    top: 100,
    left: -70,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: 100,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  decorativeCircle4: {
    position: "absolute",
    bottom: -80,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  decorativeCircle5: {
    position: "absolute",
    bottom: 250,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
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
  headerContainer: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 25,
    fontFamily: "Poppins-Bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#FF69B4",
  },
  subheading: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    color: "#6B7280",
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    fontFamily: "Poppins-SemiBold",
    borderRadius: 15,
    marginBottom: 20,
    height: 60,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#FFB6C1",
  },
  button: {
    backgroundColor: "#FF69B4",
    borderRadius: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#FF69B4",
  },
  buttonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  modalHeaderGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalBody: {
    padding: 20,
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 24,
  },
  modalButton: {
    marginVertical: 10,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,backgroundColor: "#FF69B4",
  },
  successButton: {
    backgroundColor: "#FF69B4",
  },
  errorButton: {
    backgroundColor: "#FD6585",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  }
});

export default ForgotPassword;