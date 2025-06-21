import { useContext, useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity, // Add TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

import Loader from "@/components/Loader";
import { UserContext } from "@/context/UserContext";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const Quiz_Progress = () => {
  const { user } = useContext(UserContext);
  const [quizProgress, setQuizProgress] = useState([]);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation(); // Initialize navigation hook

  const fetchQuizProgress = async () => {
    try {
      setLoading(true);
      const userId = user?.user?._id || (await AsyncStorage.getItem("userId"));
      if (!userId) {
        console.error("No user ID found");
        return;
      }

      let response;
      try {
        response = await axios.get(`${BASE_URL}/progress/quizprogress/${userId}`);
      } catch (error) {
        console.warn(
          "Endpoint failed, using fallback. Please register route at /progress/quizprogress/:userId:",
          error.message
        );
      }

      const data = response.data;
      console.log("Quiz Progress Data:", JSON.stringify(data, null, 2));

      setQuizProgress(data.categoryProgress || []);
      setTotalQuizzes(data.totalQuizzes || 0);
      setTotalAttempted(data.attemptedQuizzes || 0);
      console.log(
        "State updated - totalAttempted:",
        data.attemptedQuizzes,
        "totalQuizzes:",
        data.totalQuizzes,
        "categoryProgress:",
        data.categoryProgress
      );
    } catch (error) {
      console.error("Error fetching quiz progress:", error);
      if (error.response) {
        console.log("Response status:", error.response.status);
        console.log("Response data:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizProgress();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuizProgress();
    setRefreshing(false);
  };

  // Handle navigation to ScoreScreen
  const handleCategoryPress = (category) => {
    navigation.navigate("QuizScoreProgress", {
      category,
      userId: user?.user?._id || null,
    });
  };

  return (
    <ImageBackground
      source={require("@/assets/images/profile.jpeg")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={["rgba(104, 0, 126, 0.8)", "rgba(104, 0, 126, 0.4)"]}
          style={styles.headerGradient}
        >
          <Text style={styles.pageTitle}>Quiz Progress</Text>
          <Text style={styles.overallProgress}>
            {totalAttempted} / {totalQuizzes} Quizzes Attempted
          </Text>
        </LinearGradient>

        {loading ? (
          <Loader />
        ) : (
          <View style={styles.progressContainer}>
            {quizProgress.length === 0 ? (
              <Text style={styles.noDataText}>No quiz progress found.</Text>
            ) : (
              quizProgress.map((item, index) => (
                <View
                  key={index}
                  style={styles.categoryBox}
                  onPress={() => handleCategoryPress(item.category)} // Add onPress handler
                >
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.progressText}>
                    {item.attemptedQuizzes} / {item.totalQuizzes} Quizzes Attempted
                  </Text>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${item.questionCompletionPercentage || 0}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageText}>
                    {item.questionCompletionPercentage || 0}% Questions Completed
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 30,
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
  overallProgress: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#ffe6ff",
    textAlign: "center",
    marginTop: 5,
  },
  progressContainer: {
    paddingHorizontal: 16,
  },
  categoryBox: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2,
  },
  categoryName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 8,
    color: "#68007e",
  },
  progressText: {
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
  percentageText: {
    fontSize: 12,
    color: "#6a1b9a",
    marginTop: 4,
    fontFamily: "Poppins-SemiBold",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
    fontFamily: "Poppins-Regular",
  },
});

export default Quiz_Progress;