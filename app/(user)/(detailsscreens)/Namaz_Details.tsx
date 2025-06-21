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
} from "react-native";
import { Audio } from "expo-av";
import axios from "axios";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import { UserContext } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  SlideInRight,
  SlideInLeft,
} from "react-native-reanimated";
import CustomAlert from "@/components/CustomAlert";

const { width, height } = Dimensions.get("window");

const colorThemes = [
  {
    primary: "#4A90E2",
    secondary: "#F7B731",
    accent: "#FF6F61",
    text: "#333333",
    background: ["#E6F0FA", "#F0F8FF"],
  },
  {
    primary: "#50C878",
    secondary: "#FF9F43",
    accent: "#FF6F61",
    text: "#333333",
    background: ["#E6FFE6", "#F0FFF0"],
  },
  {
    primary: "#FF6F61",
    secondary: "#4A90E2",
    accent: "#50C878",
    text: "#333333",
    background: ["#FFE6E6", "#FFF0F0"],
  },
];

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
  const [currentTheme, setCurrentTheme] = useState(colorThemes[0]);

  // Animation values
  const arabicTextScale = useSharedValue(1);
  const arabicOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const titleScale = useSharedValue(1);
  const starRotation = useSharedValue(0);
  const starScale = useSharedValue(1);

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    showCancel: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Animated styles
  const arabicTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: arabicTextScale.value }],
    opacity: arabicOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${starRotation.value}deg` },
      { scale: starScale.value },
    ],
  }));

  useEffect(() => {
    // Initial animations
    cardScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    cardOpacity.value = withTiming(1, { duration: 600 });
    arabicOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    titleScale.value = withSequence(
      withTiming(1.1, { duration: 400 }),
      withSpring(1, { damping: 12, stiffness: 120 })
    );

    // Fetch data
    const fetchData = async () => {
      try {
        const [namazResponse, progressResponse] = await Promise.all([
          axios.get(`${BASE_URL}/namaz/namaz`),
          user?.user?._id
            ? axios.get(`${BASE_URL}/progress/namazprogress/${user.user._id}`, {
                headers: {
                  Authorization: `Bearer ${await AsyncStorage.getItem(
                    "userToken"
                  )}`,
                },
              })
            : Promise.resolve({ data: null }),
        ]);

        // Filter and sort duas by id in ascending order
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
        console.error("Error fetching data:", error);
        setAlert({
          visible: true,
          title: "Error",
          message: "Failed to load data",
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

  useEffect(() => {
    setCurrentTheme(colorThemes[currentIndex % colorThemes.length]);

    if (currentIndex > 0) {
      arabicTextScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, { damping: 14, stiffness: 120 })
      );
    }
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

      buttonScale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1)
      );
      starRotation.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(360, { duration: 800 })
      );
      starScale.value = withSequence(
        withTiming(1.3, { duration: 150 }),
        withSpring(1, { damping: 12, stiffness: 120 })
      );

      const response = await axios.post(
        `${BASE_URL}/progress/namazprogress`,
        {
          userId: user.user._id,
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
      },
    });
  };

  const navigateDua = async (direction: "prev" | "next") => {
    if (currentSound) {
      await currentSound.stopAsync();
      setIsPlaying(false);
    }

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

useEffect(() => {
  // Handle hardware back button press
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    handleBackPress();
    return true; // Prevent default behavior (exit app or navigate back)
  });

  // Cleanup on component unmount
  return () => {
    backHandler.remove(); // Remove the back button listener
    if (currentSound) {
      currentSound.unloadAsync();
    }
  };
}, [currentSound]); // Add currentSound as a dependency to ensure it’s available

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
        style={{ width, padding: 20 }}
        entering={SlideInRight.duration(600)}
      >
        <Animated.View
          style={[
            styles.duaCard,
            cardStyle,
            {
              backgroundColor: "#FFFFFF",
              borderColor: currentTheme.primary,
            },
          ]}
        >
          <LinearGradient
            colors={currentTheme.background}
            style={styles.cardBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View style={styles.headerIntro}>
            <Text
              style={[
                styles.categoryHeading,
                {
                  color: currentTheme.primary,
                  textAlign: "center",
                  fontFamily: "Poppins-Bold",
                },
              ]}
            >
              {category}
            </Text>
          </View>

          <View style={styles.content}>
            <Animated.View style={titleAnimatedStyle}>
              <Text style={[styles.stepTitle, { color: currentTheme.text }]}>
                Step by Step Guide
              </Text>
            </Animated.View>

            {firstItemWithImage?.image && (
              <Animated.Image
                source={{ uri: firstItemWithImage.image }}
                style={styles.stepImage}
                resizeMode="contain"
                entering={FadeIn.delay(200).duration(600)}
              />
            )}

            <Animated.View entering={FadeIn.delay(400)}>
              <TouchableOpacity
                style={[
                  styles.startButton,
                  { backgroundColor: currentTheme.primary },
                ]}
                onPress={() => navigateDua("next")}
              >
                <Text style={styles.startButtonText}>
                  {language === "english"
                    ? "Start Learning"
                    : "سیکھنا شروع کریں"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }, [duas, currentTheme, language, cardStyle, titleAnimatedStyle]);

  const renderDuaItem = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={{ width, padding: 20 }}
        entering={currentIndex > index ? SlideInLeft : SlideInRight}
      >
        <Animated.View
          style={[
            styles.duaCard,
            cardStyle,
            {
              backgroundColor: "#FFFFFF",
              borderColor: currentTheme.primary,
            },
          ]}
        >
          <LinearGradient
            colors={currentTheme.background}
            style={styles.cardBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View style={styles.header}>
            <Text
              style={[styles.categoryHeading, { color: currentTheme.primary }]}
            >
              {category}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setLanguage((lang) => (lang === "english" ? "urdu" : "english"))
              }
              style={[styles.languageButton, { backgroundColor: "#4A90E2" }]}
            >
              <Text style={styles.toggleText}>
                {language === "english" ? "Urdu" : "English"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentJustified}>
              <View style={styles.pageIndicatorContainer}>
                <Text
                  style={[styles.pageIndicator, { color: currentTheme.text }]}
                >
                  {index + 1}/{duas.length}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.audioButton}
                onPress={handlePlayPress}
              >
                <Animated.View style={styles.audioIconContainer}>
                  <Ionicons
                    name={isPlaying ? "pause-circle" : "play-circle"}
                    size={40}
                    color="#50C878"
                  />
                </Animated.View>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.arabicContainer,
                  { backgroundColor: `${currentTheme.primary}10` },
                ]}
              >
                <Animated.Text
                  style={[
                    styles.arabic,
                    arabicTextStyle,
                    { color: currentTheme.text },
                  ]}
                >
                  {item.arabic}
                </Animated.Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.translationContainer,
                  { backgroundColor: `${currentTheme.secondary}10` },
                ]}
              >
                <Text
                  style={[
                    styles.translation,
                    { color: currentTheme.text },
                    language === "urdu" && {
                      fontFamily: "NotoNastaliqUrdu-Medium",
                      textAlign: "center",
                      lineHeight: 40
                    },
                  ]}
                >
                  {language === "english"
                    ? item.english_translation
                    : item.urdu_translation}
                </Text>
              </Animated.View>
            </View>
          </ScrollView>

          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[
                styles.learnButton,
                {
                  backgroundColor: learnedItems[item._id]
                    ? "#2E7DCE"
                    : "#4A90E2",
                },
              ]}
              onPress={() => markAsLearned(item._id, item.dua)}
            >
              <Text style={styles.learnButtonText}>
                {learnedItems[item._id] ? "✓ Learned!" : "Mark as Learned"}
              </Text>
              {learnedItems[item._id] && (
                <Animated.View style={starStyle}>
                  <MaterialCommunityIcons
                    name="star"
                    size={20}
                    color="#FFD700"
                  />
                </Animated.View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.navigation}>
            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: currentTheme.primary },
              ]}
              onPress={() => navigateDua("prev")}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                {
                  backgroundColor:
                    index === duas.length - 1
                      ? currentTheme.accent
                      : currentTheme.primary,
                  opacity: index === duas.length - 1 ? 1 : 0.9,
                },
              ]}
              onPress={() => {
                if (index === duas.length - 1) {
                  handleFinishPress();
                } else {
                  navigateDua("next");
                }
              }}
            >
              <Text style={styles.navButtonText}>
                {index === duas.length - 1 ? "Finish" : "Next"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    ),
    [
      currentTheme,
      language,
      learnedItems,
      currentIndex,
      isPlaying,
      arabicTextStyle,
      buttonAnimatedStyle,
      starStyle,
      handleFinishPress,
      navigateDua,
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
        source={require("@/assets/images/s5.png")}
        style={styles.loadingContainer}
      >
        <Animated.View
          style={styles.loadingContent}
          entering={FadeIn.duration(1000)}
        >
          <Animated.Image
            source={require("@/assets/images/NamazLoading.png")}
            style={styles.loadingImage}
            resizeMode="contain"
            entering={FadeIn.delay(300).duration(1000)}
          />
          <Text style={styles.loadingText}>Loading your prayers...</Text>
          <ActivityIndicator size="large" color={colorThemes[0].primary} />
        </Animated.View>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("@/assets/images/s5.png")}
        style={styles.container}
        imageStyle={styles.backgroundImage}
      >
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
    shadowColor: "#6A0DAD",
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
    color: "#6A0DAD",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  duaCard: {
    flex: 1,
    borderRadius: 20,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    elevation: 3,
  },
  cardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerIntro: {
    alignItems: "center",
    marginBottom: 15,
  },
  categoryHeading: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  toggleText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentJustified: {
    flex: 1,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 20,
  },
  stepImage: {
    width: "100%",
    height: 180,
    borderRadius: 15,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 20,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    marginRight: 8,
  },
  arabicContainer: {
    width: "100%",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  arabic: {
    fontSize: 22,
    textAlign: "center",
    fontFamily: "AmiriQuranColored",
    lineHeight: 40,
    color: "#333333",
  },
  audioButton: {
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 10,
  },
  audioIconContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  translationContainer: {
    width: "100%",
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
  },
  translation: {
    fontSize: 16,
    textAlign: "justify",
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#333333",
  },
  pageIndicatorContainer: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  pageIndicator: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    color: "#333333",
  },
  learnButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 7,
    marginTop: 15,
  },
  learnButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    marginRight: 8,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navButtonText: {
    color: "#FFFFFF",
    marginHorizontal: 6,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
});

export default NamazDetailScreen;