import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ImageBackground,
  Animated,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.43;

const Quizzes = () => {
  const [quizCategories, setQuizCategories] = useState([]);
  const [headerAnim] = useState(new Animated.Value(0));
  const [language, setLanguage] = useState("en");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const categoryIcons = {
    Kalmas: "script-text-outline",
    Dua: "hands-pray",
    "Prophet Stories": "book-open-variant",
    Namaz: "mosque",
    Wudu: "water-outline",
  };

  // Enhanced gradient combinations
  const categoryGradients = [
    ["#4776E6", "#8E54E9"], // Purple to blue
    ["#FF512F", "#DD2476"], // Orange to pink
    ["#1D976C", "#93F9B9"], // Green to light green
    ["#FF8008", "#FFC837"], // Orange to yellow
    ["#4568DC", "#B06AB3"], // Blue to purple
    ["#E44D26", "#F16529"], // Red to orange
    ["#1FA2FF", "#12D8FA", "#A6FFCB"], // Blue to teal
    ["#FF0084", "#33001B"], // Pink to dark purple
  ];

  const fetchQuizData = useCallback(() => {
    fetch(`${BASE_URL}/quiz/quizzes`)
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((quiz, index) => ({
          id: index.toString(),
          title: quiz.name[language],
          name: quiz.name,
          icon: categoryIcons[quiz.name.en] || "star",
          gradient: categoryGradients[index % categoryGradients.length],
          scale: new Animated.Value(1),
          translateY: new Animated.Value(80),
          opacity: new Animated.Value(0),
        }));
        setQuizCategories(formattedData);

        formattedData.forEach((item, index) => {
          Animated.parallel([
            Animated.timing(item.translateY, {
              toValue: 0,
              duration: 800,
              delay: index * 100,
              useNativeDriver: true,
            }),
            Animated.timing(item.opacity, {
              toValue: 1,
              duration: 800,
              delay: index * 100,
              useNativeDriver: true,
            }),
          ]).start();
        });
      })
      .catch((error) => console.error("Error fetching quizzes:", error))
      .finally(() => setRefreshing(false));
  }, [language]);

  useEffect(() => {
    fetchQuizData();

    // Header animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(headerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [language, fetchQuizData]);

  const handleCardPress = (categoryName, scale) => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.9,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push(`/(quizzes)/${categoryName}`);
    });
  };

  const handleDetailButtonPress = (categoryName) => {
    router.push(`/(quizzes)/${categoryName}`);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ur" : "en"));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQuizData();
  }, [fetchQuizData]);

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: item.scale }, { translateY: item.translateY }],
          opacity: item.opacity,
          marginTop: index % 2 === 0 ? 0 : 50,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleCardPress(item.name.en, item.scale)}
      >
        <LinearGradient
          colors={item.gradient}
          style={styles.quizItem}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
              style={styles.iconBackground}
            >
              <MaterialCommunityIcons name={item.icon} size={40} color="white" />
            </LinearGradient>
          </View>
          <Text style={[
            styles.quizTitle,
            language === "ur" ? styles.urduTitle : null
          ]}>
            {item.title}
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => handleDetailButtonPress(item.name.en)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[
                styles.startButtonText,
                language === "ur" ? styles.urduButtonText : null
              ]}>
                {language === "en" ? "See Details" : "تفصیلات دیکھیں"}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="white"
                style={styles.arrowIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const headerScale = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/profile2.jpeg")}
        style={styles.background}
        blurRadius={4}
      >
        <LinearGradient
          colors={["rgba(69, 58, 74, 0.3)", "rgba(49, 6, 77, 0.5)"]}
          style={styles.overlay}
        >
          <Animated.View
            style={[
              styles.headerContainer,
              { transform: [{ scale: headerScale }] },
            ]}
          >
            <Text style={[
              styles.heading,
              language === "ur" ? styles.urduHeading : null
            ]}>
              {language === "en" ? "Quiz Time" : "  کوئز کا وقت" }
            </Text>
          </Animated.View>

          {/* Enhanced Language Toggle Button */}
          {/* <TouchableOpacity
            onPress={toggleLanguage}
            style={styles.languageButton}
          >
            <LinearGradient
              colors={["#8E54E9", "#4776E6"]}
              style={styles.languageButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[
                styles.languageButtonText,
                language === "ur" ? styles.urduLanguageButtonText : null
              ]}>
                {language === "en" ? "Switch to Urdu" : "Switch to English"}
              </Text>
            </LinearGradient>
          </TouchableOpacity> */}

          <FlatList
            data={quizCategories}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ffffff"
                colors={["#8E54E9", "#4776E6"]}
                progressBackgroundColor="rgba(255, 255, 255, 0.2)"
              />
            }
          />
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    padding: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
    gap: 5,
  },
  headingGradient: {
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  heading: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: "white",
    textAlign: "center",
    textShadowColor: "#551184",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  urduHeading: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 22,
  },
  listContainer: {
    paddingBottom: 20,
  },
  cardContainer: {
    flex: 1,
    margin: 8,
  },
  quizItem: {
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    minHeight: 220,
    width: CARD_WIDTH,
  },
  iconContainer: {
    marginBottom: 5,
  },
  iconBackground: {
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  quizTitle: {
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    color: "white",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  urduTitle: {
    fontFamily: "NotoNastaliqUrdu-Regular",
    fontSize: 16,
    lineHeight: 30,
  },
  startButton: {
    width: "100%",
    marginTop: 15,
    borderRadius: 20,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },
  urduButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
  },
  arrowIcon: {
    marginLeft: 5,
  },
  languageButton: {
    alignSelf: "center",
    marginBottom: 15,
    borderRadius: 25,
    shadowColor: "#8E54E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  languageButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  languageButtonText: {
    fontSize: 14,
    color: "white",
    fontFamily: "Poppins-SemiBold",
    marginLeft: 8,
  },
  urduLanguageButtonText: {
    fontFamily: "NotoNastaliqUrdu-Medium",
    fontSize: 14,
  },
  translateIcon: {
    marginRight: 5,
  },
});

export default Quizzes;