import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring
} from "react-native-reanimated";

// Progress Bar Component
const ProgressBar = ({ percentage, color = "#FFFFFF" }) => {
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withSpring(Math.min(percentage, 100), {
      damping: 15,
      stiffness: 100,
    });
  }, [percentage]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnim.value}%`,
    };
  });

  return (
    <View style={styles.progressBar}>
      <Animated.View 
        style={[
          styles.progressFill,
          { backgroundColor: color },
          animatedProgressStyle
        ]}
      />
    </View>
  );
};

export default function UserDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;
  const [loading, setLoading] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [progressData, setProgressData] = useState({
    stories: [],
    kalmas: [],
    duas: [],
    namaz: [],
    totalStories: 10,
    totalKalmas: 6,
    totalDuas: 10,
    totalNamaz: 7,
  });
  const [scheduleData, setScheduleData] = useState([]);
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    console.log('User object received:', user);
    fetchUserProgress();
    fetchUserDataAndSchedules();

    fadeAnim.value = withTiming(1, { duration: 1000 });

    const checkInterval = setInterval(() => {
      setScheduleData((prevData) => checkExpiredSchedules(prevData));
    }, 60000);

    return () => clearInterval(checkInterval);
  }, []);

  // Updated function to check expired schedules - using the same logic as Schedule screen
  const checkExpiredSchedules = (schedules) => {
    const currentTime = new Date();
    return schedules.filter((schedule) => {
      const expirationTime = new Date(schedule.createdAt);
      expirationTime.setDate(
        expirationTime.getDate() + schedule.durationWeeks * 7
      );
      return currentTime <= expirationTime;
    });
  };

  // Enhanced token validation function
  const validateToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      return token;
    } catch (error) {
      Alert.alert(
        "Authentication Error", 
        "Please log in again to continue.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Login");
            }
          }
        ]
      );
      throw error;
    }
  };

  // Helper function to get user ID - handles different user object structures
  const getUserId = () => {
    // Try different possible structures
    if (user._id) return user._id;
    if (user.user && user.user._id) return user.user._id;
    if (user.id) return user.id;
    
    console.error('Could not find user ID in user object:', user);
    return null;
  };

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const token = await validateToken();
      const userId = getUserId();

      if (!userId) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      console.log('Fetching progress for user ID:', userId);

      const [
        storyProgressResponse,
        kalmaProgressResponse,
        duaProgressResponse,
        namazProgressResponse,
      ] = await Promise.all([
        axios.get(
          `${BASE_URL}/progress/storyprogress/${userId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        ),
        axios.get(
          `${BASE_URL}/progress/kalmaprogress/${userId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        ),
        axios.get(
          `${BASE_URL}/progress/duaprogress/${userId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        ),
        axios.get(
          `${BASE_URL}/progress/namazprogress/${userId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        ),
      ]);

      setProgressData({
        stories: storyProgressResponse.data || [],
        kalmas: kalmaProgressResponse.data || [],
        duas: duaProgressResponse.data || [],
        namaz: namazProgressResponse.data || [],
        totalStories: 10,
        totalKalmas: 6,
        totalDuas: 10,
        totalNamaz: 7,
      });
    } catch (error) {
      console.error("Error fetching user progress:", error);
      
      if (error.response?.status === 401) {
        Alert.alert(
          "Authentication Error",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => {
                AsyncStorage.removeItem("userToken");
                navigation.navigate("Login");
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to fetch progress data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Updated fetchUserDataAndSchedules function - using the same logic as Schedule screen
  const fetchUserDataAndSchedules = async () => {
    try {
      setIsLoadingSchedules(true);
      const token = await validateToken();
      const userId = getUserId();

      if (!userId) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      console.log('Fetching schedules for user ID:', userId);

      const scheduleResponse = await axios.get(
        `${BASE_URL}/schedule/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log('Raw schedule response:', scheduleResponse.data);

      // Apply the same filtering logic as Schedule screen
      const validSchedules = checkExpiredSchedules(scheduleResponse.data || []);
      const sortedSchedules = validSchedules.sort((a, b) => {
        return a.time.localeCompare(b.time);
      });

      console.log('Final sorted schedules to display:', sortedSchedules);
      setScheduleData(sortedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      
      if (error.response?.status === 401) {
        Alert.alert(
          "Authentication Error",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => {
                AsyncStorage.removeItem("userToken");
                navigation.navigate("Login");
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to fetch schedules. Please try again.");
      }
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // Calculate progress percentages
  const storiesCount = progressData.stories.length;
  const kalmasCount = progressData.kalmas.length;
  const duasCount = progressData.duas.length;
  const namazCount = progressData.namaz.length;

  const storyPercentage = (storiesCount / progressData.totalStories) * 100;
  const kalmaPercentage = (kalmasCount / progressData.totalKalmas) * 100;
  const duaPercentage = (duasCount / progressData.totalDuas) * 100;
  const namazPercentage = (namazCount / progressData.totalNamaz) * 100;

  const overallPercentage = (storyPercentage + kalmaPercentage + duaPercentage + namazPercentage) / 4;

  const progressItems = [
    {
      title: "Stories Progress",
      count: storiesCount,
      total: progressData.totalStories,
      percentage: storyPercentage,
      icon: "book-outline",
      color: "#4F46E5",
      progressColor: "#6366F1",
    },
    {
      title: "Kalmas Progress",
      count: kalmasCount,
      total: progressData.totalKalmas,
      percentage: kalmaPercentage,
      icon: "text-outline",
      color: "#0EA5E9",
      progressColor: "#38BDF8",
    },
    {
      title: "Duas Progress",
      count: duasCount,
      total: progressData.totalDuas,
      percentage: duaPercentage,
      icon: "hand-right-outline",
      color: "#8B5CF6",
      progressColor: "#A78BFA",
    },
    {
      title: "Namaz Progress",
      count: namazCount,
      total: progressData.totalNamaz,
      percentage: namazPercentage,
      icon: "people-outline",
      color: "#10B981",
      progressColor: "#34D399",
    },
  ];

  const animatedStyle = useAnimatedStyle(() => {
    return { 
      opacity: fadeAnim.value,
      transform: [
        {
          translateY: withTiming(fadeAnim.value === 1 ? 0 : 20, { duration: 1000 })
        }
      ]
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#68007e', '#48005e']}
          style={styles.profileHeader}
        >
          <View style={styles.profileAvatarContainer}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>
                {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.profileName}>{user.username || "User"}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.detailContainer}>
            <View style={styles.detailIcon}>
              <Ionicons name="person-outline" size={20} color="#68007e" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.label}>Username</Text>
              <Text style={styles.value}>{user.username || "Not provided"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailContainer}>
            <View style={styles.detailIcon}>
              <Ionicons name="mail-outline" size={20} color="#68007e" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailContainer}>
            <View style={styles.detailIcon}>
              <Ionicons name="transgender-outline" size={20} color="#68007e" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>{user.gender || "Not provided"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailContainer}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color="#68007e" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.label}>Age</Text>
              <Text style={styles.value}>{user.age || "Not provided"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailContainer}>
            <View style={styles.detailIcon}>
              <Ionicons name="shield-outline" size={20} color="#68007e" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{user.role}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#68007e" />
              <Text style={styles.loadingText}>Loading progress data...</Text>
            </View>
          ) : (
            <>
              <LinearGradient
                colors={['#68007e', '#8A2BE2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.overallProgressContainer}
              >
                <View style={styles.overallProgressHeader}>
                  <Ionicons name="stats-chart" size={24} color="#fff" />
                  <Text style={styles.overallProgressLabel}>Overall Progress</Text>
                </View>
                <View style={styles.overallProgressBarContainer}>
                  <ProgressBar percentage={overallPercentage} />
                  <Text style={styles.overallProgressPercentage}>
                    {overallPercentage.toFixed(0)}%
                  </Text>
                </View>
              </LinearGradient>

              <View style={styles.progressSummary}>
                {progressItems.map((item, index) => (
                  <View key={index} style={[styles.progressItem, { borderLeftColor: item.color }]}>
                    <View style={styles.progressItemHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                        <Ionicons name={item.icon} size={18} color="#fff" />
                      </View>
                      <Text style={styles.progressItemTitle}>{item.title}</Text>
                    </View>
                    
                    <View style={styles.progressItemStats}>
                      <Text style={styles.progressCount}>
                        {item.count}/{item.total}
                      </Text>
                      <View style={[styles.percentageBadge, { backgroundColor: item.color }]}>
                        <Text style={styles.percentageText}>
                          {item.percentage.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    
                    <ProgressBar percentage={item.percentage} color={item.progressColor} />
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <Animated.View style={[styles.scheduleCard, animatedStyle]}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>Scheduled Tasks</Text>
            <View style={styles.taskCountBadge}>
              <Text style={styles.taskCountText}>{scheduleData.length}</Text>
            </View>
          </View>
          
          {isLoadingSchedules ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#68007e" />
              <Text style={styles.loadingText}>Loading schedules...</Text>
            </View>
          ) : scheduleData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={40} color="#64748B" />
              <Text style={styles.emptyText}>No upcoming tasks scheduled</Text>
              <Text style={styles.emptySubtext}>User hasn't created any tasks yet</Text>
            </View>
          ) : (
            <View style={styles.scheduleList}>
              {scheduleData.map((schedule, index) => (
                <LinearGradient
                  key={index}
                  colors={["#ffe4eb", "#c5cff7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scheduleItem}
                >
                  <View style={styles.scheduleIcon}>
                    <Ionicons name="time-outline" size={20} color="#68007e" />
                  </View>
                  <View style={styles.scheduleDetails}>
                    <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                    <View style={styles.scheduleTimeContainer}>
                      <Ionicons name="alarm-outline" size={16} color="#64748B" />
                      <Text style={styles.scheduleTime}>{schedule.time}</Text>
                    </View>
                    <View style={styles.scheduleDurationContainer}>
                      <Ionicons name="calendar-outline" size={16} color="#64748B" />
                      <Text style={styles.scheduleDuration}>
                        {schedule.durationWeeks} {schedule.durationWeeks === 1 ? "week" : "weeks"}
                      </Text>
                    </View>
                    {schedule.createdAt && (
                      <View style={styles.scheduleCreatedContainer}>
                        <Ionicons name="bookmark-outline" size={16} color="#64748B" />
                        <Text style={styles.scheduleCreated}>
                          Created: {new Date(schedule.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Back to Users</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  profileHeader: {
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileAvatarContainer: {
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2B4B",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 16,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  detailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(104, 0, 126, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E4E9F0",
    marginVertical: 12,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  taskCountBadge: {
    backgroundColor: "#68007e",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  taskCountText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 16,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
  },
  overallProgressContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  overallProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  overallProgressLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  overallProgressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  overallProgressPercentage: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "right",
  },
  progressSummary: {
    gap: 16,
  },
  progressItem: {
    backgroundColor: "#F8F7FC",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  progressItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  progressItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  progressItemStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressCount: {
    fontSize: 15,
    fontWeight: "500",
    color: "#555",
  },
  percentageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(104, 0, 126, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  scheduleTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: "500",
  },
  scheduleDurationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  scheduleDuration: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: "500",
  },
  scheduleCreatedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleCreated: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 6,
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});