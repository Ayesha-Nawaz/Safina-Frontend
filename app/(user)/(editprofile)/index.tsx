import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "@/components/CustomAlert"; // Import the CustomAlert component
import { BASE_URL } from "@/Ipconfig/ipconfig";

const { width } = Dimensions.get("window");

const EditProfileScreen = () => {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});

  // Modal states
  const [ageModalVisible, setAgeModalVisible] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  // CustomAlert states
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

  // Age options (5-12)
  const ageOptions = Array.from({ length: 8 }, (_, i) => (i + 5).toString());

  // Gender options
  const genderOptions = ["Male", "Female"];

  // Helper function to show custom alerts
  const showAlert = (config) => {
    setAlertConfig({
      ...alertConfig,
      ...config,
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          showAlert({
            title: "Error",
            message: "No token found. Please log in.",
            type: "error",
          });
          return;
        }

        const storedUserId = await AsyncStorage.getItem("userId");
        const response = await axios.get(
          `${BASE_URL}/user/auser/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
        const userData = response.data.user;
        setUsername(userData.username || "");
        setEmail(userData.email || "");
        setAge(userData.age?.toString() || "");
        setGender(
          userData.gender?.charAt(0).toUpperCase() +
            userData.gender?.slice(1) || ""
        );
      } catch (error) {
        console.error("Error fetching user data: ", error);
        showAlert({
          title: "Error",
          message: "Failed to fetch user data. Please try again.",
          type: "error",
        });
      }
    };
    fetchUserData();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Username validation (not empty, max 25 characters, only alphabets)
    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (username.trim().length > 25) {
      newErrors.username = "Username must be 25 characters or less";
      isValid = false;
    } else if (!/^[a-zA-Z]+$/.test(username.trim())) {
      newErrors.username = "Username must contain only alphabetic characters";
      isValid = false;
    }

    // Email validation (not empty, valid format, and must be gmail.com)
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else {
      // Email regex pattern to validate format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      } else if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
        newErrors.email =
          "Email must be a Gmail address (e.g., example@gmail.com)";
        isValid = false;
      }
    }

    // Age validation (must be between 5-12)
    if (!age.trim()) {
      newErrors.age = "Age is required";
      isValid = false;
    } else if (!ageOptions.includes(age.trim())) {
      newErrors.age = "Age must be between 5 and 12 years";
      isValid = false;
    }

    // Gender validation (must be "Male" or "Female")
    if (!gender.trim()) {
      newErrors.gender = "Gender is required";
      isValid = false;
    } else if (!genderOptions.includes(gender.trim())) {
      newErrors.gender = "Gender must be Male or Female";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    try {
      // Validate form first
      if (!validateForm()) {
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showAlert({
          title: "Error",
          message: "No token found. Please log in.",
          type: "error",
        });
        return;
      }

      const userId = user?.user?._id;
      if (!userId) {
        showAlert({
          title: "Error",
          message: "User ID not found. Please try logging in again.",
          type: "error",
        });
        return;
      }

      const updatedData = {
        username: username.trim(),
        email: email.trim(),
        age: parseInt(age),
        gender: gender.trim().toLowerCase(),
      };

      const response = await axios.put(
        `${BASE_URL}/user/update/${userId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      if (response.data.message === "User updated successfully") {
        showAlert({
          title: "Success",
          message: "Profile updated successfully",
          type: "success",
          onConfirm: () => navigation.goBack(),
        });
      } else {
        showAlert({
          title: "Error",
          message: "Failed to update profile. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Full error:", error);
      showAlert({
        title: "Error",
        message: error.response?.data?.message || "Server error occurred",
        type: "error",
      });
    }
  };

  const handleResetPassword = () => {
    // Navigate to ResetPasswordScreen with the user's email
    navigation.navigate("(zforgetpassword)");
  };

  // Helper function to render error message
  const renderError = (field) => {
    return errors[field] ? (
      <Text style={styles.errorText}>{errors[field]}</Text>
    ) : null;
  };

  // Age Picker Modal
  const renderAgeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={ageModalVisible}
      onRequestClose={() => setAgeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={["#614385", "#516395"]}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Select Age</Text>
            <TouchableOpacity onPress={() => setAgeModalVisible(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <FlatList
            data={ageOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  age === item && styles.selectedOptionItem,
                ]}
                onPress={() => {
                  setAge(item);
                  setAgeModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    age === item && styles.selectedOptionText,
                  ]}
                >
                  {item} years
                </Text>
                {age === item && (
                  <Ionicons name="checkmark-circle" size={24} color="#614385" />
                )}
              </TouchableOpacity>
            )}
            style={styles.optionsList}
          />
        </Animatable.View>
      </View>
    </Modal>
  );

  // Gender Picker Modal
  const renderGenderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={genderModalVisible}
      onRequestClose={() => setGenderModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={["#614385", "#516395"]}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Select Gender</Text>
            <TouchableOpacity onPress={() => setGenderModalVisible(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.genderOptionsContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  gender === option && styles.selectedGenderOption,
                ]}
                onPress={() => {
                  setGender(option);
                  setGenderModalVisible(false);
                }}
              >
                <LinearGradient
                  colors={
                    gender === option
                      ? ["#614385", "#516395"]
                      : ["#f8f8f8", "#f0f0f0"]
                  }
                  style={styles.genderOptionInner}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      gender === option && styles.selectedGenderOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground
      source={require("@/assets/images/profile2.jpeg")}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Animatable.View
          animation="fadeInUp"
          duration={1000}
          style={styles.formContainer}
        >
          <Text style={styles.title}>Edit Profile</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              value={username}
              onChangeText={setUsername}
              placeholder="Username (max 25 characters, letters only)"
              maxLength={25}
            />
            {renderError("username")}
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email (e.g., example@gmail.com)"
              keyboardType="email-address"
            />
            {renderError("email")}
          </View>

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[styles.pickerButton, errors.age && styles.inputError]}
              onPress={() => setAgeModalVisible(true)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  !age && styles.placeholderText,
                ]}
              >
                {age ? `${age} years` : "Select Age"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#614385" />
            </TouchableOpacity>
            {renderError("age")}
          </View>

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[styles.pickerButton, errors.gender && styles.inputError]}
              onPress={() => setGenderModalVisible(true)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  !gender && styles.placeholderText,
                ]}
              >
                {gender || "Select Gender"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#614385" />
            </TouchableOpacity>
            {renderError("gender")}
          </View>

          <TouchableOpacity
            style={styles.resetPasswordButton}
            onPress={handleResetPassword}
          >
            <LinearGradient
              colors={["#614385", "#516395"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.resetPasswordGradient}
            >
              <Ionicons
                name="lock-closed"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.resetPasswordText}>Reset Password</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={["#FF9E80", "#FF7043"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Back</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={["#66BB6A", "#4CAF50"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons
                  name="save"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </KeyboardAvoidingView>

      {renderAgeModal()}
      {renderGenderModal()}
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
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    padding: 30,
    width: "92%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    color: "#614385",
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: "#E4E4E4",
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 15,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pickerButton: {
    height: 50,
    borderColor: "#E4E4E4",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pickerButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  placeholderText: {
    color: "#aaa",
  },
  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 5,
    fontFamily: "Poppins-Regular",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  buttonIcon: {
    marginRight: 8,
  },
  resetPasswordButton: {
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resetPasswordGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resetPasswordText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: width * 0.85,
    maxHeight: 400,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOptionItem: {
    backgroundColor: "rgba(97, 67, 133, 0.1)",
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  selectedOptionText: {
    fontFamily: "Poppins-SemiBold",
    color: "#614385",
  },

  // Gender picker specific styles
  genderOptionsContainer: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-around",
  },
  genderOption: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedGenderOption: {
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  genderOptionInner: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  genderOptionText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#614385",
  },
  selectedGenderOptionText: {
    color: "#fff",
  },
});

export default EditProfileScreen;
