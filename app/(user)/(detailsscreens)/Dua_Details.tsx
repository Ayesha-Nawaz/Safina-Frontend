import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  FlatList,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { UserContext } from "@/context/UserContext";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import Loader from "@/components/Loader";
import CustomAlert from "@/components/CustomAlert";

const DuaDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState<{ [key: number]: boolean }>({});
  const [sounds, setSounds] = useState<{ [key: number]: Audio.Sound | null }>(
    {}
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<"eng" | "urdu">("eng");
  const [isLearned, setIsLearned] = useState(false);
  const { user } = useContext(UserContext);
  const [bookmarkedDuas, setBookmarkedDuas] = useState<{
    [key: string]: boolean;
  }>({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [duaData, setDuaData] = useState(null);
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryBookmarked, setIsCategoryBookmarked] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "info" | "warning" | "error",
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const languageButtonScale = useRef(new Animated.Value(1)).current;
  const navigationButtonScale = useRef(new Animated.Value(1)).current;
  const audioButtonScale = useRef(new Animated.Value(1)).current;
  const arabicTextScale = useRef(new Animated.Value(1)).current;
  const audioWaveAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef(null);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  // Fetch dua data
  useEffect(() => {
    const fetchDuaData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/dua/${params.id}`);
        setDuaData(response.data);
        if (response.data && response.data.duas) {
          setDuas(response.data.duas);
        }
      } catch (error) {
        console.error("Error fetching dua data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDuaData();
    }
  }, [params.id]);

  // Check if the category is bookmarked
  useEffect(() => {
    const checkCategoryBookmarkStatus = async () => {
      if (!user?._id || !duaData) return;

      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/bookmarks/check`, {
          params: {
            userId: user._id,
            contentId: params.id, // Using the category ID
            contentType: "DuaCategory", // Change content type to DuaCategory
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 5000,
        });

        setIsCategoryBookmarked(response.data?.isBookmarked || false);
      } catch (error) {
        console.error("Error checking category bookmark status:", error);
      }
    };

    checkCategoryBookmarkStatus();
  }, [duaData, user]);

  // Check bookmark status for individual duas in the category (keeping this for reference)
  useEffect(() => {
    const checkDuaBookmarkStatus = async () => {
      if (!user?._id || duas.length === 0) return;

      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        const bookmarkStatus: { [key: string]: boolean } = {};
        const promises = duas.map(async (dua) => {
          const response = await axios.get(`${BASE_URL}/bookmarks/check`, {
            params: {
              userId: user._id,
              contentId: params.id,
              contentType: "Dua",
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
            timeout: 5000,
          });
          bookmarkStatus[params.id] = response.data?.isBookmarked || false;
        });

        await Promise.all(promises);
        setBookmarkedDuas(bookmarkStatus);

        // Update the isBookmarked state based on the current dua
        if (duas.length > 0 && currentIndex < duas.length) {
          const currentDua = duas[currentIndex];
          setIsBookmarked(bookmarkStatus[currentDua.id] || false);
        }
      } catch (error) {
        console.error("Error checking bookmarks:", error);
      }
    };

    checkDuaBookmarkStatus();
  }, [duas, user, currentIndex]);

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(arabicTextScale, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(arabicTextScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [currentIndex]);

  useEffect(() => {
    if (Object.values(isPlaying).some((playing) => playing)) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(audioWaveAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(audioWaveAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      audioWaveAnim.setValue(1);
    }
  }, [isPlaying]);

  // FIXED: Effect to clean up audio when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup function that will run when component unmounts
      Object.entries(sounds).forEach(async ([duaId, sound]) => {
        if (sound) {
          try {
            // First check if sound is loaded before attempting to stop or unload
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              await sound.stopAsync();
              await sound.unloadAsync();
            }
          } catch (error) {
            console.error("Error during sound cleanup:", error);
          }
        }
      });
    };
  }, [sounds]);

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

  const animateButton = (animValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // FIXED: Safe audio handling in toggleAudio function
  const toggleAudio = async (duaId: number, audioUrl: string) => {
    animateButton(audioButtonScale);
    try {
      if (!sounds[duaId]) {
        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        setSounds((prev) => ({ ...prev, [duaId]: sound }));
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying((prev) => ({ ...prev, [duaId]: false }));
            // Safely unload
            (async () => {
              try {
                await sound.unloadAsync();
                setSounds((prev) => ({ ...prev, [duaId]: null }));
              } catch (error) {
                console.error("Error unloading sound after finish:", error);
                setSounds((prev) => ({ ...prev, [duaId]: null }));
              }
            })();
          }
        });
        await sound.playAsync();
        setIsPlaying((prev) => ({ ...prev, [duaId]: true }));
      } else {
        const currentSound = sounds[duaId];
        if (currentSound) {
          // Check if sound is loaded before attempting to play/pause
          const status = await currentSound.getStatusAsync();
          if (status.isLoaded) {
            if (isPlaying[duaId]) {
              await currentSound.pauseAsync();
              setIsPlaying((prev) => ({ ...prev, [duaId]: false }));
            } else {
              await currentSound.playAsync();
              setIsPlaying((prev) => ({ ...prev, [duaId]: true }));
            }
          } else {
            // If sound is not loaded, create a new one
            setSounds((prev) => ({ ...prev, [duaId]: null }));
            toggleAudio(duaId, audioUrl);
          }
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      // Clean up in case of error
      setSounds((prev) => ({ ...prev, [duaId]: null }));
      setIsPlaying((prev) => ({ ...prev, [duaId]: false }));
    }
  };

  // FIXED: Modified navigateDua function to safely stop audio before navigating
  const navigateDua = async (direction: "next" | "prev") => {
    animateButton(navigationButtonScale);

    // Safely stop any currently playing audio before navigating
    const currentDua = duas[currentIndex];
    if (currentDua && sounds[currentDua.id] && isPlaying[currentDua.id]) {
      try {
        const sound = sounds[currentDua.id];
        const status = await sound?.getStatusAsync();

        if (status && status.isLoaded) {
          await sound?.stopAsync();
          await sound?.unloadAsync();
        }

        setSounds((prev) => ({ ...prev, [currentDua.id]: null }));
        setIsPlaying((prev) => ({ ...prev, [currentDua.id]: false }));
      } catch (error) {
        console.error("Error stopping audio during navigation:", error);
        // Still clear the sound reference even if there was an error
        setSounds((prev) => ({ ...prev, [currentDua.id]: null }));
        setIsPlaying((prev) => ({ ...prev, [currentDua.id]: false }));
      }
    }

    // Then navigate to the new dua
    if (direction === "next" && currentIndex < duas.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === "prev" && currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // FIXED: Handle viewable items change to safely stop audio when swiping
  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;

      // If the index changed, stop any playing audio
      if (newIndex !== currentIndex) {
        const currentDua = duas[currentIndex];
        if (currentDua && sounds[currentDua.id] && isPlaying[currentDua.id]) {
          (async () => {
            try {
              const sound = sounds[currentDua.id];
              if (sound) {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                  await sound.stopAsync();
                  await sound.unloadAsync();
                }
              }
              setSounds((prev) => ({ ...prev, [currentDua.id]: null }));
              setIsPlaying((prev) => ({ ...prev, [currentDua.id]: false }));
            } catch (error) {
              console.error("Error stopping audio on scroll:", error);
              // Still clean up the references
              setSounds((prev) => ({ ...prev, [currentDua.id]: null }));
              setIsPlaying((prev) => ({ ...prev, [currentDua.id]: false }));
            }
          })();
        }
        setCurrentIndex(newIndex);
      }
    }
  }).current;

  // FIXED: Function to safely handle back button press
  const onBack = async () => {
    // Safely stop all playing audio before navigating back
    const audioPromises = Object.entries(sounds).map(async ([duaId, sound]) => {
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            if (isPlaying[parseInt(duaId)]) {
              await sound.stopAsync();
            }
            await sound.unloadAsync();
          }
        } catch (error) {
          console.error("Error stopping audio on back:", error);
        }
      }
    });

    try {
      await Promise.all(audioPromises);
    } catch (error) {
      console.error("Error cleaning up audio on back:", error);
    } finally {
      // Clear all sound references
      setSounds({});
      setIsPlaying({});
      router.back();
    }
  };

  const handleAddBookmark = async () => {
    if (!user?._id) {
      showCustomAlert(
        "Login Required",
        "Please log in to bookmark.",
        "warning"
      );
      return;
    }

    if (!params.id) {
      showCustomAlert(
        "Error",
        "No dua category available to bookmark.",
        "error"
      );
      return;
    }

    setBookmarkLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Authentication token not found");

      // Make the API call to add bookmark
      const response = await axios.post(
        `${BASE_URL}/bookmarks/add`,
        {
          userId: user._id,
          contentId: params.id, // This should be the MongoDB ObjectID
          contentType: "Dua", // Use explicit DuaCategory type
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data &&
        (response.status === 200 || response.status === 201)
      ) {
        setIsCategoryBookmarked(true);
        startRotateAnimation();
        showCustomAlert("Success", "Bookmarked successfully", "success");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setIsCategoryBookmarked(true);
          showCustomAlert("Info", "This is already bookmarked", "info");
        } else {
          console.error("Error adding bookmark:", error);
          console.error("Error response data:", error.response?.data);
          showCustomAlert(
            "Error",
            error.response?.data?.message ||
              "Failed to add bookmark. Please try again.",
            "error"
          );
        }
      } else {
        console.error("Error adding bookmark:", error);
        showCustomAlert(
          "Error",
          "Failed to add bookmark. Please try again.",
          "error"
        );
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Update checkCategoryBookmarkStatus function
  const checkCategoryBookmarkStatus = async () => {
    if (!user?._id || !duaData) return;

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/bookmarks/check`, {
        params: {
          userId: user._id,
          contentId: params.id, // MongoDB ObjectID
          contentType: "Dua", // Match this with what we use in handleAddBookmark
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        timeout: 5000,
      });

      setIsCategoryBookmarked(response.data?.isBookmarked || false);
    } catch (error) {
      console.error("Error checking category bookmark status:", error);
    }
  };
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const showCustomAlert = (
    title: string,
    message: string,
    type: "success" | "info" | "warning" | "error" = "info"
  ) => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const markAsLearn = async () => {
    try {
      if (!user.user || !user._id) {
        showCustomAlert("Login Required", "User not logged in.", "warning");
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        showCustomAlert("Error", "Authentication token not found.", "error");
        return;
      }

      if (isLearned) {
        showCustomAlert(
          "Info",
          "This Dua has already been marked as learned.",
          "info"
        );
        return;
      }

      const duaResponse = await axios.post(
        `${BASE_URL}/progress/duaprogress`,
        {
          userId: user._id,
          duaId: params.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        duaResponse.data.success === false &&
        duaResponse.data.message === "Dua already marked as Learn"
      ) {
        setIsLearned(true);
        showCustomAlert(
          "Info",
          "This Dua has already been marked as learned.",
          "info"
        );
      } else {
        setIsLearned(true);
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        showCustomAlert(
          "Success",
          "Dua marked as learned successfully.",
          "success"
        );
      }
    } catch (error) {
      console.error("Error marking Dua as learn: ", error);
      showCustomAlert(
        "Error",
        error.response?.data?.message ||
          "An error occurred while marking the Dua as learn.",
        "error"
      );
    }
  };

  const renderDuaCard = ({ item: dua, index }) => {
    return (
      <View style={{ width: windowWidth, paddingVertical: 0 }}>
        <TouchableOpacity
          style={[
            styles.bookmarkButton,
            isCategoryBookmarked
              ? styles.bookmarkButtonActive
              : styles.bookmarkButtonInactive,
          ]}
          onPress={handleAddBookmark}
          disabled={bookmarkLoading}
        >
          {bookmarkLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name={isCategoryBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color="#fff"
            />
          )}
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.duaCard,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              height: windowHeight * 0.55,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardHeader}>
              <View style={styles.languageToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    language === "eng" && styles.activeLanguageButton,
                    {
                      transform: [
                        {
                          scale: languageButtonScale.interpolate({
                            inputRange: [0.9, 1],
                            outputRange: [0.98, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                  onPress={() => {
                    animateButton(languageButtonScale);
                    setLanguage("eng");
                  }}
                >
                  <View style={styles.languageButtonContent}>
                    <Text
                      style={[
                        styles.languageButtonText,
                        language === "eng" && styles.activeLanguageButtonText,
                        { fontFamily: "Poppins-Medium" },
                      ]}
                    >
                      English
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    language === "urdu" && styles.activeLanguageButton,
                    {
                      transform: [
                        {
                          scale: languageButtonScale.interpolate({
                            inputRange: [0.9, 1],
                            outputRange: [0.98, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                  onPress={() => {
                    animateButton(languageButtonScale);
                    setLanguage("urdu");
                  }}
                >
                  <View style={styles.languageButtonContent}>
                    <Text
                      style={[
                        styles.languageButtonTextUrdu,
                        language === "urdu" && styles.activeLanguageButtonText,
                        { fontFamily: "Poppins-Medium" },
                      ]}
                    >
                      Urdu
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <Text
              style={language === "eng" ? styles.duaTitle : styles.duaTitleUrdu}
            >
              {language === "eng"
                ? dua.titleEng || `Dua ${index + 1}`
                : dua.titleUrdu || `دعا ${index + 1}`}
            </Text>

            <Animated.Text
              style={[
                styles.arabicText,
                {
                  transform: [
                    {
                      scale: arabicTextScale,
                    },
                  ],
                },
              ]}
            >
              {dua.arabic}
            </Animated.Text>

            <View style={styles.audioControlContainer}>
              <Animated.View
                style={[
                  {
                    transform: [{ scale: audioButtonScale }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => toggleAudio(dua.id, dua.audio)}
                >
                  <Animated.View
                    style={[
                      styles.audioWaveCircle,
                      {
                        transform: [
                          { scale: isPlaying[dua.id] ? audioWaveAnim : 1 },
                        ],
                      },
                    ]}
                  />
                  <Ionicons
                    name={isPlaying[dua.id] ? "pause-circle" : "play-circle"}
                    size={50}
                    color="#4CAF50"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            <Text
              style={[
                styles.translationText,
                language === "urdu" && styles.translationTextUrdu,
              ]}
            >
              {language === "eng" ? dua.contentEng : dua.contentUrdu}
            </Text>

            {dua.illustrationIcon && (
              <Ionicons
                name={dua.illustrationIcon}
                size={26}
                color="#663399"
                style={styles.contextIcon}
              />
            )}
          </ScrollView>
        </Animated.View>

        <View style={styles.cardActionsContainer}>
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
              {isLearned ? "✓ Learned!" : "Mark as Learn"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/dua.jpg")}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        resizeMode="cover"
        blurRadius={10} // Adjust the value for stronger or lighter blur
      >
        <Loader text="Loading Duas..." />
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#E6E6FA", "#D8BFD8", "#C8A2C8"]}
        style={styles.header}
      >
        <View style={styles.imageContainer}>
          {duaData && duaData.image && (
            <Image
              source={{ uri: duaData.image }}
              style={styles.topicImage}
              resizeMode="cover"
            />
          )}
        </View>
        <View style={styles.titleBox}>
          <Text
            style={[
              styles.headerTitle,
              language === "urdu" && styles.headerTitleUrdu,
            ]}
          >
            {duaData
              ? language === "eng"
                ? duaData.topic
                : duaData.topicUrdu
              : ""}
          </Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={["#E6E6FA", "#D8BFD8", "#C8A2C8"]}
        style={styles.gradientBackground}
      >
        {/* Navigation Controls - Now OUTSIDE the card */}
        <View style={styles.navigationControlsContainer}>
          <Animated.View
            style={[
              styles.navigationButtonWrapper,
              {
                transform: [
                  {
                    scale: navigationButtonScale.interpolate({
                      inputRange: [0.9, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.navigationButton,
                currentIndex === 0 && styles.disabledButton,
              ]}
              onPress={() => navigateDua("prev")}
              disabled={currentIndex === 0}
            >
              <Ionicons
                name="arrow-back"
                size={28}
                color={currentIndex === 0 ? "#CCCCCC" : "#663399"}
              />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.paginationIndicator}>
            <Text style={styles.paginationText}>
              {currentIndex + 1} / {duas.length}
            </Text>
          </View>

          <Animated.View
            style={[
              styles.navigationButtonWrapper,
              {
                transform: [
                  {
                    scale: navigationButtonScale.interpolate({
                      inputRange: [0.9, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.navigationButton,
                currentIndex === duas.length - 1 && styles.disabledButton,
              ]}
              onPress={() => navigateDua("next")}
              disabled={currentIndex === duas.length - 1}
            >
              <Ionicons
                name="arrow-forward"
                size={28}
                color={currentIndex === duas.length - 1 ? "#CCCCCC" : "#663399"}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.cardContainer}>
          <FlatList
            ref={flatListRef}
            data={duas}
            renderItem={renderDuaCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </LinearGradient>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    height: 140,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    backgroundColor: "#E6E6FA",
  },
  imageContainer: {
    flex: 2.2,
    borderTopRightRadius: 75,
    overflow: "hidden",
    borderRightWidth: 1,
    borderRightColor: "#DDD",
  },
  topicImage: {
    width: "100%",
    height: "100%",
  },
  titleBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 7,
    borderWidth: 1,
    borderColor: "#D8BFD8",
    margin: 10,
    borderRadius: 15,
    backgroundColor: "#E6E6FA",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#663399",
    textAlign: "center",
  },
  headerTitleUrdu: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 15,
  },
  gradientBackground: {
    flex: 1,
    width: "100%",
  },
  navigationControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  bookmarkButtonActive: {
    backgroundColor: "#663399",
  },
  bookmarkButtonInactive: {
    backgroundColor: "#B57EDC",
  },
  paginationIndicator: {
    backgroundColor: "rgba(102, 51, 153, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  paginationText: {
    color: "#663399",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  navigationButtonWrapper: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 3,
    marginBottom: 10,
  },
  audioControlContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  duaCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 10,
    marginVertical: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    alignItems: "center",
    marginHorizontal: 15,
    position: "relative",
    flex: 1,
  },
  scrollViewContent: {
    alignItems: "center",
    paddingBottom: 10,
  },
  duaTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#663399",
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  duaTitleUrdu: {
    fontSize: 16,
    fontFamily: "NotoNastaliqUrdu-Medium",
    color: "#663399",
    textAlign: "center",
    marginBottom: 5,
    paddingHorizontal: 10,
    lineHeight: 38,
  },
  arabicText: {
    fontSize: 25,
    fontFamily: "AmiriQuranColored",
    color: "#4CAF50",
    textAlign: "center",
    lineHeight: 50,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  translationText: {
    fontSize: 18,
    color: "#663399",
    textAlign: "justify",
    fontFamily: "Poppins-Regular",
    marginTop: 10,
    marginBottom: 16,
  },
  translationTextUrdu: {
    fontFamily: "NotoNastaliqUrdu-Regular",
    lineHeight: 38,
    textAlign: "center",
    fontSize: 16,
  },
  audioButton: {
    backgroundColor: "#FFF",
    borderRadius: 40,
    padding: 3,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#B57EDC",
    alignItems: "center",
    justifyContent: "center",
  },
  audioWaveCircle: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#B57EDC",
    opacity: 0.4,
  },
  navigationButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  languageToggleContainer: {
    flexDirection: "row",
    justifyContent: "center", // Already centered, ensure no override
    alignItems: "center",
    gap: 12,
    width: "100%", // Ensure full width for centering
    alignSelf: "center", // Explicitly center the container
  },
  languageButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#B57EDC",
  },
  languageButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  activeLanguageButton: {
    backgroundColor: "#663399",
  },
  languageButtonText: {
    color: "#FFF",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  languageButtonTextUrdu: {
    color: "#FFF",
    lineHeight: 24,
    fontSize: 14,
  },
  activeLanguageButtonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
  },

  cardActionsContainer: {
    alignItems: "center",
    marginVertical: 5,
  },
  markAsReadButton: {
    marginBottom: 3,
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: "#B57EDC",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
    alignSelf: "center",
    minWidth: 200,
    borderWidth: 2,
    borderColor: "#FF9AA2",
  },
  markAsReadButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#45A049",
  },
  markAsReadText: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  markAsReadTextActive: {
    color: "#FFF",
  },
  contextIcon: {
    marginTop: 5,
    marginBottom: 5,
  },
});

export default DuaDetails;
