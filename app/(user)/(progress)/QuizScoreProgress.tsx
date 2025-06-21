import React, { useEffect, useState, useRef } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Loader from "@/components/Loader";
import CustomAlert from "@/components/CustomAlert";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const QuizScoreProgress = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, userId, quizId } = route.params; // Added quizId
  const [quizScore, setQuizScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    fetchQuizScore();
  }, [category, userId, quizId]);

  useEffect(() => {
    if (!loading) {
      animateEntrance();
    }
  }, [loading]);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchQuizScore = async () => {
    try {
      setLoading(true);
      if (!userId || !category || !quizId) {
        setFeedback({
          title: "Error",
          message: "User ID, category, or quiz ID missing. Please try again.",
          type: "error",
          confirmText: "OK",
          onConfirm: () => navigation.goBack(),
        });
        setShowFeedback(true);
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setFeedback({
          title: "Error",
          message: "Authentication token not found. Please log in again.",
          type: "error",
          confirmText: "OK",
          onConfirm: () => navigation.goBack(),
        });
        setShowFeedback(true);
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/quiz/scores/${userId}/${quizId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      setQuizScore(data);
    } catch (error) {
      console.error("Error fetching quiz score:", error);
      setFeedback({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to load quiz score.",
        type: "error",
        confirmText: "OK",
        showCancel: true,
        cancelText: "Retry",
        onCancel: () => fetchQuizScore(),
      });
      setShowFeedback(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (quizId) {
      navigation.navigate("Quiz", { id: quizId });
    } else {
      navigation.navigate("QuizProgress");
      setFeedback({
        title: "No Quiz Available",
        message: "No quiz ID provided. Returning to progress screen.",
        type: "info",
        confirmText: "OK",
        onConfirm: () => setShowFeedback(false),
      });
      setShowFeedback(true);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <ImageBackground
      source={require("@/assets/images/profile.jpeg")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <LinearGradient
            colors={["rgba(104, 0, 126, 0.8)", "rgba(104, 0, 126, 0.4)"]}
            style={styles.headerGradient}
          >
            <Text style={styles.pageTitle}>{category} Quiz Score</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back to Progress</Text>
            </TouchableOpacity>
          </LinearGradient>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <View style={styles.scoresContainer}>
              {quizScore ? (
                <View style={styles.quizBox}>
                  <Text style={styles.quizName}>
                    Quiz (Taken on{" "}
                    {new Date(quizScore.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    )
                  </Text>
                  <Text style={styles.scoreText}>
                    Score: {quizScore.percentage}% ({quizScore.score}/
                    {quizScore.totalQuestions * 2})
                  </Text>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${quizScore.percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={40}
                    color="#7b4e91"
                  />
                  <Text style={styles.noDataText}>
                    No score found for this quiz in {category}.
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Take the quiz to track your score here!
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>
                {quizScore ? "Retry Quiz" : "Select a Quiz"}
              </Text>
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
          </Animated.View>

          <CustomAlert
            visible={showFeedback}
            title={feedback?.title || ""}
            message={feedback?.message || ""}
            type={feedback?.type || "info"}
            confirmText={feedback?.confirmText || "OK"}
            showCancel={feedback?.showCancel || false}
            cancelText={feedback?.cancelText || "Cancel"}
            onConfirm={feedback?.onConfirm}
            onCancel={feedback?.onCancel}
            onClose={() => setShowFeedback(false)}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.7,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 5,
    textShadowColor: "rgba(47, 7, 67, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  backButton: {
    marginTop: 10,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#6a1b9a",
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  scoresContainer: {
    paddingHorizontal: 16,
  },
  quizBox: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#614385",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 8,
    color: "#68007e",
  },
  scoreText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#555",
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 10,
    backgroundColor: "#6a1b9a",
  },
  noDataText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#68007e",
    marginTop: 8,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#7b4e91",
    marginTop: 4,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#614385",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default QuizScoreProgress;