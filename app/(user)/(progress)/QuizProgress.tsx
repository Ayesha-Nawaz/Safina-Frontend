import { useContext, useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

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
  const navigation = useNavigation();

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

  // Calculate quiz completion percentage
  const calculateQuizPercentage = (attemptedQuizzes, totalQuizzes) => {
    if (!totalQuizzes || totalQuizzes === 0) return 0;
    return Math.round((attemptedQuizzes / totalQuizzes) * 100);
  };

  // Handle navigation to ScoreScreen with proper error handling
  const handleCategoryPress = (category) => {
    try {
      const userId = user?.user?._id || null;
      
      console.log("Quiz_Progress - Navigating with params:", {
        category,
        userId
      });

      if (!category) {
        console.error("Quiz_Progress - No category provided for navigation");
        return;
      }

      // Ensure we're passing the exact category value
      const navigationParams = {
        category: category,
        userId: userId,
      };

      console.log("Quiz_Progress - Final navigation params:", navigationParams);

      navigation.navigate("QuizScoreProgress", navigationParams);
    } catch (error) {
      console.error("Quiz_Progress - Navigation error:", error);
    }
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
              quizProgress.map((item, index) => {
                const quizCompletionPercentage = calculateQuizPercentage(
                  item.attemptedQuizzes || 0,
                  item.totalQuizzes || 0
                );
                
                return (
                  <TouchableOpacity
                    key={`${item.category || 'category'}-${index}`}
                    style={styles.categoryBox}
                    onPress={() => {
                      console.log("Quiz_Progress - TouchableOpacity pressed with category:", item.category);
                      handleCategoryPress(item.category);
                    }}
                    disabled={!item.category} // Disable if no category
                  >
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>{item.category || "Unknown Category"}</Text>
                     
                    </View>
                    <Text style={styles.progressText}>
                      {item.attemptedQuizzes || 0} / {item.totalQuizzes || 0} Quizzes Attempted
                    </Text>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${Math.min(quizCompletionPercentage, 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.percentageText}>
                      {quizCompletionPercentage}% Quizzes Completed
                    </Text>
                  </TouchableOpacity>
                );
              })
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
  categoryHeader: {
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
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
  debugText: {
    fontSize: 10,
    color: "#999",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
});

export default Quiz_Progress;