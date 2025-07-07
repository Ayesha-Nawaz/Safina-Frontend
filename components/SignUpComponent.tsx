import React, { useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import { UserContext } from "@/context/UserContext";

// Define error types
type ErrorType = {
  title: string;
  message: string;
};

const SignUpComponent: React.FC = () => {
  const { login } = useContext(UserContext); // Access login from UserContext
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState<boolean>(false);
  const [ageModalVisible, setAgeModalVisible] = useState<boolean>(false);
  const [genderModalVisible, setGenderModalVisible] = useState<boolean>(false);
  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<ErrorType | null>(null);
  const [usernameLength, setUsernameLength] = useState<number>(0);
  const [passwordLength, setPasswordLength] = useState<number>(0);

  const navigation = useNavigation();

  const ageOptions = Array.from({ length: 8 }, (_, i) => (i + 5).toString());
  const genderOptions = ["Male", "Female"];

  const showError = (title: string, message: string) => {
    setCurrentError({ title, message });
    setErrorModalVisible(true);
  };

  const isValidGmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const isValidPassword = (password: string) => {
    return password.length >= 6 && password.length <= 15;
  };

  const isValidUsername = (username: string) => {
    // Allow alphabets (a-z, A-Z), numbers (0-9), and spaces; disallow other characters
    const usernameRegex = /^[a-zA-Z0-9 ]+$/;
    return usernameRegex.test(username);
  };

  const validateInputs = () => {
    if (!email) {
      showError("Empty Field Error", "Email address is required.");
      return false;
    }
    if (!password) {
      showError("Empty Field Error", "Password is required.");
      return false;
    }
    if (!username) {
      showError("Empty Field Error", "Username is required.");
      return false;
    }
    if (!age) {
      showError("Empty Field Error", "Age selection is required.");
      return false;
    }
    if (!gender) {
      showError("Empty Field Error", "Gender selection is required.");
      return false;
    }

    if (!isValidGmail(email)) {
      showError("Email Error", "Only Gmail.com addresses are allowed.");
      return false;
    }

    if (!isValidUsername(username)) {
      showError("Username Error", "Username can only contain letters (a-z, A-Z), numbers (0-9), and spaces.");
      return false;
    }

    if (username.length > 25) {
      showError("Username Error", "Username should not exceed 25 characters.");
      return false;
    }

    const ageNumber = parseInt(age);
    if (isNaN(ageNumber) || ageNumber > 12 || ageNumber < 5) {
      showError("Age Error", "Age should be a number between 5 and 12.");
      return false;
    }

    if (!isValidPassword(password)) {
      showError("Password Error", "Password must be between 6 and 15 characters long.");
      return false;
    }

    return true;
  };

  const signUp = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setLoadingModalVisible(true);

    try {
      const response = await fetch(`${BASE_URL}/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
          age: parseInt(age),
          gender,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("signUp: User signed up successfully:", data.message);
        console.log("signUp: Token received:", data.token);

        const adminEmails = [
          "ayeshanawaz211288@gmail.com",
          "avae1856@gmail.com",
          "arhamaleem103@gmail.com",
        ];

        const isAdmin = adminEmails.includes(email);
        const userRole = isAdmin ? "admin" : "user";

        if (data.token) {
          // Call UserContext.login to update user state
          await login(
            {
              _id: data.user?._id || data._id, // Handle potential API response variations
              email,
              username,
              age: parseInt(age),
              gender,
              role: userRole,
            },
            data.token
          );

          await AsyncStorage.setItem("userRole", userRole);

          setLoadingModalVisible(false);

          if (isAdmin) {
            navigation.replace("(zadmin)");
          } else {
            navigation.replace("index");
          }
        } else {
          showError("Authentication Error", "No token received. Please try again.");
          setLoadingModalVisible(false);
        }
      } else {
        let errorTitle = "Registration Error";
        let errorMessage = data.message || "An error occurred during sign up.";

        if (data.message && data.message.toLowerCase().includes("email already exists")) {
          errorTitle = "Account Error";
          errorMessage = "This email is already registered. Please use a different email or try logging in.";
        } else if (data.message && data.message.toLowerCase().includes("username already exists")) {
          errorTitle = "Username Error";
          errorMessage = "This username is already taken. Please choose a different username.";
        }

        showError(errorTitle, errorMessage);
        setLoadingModalVisible(false);
      }
    } catch (error) {
      console.error("signUp: Sign-up error:", error);
      showError("Network Error", "Connection failed. Please check your internet connection and try again.");
      setLoadingModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const renderAgeItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.modalItem, age === item && styles.selectedModalItem]}
      onPress={() => {
        setAge(item);
        setAgeModalVisible(false);
      }}
    >
      <Text
        style={[
          styles.modalItemText,
          age === item && styles.selectedModalItemText,
        ]}
      >
        {item}
      </Text>
      {age === item && (
        <FontAwesome
          name="check"
          size={18}
          color="#fff"
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  const renderGenderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.modalItem, gender === item && styles.selectedModalItem]}
      onPress={() => {
        setGender(item);
        setGenderModalVisible(false);
      }}
    >
      <Text
        style={[
          styles.modalItemText,
          gender === item && styles.selectedModalItemText,
        ]}
      >
        {item}
      </Text>
      {gender === item && (
        <FontAwesome
          name="check"
          size={18}
          color="#fff"
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setUsernameLength(text.length);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordLength(text.length);
  };

  const getUsernameLengthColor = () => {
    if (usernameLength === 0) return "#999";
    if (usernameLength > 20) return "#FF8C00";
    if (usernameLength === 25) return "#FF0000";
    return "#4CAF50";
  };

  const getPasswordLengthColor = () => {
    if (passwordLength === 0) return "#999";
    if (passwordLength < 6) return "#FF0000";
    if (passwordLength > 12) return "#FF8C00";
    return "#4CAF50";
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
          <Text style={styles.subheading}>Sign Up to Join us!!</Text>

          <View style={styles.inputWrapperContainer}>
            <View style={styles.inputContainer}>
              <FontAwesome
                name="user"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={handleUsernameChange}
                maxLength={25}
              />
            </View>
            <Text style={[styles.helperText, { color: getUsernameLengthColor() }]}>
              {usernameLength}/25 characters (letters, numbers, spaces only)
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome
              name="envelope"
              size={18}
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
            />
          </View>
          <Text style={styles.helperText}>Only Gmail.com accounts are accepted</Text>

          <View style={styles.inputWrapperContainer}>
            <View style={styles.inputContainer}>
              <FontAwesome
                name="lock"
                size={22}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={handlePasswordChange}
                maxLength={15}
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
            <Text style={[styles.helperText, { color: getPasswordLengthColor() }]}>
              {passwordLength}/15 characters (min: 6, max: 15)
            </Text>
          </View>

          <TouchableOpacity
            style={styles.selectorContainer}
            onPress={() => setAgeModalVisible(true)}
          >
            <FontAwesome
              name="calendar"
              size={18}
              color="#666"
              style={styles.inputIcon}
            />
            <Text style={[styles.selectorText, !age && styles.placeholder]}>
              {age ? `Age: ${age}` : "Select Age"}
            </Text>
            <FontAwesome
              name="chevron-down"
              size={16}
              color="#666"
              style={styles.selectorIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectorContainer}
            onPress={() => setGenderModalVisible(true)}
          >
            <FontAwesome
              name="venus-mars"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <Text style={[styles.selectorText, !gender && styles.placeholder]}>
              {gender ? `Gender: ${gender}` : "Select Gender"}
            </Text>
            <FontAwesome
              name="chevron-down"
              size={16}
              color="#666"
              style={styles.selectorIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={signUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Signing Up..." : "Sign Up"}
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
            Already have an account?{" "}
            <Text
              style={styles.switchLink}
              onPress={() => navigation.navigate("index")}
            >
              Sign In
            </Text>
          </Text>
        </View>

        <Modal
          visible={ageModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setAgeModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAgeModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderText}>Select Age</Text>
                <TouchableOpacity onPress={() => setAgeModalVisible(false)}>
                  <FontAwesome name="times" size={22} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={ageOptions}
                renderItem={renderAgeItem}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.modalList}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={genderModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setGenderModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setGenderModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderText}>Select Gender</Text>
                <TouchableOpacity onPress={() => setGenderModalVisible(false)}>
                  <FontAwesome name="times" size={22} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={genderOptions}
                renderItem={renderGenderItem}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.modalList}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={loadingModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLoadingModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.loadingModalContent}>
              <ActivityIndicator size="large" color="#f78cd6" />
              <Text style={styles.modalText}>
                Creating account, Please wait...
              </Text>
            </View>
          </View>
        </Modal>

        <Modal
          visible={errorModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setErrorModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.errorModalContent}>
              <View style={styles.errorHeader}>
                <FontAwesome name="exclamation-circle" size={28} color="#fff" />
                <Text style={styles.errorHeaderText}>
                  {currentError?.title || "Error"}
                </Text>
              </View>
              <View style={styles.errorBody}>
                <Text style={styles.errorMessage}>
                  {currentError?.message || "An unexpected error occurred."}
                </Text>
                <TouchableOpacity
                  style={styles.errorButton}
                  onPress={() => setErrorModalVisible(false)}
                >
                  <Text style={styles.errorButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
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
  },
  container: {
    flex: 1,
    paddingTop: 45,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  appNameContainer: {
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
  },
  appName: {
    fontSize: 50,
    color: "#FF1493",
    fontFamily: "Airtravelers",
    textShadowColor: "rgba(229, 219, 225, 0.69)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  appTagline: {
    fontSize: 18,
    color: "#666",
    marginTop: 5,
    fontFamily: "Poppins-SemiBold",
  },
  heading: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: "#FF69B4",
    textAlign: "center",
    textShadowColor: "#FFC1CC",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subheading: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    padding: 25,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  inputWrapperContainer: {
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#FFB6C1",
    position: "relative",
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
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 10,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 5,
    marginBottom: 15,
    fontFamily: "Poppins-Regular",
  },
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#FFB6C1",
    height: 58,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  selectorIcon: {
    padding: 5,
  },
  placeholder: {
    color: "#999",
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
  switchTextContainer: {
    marginTop: 15,
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
  modalOverlay: {
    padding: 20,
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingBottom: 30,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalHeaderText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#FF69B4",
  },
  modalList: {
    padding: 10,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: "#F8F9FA",
  },
  selectedModalItem: {
    backgroundColor: "#FF69B4",
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  selectedModalItemText: {
    color: "#fff",
  },
  checkIcon: {
    marginLeft: 10,
  },
  loadingModalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  errorModalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    maxWidth: 350,
    alignSelf: "center",
    overflow: "hidden",
  },
  errorHeader: {
    backgroundColor: "#FF1493",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  errorHeaderText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginLeft: 10,
  },
  errorBody: {
    padding: 20,
    alignItems: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
  },
  errorButton: {
    backgroundColor: "#FF69B4",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});

export default SignUpComponent;