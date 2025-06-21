import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  interpolateColor,
  interpolate,
} from "react-native-reanimated";
import wuduchart from "@/assets/images/wuzu.jpg";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Loader from "./Loader";

const { width, height } = Dimensions.get("window");

// Modern soft gradient palette
const gradientPalettes = [
  ["#4568DC", "#B06AB3"], // Purple dream
  ["#00B4DB", "#0083B0"], // Blue marine
  ["#FF5F6D", "#FFC371"], // Warm sunset
  ["#11998e", "#38ef7d"], // Green mint
  ["#6441A5", "#2a0845"], // Deep violet
  ["#FC466B", "#3F5EFB"], // Bright pink to purple
  ["#00F5A0", "#00D9F5"], // Aqua breeze
  ["#FBD3E9", "#BB377D"], // Sweet pink
];

// Accent colors for UI elements
const accentColors = {
  primary: "#5B6EF5",
  secondary: "#FFB866",
  text: "#2D3047",
  light: "#FFFFFF",
  lightText: "#8C9BBD",
  success: "#4CAF50",
  highlight: "#FF7A6C",
};

const getRandomGradient = () => {
  return gradientPalettes[Math.floor(Math.random() * gradientPalettes.length)];
};

const WuzuComponent = () => {
  const [isEnglish, setIsEnglish] = useState(true);
  const [wuduSteps, setWuduSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentGradient, setCurrentGradient] = useState(getRandomGradient());

  // Animation values
  const fadeIn = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const starOpacity = useSharedValue(0);
  const progress = useSharedValue(0);
  const buttonPulse = useSharedValue(1);

  // Background animation - removed floating animation
  useEffect(() => {
    shimmer.value = 0;
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Button pulse animation - keeping this but can be removed if needed
    buttonPulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    const fetchWuduSteps = async () => {
      try {
        const response = await fetch(`${BASE_URL}/wudu/wudu`);
        if (!response.ok) {
          throw new Error("Failed to fetch Wudu steps");
        }
        const data = await response.json();
        setWuduSteps(data);
      } catch (error) {
        console.error("Error fetching Wudu steps:", error);
        Alert.alert("Error", "Failed to load Wudu steps. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWuduSteps();
  }, []);

  useEffect(() => {
    // Reset and trigger animations
    fadeIn.value = 0;
    translateY.value = 50;
    starOpacity.value = 0;

    // Fade and slide up animation
    fadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.back()),
    });
    translateY.value = withTiming(0, {
      duration: 700,
      easing: Easing.out(Easing.back(1.7)),
    });

    // Stars appear animation
    starOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));

    setCurrentGradient(getRandomGradient());

    // Update progress
    if (wuduSteps.length > 0) {
      progress.value = withTiming(currentPage / wuduSteps.length, { 
        duration: 600, 
        easing: Easing.inOut(Easing.cubic) 
      });
    }

    // Provide haptic feedback on page change
    if (currentPage > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentPage, wuduSteps.length]);

  // Removed bounceStyle and replaced with a static style
  const staticImageStyle = {
    // No transformations here
  };

  // Removed rotation from buttonStyle
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(scale.value) },
    ],
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: translateY.value }],
  }));

  const buttonPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonPulse.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const translateXValue = interpolate(
      shimmer.value,
      [0, 1],
      [-width * 1.5, width * 1.5]
    );

    return {
      position: "absolute",
      width: "200%",
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      transform: [{ translateX: translateXValue }, { rotate: "30deg" }],
    };
  });

  const starStyle = useAnimatedStyle(() => ({
    opacity: starOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const handleNext = () => {
    scale.value = withSequence(
      withSpring(0.9),
      withSpring(1, { stiffness: 200 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentPage < wuduSteps.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    scale.value = withSequence(
      withSpring(0.9),
      withSpring(1, { stiffness: 200 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleLanguage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEnglish(!isEnglish);
  };

  const backgroundImage = require("@/assets/images/wudu.jpg");

  if (loading) {
    return (
     <Loader text="Loading Wudu....."/>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="cover"
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
        <View style={styles.container}>
          {currentPage === 0 ? (
            <Animated.View style={[styles.titlePage, animatedStyle]}>
              <Animated.View style={starStyle}>
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
              </Animated.View>

              <LinearGradient
                colors={["rgba(255,255,255,0.8)", "rgba(255,255,255,0.6)"]}
                style={styles.titleHeader}
              >
                <Text style={styles.heading}>
                  {isEnglish ? "Wudu (Ablution) Guide" : "وضو کا طریقہ"}
                </Text>
                
              </LinearGradient>

              <View style={styles.chartContainer}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.85)", "rgba(255,255,255,0.65)"]}
                  style={styles.chartGradient}
                >
                  <Image
                    source={wuduchart}
                    style={styles.wuduChart}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </View>

              {/* Removed animation from language button */}
              <View style={{ marginVertical: 15 }}>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={toggleLanguage}
                >
                 
                  <Text style={styles.toggleButtonText}>
                    {isEnglish ? "Switch to Urdu" : "انگریزی میں تبدیل کریں۔"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ width: "80%" }}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleNext}
                >
                  <LinearGradient
                    colors={[accentColors.primary, "#3A56E8"]}
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
                      {isEnglish ? "Start Wudu Steps" : "وضو کے مراحل شروع کریں"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.contentContainer, animatedStyle]}>
              <LinearGradient
                colors={currentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
              >
                <Animated.View style={shimmerStyle} />

                <View style={styles.stepHeader}>
                  <View style={styles.stepProgress}>
                    <View style={styles.progressContainer}>
                      <Animated.View style={[styles.progressBar, progressStyle]} />
                    </View>
                    <Text style={styles.progressText}>
                      {currentPage}/{wuduSteps.length}
                    </Text>
                  </View>
                  
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{currentPage}</Text>
                  </View>
                </View>

                <View style={styles.contentWrapper}>
                  <View style={styles.mainContent}>
                    {wuduSteps[currentPage - 1]?.image && (
                      <View style={staticImageStyle}>
                        <View style={styles.imageContainer}>
                          <Image
                            source={{ uri: wuduSteps[currentPage - 1]?.image }}
                            style={styles.pageImage}
                            resizeMode="cover"
                          />
                          <View style={styles.imageOverlay} />
                        </View>
                      </View>
                    )}

                    <Animated.View style={[starStyle, { alignItems: "center" }]}>
                      <View style={styles.smallStarsContainer}>
                        {[...Array(3)].map((_, index) => (
                          <FontAwesome5
                            key={index}
                            name="star"
                            size={14}
                            color={accentColors.secondary}
                            style={styles.smallStarIcon}
                          />
                        ))}
                      </View>
                    </Animated.View>

                    <View style={styles.stepContentContainer}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                        style={styles.stepContentGradient}
                      >
                        <Text
                          style={[styles.stepTitle, !isEnglish && styles.urduTitle]}
                        >
                          {`${
                            isEnglish
                              ? "Step " + currentPage
                              : " مرحلہ " + currentPage
                          }: ${
                            isEnglish
                              ? wuduSteps[currentPage - 1]?.titleEn
                              : wuduSteps[currentPage - 1]?.titleUr
                          }`}
                        </Text>
                        <Text
                          style={[
                            styles.description,
                            !isEnglish && styles.urduDescription,
                          ]}
                        >
                          {isEnglish
                            ? wuduSteps[currentPage - 1]?.descriptionEn
                            : wuduSteps[currentPage - 1]?.descriptionUr}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>

                  {/* Fixed bottom container with proper spacing */}
                  <View style={styles.fixedBottomContainer}>
                    {/* Removed animation from language button */}
                    <View>
                      <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={toggleLanguage}
                      >
                        <FontAwesome5
                          name="language"
                          size={18}
                          color="white"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.toggleButtonText}>
                          {isEnglish ? "Switch to Urdu" : "Switch to English"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                      <Animated.View style={buttonStyle}>
                        <TouchableOpacity
                          style={[
                            styles.circularButton,
                            {
                              opacity: currentPage > 1 ? 1 : 0.5,
                            },
                          ]}
                          onPress={handlePrevious}
                          disabled={currentPage <= 1}
                        >
                          <LinearGradient
                            colors={["#6B78FF", "#5B6EF5"]}
                            style={styles.gradientCircleButton}
                          >
                            <Ionicons name="arrow-back" size={26} color="white" />
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>

                      <View style={styles.buttonSpacer} />

                      <Animated.View style={buttonStyle}>
                        <TouchableOpacity
                          style={[
                            styles.circularButton,
                            {
                              opacity: currentPage < wuduSteps.length ? 1 : 0.5,
                            },
                          ]}
                          onPress={handleNext}
                          disabled={currentPage >= wuduSteps.length}
                        >
                          <LinearGradient
                            colors={["#FF7A6C", "#FF9066"]}
                            style={styles.gradientCircleButton}
                          >
                            <Ionicons
                              name="arrow-forward"
                              size={26}
                              color="white"
                            />
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  blurContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  androidBlur: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: accentColors.text,
    fontFamily: "Poppins-SemiBold",
    letterSpacing: 0.3,
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: accentColors.lightText,
    fontFamily: "Poppins-Medium",
  },
  titlePage: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 400,
  },
  titleHeader: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 18,
    marginBottom: 15,
    width: "90%",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 7,
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
  heading: {
    fontSize: 24,
    color: accentColors.text,
    textAlign: "center",
    marginBottom: 5,
    fontFamily: "Poppins-Bold",
  },
  subheading: {
    fontSize: 16,
    color: accentColors.lightText,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },
  chartContainer: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  chartGradient: {
    borderRadius: 18,
    padding: 8,
  },
  wuduChart: {
    width: 320,
    height: 220,
    borderRadius: 12,
  },
  startButton: {
    width: "100%",
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
    textAlign: "center",
    fontFamily: "Poppins-Bold",
  },
  contentContainer: {
    width: "95%",
    height: "99%",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  gradientBackground: {
    flex: 1,
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
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
  stepNumberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  stepNumberText: {
    color: accentColors.primary,
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "space-between",
  },
  mainContent: {
    flex: 1,
    justifyContent: "flex-start",
    paddingBottom: 1, // Added padding to prevent overlap with bottom controls
  },
  imageContainer: {
    width: 300,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    alignSelf: "center",
    marginBottom: 5,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 20,
  },
  pageImage: {
    width: "100%",
    height: "100%",
  },
  stepContentContainer: {
    width: "100%",
    marginTop: 7,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    maxHeight: '45%', // Limit height to prevent overlap
  },
  stepContentGradient: {
    padding: 18,
    borderRadius: 16,
  },
  stepTitle: {
    fontSize: 17,
    color: accentColors.text,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Poppins-Bold",
  },
  urduTitle: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 22,
    lineHeight: 42,
  },
  description: {
    fontSize: 16,
    color: accentColors.text,
    lineHeight: 24,
    textAlign: "justify",
    fontFamily: "Poppins-Regular",
  },
  urduDescription: {
    fontFamily: "NotoNastaliqUrdu-Regular",
    fontSize: 17,
    lineHeight: 38,
    textAlign: "right",
    paddingRight: 5,
  },
  // Fixed bottom container to prevent overlapping
  fixedBottomContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 30,
    marginBottom: 5,
  },
  toggleButton: {
    backgroundColor: "rgba(91, 110, 245, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 15,
    marginBottom: 5, // Increased spacing
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%", // Increased for better spacing
  },
  buttonSpacer: {
    width: 30, // Adds space between buttons
  },
  circularButton: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
});

export default WuzuComponent;