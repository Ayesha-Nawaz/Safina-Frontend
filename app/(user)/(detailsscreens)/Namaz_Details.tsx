import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  FlatList,
  ImageBackground,
  ScrollView,
  BackHandler,
  Platform,
} from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import { BASE_URL } from "@/Ipconfig/ipconfig"; // Ensure this path is correct
import { UserContext } from "@/context/UserContext"; // Ensure this path is correct
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  FadeIn,
  ZoomIn,
  BounceInRight,
  BounceInLeft,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import CustomAlert from "@/components/CustomAlert"; // Ensure this path is correct

const { width, height } = Dimensions.get("window");

// Kid-friendly, vibrant gradient palette - Updated for more aesthetic appeal
const gradientPalettes = [
  ["#FFE5F1", "#FF9EC7"], // Soft Rose to Pink Blossom
  ["#E8F4FD", "#7DD3FC"], // Light Sky to Bright Sky Blue
  ["#F0FDF4", "#86EFAC"], // Mint Cream to Light Green
  ["#FEF3C7", "#FDE047"], // Cream to Sunny Yellow
  ["#F3E8FF", "#C084FC"], // Lavender Mist to Soft Purple
  ["#FFF1F2", "#FDA4AF"], // Rose Tint to Coral Pink
  ["#F0F9FF", "#7DD3FC"], // Ice Blue to Sky Blue
  ["#F7FEE7", "#BEF264"], // Light Mint to Fresh Lime
  ["#FEF7FF", "#E879F9"], // Fairy Pink to Bright Magenta
  ["#FFFBEB", "#FBBF24"], // Cream to Warm Amber
  ["#F0FDFA", "#67E8F9"], // Aqua Mist to Cyan
  ["#EFF6FF", "#93C5FD"], // Powder Blue to Periwinkle
];

// Accent colors for UI elements
const accentColors = {
  primary: "#FF4C8B", // Bright Pink
  secondary: "#FFD700", // Golden Yellow
  text: "#2D3047", // Deep Blue
  light: "#FFFFFF",
  lightText: "#8C9BBD",
  success: "#00D68F", // Bright Green
  highlight: "#FF9F43", // Tangerine
  arabicText: "#4CAF50", // Green color for Arabic text
};

const getRandomGradient = () => {
  return gradientPalettes[Math.floor(Math.random() * gradientPalettes.length)];
};

const NamazDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = params.category as string;
  const { user } = useContext(UserContext);
  const flatListRef = useRef<FlatList>(null);

  const [duas, setDuas] = useState([]);
  const [language, setLanguage] = useState("english");
  const [learnedItems, setLearnedItems] = useState({});
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGradient, setCurrentGradient] = useState(getRandomGradient());
  const [navigationDirection, setNavigationDirection] = useState<
    "next" | "prev" | null
  >(null);

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    showCancel: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [namazResponse, progressResponse] = await Promise.all([
          axios.get(`${BASE_URL}/namaz/namaz`, { headers }).catch((error) => {
            throw new Error(
              `Namaz API error: ${error.response?.status || error.message}`
            );
          }),
          user?._id
            ? axios
                .get(`${BASE_URL}/progress/namazprogress/${user._id}`, {
                  headers,
                })
                .catch((error) => {
                  throw new Error(
                    `Progress API error: ${
                      error.response?.status || error.message
                    }`
                  );
                })
            : Promise.resolve({ data: null }),
        ]);

        setDuas(
          namazResponse.data
            .filter(
              (item) => item.category.toLowerCase() === category.toLowerCase()
            )
            .sort((a, b) => a.id - b.id)
        );

        if (progressResponse?.data?.learnedItems) {
          const learnedMap = {};
          progressResponse.data.learnedItems.forEach((item) => {
            learnedMap[item.namazId] = true;
          });
          setLearnedItems(learnedMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setAlert({
          visible: true,
          title: "Connection Error",
          message:
            "Unable to fetch data. Please check your internet connection or try again later.",
          type: "error",
          showCancel: false,
          onConfirm: () => setAlert((prev) => ({ ...prev, visible: false })),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [category, user]);

  // Update gradient on index change
  useEffect(() => {
    setCurrentGradient(getRandomGradient());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [currentIndex]);

  const markAsLearned = async (namazId: string, dua: string) => {
  try {
    if (!user?.user?._id) {
      setAlert({
        visible: true,
        title: "Login Required",
        message: "Please log in to mark content as learned.",
        type: "warning",
        showCancel: false,
        onConfirm: () => setAlert((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Authentication token not found");

    const response = await axios.post(
      `${BASE_URL}/progress/namazprogress`,
      {
        userId: user._id,
        category: category,
        dua: dua,
        namazId: namazId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.message === "Namaz item already marked as read") {
      setAlert({
        visible: true,
        title: "Info",
        message: "This item is already marked as learned.",
        type: "info",
        showCancel: false,
        onConfirm: () => setAlert((prev) => ({ ...prev, visible: false })),
      });
    } else {
      setLearnedItems((prev) => ({ ...prev, [namazId]: true }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch (error) {
    console.error("Error marking as learned:", error);
    setAlert({
      visible: true,
      title: "Error",
      message: error.response?.data?.message || "An error occurred",
      type: "error",
      showCancel: false,
      onConfirm: () => setAlert((prev) => ({ ...prev, visible: false })),
    });
  }
};

  const handlePlayPress = async () => {
    try {
      if (isPlaying && currentSound) {
        await currentSound.stopAsync();
        setIsPlaying(false);
        return;
      }

      const currentItem = duas[currentIndex - 1];
      if (!currentItem?.audio) {
        setAlert({
          visible: true,
          title: "Audio Not Available",
          message: "No audio file found for this content.",
          type: "warning",
          showCancel: false,
          onConfirm: () => setAlert((prev) => ({ ...prev, visible: false })),
        });
        return;
      }

      if (currentSound) {
        await currentSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentItem.audio },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setCurrentSound(sound);
      setIsPlaying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Error playing audio:", error);
      setAlert({
        visible: true,
        title: "Error",
        message: "Failed to play audio. Please try again.",
        type: "error",
        showCancel: false,
        onConfirm: () => setAlert((prev) => ({ ...prev, visible: false })),
      });
      setIsPlaying(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const handleFinish = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      setIsPlaying(false);
    }
    setAlert({
      visible: true,
      title: "Congratulations!",
      message: `You have completed the ${category} learning guide! Would you like to go back or restart from the beginning?`,
      type: "success",
      showCancel: true,
      onConfirm: () => {
        setAlert((prev) => ({ ...prev, visible: false }));
        router.back();
      },
      onCancel: () => {
        setAlert((prev) => ({ ...prev, visible: false }));
        setCurrentIndex(0);
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
        setNavigationDirection(null);
      },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const navigateDua = async (direction: "prev" | "next") => {
    if (currentSound) {
      await currentSound.stopAsync();
      setIsPlaying(false);
    }

    setNavigationDirection(direction);

    if (direction === "next" && currentIndex < duas.length) {
      setCurrentIndex((prev) => {
        const newIndex = prev + 1;
        flatListRef.current?.scrollToIndex({
          index: newIndex,
          animated: true,
        });
        return newIndex;
      });
    } else if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex((prev) => {
        const newIndex = prev - 1;
        flatListRef.current?.scrollToIndex({
          index: newIndex,
          animated: true,
        });
        return newIndex;
      });
    } else if (direction === "prev" && currentIndex === 0) {
      router.back();
    }
  };

  const handleFinishPress = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      setIsPlaying(false);
    }
    handleFinish();
  };

  const handleBackPress = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      setIsPlaying(false);
    }
    router.back();
  };

  const handleHomePress = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      setIsPlaying(false);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentIndex(0);
    flatListRef.current?.scrollToIndex({
      index: 0,
      animated: true,
    });
    setNavigationDirection(null);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBackPress();
        return true;
      }
    );

    return () => {
      backHandler.remove();
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [currentSound]);

  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, []);

  const renderIntroPage = useCallback(() => {
    const firstItemWithImage = duas.find((item) => item.image);

    return (
      <Animated.View
        style={styles.introContainer}
        entering={
          navigationDirection === "next"
            ? BounceInRight.duration(500)
            : navigationDirection === "prev"
            ? BounceInLeft.duration(500)
            : ZoomIn.duration(500)
        }
      >
        <LinearGradient
          colors={currentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.headerIntro}>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, index) => (
                <FontAwesome5
                  key={index}
                  name="star"
                  size={20}
                  color={accentColors.secondary}
                  style={styles.starIcon}
                />
              ))}
            </View>
            <Text
              style={[styles.categoryHeading, { color: accentColors.text }]}
            >
              {category}
            </Text>
          </View>

          <View style={styles.content}>
            <Animated.View
              style={styles.titleContainer}
              entering={FadeIn.duration(600)}
            >
              <Text style={[styles.stepTitle, { color: accentColors.text }]}>
                Step by Step Guide
              </Text>
            </Animated.View>

            {firstItemWithImage?.image && (
              <View style={styles.imageContainer}>
                <Animated.Image
                  source={{ uri: firstItemWithImage.image }}
                  style={styles.stepImage}
                  resizeMode="contain"
                  entering={FadeIn.delay(200).duration(600)}
                />
                <View style={styles.imageOverlay} />
              </View>
            )}

            <Animated.View
              entering={ZoomIn.springify().mass(1).damping(10).stiffness(100)}
            >
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => navigateDua("next")}
              >
                <LinearGradient
                  colors={[accentColors.primary, "#FF69B4"]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <FontAwesome5
                    name="play-circle"
                    size={22}
                    color="white"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.startButtonText}>
                    {language === "english"
                      ? "Start Learning"
                      : "سیکھنا شروع کریں"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }, [duas, currentGradient, language, navigationDirection]);

  const renderDuaItem = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={styles.contentContainer}
        entering={
          navigationDirection === "next"
            ? BounceInRight.duration(500)
            : navigationDirection === "prev"
            ? BounceInLeft.duration(500)
            : FadeIn.duration(500)
        }
      >
        <LinearGradient
          colors={currentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.header}>
            <View style={styles.stepProgress}>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${(currentIndex / duas.length) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {index + 1}/{duas.length}
              </Text>
            </View>
            <Animated.View
              entering={ZoomIn.springify().mass(1).damping(10).stiffness(100)}
            >
              <TouchableOpacity
                onPress={() => {
                  setLanguage((lang) =>
                    lang === "english" ? "urdu" : "english"
                  );
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.languageButton}
              >
                <LinearGradient
                  colors={[accentColors.highlight, accentColors.primary]}
                  style={styles.languageButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.toggleText}>
                    {language === "english" ? "Urdu" : "English"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.contentJustified}>
              <Animated.View
                style={styles.smallStarsContainer}
                entering={FadeIn.delay(200).duration(600)}
              >
                {[...Array(3)].map((_, i) => (
                  <FontAwesome5
                    key={i}
                    name="star"
                    size={14}
                    color={accentColors.secondary}
                    style={styles.smallStarIcon}
                  />
                ))}
              </Animated.View>

              <View style={styles.arabicContainer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
                  style={styles.textGradient}
                >
                  <Animated.Text
                    style={[styles.arabic, { color: accentColors.arabicText }]}
                    entering={FadeIn.delay(600).duration(600)}
                  >
                    {item.arabic}
                  </Animated.Text>

                  <View style={styles.audioControlContainer}>
                    <Animated.View
                      style={[
                        styles.audioButton,
                        {
                          transform: [{ scale: 1 }],
                        },
                      ]}
                    >
                      <View style={styles.audioWaveCircle} />
                      <TouchableOpacity onPress={handlePlayPress}>
                        <Ionicons
                          name={isPlaying ? "pause-circle" : "play-circle"}
                          size={50}
                          color={accentColors.arabicText}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.translationContainer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
                  style={styles.textGradient}
                >
                  <Animated.Text
                    style={[
                      styles.translation,
                      { color: accentColors.text },
                      language === "urdu" && {
                        fontFamily: "NotoNastaliqUrdu-Medium",
                        textAlign: "right",
                        lineHeight: 40,
                      },
                    ]}
                    entering={FadeIn.delay(800).duration(600)}
                  >
                    {language === "english"
                      ? item.english_translation
                      : item.urdu_translation}
                  </Animated.Text>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>

          <View style={styles.fixedBottomContainer}>
            <Animated.View
              entering={ZoomIn.springify().mass(1).damping(10).stiffness(100)}
            >
              <TouchableOpacity
                style={[
                  styles.learnButton,
                  {
                    backgroundColor: learnedItems[item._id]
                      ? accentColors.success
                      : accentColors.primary,
                  },
                ]}
                onPress={() => markAsLearned(item._id, item.dua)}
              >
                <Text style={styles.learnButtonText}>
                  {learnedItems[item._id] ? "✓ Learned!" : "Mark as Learn"}
                </Text>
                {learnedItems[item._id] && (
                  <MaterialCommunityIcons
                    name="star"
                    size={20}
                    color={accentColors.secondary}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.navigation}>
              <Animated.View
                entering={ZoomIn.springify().mass(1).damping(10).stiffness(100)}
              >
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    { opacity: currentIndex > 0 ? 1 : 0.5 },
                  ]}
                  onPress={() => navigateDua("prev")}
                  disabled={currentIndex === 0}
                >
                  <LinearGradient
                    colors={["#54A0FF", accentColors.primary]}
                    style={styles.gradientCircleButton}
                  >
                    <Ionicons name="arrow-back" size={26} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                entering={ZoomIn.springify().mass(1).damping(10).stiffness(100)}
              >
                <TouchableOpacity
                  style={styles.homeButton}
                  onPress={handleHomePress}
                >
                  <LinearGradient
                    colors={[accentColors.highlight, "#FF69B4"]}
                    style={styles.gradientCircleButton}
                  >
                    <Ionicons name="home" size={26} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                entering={ZoomIn.springify().mass(1).damping(10).stiffness(100)}
              >
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    { opacity: index < duas.length - 1 ? 1 : 0.5 },
                  ]}
                  onPress={() => {
                    if (index === duas.length - 1) {
                      handleFinishPress();
                    } else {
                      navigateDua("next");
                    }
                  }}
                  disabled={index === duas.length - 1}
                >
                  <LinearGradient
                    colors={["#FF9F43", "#FF477E"]}
                    style={styles.gradientCircleButton}
                  >
                    <Ionicons name="arrow-forward" size={26} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    ),
    [
      currentGradient,
      language,
      learnedItems,
      currentIndex,
      isPlaying,
      navigationDirection,
    ]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      if (index === 0) {
        return renderIntroPage();
      }
      return renderDuaItem({ item, index: index - 1 });
    },
    [renderIntroPage, renderDuaItem]
  );

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/s5.png")} // Ensure this path is correct
        style={styles.loadingContainer}
      >
        <Animated.View
          style={styles.loadingContent}
          entering={FadeIn.duration(600)}
        >
          <Animated.Image
            source={require("@/assets/images/NamazLoading.png")} // Ensure this path is correct
            style={styles.loadingImage}
            resizeMode="contain"
            entering={FadeIn.delay(200).duration(600)}
          />
          <Text style={styles.loadingText}>Loading your prayers...</Text>
          <ActivityIndicator size="large" color={accentColors.primary} />
        </Animated.View>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("@/assets/images/s5.png")} // Ensure this path is correct
        style={styles.container}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.blurContainer}>
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={30}
              style={StyleSheet.absoluteFill}
              tint="light"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidBlur]} />
          )}
          <FlatList
            ref={flatListRef}
            data={[{ id: "intro" }, ...duas]}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            initialScrollIndex={currentIndex}
            onScrollToIndexFailed={(info) => {
              flatListRef.current?.scrollToIndex({
                index: Math.min(info.index, duas.length),
                animated: true,
              });
            }}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            windowSize={3}
            maxToRenderPerBatch={3}
            updateCellsBatchingPeriod={50}
          />
          <CustomAlert
            visible={alert.visible}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            showCancel={alert.showCancel}
            onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
            onConfirm={alert.onConfirm}
            onCancel={alert.onCancel}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  androidBlur: {
    backgroundColor: "rgba(255, 255, 255, 0.09)",
  },
  backgroundImage: {
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  loadingContent: {
    padding: 30,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 25,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  loadingImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginBottom: 20,
    color: accentColors.text,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  introContainer: {
    width,
    padding: 15,
    alignItems: "center",
  },
  contentContainer: {
    width,
    height: "100%",
    padding: 15,
    borderRadius: 60,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  gradientBackground: {
    flex: 1,
    padding: 15,
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
  },
  headerIntro: {
    alignItems: "center",
    marginBottom: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
    paddingHorizontal: 10,
  },
  categoryHeading: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  smallStarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  smallStarIcon: {
    marginHorizontal: 3,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  contentJustified: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  titleContainer: {
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 18,
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  stepTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginBottom: 10,
  },
  imageContainer: {
    width: 300,
    height: 300,
    borderRadius: 200,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    alignSelf: "center",
    marginBottom: 10,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 200,
  },
  stepImage: {
    width: "100%",
    height: "100%",
  },
  startButton: {
    width: "80%",
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginRight: 8,
  },
  scrollContainer: {
    flex: 1,
    height: "70%",
  },
  arabicContainer: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
  },
  arabic: {
    fontSize: 22,
    textAlign: "center",
    fontFamily: "AmiriQuranColored",
    lineHeight: 45,
    color: "#4CAF50",
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
  audioControlContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
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
  translationContainer: {
    width: "100%",
    borderRadius: 16,
    marginVertical: 10,
    overflow: "hidden",
  },
  textGradient: {
    padding: 18,
    borderRadius: 16,
  },
  translation: {
    fontSize: 16,
    textAlign: "justify",
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
  },
  stepProgress: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
    flex: 1,
    marginRight: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 3,
  },
  progressText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  learnButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 7,
    marginTop: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  learnButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    marginRight: 8,
  },
  fixedBottomContainer: {
    width: "100%",
    alignItems: "center",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    marginTop: 2,
  },
  navButton: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  gradientCircleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  homeButton: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  languageButton: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  languageButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  toggleText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});

export default NamazDetailScreen;
