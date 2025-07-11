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

const QuizListScreen = () => {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bounceAnim] = useState(new Animated.Value(1));
  const [floatAnim] = useState(new Animated.Value(0));

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
  }, []);

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

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/profile2.jpeg")}
        style={styles.container}
      >
        <Loader text="Getting ready for fun" />
      </ImageBackground>
    );
  }

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="emoticon-sad" size={84} color="#FFA07A" />
        <Text style={styles.errorText}>Oopsie! We got lost!</Text>
        <Text style={styles.errorSubText}>
          Let's go on a different adventure!
        </Text>
      </View>
    );
  }

  const categoryData = quizData.find(
    (quiz) => quiz.name.en.toLowerCase() === category?.toLowerCase()
  );

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
            router.push(`/(quizzes)/(quiz)/${item._id}`);
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
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={icons[index % icons.length]}
                  size={40}
                  color="#FFF"
                />
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.quizTitle}>Quiz {index + 1}</Text>
              </View>

              <View style={styles.syllabusContainer}>
                {item.syllabus.en.map((topic, idx) => (
                  <View key={idx} style={styles.topicBubble}>
                    <Text style={styles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.startButton}>
                <Text style={styles.startButtonText}>Start Adventure!</Text>
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
          <Text style={styles.heading}>{categoryData?.name.en} Quiz</Text>
        </View>
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
          <Text style={styles.noDataText}>No quizzes yet!</Text>
          <Text style={styles.noDataSubText}>
            New adventures coming soon!
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
    textShadowColor: "white",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
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
});

export default QuizListScreen;