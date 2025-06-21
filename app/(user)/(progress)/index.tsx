import { useContext, useEffect, useState, useRef } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import Loader from "@/components/Loader";
import { UserContext } from "@/context/UserContext";
import { BASE_URL } from "@/Ipconfig/ipconfig";

// Get screen dimensions for responsive design
const { width } = Dimensions.get("window");

// Separate component for the progress bar with animation
const AnimatedProgressBar = ({ percentage }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(percentage, 100) / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

// Separate component for progress card
const ProgressCard = ({ title, current, total, percentage, items, type }) => {
  const getIconName = () => {
    switch (type) {
      case "Story":
        return "book-outline";
      case "Kalma":
        return "text-outline";
     case "Dua":
    return "heart-outline";
      case "Namaz":
        return "moon-outline";
      default:
        return "checkmark-circle-outline";
    }
  };

  const renderItemList = () => {
    if (!items || items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={40} color="#d3b4e5" />
          <Text style={styles.noProgressText}>No {type}s completed yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Items you learn will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.itemsList}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
              </View>
              <Text style={styles.itemNumber}>{`#${index + 1}`}</Text>
            </View>

            <View style={styles.itemContent}>
              {/* Handle Namaz items with both category and dua */}
              {type === "Namaz" && (
                <>
                  <Text style={styles.itemTextUrdu}>{item.category || "Unnamed Category"}</Text>
                  {item.dua && <Text style={styles.itemDua}>{item.dua}</Text>}
                </>
              )}
              
              {/* Handle non-Namaz items */}
              {type !== "Namaz" && (
                <>
                  {item.titleUrdu && (
                    <Text style={styles.itemTextUrdu}>{item.titleUrdu}</Text>
                  )}
                  <Text style={styles.itemTextEn}>{item.title || "Untitled"}</Text>
                </>
              )}
              
              {item.completionDate && (
                <Text style={styles.itemDate}>
                  {new Date(item.completionDate).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <View style={styles.cardIconContainer}>
            <Ionicons name={getIconName()} size={24} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>

        <View style={styles.progressStats}>
          <Text style={styles.progressCount}>
            {current} / {total}
          </Text>
          <View style={styles.percentageBadge}>
            <Text style={styles.progressPercentage}>
              {percentage.toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>

      <AnimatedProgressBar percentage={percentage} />
      {renderItemList()}
    </View>
  );
};

// New Quiz Progress Card component with button
const QuizProgressCard = ({ navigation }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <View style={styles.cardIconContainer}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Quiz Progress</Text>
        </View>
      </View>

      <View style={styles.quizCardContent}>
        <Text style={styles.quizCardText}>
          Track your quiz performance and see detailed analytics
        </Text>

        <TouchableOpacity
          style={styles.quizButton}
          onPress={() => navigation.navigate("QuizProgress")}
        >
          <Text style={styles.quizButtonText}>View Quiz Progress</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Progress_Details = () => {
  const [readStories, setReadStories] = useState(null);
  const [learnedKalmas, setLearnedKalmas] = useState(null);
  const [learnedDuas, setLearnedDuas] = useState(null);
  const [completedNamazs, setCompletedNamazs] = useState(null);
  const [totalStories, setTotalStories] = useState(10);
  const [totalKalmas, setTotalKalmas] = useState(6);
  const [totalDuas, setTotalDuas] = useState(10);
  const [totalNamazs, setTotalNamazs] = useState(11);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  // Fetch progress data
  const fetchProgress = async () => {
    try {
      if (!user?.user?._id) {
        Alert.alert("Error", "User not found or not logged in.");
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Authentication token not found.");
        return;
      }

      const currentUserId = user.user._id;

      // Fetch all progress data concurrently
      const [
        storyProgressResponse,
        kalmaProgressResponse,
        duaProgressResponse,
        namazProgressResponse,
      ] = await Promise.all([
        axios.get(`${BASE_URL}/progress/storyprogress/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/progress/kalmaprogress/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/progress/duaprogress/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/progress/namazprogress/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Update state with progress data
      setReadStories(storyProgressResponse.data || []);
      setLearnedKalmas(kalmaProgressResponse.data || []);
      setLearnedDuas(duaProgressResponse.data || []);
      setCompletedNamazs(namazProgressResponse.data || []);
    } catch (error) {
      console.error("Error fetching progress:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch progress"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProgress();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchProgress();
  };

  // Calculate progress percentages
  const readStoriesCount = Array.isArray(readStories) ? readStories.length : 0;
  const learnedKalmasCount = Array.isArray(learnedKalmas)
    ? learnedKalmas.length
    : 0;
  const learnedDuasCount = Array.isArray(learnedDuas) ? learnedDuas.length : 0;
  const completedNamazsCount = Array.isArray(completedNamazs)
    ? completedNamazs.length
    : 0;

  const storyPercentage =
    totalStories > 0 ? (readStoriesCount / totalStories) * 100 : 0;
  const kalmaPercentage =
    totalKalmas > 0 ? (learnedKalmasCount / totalKalmas) * 100 : 0;
  const duaPercentage =
    totalDuas > 0 ? (learnedDuasCount / totalDuas) * 100 : 0;
  const namazPercentage =
    totalNamazs > 0 ? (completedNamazsCount / totalNamazs) * 100 : 0;

  // Calculate overall progress (now including namaz)
  const overallPercentage =
    (storyPercentage + kalmaPercentage + duaPercentage + namazPercentage) / 4;

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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#68007e"]}
            tintColor="#68007e"
          />
        }
      >
        <LinearGradient
          colors={["rgba(104, 0, 126, 0.8)", "rgba(104, 0, 126, 0.4)"]}
          style={styles.headerGradient}
        >
          <Text style={styles.pageTitle}>Learning Journey</Text>

          <View style={styles.overallProgressContainer}>
            <Text style={styles.overallProgressLabel}>Overall Content Progress</Text>
            <View style={styles.overallProgressBar}>
              <View
                style={[
                  styles.overallProgressFill,
                  { width: `${Math.min(overallPercentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.overallProgressPercentage}>
              {overallPercentage.toFixed(0)}%
            </Text>
          </View>
        </LinearGradient>

        {loading ? (
          <Loader text="Loading progress..." />
        ) : (
          <View style={styles.cardsContainer}>
            {/* Namaz Progress Card */}
            <ProgressCard
              title="Namaz Progress"
              current={completedNamazsCount}
              total={totalNamazs}
              percentage={namazPercentage}
              items={completedNamazs}
              type="Namaz"
            />
            {/* Stories Progress Card */}
            <ProgressCard
              title="Stories Progress"
              current={readStoriesCount}
              total={totalStories}
              percentage={storyPercentage}
              items={readStories}
              type="Story"
            />
            {/* Kalmas Progress Card */}
            <ProgressCard
              title="Kalmas Progress"
              current={learnedKalmasCount}
              total={totalKalmas}
              percentage={kalmaPercentage}
              items={learnedKalmas}
              type="Kalma"
            />
            {/* Duas Progress Card */}
            <ProgressCard
              title="Duas Progress"
              current={learnedDuasCount}
              total={totalDuas}
              percentage={duaPercentage}
              items={
                learnedDuas &&
                learnedDuas.map((dua) => ({
                  title: dua.topic || "Untitled Dua",
                  titleUrdu: dua.topicUrdu || "",
                }))
              }
              type="Dua"
            />
            {/* Quiz Progress Card */}
            <QuizProgressCard navigation={navigation} />
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

// Add style for dua text
const styles = StyleSheet.create({
  itemDua: {
    fontSize: 14,
    color: "#7b4e91",
    marginTop: 4,
    fontWeight: "500",
  },
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
    paddingBottom: 2,
  },
  headerGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 15,
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
  overallProgressContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  overallProgressLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    marginBottom: 8,
  },
  overallProgressBar: {
    height: 14,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 7,
    overflow: "hidden",
    marginBottom: 8,
  },
  overallProgressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 7,
  },
  overallProgressPercentage: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    textAlign: "right",
  },
  cardsContainer: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#68007e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#68007e",
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressCount: {
    fontSize: 16,
    color: "#555",
    fontFamily: "Poppins-Medium",
  },
  percentageBadge: {
    backgroundColor: "#68007e",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  progressPercentage: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
  progressBarContainer: {
    marginVertical: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#68007e",
    borderRadius: 5,
  },
  itemsList: {
    marginTop: 8,
  },
  itemCard: {
    backgroundColor: "rgba(223, 216, 238, 0.68)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#68007e",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  checkmarkContainer: {
    marginRight: 8,
  },
  itemNumber: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Medium",
  },
  itemContent: {
    paddingLeft: 30,
  },
  itemTextUrdu: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Poppins-Bold",
    textAlign: "left",
    marginBottom: 2,
  },
  itemDua: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins-Regular",
    textAlign: "left",
    marginBottom: 4,
  },
  itemTextEn: {
    fontSize: 16,
    color: "#555",
    fontFamily: "Poppins-Regular",
  },
  itemDate: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noProgressText: {
    fontSize: 16,
    color: "#68007e",
    fontFamily: "Poppins-Medium",
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    fontFamily: "Poppins-Regular",
    marginTop: 4,
  },
  // Quiz card specific styles
  quizCardContent: {
    alignItems: "center",
    paddingVertical: 15,
  },
  quizCardText: {
    fontSize: 16,
    color: "#555",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  quizButton: {
    backgroundColor: "#68007e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  quizButtonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginRight: 8,
  },
});

export default Progress_Details;
