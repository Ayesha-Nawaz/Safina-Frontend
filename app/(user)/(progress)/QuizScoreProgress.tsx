import { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import Loader from "@/components/Loader";

const QuizScoreProgress = ({ route: routeProp }) => {
  const routeHook = useRoute();
  const navigation = useNavigation();
  
  const route = routeProp || routeHook;
  console.log("QuizScoreProgress - routeProp:", routeProp);
  console.log("QuizScoreProgress - routeHook:", routeHook);
  console.log("QuizScoreProgress - Final route object:", route);
  console.log("QuizScoreProgress - Route params:", route?.params);
  
  const category = route?.params?.category;
  const userId = route?.params?.userId;
  
  console.log("QuizScoreProgress - Extracted category:", category);
  console.log("QuizScoreProgress - Extracted userId:", userId);
  
  const [scores, setScores] = useState([]);
  const [totalQuizzesTaken, setTotalQuizzesTaken] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuizScores = async () => {
    try {
      setLoading(true);
      
      console.log("fetchQuizScores - Starting with category:", category);
      
      if (!category) {
        console.error("fetchQuizScores - No category provided, category value:", category);
        setLoading(false);
        return;
      }
      
      let id = userId;
      if (!id) {
        id = await AsyncStorage.getItem("userId");
        console.log("fetchQuizScores - Got userId from AsyncStorage:", id);
      }
      
      if (!id) {
        console.error("fetchQuizScores - No user ID found");
        setLoading(false);
        return;
      }

      // Fetch quiz scores
      console.log("fetchQuizScores - Making API call with userId:", id);
      const scoreResponse = await axios.get(`${BASE_URL}/quiz/scores/${id}`);
      const scoreData = scoreResponse.data;

      console.log("Quiz Scores Data:", JSON.stringify(scoreData, null, 2));
      console.log("Filtering for category:", category);

      // Filter scores by the selected category
      let filteredScores = scoreData.scores?.filter(
        (score) => score.category === category
      ) || [];

      // Fetch all quizzes to map quizId to title
      const quizResponse = await axios.get(`${BASE_URL}/quiz/quizzes`);
      const quizzes = quizResponse.data;

      console.log("Quiz Data:", JSON.stringify(quizzes, null, 2));

      // Create a map of quizId to normalized quiz title
      const quizTitleMap = {};
      let quizIndex = 1; // Fallback index for titles without a number
      quizzes.forEach((quizDoc) => {
        quizDoc.quizzes.forEach((subQuiz) => {
          const title = subQuiz.title?.en || subQuiz.title?.ur || "";
          // Extract number from title (e.g., "Part 1", "Quiz 1", "Syllabus 3")
          const match = title.match(/(\d+)/); // Match any number in the title
          const quizNumber = match ? parseInt(match[0], 10) : quizIndex++;
          quizTitleMap[subQuiz._id.toString()] = `Quiz ${quizNumber}`;
        });
      });

      // Enrich scores with normalized quiz titles
      filteredScores = filteredScores.map((score) => ({
        ...score,
        quizTitle: quizTitleMap[score.quizId.toString()] || `Quiz ${score.quizId}`,
        quizNumber: parseInt(quizTitleMap[score.quizId.toString()]?.match(/(\d+)/)?.[1] || Infinity),
      }));

      // Sort by quizNumber
      filteredScores.sort((a, b) => a.quizNumber - b.quizNumber);

      console.log("Filtered and sorted scores:", filteredScores);

      setScores(filteredScores);
      
      // Calculate statistics
      const categoryQuizCount = filteredScores.length;
      const categoryAverageScore = categoryQuizCount > 0 
        ? Math.round(filteredScores.reduce((sum, score) => sum + (score.percentage || 0), 0) / categoryQuizCount)
        : 0;

      setTotalQuizzesTaken(categoryQuizCount);
      setAverageScore(categoryAverageScore);

      console.log("Category stats:", {
        totalQuizzesTaken: categoryQuizCount,
        averageScore: categoryAverageScore
      });

    } catch (error) {
      console.error("Error fetching quiz scores:", error);
      if (error.response) {
        console.log("Response status:", error.response.status);
        console.log("Response data:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered with category:", category, "userId:", userId);
    fetchQuizScores();
  }, [category, userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuizScores();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "No Date";
      
      // Handle different date formats
      let date;
      
      // Try parsing as ISO string first
      if (typeof dateString === 'string') {
        // Handle ISO format (2024-01-15T10:30:00Z)
        if (dateString.includes('T') || dateString.includes('Z')) {
          date = new Date(dateString);
        }
        // Handle DD/MM/YYYY format
        else if (dateString.includes('/')) {
          const parts = dateString.split('/');
          if (parts.length === 3) {
            // Assuming DD/MM/YYYY format
            date = new Date(parts[2], parts[1] - 1, parts[0]);
          }
        }
        // Handle DD-MM-YYYY format
        else if (dateString.includes('-') && dateString.split('-').length === 3) {
          const parts = dateString.split('-');
          // Check if it's DD-MM-YYYY or YYYY-MM-DD
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            date = new Date(dateString);
          } else {
            // DD-MM-YYYY format
            date = new Date(parts[2], parts[1] - 1, parts[0]);
          }
        }
        // Try direct parsing as fallback
        else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log("Invalid date string:", dateString);
        return "Invalid Date";
      }
      
      // Format the date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", dateString);
      return "Invalid Date";
    }
  };

  const getQuizTitle = (score) => {
    return score.quizTitle || `Quiz ${score.quizId}`;
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
          <Text style={styles.pageTitle}>{category || "Quiz"} Scores</Text>
          <Text style={styles.overallProgress}>
            Total Quizzes Taken: {totalQuizzesTaken}
          </Text>
          <Text style={styles.overallProgress}>
            Average Score: {averageScore}%
          </Text>
        </LinearGradient>

        {loading ? (
          <Loader />
        ) : (
          <View style={styles.scoresContainer}>
            {!category ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  No category selected.
                </Text>
                <Text style={styles.noDataSubText}>
                  Please navigate from the Quiz Progress screen.
                </Text>
                <Text style={styles.debugText}>
                  Debug: Category = {JSON.stringify(category)}
                </Text>
                <Text style={styles.debugText}>
                  Debug: Route prop = {JSON.stringify(routeProp)}
                </Text>
                <Text style={styles.debugText}>
                  Debug: Route hook = {JSON.stringify(routeHook?.params)}
                </Text>
                <Text style={styles.debugText}>
                  Debug: Final route params = {JSON.stringify(route?.params)}
                </Text>
              </View>
            ) : scores.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  No scores found for {category}.
                </Text>
              </View>
            ) : (
              scores.map((score, index) => (
                <View key={`${score.quizId || index}-${index}`} style={styles.scoreBox}>
                  <Text style={styles.scoreTitle}>{getQuizTitle(score)}</Text>
                  <Text style={styles.scoreText}>
                    Score: {score.score || 0} / {(score.totalQuestions || 0) * 2}
                  </Text>
                  <Text style={styles.scoreText}>
                    Percentage: {score.percentage || 0}%
                  </Text>
                  
                  <Text style={styles.scoreText}>
                    Questions Answered: {score.totalQuestions || 0}
                  </Text>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={{
                        ...styles.progressBarFill,
                        width: `${Math.min(score.percentage || 0, 100)}%`,
                      }}
                    />
                  </View>
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
  scoresContainer: {
    paddingHorizontal: 16,
  },
  scoreBox: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2,
  },
  scoreTitle: {
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
    marginTop: 5,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: "#6a1b9a",
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
    fontFamily: "Poppins-Regular",
  },
  noDataSubText: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginTop: 10,
    fontFamily: "Poppins-Regular",
    fontStyle: "italic",
  },
  debugText: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 5,
    fontFamily: "Poppins-Regular",
  },
});

export default QuizScoreProgress;