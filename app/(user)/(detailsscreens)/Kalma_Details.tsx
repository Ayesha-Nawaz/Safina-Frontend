import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Animated,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { UserContext } from "@/context/UserContext";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import CustomAlert from "@/components/CustomAlert"; // Adjust the import path as needed

// Color theme constants
const COLORS = {
  primary: "#FF9AA2",
  secondary: "#FFB7B2",
  accent: "#FFDAC1",
  text: "#666",
  lightText: "#999",
  background: "#F0F8FF",
  card: "#FFFFFF",
  shadow: "#4CAF50",
  border: "#A5D6A7",
  success: "#4CAF50",
  info: "#2196F3",
  warning: "#FF9800",
  error: "#F44336",
};

const KalmaDetail: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [kalmaData, setKalmaData] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [language, setLanguage] = useState<"urdu" | "english">("urdu");
  const [isLearned, setIsLearned] = useState(false);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for CustomAlert
  const [alertProps, setAlertProps] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "info" | "warning" | "error",
    confirmText: "OK",
    showCancel: false,
    cancelText: "Cancel",
  });

  // Function to show CustomAlert
  const showAlert = ({
    title,
    message,
    type = "info",
    confirmText = "OK",
    showCancel = false,
    cancelText = "Cancel",
    onConfirm,
    onCancel,
  }: {
    title: string;
    message: string;
    type?: "success" | "info" | "warning" | "error";
    confirmText?: string;
    showCancel?: boolean;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => {
    setAlertProps({
      visible: true,
      title,
      message,
      type,
      confirmText,
      showCancel,
      cancelText,
      onConfirm,
      onCancel,
    });
  };

  // Function to hide CustomAlert
  const hideAlert = () => {
    setAlertProps((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const fetchKalmaData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/kalma/${id}`);
        setKalmaData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching kalma details:", err);
        setError(err.message || "Failed to load kalma details");
      } finally {
        setLoading(false);
      }
    };

    fetchKalmaData();
  }, [id]);

  // Check bookmark status on component mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user?.user?._id) {
        console.warn("Cannot check bookmark: No user ID available");
        return;
      }

      if (!id) {
        console.error("Cannot check bookmark: Missing content ID");
        return;
      }

      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          console.warn("Cannot check bookmark: No authentication token found");
          return;
        }

        const params = {
          userId: user.user._id,
          contentId: id,
          contentType: "Kalma",
        };

        console.log("Making bookmark check request to:", `${BASE_URL}/bookmarks/check`);
        console.log("With params:", params);

        const response = await axios.get(`${BASE_URL}/bookmarks/check`, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 5000,
        });

        if (response.data && typeof response.data.isBookmarked === "boolean") {
          setIsBookmarked(response.data.isBookmarked);
          console.log("Bookmark status updated to:", response.data.isBookmarked);
        } else {
          console.warn("Invalid bookmark response format:", response.data);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error(
              "Bookmark check failed with status:",
              error.response.status,
              "Data:",
              error.response.data
            );
          } else if (error.request) {
            console.error("No response received for bookmark check");
          } else {
            console.error("Error setting up bookmark check:", error.message);
          }
        } else {
          console.error("Unexpected error checking bookmark:", error);
        }
      }
    };
    checkBookmarkStatus();
  }, [id, user]);

  // Animation effects
  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const startRotateAnimation = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle navigation and audio cleanup
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (sound) {
        e.preventDefault();

        const cleanup = async () => {
          try {
            console.log("Navigating away, stopping audio");

            if (sound) {
              try {
                if (isPlaying) {
                  await sound.stopAsync();
                }
                await sound.unloadAsync();
              } catch (soundError) {
                console.log("Error cleaning up sound:", soundError);
              }
            }

            setSound(null);
            setIsPlaying(false);
            navigation.dispatch(e.data.action);
          } catch (error) {
            console.error("General error in audio cleanup:", error);
            navigation.dispatch(e.data.action);
          }
        };

        cleanup();
      }
    });

    return unsubscribe;
  }, [navigation, sound, isPlaying]);

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (sound) {
        try {
          console.log("Back button pressed, stopping audio");
          if (isPlaying) {
            sound
              .stopAsync()
              .then(() => sound.unloadAsync())
              .then(() => {
                setSound(null);
                setIsPlaying(false);
              })
              .catch((error) => {
                console.log("Error cleaning up sound on back press:", error);
                setSound(null);
                setIsPlaying(false);
              });
          } else {
            sound
              .unloadAsync()
              .then(() => {
                setSound(null);
              })
              .catch((error) => {
                console.log("Error unloading sound on back press:", error);
                setSound(null);
              });
          }
        } catch (error) {
          console.log("General error on back press:", error);
          setSound(null);
          setIsPlaying(false);
        }
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [sound, isPlaying]);

  // Audio playback functionality
  const toggleAudio = async () => {
    try {
      if (!kalmaData?.audio) {
        showAlert({
          title: "No Audio Available",
          message: "Audio is not available for this Kalma.",
          type: "warning",
        });
        return;
      }

      if (!sound) {
        console.log("Loading new audio...");
        const { sound: newSound } = await Audio.Sound.createAsync({
          uri: kalmaData.audio,
        });
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            newSound.unloadAsync();
            setSound(null);
          }
        });

        await newSound.playAsync();
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          console.log("Pausing audio...");
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          console.log("Resuming audio...");
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      showAlert({
        title: "Audio Error",
        message: "Could not play the audio.",
        type: "error",
      });
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Bookmark functionality
  const handleAddBookmark = async () => {
    if (isBookmarked) {
      showAlert({
        title: "Bookmark Info",
        message: "This Kalma is already bookmarked.",
        type: "info",
      });
      return;
    }

    if (!user?.user?._id) {
      showAlert({
        title: "Login Required",
        message: "Please log in to bookmark content.",
        type: "warning",
      });
      return;
    }

    if (!id) {
      showAlert({
        title: "Error",
        message: "No content available to bookmark.",
        type: "error",
      });
      return;
    }

    setBookmarkLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Authentication token not found");

      console.log("Sending bookmark request with:", {
        userId: user.user._id,
        contentId: id,
        contentType: "Kalma",
      });

      const response = await axios.post(
        `${BASE_URL}/bookmarks/add`,
        {
          userId: user.user._id,
          contentId: id,
          contentType: "Kalma",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Bookmark response:", response.data);
      setIsBookmarked(true);
      startRotateAnimation();
      showAlert({
        title: "Success",
        message: "Bookmark added successfully.",
        type: "success",
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setIsBookmarked(true);
        showAlert({
          title: "Bookmark Info",
          message: "This Kalma is already bookmarked.",
          type: "info",
        });
      } else {
        console.error("Error adding bookmark:", error);
        showAlert({
          title: "Bookmark Error",
          message: "Failed to add bookmark. Please try again.",
          type: "error",
        });
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Mark as learned functionality
 const markAsLearn = async () => {
  try {
    if (!user?.user?._id) {
      showAlert({
        title: "Login Required",
        message: "Please log in to mark content as learned.",
        type: "warning",
      });
      return;
    }

    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      showAlert({
        title: "Authentication Error",
        message: "Authentication token not found.",
        type: "error",
      });
      return;
    }

    console.log("Marking as learned:", {
      userId: user.user._id,
      kalmaId: id,
    });

    const response = await axios.post(
      `${BASE_URL}/progress/kalmaprogress`,
      {
        userId: user.user._id,
        kalmaId: id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Mark as learned response:", response.data);

    if (response.data.message === "Kalma already marked as learn") { // Updated to match backend
      setIsLearned(true);
      showAlert({
        title: "Already Learned",
        message: "This Kalma has already been marked as learned.",
        type: "info",
      });
    } else {
      setIsLearned(true);
      showAlert({
        title: "Success",
        message: "Kalma marked as learned successfully.",
        type: "success",
      });
    }
  } catch (error) {
    console.error("Error marking Kalma as learn:", {
      errorResponse: error.response?.data,
      errorMessage: error.message,
    });

    showAlert({
      title: error.response?.data?.message === "Kalma already marked as learn" ? "Already Learned" : "Error",
      message:
        error.response?.data?.message === "Kalma already marked as learn"
          ? "This Kalma has already been marked as learned."
          : error.response?.data?.message || "An error occurred while marking the Kalma as learned.",
      type: error.response?.data?.message === "Kalma already marked as learn" ? "info" : "error",
    });

    if (error.response?.data?.message === "Kalma already marked as learn") {
      setIsLearned(true);
    }
  }
};
  return (
    <ImageBackground
      source={require("@/assets/images/kalmas.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                {
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Language Toggle */}
          <View style={styles.languageToggle}>
            {["urdu", "english"].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  language === lang && styles.activeLanguage,
                ]}
                onPress={() => {
                  setLanguage(lang as "urdu" | "english");
                  animatePress();
                }}
              >
                <Animated.Text
                  style={[
                    styles.languageText,
                    language === lang && styles.activeLanguageText,
                    { transform: [{ scale: scaleAnim }] },
                  ]}
                >
                  {lang === "urdu" ? "اردو" : "English"}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            {/* Bookmark Button */}
            <TouchableOpacity
              style={[
                styles.bookmarkButton,
                isBookmarked
                  ? styles.bookmarkButtonActive
                  : styles.bookmarkButtonInactive,
              ]}
              onPress={handleAddBookmark}
              disabled={bookmarkLoading}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                {bookmarkLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={24}
                    color="#fff"
                  />
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Arabic Section with Audio */}
            <View style={styles.arabicSection}>
              <View style={styles.arabicTextContainer}>
                <Text style={styles.arabicText}>{kalmaData?.arabic || ""}</Text>
              </View>
              {/* Audio Controls */}
              {kalmaData?.audio && (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={toggleAudio}
                >
                  <Animated.View
                    style={[
                      styles.audioIconContainer,
                      { transform: [{ scale: scaleAnim }] },
                    ]}
                  >
                    <Ionicons
                      name={isPlaying ? "pause-circle" : "play-circle"}
                      size={60}
                      color="#4CAF50"
                    />
                  </Animated.View>
                </TouchableOpacity>
              )}
            </View>

            {/* Translation Section */}
            <View style={styles.translationSection}>
              {language === "urdu" ? (
                <View style={styles.translationContainer}>
                  <Text style={styles.urduTitle}>{kalmaData?.titleUrdu || ""}</Text>
                  <Text style={styles.urduContent}>{kalmaData?.contentUrdu || ""}</Text>
                </View>
              ) : (
                <View style={styles.translationContainer}>
                  <Text style={styles.englishTitle}>{kalmaData?.title || ""}</Text>
                  <Text style={styles.englishContent}>{kalmaData?.content || ""}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Mark as Learn Button */}
          <TouchableOpacity
            style={[
              styles.markAsReadButton,
              isLearned && styles.markAsReadButtonActive,
            ]}
            onPress={markAsLearn}
            disabled={isLearned}
          >
            <Text
              style={[
                styles.markAsReadText,
                isLearned && styles.markAsReadTextActive,
              ]}
            >
              {isLearned ? "✓ Learned!" : "Mark as Learned"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* CustomAlert Component */}
      <CustomAlert
        visible={alertProps.visible}
        title={alertProps.title}
        message={alertProps.message}
        type={alertProps.type}
        confirmText={alertProps.confirmText}
        showCancel={alertProps.showCancel}
        cancelText={alertProps.cancelText}
        onClose={hideAlert}
        onConfirm={alertProps.onConfirm}
        onCancel={alertProps.onCancel}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
    padding: 12,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    padding: 10,
    width: "100%",
    maxWidth: 450,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    borderWidth: 3,
    borderColor: "#f1948a",
    overflow: "hidden",
  },
  languageToggle: {
    flexDirection: "row",
    marginBottom: 25,
    backgroundColor: "#F0F8FF",
    borderRadius: 25,
    padding: 5,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  languageButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  activeLanguage: {
    backgroundColor: "#FF9AA2",
    transform: [{ scale: 1.05 }],
  },
  languageText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins-SemiBold",
  },
  activeLanguageText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    gap: 15,
  },
  arabicSection: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 25,
    padding: 5,
    borderWidth: 2,
    borderColor: "#A5D6A7",
  },
  arabicTextContainer: {
    width: "100%",
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FFB7B2",
  },
  arabicText: {
    fontSize: 28,
    fontFamily: "AmiriQuranColored",
    color: "#4CAF50",
    marginBottom: 15,
    textAlign: "justify",
    lineHeight: 55,
    textShadowColor: "rgba(76, 175, 80, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  audioIconContainer: {
    backgroundColor: "#FFF",
    borderRadius: 40,
    padding: 4,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFB7B2",
  },
  translationSection: {
    width: "100%",
    backgroundColor: "#FFF3E0",
    borderRadius: 25,
    padding: 5,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  translationContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: "#FFB7B2",
  },
  urduTitle: {
    fontSize: 24,
    fontFamily: "NotoNastaliqUrdu-Bold",
    color: "#FF7043",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(255, 112, 67, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  urduContent: {
    fontSize: 18,
    color: "#FF8A65",
    textAlign: "center",
    fontFamily: "NotoNastaliqUrdu-Regular",
    lineHeight: 38,
  },
  englishTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#FF7043",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(255, 112, 67, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  englishContent: {
    fontSize: 17,
    color: "#FF8A65",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    lineHeight: 26,
  },
  audioButton: {
    marginTop: 10,
  },
  bookmarkButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  bookmarkButtonActive: {
    backgroundColor: "#FF9AA2",
    borderRadius: 50,
    padding: 10,
    alignSelf: "flex-end",
  },
  bookmarkButtonInactive: {
    backgroundColor: "#FFB7B2",
    borderRadius: 50,
    padding: 10,
    alignSelf: "flex-end",
  },
  markAsReadButton: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FF9AA2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markAsReadButtonActive: {
    backgroundColor: "#4CAF50",
  },
  markAsReadText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    color: "#fff",
  },
  markAsReadTextActive: {},
});

export default KalmaDetail;