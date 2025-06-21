import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Loader from "@/components/Loader";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;

// Mapping of English category names to Urdu category names
const categoryNameMapping = {
  Kalmas: "کلمے",
  Dua: "دعائیں",
  "Prophet Stories": "انبیا کے قصے",
  Namaz: "نماز",
  Wudu: "وضو",
};

const QuizListScreen = () => {
  const { category, language: routeLanguage } = useLocalSearchParams();
  const router = useRouter();
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bounceAnim] = useState(new Animated.Value(1));
  const [floatAnim] = useState(new Animated.Value(0));
  // Use the language from route params if available
  const [language, setLanguage] = useState(routeLanguage || "en");

  useEffect(() => {
    fetch(`${BASE_URL}/quiz/quizzes`)
      .then((res) => res.json())
      .then((data) => {
        setQuizData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });

    // Start floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [language]); // Re-fetch data when language changes

  const startBounceAnimation = () => {
    Animated.sequence([
      Animated.spring(bounceAnim, {
        toValue: 0.9,
        friction: 3,
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

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ur" : "en"));
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/profile2.jpeg")}
        style={styles.container}
      >
        <Loader
          text={
            language === "en" ? "Getting ready for fun!" : "تیار ہو رہے ہیں!"
          }
        />
      </ImageBackground>
    );
  }

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="emoticon-sad" size={84} color="#FFA07A" />
        <Text style={[styles.errorText, language === "ur" && styles.urduText]}>
          {language === "en" ? "Oopsie! We got lost!" : "اوہ! ہم کھو گئے!"}
        </Text>
        <Text
          style={[styles.errorSubText, language === "ur" && styles.urduText]}
        >
          {language === "en"
            ? "Let's go on a different adventure!"
            : "آئیے ایک مختلف مہم جوئی پر چلیں!"}
        </Text>
      </View>
    );
  }

  // Find the category data based on the current language
  const categoryData = quizData.find((quiz) => {
    // First try to match by current language
    if (quiz.name[language]?.toLowerCase() === category?.toLowerCase()) {
      return true;
    }
    // If that fails, try to match by English name (fallback)
    if (quiz.name.en.toLowerCase() === category?.toLowerCase()) {
      return true;
    }
    // If that fails, try to match by Urdu name (another fallback)
    if (quiz.name.ur?.toLowerCase() === category?.toLowerCase()) {
      return true;
    }
    return false;
  });

  const gradients = [
    ["#FF7F9F", "#4A90E2"], // Vibrant Pink to Deeper Sky Blue
    ["#D47C90", "#F2A07B"], // Rich Rose to Warm Peach
    ["#5FA8D3", "#87CEEB"], // Medium Blue to Soft Cyan
    ["#A685E2", "#CDA6F0"], // Royal Lilac to Soft Lavender
    ["#4CAF50", "#81C784"], // Deep Green to Fresh Mint
    ["#FF8C42", "#FF6B6B"], // Sunset Orange to Soft Red
  ];

  const icons = [
    "star-face",
    "brain",
    "rocket",
    "lightbulb",
    "puzzle",
    "school",
  ];

  const renderQuizCard = ({ item, index }) => {
    const translateY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -10],
    });

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ translateY }, { scale: bounceAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            startBounceAnimation();
            router.push(`/(quizzes)/(quiz)/${item._id}?language=${language}`);
          }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={gradients[index % gradients.length]}
            style={styles.quizCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardContent}>
              {language === "en" ? (
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={icons[index % icons.length]}
                    size={40}
                    color="#FFF"
                  />
                </View>
              ) : (
                <View style={styles.iconContainerUrdu}>
                  <MaterialCommunityIcons
                    name={icons[index % icons.length]}
                    size={40}
                    color="#FFF"
                  />
                </View>
              )}

              <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.quizTitle,
                    language === "ur" && styles.urduText,
                  ]}
                >
                  {language === "en"
                    ? `Quiz ${index + 1}`
                    : `کوئز ${index + 1}`}
                </Text>
                {/* <Text
                  style={[
                    styles.quizSubtitle,
                    language === "ur" && styles.urduText,
                  ]}
                >
                  {item.title[language]}
                </Text> */}
              </View>

              <View style={styles.syllabusContainer}>
                {item.syllabus[language].map((topic, idx) => (
                  <View key={idx} style={styles.topicBubble}>
                    <Text
                      style={[
                        styles.topicText,
                        language === "ur" && styles.urduText,
                      ]}
                    >
                      {topic}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.startButton}>
                <Text
                  style={[
                    styles.startButtonText,
                    language === "ur" && styles.urduText,
                  ]}
                >
                  {language === "en"
                    ? "Start Adventure!"
                    : "مہم جوئی شروع کریں!"}
                </Text>
                <MaterialCommunityIcons
                  name="rocket-launch"
                  size={24}
                  color="#FFF"
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ImageBackground
      source={require("@/assets/images/profile2.jpeg")}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <View style={styles.headingWrapper}>
          <Text
            style={[styles.heading, language === "ur" && styles.urduHeading]}
          >
            {categoryData?.name[language]} {language === "en" ? "Quiz" : "کوئز"}
          </Text>
        </View>
      </View>
      <View style={styles.languageToggleContainer}>
        <TouchableOpacity
          onPress={toggleLanguage}
          style={styles.languageButton}
        >
          <Text style={styles.languageButtonText}>
            {language === "en" ? "Switch to Urdu" : "انگریزی میں تبدیل کریں"}
          </Text>
        </TouchableOpacity>
      </View>

      {categoryData ? (
        <FlatList
          data={categoryData.quizzes}
          keyExtractor={(item) => item._id}
          renderItem={renderQuizCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons
            name="cloud-search"
            size={84}
            color="#FFA07A"
          />
          <Text
            style={[styles.noDataText, language === "ur" && styles.urduText]}
          >
            {language === "en" ? "No quizzes yet!" : "ابھی تک کوئی کوئز نہیں!"}
          </Text>
          <Text
            style={[styles.noDataSubText, language === "ur" && styles.urduText]}
          >
            {language === "en"
              ? "New adventures coming soon!"
              : "نئی مہم جوئی جلد آرہی ہے!"}
          </Text>
        </View>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  headingWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 25,
  },
  heading: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#551184",
    textAlign: "center",
    textShadowColor: "white", // Shadow color (black)
    textShadowOffset: { width: 2, height: 2 }, // Horizontal and vertical shadow offset
    textShadowRadius: 3,
  },
  urduHeading: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 22,
    lineHeight: 45,
  },
  urduText: {
    fontFamily: "NotoNastaliqUrdu-Medium",
    textAlign: "right",
    lineHeight: 45,
  },
  listContainer: {
    padding: 10,
    gap: 20,
  },
  cardWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quizCard: {
    borderRadius: 25,
    overflow: "hidden",
    width: CARD_WIDTH,
  },
  cardContent: {
    padding: 20,
    minHeight: 200,
  },
  iconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    padding: 12,
  },
  iconContainerUrdu: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    padding: 12,
    width: 64, // Match the width of the English version
    height: 64, // Match the height of the English version
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  quizTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.78)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  quizSubtitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.63)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  syllabusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },
  topicBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topicText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    textShadowColor: "rgba(0, 0, 0, 0.69)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
    gap: 8,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    textShadowColor: "rgba(0, 0, 0, 0.78)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  errorText: {
    fontSize: 24,
    color: "#FFA07A",
    fontFamily: "Poppins-Bold",
    marginTop: 15,
  },
  errorSubText: {
    fontSize: 18,
    color: "#666",
    fontFamily: "Poppins-Medium",
    marginTop: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 24,
    color: "#FFA07A",
    fontFamily: "Poppins-Bold",
    marginTop: 15,
  },
  noDataSubText: {
    fontSize: 18,
    color: "#666",
    fontFamily: "Poppins-Medium",
    marginTop: 8,
  },
  // Enhanced language toggle styling
  languageToggleContainer: {
    alignSelf: "center",
    marginBottom: 15,
    borderRadius: 25,
    shadowColor: "#8E54E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  languageButton: {
    backgroundColor: "#7209b7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 6,
  },
  languageButtonText: {
    fontSize: 16,
    color: "white",
    fontFamily: "Poppins-SemiBold",
  },
});

export default QuizListScreen;
