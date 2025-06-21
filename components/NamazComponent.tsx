// components/KidFriendlyNamazListScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Link } from "expo-router";
import axios from "axios";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { LogBox } from "react-native";
import Loader from "./Loader";
import { LinearGradient } from "expo-linear-gradient";

// Ignore specific warnings
LogBox.ignoreLogs(["source.uri should be an object"]);

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get("window");

// Define the correct order of namaz steps
const NAMAZ_STEPS_ORDER = [
  "TAKBEER",
  "QAYYAM",
  "RUKKUH",
  "QOUMA",
  "SAJDAH",
  "TASHHAD",
  "SALAAM",
];

// Language translations
const TRANSLATIONS = {
  en: {
    title: "Namaz Steps",
    subtitle: "Follow these steps to learn Namaz!",
    dua: " Dua",
    duas: " Duas",
    loading: "Loading Namaz...",
    noSteps: "No namaz steps found",
    tryAgain: "Try Again",
    switchToUrdu: "Urdu",
    noName: "No Name",
  },
  ur: {
    title: "نماز کے مراحل",
    subtitle: "نماز سیکھنے کے لیے ان مراحل پر عمل کریں!",
    dua: " دعا",
    duas: " دعائیں",
    loading: "نماز لوڈ ہو رہی ہے...",
    noSteps: "نماز کے مراحل نہیں ملے",
    tryAgain: "دوبارہ کوشش کریں",
    switchToEnglish: "English",
    noName: "کوئی نام نہیں",
  },
};

// Bright gradient combinations for cards
const CARD_GRADIENTS = [
  ["#FFE066", "#FF6B6B"], // sunny yellow to coral
  ["#4ECDC4", "#44A08D"], // teal to green
  ["#A8E6CF", "#7FCDCD"], // mint to aqua
  ["#FFB6C1", "#FF8A95"], // light pink to rose
  ["#C7A2FF", "#9575CD"], // light purple to medium purple
  ["#87CEEB", "#4A90E2"], // sky blue to ocean blue
  ["#FFD700", "#FFA500"], // gold to orange
  ["#98FB98", "#32CD32"], // light green to lime
];

// Cute emojis for each step
const STEP_EMOJIS = ["🤲", "🕌", "🙇‍♂️", "🧍‍♂️", "🕊️", "☪️", "✨"];

const NamazListScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("en");

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const headerBounceAnim = useRef(new Animated.Value(0)).current;
  const [itemAnims, setItemAnims] = useState([]);
  const floatingAnim = useRef(new Animated.Value(0)).current;

  // Floating animation for background elements
  useEffect(() => {
    const createFloatingAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createFloatingAnimation().start();
  }, []);

  // Start header animations once on initial render
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(headerBounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "ur" : "en"));
  };

  useEffect(() => {
    const fetchNamazCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/namaz/namaz`);

        // Process API response to group by category and ensure proper order
        const categoryMap = response.data.reduce((acc, item) => {
          const originalName = item.category?.trim() || "";
          const categoryName = originalName.toUpperCase();
          const categoryKey = categoryName.toLowerCase();
          const urduName = item.categoryurdu?.trim() || "";

          if (!acc[categoryKey]) {
            const orderIndex = NAMAZ_STEPS_ORDER.findIndex(
              (step) => step.toLowerCase() === categoryKey
            );

            acc[categoryKey] = {
              id: item._id,
              name: categoryName || TRANSLATIONS[language].noName,
              urduName: urduName || TRANSLATIONS[language].noName,
              originalName: originalName,
              count: 1,
              image: item.image,
              orderIndex: orderIndex !== -1 ? orderIndex : 999,
            };
          } else {
            acc[categoryKey].count++;
          }
          return acc;
        }, {});

        const sortedCategories = Object.values(categoryMap).sort((a, b) => {
          return a.orderIndex - b.orderIndex;
        });

        const orderedCategories = [];

        NAMAZ_STEPS_ORDER.forEach((stepName, index) => {
          const matchingCategory = sortedCategories.find(
            (category) => category.name.toLowerCase() === stepName.toLowerCase()
          );

          if (matchingCategory) {
            matchingCategory.orderIndex = index;
            orderedCategories.push(matchingCategory);
          }
        });

        const remainingCategories = sortedCategories.filter(
          (category) => !NAMAZ_STEPS_ORDER.includes(category.name)
        );

        setCategories([...orderedCategories, ...remainingCategories]);
        setError(null);
      } catch (err) {
        console.error("Error fetching Namaz categories:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNamazCategories();
  }, [language]);

  // Create animation values for each category when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      const newAnimValues = categories.map(() => new Animated.Value(0));
      setItemAnims(newAnimValues);

      const animations = newAnimValues.map((anim, index) => {
        return Animated.spring(anim, {
          toValue: 1,
          delay: index * 200,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        });
      });

      Animated.stagger(150, animations).start();
    }
  }, [categories]);

  const renderCategoryItem = ({ item, index }) => {
    const gradientColors = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
    const emoji = STEP_EMOJIS[index % STEP_EMOJIS.length];
    const t = TRANSLATIONS[language];

    const animatedStyle = itemAnims[index]
      ? {
          opacity: itemAnims[index],
          transform: [
            {
              translateY: itemAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
            {
              scale: itemAnims[index].interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [0.7, 1.1, 1],
              }),
            },
            {
              rotate: itemAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: ["-5deg", "0deg"],
              }),
            },
          ],
        }
      : {};

    const displayName =
      language === "ur" ? item.urduName || t.noName : item.name || t.noName;

    return (
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <Link
          href={{
            pathname: "(detailsscreens)/Namaz_Details",
            params: {
              category: item.name,
              categoryImage: item.image,
            },
          }}
          asChild
        >
          <TouchableOpacity style={styles.cardTouchable} activeOpacity={0.8}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Card Header with Step Number */}
              <View style={styles.cardHeader}>
                <LinearGradient
                  colors={["#ffffff", "#f8f9ff"]}
                  style={styles.stepNumberCircle}
                >
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </LinearGradient>

                <View style={styles.arrowContainer}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                    style={styles.arrowCircle}
                  >
                    <Ionicons
                      name= "chevron-forward"
                      size={24}
                      color="rgba(255,255,255,0.9)"
                    />
                  </LinearGradient>
                </View>
              </View>

              {/* Main Content Container */}
              <View style={styles.mainContent}>
                {/* Image Container */}
                <View style={styles.imageContainer}>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.image}
                      resizeMode="cover"
                      onError={() => console.log("Image failed to load")}
                    />
                  ) : (
                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.9)",
                        "rgba(255,255,255,0.7)",
                      ]}
                      style={[styles.image, styles.placeholderImage]}
                    >
                      <Ionicons name="sparkles" size={40} color="#6950fb" />
                    </LinearGradient>
                  )}
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                  <Text
                    style={[
                      styles.stepName,
                      language === "ur" && styles.urduStepName,
                    ]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {displayName} 
                  </Text>

                  <View
                    style={[
                      styles.countContainer,
                      language === "ur" && styles.urduCountContainer,
                    ]}
                  >
                    <Ionicons
                      name="book-outline"
                      size={16}
                      color="rgba(255,255,255,0.9)"
                      style={[
                        styles.countIcon,
                        language === "ur" && styles.urduCountIcon,
                      ]}
                    />
                    <Text
                      style={[
                        styles.stepCount,
                        language === "ur" && styles.urduStepCount,
                      ]}
                    >
                      {item.count}
                      {item.count > 1 ? t.duas : t.dua}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  const t = TRANSLATIONS[language];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader text="Loading Namaz......" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <LottieView
          source={require("@/assets/images/NamazLoading.png")}
          autoPlay
          loop={false}
          style={styles.lottieAnimation}
        />
        <Text style={styles.errorText}>{error}</Text>
        <Link href="/" asChild>
          <TouchableOpacity>
            <LinearGradient
              colors={["#6950fb", "#8e44ad"]}
              style={styles.retryButton}
            >
              <Text
                style={[
                  styles.retryButtonText,
                  language === "ur" && styles.urduText,
                ]}
              >
                {t.tryAgain}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Floating background elements */}
      <Animated.View
        style={[
          styles.backgroundElement,
          styles.bgElement1,
          {
            transform: [
              {
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.backgroundElement,
          styles.bgElement2,
          {
            transform: [
              {
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
            ],
          },
        ]}
      />

      <View
        style={[styles.container, language === "ur" && styles.rtlContainer]}
      >
        {/* Language Toggle Button */}
        <View style={styles.languageToggleContainer}>
          <View style={styles.languageToggleWrapper}>
            <TouchableOpacity
              style={[
                styles.languageOption,
                styles.leftOption,
                language === "en" && styles.selectedLanguageOption,
              ]}
              onPress={() => language !== "en" && toggleLanguage()}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === "en" && styles.selectedLanguageText,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                styles.rightOption,
                language === "ur" && styles.selectedLanguageOption,
              ]}
              onPress={() => language !== "ur" && toggleLanguage()}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === "ur" && styles.selectedLanguageText,
                  styles.urduOptionText,
                ]}
              >
                Urdu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: headerBounceAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
            style={styles.titleContainer}
          >
            <Text style={[styles.title, language === "ur" && styles.urduTitle]}>
              🕌 {t.title} 🕌
            </Text>
            <Text
              style={[
                styles.subtitle,
                language === "ur" && styles.urduSubtitle,
              ]}
            >
              ⭐ {t.subtitle} ⭐
            </Text>
          </LinearGradient>
        </Animated.View>
        <FlatList
          data={categories}
          keyExtractor={(item) =>
            item.id?.toString() || `${item.name}_${Math.random()}`
          }
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LottieView
                source={require("@/assets/images/NamazLoading.png")}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
              <Text
                style={[styles.emptyText, language === "ur" && styles.urduText]}
              >
                {t.noSteps}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  rtlContainer: {
    direction: "rtl",
  },
  lottieAnimation: {
    width: width * 0.5,
    height: width * 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#6950fb",
    marginBottom: 30,
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  retryButtonText: {
    color: "white",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    textAlign: "center",
  },
  languageToggleContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  languageToggleWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 25,
    padding: 4,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  languageOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  leftOption: {
    marginRight: 2,
  },
  rightOption: {
    marginLeft: 2,
  },
  selectedLanguageOption: {
    backgroundColor: "#6950fb",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  languageOptionText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#6950fb",
  },
  selectedLanguageText: {
    color: "white",
    fontFamily: "Poppins-Bold",
  },
  urduOptionText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
  },
  headerContainer: {
    marginBottom: 25,
    alignItems: "center",
  },
  titleContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 23,
    fontFamily: "Poppins-ExtraBold",
    color: "#6950fb",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#8b5cf6",
    textAlign: "center",
  },
  cardContainer: {
    margin:10,
    marginBottom: 20,
  },
  cardTouchable: {
    borderRadius: 25,
    overflow: "hidden",
  },
  card: {
    borderRadius: 25,
    paddingLeft: 10,
    paddingBottom: 3,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    overflow: "hidden",
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  stepNumberCircle: {
    width: 25,
    height: 25,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: "#6950fb",
  },
  arrowContainer: {
    marginTop:3,
    paddingRight: 7,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  imageContainer: {
    marginRight: 25,
    borderRadius: 20,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.8)",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContent: {
    flex: 1,
    justifyContent: "center",
  },
  stepName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 5,
    textAlign: "left",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 24,
  },
  urduStepName: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 16,
    textAlign: "right",
    marginRight: 30,
    lineHeight: 40,
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: "flex-start", // Default alignment for English
  },

  urduCountContainer: {
    alignSelf: "flex-end", // Align to right for Urdu
    marginRight: 20,
  },
  countIcon: {
    marginRight: 6,
  },
  urduCountIcon: {
    marginLeft: 6,
    marginRight: 0,
  },
  stepCount: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "rgba(255,255,255,0.95)",
    textAlign: "left",
  },
  urduStepCount: {
    fontFamily: "NotoNastaliqUrdu-Medium",
    fontSize: 12,
    marginLeft: 20,
    textAlign: "right",
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#8b5cf6",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    textAlign: "center",
  },
  urduText: {
    fontFamily: "NotoNastaliqUrdu-Medium",
    textAlign: "right",
  },
  urduTitle: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 20,
    textAlign: "center",
    lineHeight: 45,
  },
  urduSubtitle: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 12,
    textAlign: "center",
  },
});

export default NamazListScreen;
