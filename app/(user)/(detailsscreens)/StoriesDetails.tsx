import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "@/context/UserContext";
import { BackHandler } from "react-native";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import CustomAlert from "@/components/CustomAlert"; // Adjust the import path as needed

// Color theme constants
const COLORS = {
  primary: "#8EC5FC",
  secondary: "#E0C3FC",
  accent: "#9B89B3",
  text: "#4A4A6A",
  lightText: "#6B6B8D",
  background: "#F4F1F8",
  card: "#FFFFFF",
  shadow: "#8E8EC5",
  border: "#CDC3FC",
  success: "#4CAF50",
  info: "#2196F3",
  warning: "#FF9800",
  error: "#F44336",
};

const StoryDetail = () => {
  const { id } = useLocalSearchParams();
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUrdu, setIsUrdu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [isRead, setIsRead] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current; // For language slider

  // State for CustomAlert
  const [alertProps, setAlertProps] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
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

  // Animation for bookmark rotation
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

  // Animation for language slider
  const startSlideAnimation = (toValue) => {
    Animated.timing(slideAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Fetch story data when component mounts
  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/story/${id}`);
        setStoryData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching story details:", err);
        setError(err.message || "Failed to load story details");
      } finally {
        setLoading(false);
      }
    };

    fetchStoryData();
  }, [id]);

  // Enhanced checkBookmarkStatus function
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user?._id) {
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
          userId: user._id,
          contentId: id,
          contentType: "Story",
        };

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
          console.log(
            "Bookmark status updated to:",
            response.data.isBookmarked
          );
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

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (sound) {
        console.log("Component unmounting, cleaning up audio");
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Handle navigation and audio cleanup
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (sound) {
        console.log("Navigating away, stopping audio");
        sound.stopAsync();
        sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
    });

    return unsubscribe;
  }, [navigation, sound]);

  // Handle hardware back button on Android
  useEffect(() => {
    const backAction = () => {
      if (sound) {
        console.log("Back button pressed, stopping audio");
        sound.stopAsync();
        sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [sound]);

  // Handle language changes and audio
  useEffect(() => {
    if (sound) {
      const resetAudio = async () => {
        console.log("Language changed, resetting audio");
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      };

      resetAudio();
    }
  }, [isUrdu]);

  // Bounce animation for image and message box
  const triggerBounce = () => {
    Animated.sequence([
      Animated.spring(bounceAnim, {
        toValue: 1.4,
        friction: 2,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Audio toggle function
  const toggleAudio = async () => {
    try {
      const selectedAudio = isUrdu ? storyData.audioUrdu : storyData.audio;

      if (!selectedAudio) {
        showAlert({
          title: "No Audio Available",
          message: `No audio available for ${isUrdu ? "Urdu" : "English"} version`,
          type: "warning",
        });
        return;
      }

      if (sound && isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (sound && !isPlaying) {
        await sound.playAsync();
        setIsPlaying(true);
        return;
      }

      const audioSource = { uri: selectedAudio.toString().trim() };
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio error:", error);
      showAlert({
        title: "Audio Playback Error",
        message: `Unable to play the ${isUrdu ? "Urdu" : "English"} audio.`,
        type: "error",
      });
    }
  };

  const handleAddBookmark = async () => {
    if (isBookmarked) {
      showAlert({
        title: "Bookmark Info",
        message: "This story is already bookmarked",
        type: "info",
      });
      return;
    }

    if (!user?._id) {
      showAlert({
        title: "Login Required",
        message: "Please log in to bookmark stories.",
        type: "warning",
      });
      return;
    }

    if (!id) {
      showAlert({
        title: "Error",
        message: "No story available to bookmark.",
        type: "error",
      });
      return;
    }

    setBookmarkLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Authentication token not found");

      console.log("Bookmark Request:", {
        url: `${BASE_URL}/bookmarks/add`,
        payload: {
          userId: user._id,
          contentId: id,
          contentType: "Story",
        },
        token: token.substring(0, 10) + "...",
      });

      const response = await axios.post(
        `${BASE_URL}/bookmarks/add`,
        {
          userId: user._id,
          contentId: id,
          contentType: "Story",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Bookmark Response:", response.data);

      setIsBookmarked(true);
      startRotateAnimation();
      showAlert({
        title: "Success",
        message: "Story bookmarked successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Bookmark Error:", {
        message: error.message,
        isAxiosError: axios.isAxiosError(error),
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        } : null,
        request: error.request ? "No response received" : null,
      });

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setIsBookmarked(true);
        showAlert({
          title: "Bookmark Info",
          message: "This story is already bookmarked",
          type: "info",
        });
      } else {
        showAlert({
          title: "Bookmark Error",
          message: error.response?.data?.message || "Failed to add bookmark. Please try again.",
          type: "error",
        });
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      if (!user?._id) {
        showAlert({
          title: "Login Required",
          message: "User not logged in.",
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

      const storyResponse = await axios.post(
        `${BASE_URL}/progress/storyprogress`,
        {
          userId: user._id,
          storyId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (storyResponse.data.message === "Story already marked as read") {
        setIsRead(true);
        showAlert({
          title: "Already Read",
          message: "This story has already been marked as read.",
          type: "info",
        });
      } else {
        setIsRead(true);
        showAlert({
          title: "Success",
          message: "Story marked as read successfully.",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error marking story as read: ", {
        errorResponse: error.response?.data,
        errorMessage: error.message,
      });

      showAlert({
        title: error.response?.data?.message === "Story already marked as read" ? "Already Read" : "Error",
        message:
          error.response?.data?.message === "Story already marked as read"
            ? "This story has already been marked as read."
            : error.response?.data?.message || "An error occurred while marking the story as read.",
        type: error.response?.data?.message === "Story already marked as read" ? "info" : "error",
      });

      if (error.response?.data?.message === "Story already marked as read") {
        setIsRead(true);
      }
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ImageBackground
      source={{ uri: storyData?.backimage }}
      style={styles.backgroundImage}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Slider */}
        <View style={styles.languageSelector}>
          <View style={styles.sliderTrack}>
            <Animated.View
              style={[
                styles.sliderThumb,
                {
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 140],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.sliderOptions}>
              <TouchableOpacity
                style={styles.sliderOption}
                onPress={() => {
                  if (isUrdu) {
                    if (sound) {
                      sound
                        .stopAsync()
                        .then(() => sound.unloadAsync())
                        .catch((err) => console.log("Error stopping audio:", err));
                    }
                    setIsUrdu(false);
                    setSound(null);
                    setIsPlaying(false);
                    startSlideAnimation(0);
                    triggerBounce();
                  }
                }}
              >
                <Text
                  style={[
                    styles.languageText,
                    !isUrdu && styles.selectedText,
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sliderOption}
                onPress={() => {
                  if (!isUrdu) {
                    if (sound) {
                      sound
                        .stopAsync()
                        .then(() => sound.unloadAsync())
                        .catch((err) => console.log("Error stopping audio:", err));
                    }
                    setIsUrdu(true);
                    setSound(null);
                    setIsPlaying(false);
                    startSlideAnimation(1);
                    triggerBounce();
                  }
                }}
              >
                <Text
                  style={[
                    styles.languageText,
                    isUrdu && styles.selectedText,
                  ]}
                >
                  Urdu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Image Container with Bookmark Button */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [
                { scale: bounceAnim },
                {
                  rotate: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-10deg", "10deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <View>
            <View style={styles.imageFrameInner}>
              <Image
                source={{ uri: storyData?.image }}
                style={styles.storyImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </Animated.View>

        <View style={styles.contentCard}>
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

          <Text
            style={[
              styles.title,
              isUrdu && styles.urduFont,
            ]}
          >
            {isUrdu ? storyData?.titleUrdu : storyData?.title}
          </Text>

          {/* Play Audio Button */}
          {storyData?.audio && (
            <TouchableOpacity style={styles.audioButton} onPress={toggleAudio}>
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

          {/* Story Content */}
          <Text style={[styles.content, isUrdu && styles.urduContent]}>
            {isUrdu ? storyData?.contentUrdu : storyData?.content}
          </Text>

          {/* Rainbow Divider */}
          <View style={styles.rainbowDivider}>
            {["#FF69B4", "#FFB6C1", "#FFC0CB"].map((color, index) => (
              <View
                key={index}
                style={[styles.rainbowLine, { backgroundColor: color }]}
              />
            ))}
          </View>

          {/* Message Section */}
          <Text
            style={[
              styles.messageHeading,
              isUrdu && styles.urduFont,
            ]}
          >
            {isUrdu ? "کہانی سے سبق" : "Lesson from Story"}
          </Text>

          {storyData?.message && (
            <Animated.View
              style={[
                styles.messageBox,
                {
                  transform: [
                    { scale: bounceAnim },
                    {
                      rotate: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["-3deg", "3deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={[styles.message, isUrdu && styles.messageUrdu]}>
                {isUrdu ? storyData?.messageUrdu : storyData?.message}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Mark as Read button */}
        <TouchableOpacity
          style={[
            styles.markAsReadButton,
            isRead && styles.markAsReadButtonActive,
          ]}
          onPress={markAsRead}
          disabled={isRead}
        >
          <Text
            style={[
              styles.markAsReadText,
              isRead && styles.markAsReadTextActive,
            ]}
          >
            {isRead ? "✓ Completed!" : "Mark as Read"}
          </Text>
        </TouchableOpacity>
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
  backgroundImage: {
    flex: 1,
  },
  scrollContainer: {
    padding: 10,
    alignItems: "center",
    paddingBottom: 30,
  },
  bookmarkButton: {
    position: "relative",
    top: 1,
    right: -230,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookmarkButtonActive: {
    backgroundColor: COLORS.primary,
  },
  bookmarkButtonInactive: {
    backgroundColor: COLORS.border,
  },
  languageSelector: {
    backgroundColor: COLORS.card,
    borderRadius: 30,
    padding: 5,
    marginVertical: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
    width: 300,
  },
  sliderTrack: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 25,
    overflow: "hidden",
    position: "relative",
  },
  sliderThumb: {
    position: "absolute",
    width: 140,
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  sliderOptions: {
    flexDirection: "row",
    width: "100%",
  },
  sliderOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  languageText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: COLORS.primary,
  },
  selectedText: {
    color: COLORS.card,
    fontFamily: "Poppins-SemiBold",
  },
  urduFont: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 20,
  },
  messageUrdu: {
    fontFamily: "NotoNastaliqUrdu-Regular",
    fontSize: 15,
    textAlign: "center",
  },
  imageContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 40,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    marginBottom: 25,
  },
  imageFrameInner: {
    borderWidth: 5,
    borderColor: COLORS.secondary,
    borderRadius: 25,
    borderStyle: "solid",
    padding: 8,
  },
  storyImage: {
    width: 280,
    height: 240,
    borderRadius: 20,
  },
  contentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 40,
    padding: 20,
    width: "100%",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 8,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 30,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  audioButton: {
    borderRadius: 25,
    marginVertical: 1,
    alignItems: "center",
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
    borderColor: "#E0C3FC",
  },
  content: {
    fontSize: 17,
    fontFamily: "Poppins-Regular",
    color: COLORS.text,
    lineHeight: 30,
    textAlign: "justify",
  },
  urduContent: {
    fontFamily: "NotoNastaliqUrdu-Regular",
    lineHeight: 42,
    fontSize: 16,
  },
  rainbowDivider: {
    flexDirection: "column",
    marginVertical: 25,
    height: 12,
    gap: 4,
  },
  rainbowLine: {
    height: 4,
    width: "100%",
    borderRadius: 2,
  },
  messageHeading: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  messageBox: {
    backgroundColor: COLORS.background,
    borderRadius: 30,
    padding: 15,
    borderWidth: 6,
    borderColor: COLORS.secondary,
    borderStyle: "dotted",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: 17,
    fontFamily: "Poppins-Medium",
    color: COLORS.primary,
    textAlign: "justify",
  },
  markAsReadButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginVertical: 10,
    alignSelf: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markAsReadButtonActive: {
    backgroundColor: COLORS.primary,
  },
  markAsReadText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.card,
    textAlign: "center",
  },
  markAsReadTextActive: {
    color: COLORS.card,
  },
});

export default StoryDetail;